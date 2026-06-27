# PRD.md: Run Tracker

## Overview
A single page web app that logs runs and shows progress toward a personal running goal. Built for MP2, deployed on GitHub Pages, vanilla JavaScript only.

## Problem
Starting a new running habit is easy to abandon because progress is invisible day to day. Without a running total of distance and a clear view of how close a goal actually is, it is hard to stay motivated to lace up again. A blank notes app entry gets forgotten. This tool keeps the numbers visible and current every time a run is logged.

## Who it's for
Me, starting a running habit this summer. I want to log runs in under thirty seconds and immediately see how that run moved the needle toward a goal.

## Goals and success criteria
- Logging a run takes one form and under thirty seconds
- The goal progress is always visible and updates the moment a run is logged
- I can tell at a glance whether I am on pace this week without doing mental math

## Data model
**Run**
| Field | Type | Notes |
|---|---|---|
| id | number | timestamp based, used for delete |
| date | string (YYYY-MM-DD) | from a date input |
| distanceMi | number | miles, greater than 0 |
| durationMin | number | minutes, greater than 0 |

Pace is never stored, it is always derived: `durationMin / distanceMi`, displayed as minutes:seconds per mile.

**Goal**
| Field | Type | Notes |
|---|---|---|
| type | "longRun" \| "weeklyMileage" | which kind of goal |
| target | number | miles |
| byDate | string (YYYY-MM-DD), optional | target date |

Only one active goal at a time. Setting a new goal replaces the old one.

## Features

### 1. Log a run
User story: As a runner, I want to log a run's date, distance, and duration so the app remembers it and calculates my pace.
Acceptance criteria:
- Form has date, distance (mi), duration (min)
- Submitting with any field empty or zero/negative shows an inline error, no alert box, nothing is added
- A valid submit adds the run to state, clears the form, and re-renders stats and history immediately

### 2. Set a goal
User story: As a runner, I want to set either a longest single run target or a weekly mileage target, so the app can tell me how close I am.
Acceptance criteria:
- Dropdown chooses goal type, target distance input, optional target date
- Submitting replaces the current goal and re-renders the progress view
- If no goal is set yet, the progress section shows an empty state inviting me to set one, not a blank space

### 3. Progress view
User story: As a runner, I want to see, in plain terms, what is left to hit my goal.
Acceptance criteria:
- A circular progress indicator shows percent complete toward the active goal
- A text line states the gap in plain terms, for example "1.4 miles left this week" or "Longest run so far is 2.0 mi, goal is 5.0 mi"
- If a target date is set, days remaining is shown

### 4. Stats dashboard
User story: As a runner, I want running totals without doing the math myself.
Acceptance criteria:
- Shows total miles this week, total miles this month, current streak in consecutive weeks with at least one run, and average pace across all logged runs
- All four update immediately after any run is added or deleted

### 5. Run history
User story: As a runner, I want to see and manage my past runs.
Acceptance criteria:
- Lists all runs, most recent first, with date, distance, duration, and computed pace
- A dropdown filters the list to all, this week, or this month
- Each entry has a delete button that removes it and re-renders everything derived from state
- Empty state message when there are no runs yet

## Non functional requirements
- Semantic HTML, no div soup
- CSS that looks intentional, not default browser styling
- Vanilla JavaScript only, no frameworks, no libraries, nothing loaded from a CDN
- No server calls, all state lives in memory in the browser
- Reset clears all runs and the goal without a page refresh, with an inline confirm step rather than a native confirm() dialog
- Deployed on GitHub Pages at the repo's Pages URL

## Out of scope for MP2 base build
- Saving data between sessions (localStorage is a listed extension, not required)
- Multiple goals at once
- Editing a logged run (delete and re-log instead)

## Open questions / what I don't know yet
- Cleanest way to calculate a consecutive-week streak from a list of dates
- Date math for reliably bucketing a date into "this week" vs "this month" without timezone bugs
- How much of the goal progress logic to compute on every render versus only when state changes