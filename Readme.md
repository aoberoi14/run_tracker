# Run Tracker

A lightweight running log and goal tracker that runs entirely in the browser. No account, no server, no install.

**Live site:** [aoberoi14.github.io/run_tracker](https://aoberoi14.github.io/run_tracker)
**Repo:** [github.com/aoberoi14/run_tracker](https://github.com/aoberoi14/run_tracker)

---

## What it does

- Log a run with date, distance, and duration. Pace is calculated for you.
- Set a goal: either a weekly mileage target or a longest single run target, with an optional target date.
- A circular progress ring shows how close you are to the goal, with a plain text summary of what is left.
- Stats dashboard updates live: miles this week, miles this month, current streak in consecutive weeks, and average pace.
- Filter your run history by all time, this week, or this month. Delete any entry you logged wrong.
- Reset everything in one click, with a confirm step so you cannot do it by accident.

---

## How to use it

1. Set a goal first using the form on the left. Pick weekly mileage or longest run, enter a target distance, and optionally a date to hit it by.
2. Log a run using the form in the middle. Fill in date, distance in miles, and duration in minutes, then hit Log run.
3. Watch your stats and progress ring update immediately.
4. Use the filter dropdown in the history section to narrow runs by week or month.
5. Hit Reset all data at the bottom if you want to start fresh.

---

## What I learned

- How to manage all application state in plain JavaScript arrays and objects, and re-render the page from that state on every change rather than patching individual DOM elements manually.
- Date math without a library: calculating the start of the current week, bucketing runs into weekly and monthly ranges, and building a consecutive-week streak from a set of date strings.
- How to use an SVG circle's `stroke-dashoffset` property to animate a progress ring purely in CSS and JavaScript, no canvas needed.
- Separating logic functions from DOM rendering functions kept the code much easier to debug than putting everything inside event listeners.

---

## Built for

OIM3690 AI-Powered Web Development, MP2
Babson College, Summer 2026