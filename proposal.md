# PROPOSAL.md

**What I'm building:**
A running tracker that logs each run and shows my progress toward a goal I set for myself.

**Who it's for / why:**
Me. I'm starting running this summer and want something that makes the progress concrete, not just a notes app entry I forget to update. Seeing real numbers build up is what will keep me consistent.

**The state it tracks:**
- An array of logged runs, each with a date, distance, duration, and a calculated pace
- A current goal: a target distance to build up to, or a weekly mileage target, with a target date
- Derived totals: distance run this week, distance run this month, current streak, average pace over time

**Core features:**
1. Log a run (date, distance, duration), pace gets calculated automatically
2. Set or update a goal: a target distance to work toward, or a weekly mileage target, with a target date
3. A dashboard showing totals for the current week and month, plus a current streak
4. A progress view that shows how close I am to the goal and what is actually left, for example "run 2 more times this week" or "12 miles left toward your monthly target"
5. A run history list, with the option to delete an entry I logged wrong

**What I don't know yet:**
- How to calculate a running streak cleanly from a list of dates
- Date math, figuring out what counts as "this week" and "this month" from arbitrary logged dates
- How to turn raw numbers into a useful message instead of just printing a number