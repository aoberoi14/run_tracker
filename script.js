// ---------- State ----------

let runs = [];
let goal = null; // { type: 'weeklyMileage' | 'longRun', target: number, byDate: string|null }

// ---------- Date helpers ----------

function parseDate(str) {
  // Avoid timezone drift by treating the string as local midnight.
  return new Date(str + 'T00:00:00');
}

function isoDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // shift back to Monday
  d.setDate(d.getDate() + diff);
  return d;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// ---------- Derived calculations ----------

function paceMinPerMi(distanceMi, durationMin) {
  if (!distanceMi) return null;
  return durationMin / distanceMi;
}

function formatPace(minPerMi) {
  if (minPerMi === null || !isFinite(minPerMi)) return '--';
  const minutes = Math.floor(minPerMi);
  const seconds = Math.round((minPerMi - minutes) * 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function computeStats() {
  const t = today();
  const weekStart = startOfWeek(t);
  const monthStart = startOfMonth(t);

  let weekTotal = 0;
  let monthTotal = 0;
  let longestRun = 0;
  let totalDistance = 0;
  let totalDuration = 0;

  runs.forEach(r => {
    const d = parseDate(r.date);
    if (d >= weekStart) weekTotal += r.distanceMi;
    if (d >= monthStart) monthTotal += r.distanceMi;
    if (r.distanceMi > longestRun) longestRun = r.distanceMi;
    totalDistance += r.distanceMi;
    totalDuration += r.durationMin;
  });

  const avgPace = totalDistance > 0 ? totalDuration / totalDistance : null;

  return {
    weekTotal,
    monthTotal,
    longestRun,
    avgPace,
    streakWeeks: computeStreakWeeks(),
  };
}

function computeStreakWeeks() {
  if (!runs.length) return 0;

  const weekKeys = new Set(runs.map(r => isoDate(startOfWeek(parseDate(r.date)))));

  let streak = 0;
  let cursor = startOfWeek(today());
  let isCurrentWeek = true;

  // Bounded by the earliest logged week: eventually cursor walks past it
  // and hits a week with no key, which breaks the loop.
  while (true) {
    const key = isoDate(cursor);
    if (weekKeys.has(key)) {
      streak++;
    } else if (isCurrentWeek) {
      // This week is still in progress, no run yet doesn't break the streak.
    } else {
      break;
    }
    isCurrentWeek = false;
    cursor.setDate(cursor.getDate() - 7);
  }

  return streak;
}

function computeGoalProgress(stats) {
  if (!goal) return null;

  let current, target, label;

  if (goal.type === 'weeklyMileage') {
    current = stats.weekTotal;
    target = goal.target;
    const remaining = Math.max(0, target - current);
    label = remaining > 0
      ? `${remaining.toFixed(1)} mi left this week toward your ${target} mi goal`
      : `Weekly goal hit, ${current.toFixed(1)} of ${target} mi`;
  } else {
    current = stats.longestRun;
    target = goal.target;
    const remaining = Math.max(0, target - current);
    label = remaining > 0
      ? `Longest run so far is ${current.toFixed(1)} mi, ${remaining.toFixed(1)} mi short of your ${target} mi goal`
      : `Goal hit, your longest run is ${current.toFixed(1)} mi`;
  }

  const percent = target > 0 ? Math.min(1, current / target) : 0;

  let daysLeft = null;
  if (goal.byDate) {
    const target_date = parseDate(goal.byDate);
    const diffMs = target_date - today();
    daysLeft = Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

  return { percent, label, daysLeft };
}

// ---------- Rendering ----------

const RING_CIRCUMFERENCE = 2 * Math.PI * 54;

function render() {
  const stats = computeStats();
  renderStats(stats);
  renderGoal(stats);
  renderHistory();
}

function renderStats(stats) {
  document.getElementById('statWeek').textContent = stats.weekTotal.toFixed(1);
  document.getElementById('statMonth').textContent = stats.monthTotal.toFixed(1);
  document.getElementById('statStreak').textContent = stats.streakWeeks;
  document.getElementById('statPace').textContent = formatPace(stats.avgPace);
}

function renderGoal(stats) {
  const ringProgress = document.getElementById('ringProgress');
  const ringValue = document.getElementById('ringValue');
  const goalSummary = document.getElementById('goalSummary');
  const goalDays = document.getElementById('goalDays');

  const progress = computeGoalProgress(stats);

  if (!progress) {
    ringProgress.style.strokeDashoffset = RING_CIRCUMFERENCE;
    ringValue.textContent = '--';
    goalSummary.textContent = 'Set a goal to start tracking progress.';
    goalDays.textContent = '';
    return;
  }

  const offset = RING_CIRCUMFERENCE * (1 - progress.percent);
  ringProgress.style.strokeDashoffset = offset;
  ringValue.textContent = `${Math.round(progress.percent * 100)}%`;
  goalSummary.textContent = progress.label;

  if (progress.daysLeft === null) {
    goalDays.textContent = '';
  } else if (progress.daysLeft >= 0) {
    goalDays.textContent = `${progress.daysLeft} day${progress.daysLeft === 1 ? '' : 's'} left`;
  } else {
    goalDays.textContent = 'Target date has passed';
  }
}

function getFilteredRuns() {
  const filter = document.getElementById('historyFilter').value;
  const t = today();
  const weekStart = startOfWeek(t);
  const monthStart = startOfMonth(t);

  const sorted = [...runs].sort((a, b) => parseDate(b.date) - parseDate(a.date));

  if (filter === 'week') {
    return sorted.filter(r => parseDate(r.date) >= weekStart);
  }
  if (filter === 'month') {
    return sorted.filter(r => parseDate(r.date) >= monthStart);
  }
  return sorted;
}

function renderHistory() {
  const list = document.getElementById('historyList');
  const filtered = getFilteredRuns();

  list.innerHTML = '';

  if (filtered.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty-state';
    li.textContent = runs.length === 0
      ? 'No runs logged yet. Your first one starts the streak.'
      : 'No runs in this range.';
    list.appendChild(li);
    return;
  }

  filtered.forEach(r => {
    const li = document.createElement('li');
    li.className = 'history-row';

    const pace = formatPace(paceMinPerMi(r.distanceMi, r.durationMin));

    li.innerHTML = `
      <span>${r.date}</span>
      <span>${r.distanceMi.toFixed(2)} mi</span>
      <span>${r.durationMin} min</span>
      <span>${pace} /mi</span>
    `;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-button';
    deleteBtn.setAttribute('aria-label', `Delete run on ${r.date}`);
    deleteBtn.textContent = '\u00D7';
    deleteBtn.addEventListener('click', () => deleteRun(r.id));

    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

// ---------- Mutations ----------

function addRun(date, distanceMi, durationMin) {
  runs.push({
    id: Date.now(),
    date,
    distanceMi,
    durationMin,
  });
  render();
}

function deleteRun(id) {
  runs = runs.filter(r => r.id !== id);
  render();
}

function setGoal(type, target, byDate) {
  goal = { type, target, byDate: byDate || null };
  render();
}

function resetAll() {
  runs = [];
  goal = null;
  document.getElementById('goalForm').reset();
  document.getElementById('runForm').reset();
  render();
}

// ---------- Event wiring ----------

document.getElementById('runForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('runError');

  const date = document.getElementById('runDate').value;
  const distance = parseFloat(document.getElementById('runDistance').value);
  const duration = parseFloat(document.getElementById('runDuration').value);

  if (!date) {
    errorEl.textContent = 'Pick a date for this run.';
    return;
  }
  if (!distance || distance <= 0) {
    errorEl.textContent = 'Distance has to be a number greater than 0.';
    return;
  }
  if (!duration || duration <= 0) {
    errorEl.textContent = 'Duration has to be a number greater than 0.';
    return;
  }

  errorEl.textContent = '';
  addRun(date, distance, duration);
  e.target.reset();
});

document.getElementById('goalForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('goalError');

  const type = document.getElementById('goalType').value;
  const target = parseFloat(document.getElementById('goalTarget').value);
  const byDate = document.getElementById('goalDate').value;

  if (!target || target <= 0) {
    errorEl.textContent = 'Set a target distance greater than 0.';
    return;
  }

  errorEl.textContent = '';
  setGoal(type, target, byDate);
});

document.getElementById('historyFilter').addEventListener('change', renderHistory);

let resetConfirming = false;
let resetTimer = null;

document.getElementById('resetButton').addEventListener('click', (e) => {
  const btn = e.target;
  if (!resetConfirming) {
    resetConfirming = true;
    btn.textContent = 'Click again to confirm';
    btn.classList.add('confirming');
    resetTimer = setTimeout(() => {
      resetConfirming = false;
      btn.textContent = 'Reset all data';
      btn.classList.remove('confirming');
    }, 3000);
  } else {
    clearTimeout(resetTimer);
    resetConfirming = false;
    btn.textContent = 'Reset all data';
    btn.classList.remove('confirming');
    resetAll();
  }
});

// ---------- Init ----------

render();