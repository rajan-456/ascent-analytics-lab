# Growth Hub

Personal Growth Dashboard — Master Build Prompt

Build a full-stack personal self-improvement dashboard web application called GrowthOS.

The purpose of this application is to help me track, measure, visualize, and continuously improve myself across the most important areas of my life.

This should not feel like a simple habit tracker. It should feel like a personal analytics dashboard + gamified self-improvement system.

Core Goal

The application should answer these questions:

Am I improving compared to yesterday?

Which areas of my life are improving?

Which areas are getting worse?

What habits are holding me back?

What was my best and worst day?

Am I maintaining consistency?

How close am I to my goals?

What should I focus on next?

The dashboard must track data by day and date and allow me to analyze progress over time.

1. User Authentication and Database

Create a complete authentication system.

Users should be able to:

Sign up

Log in

Log out

Reset password

Have their own private dashboard

Store all data securely in a cloud database

Each user must only be able to access their own:

Daily logs

Habits

Tasks

Goals

Statistics

XP

Levels

Achievements

Use a reliable cloud database and authentication system such as Supabase or another suitable modern backend.

2. Main Dashboard

The main dashboard should show today's date clearly at the top.

Example:

Thursday, August 20, 2026

Include a greeting such as:

Good evening! Let's improve today.

The dashboard should immediately show a high-level overview.

Top Summary Cards

Create cards for:

Overall Growth Score

Display:

Today's Growth Score: 82 / 100

Show whether the score has:

Increased from yesterday

Decreased from yesterday

Stayed the same

Also show:

Yesterday's score

Weekly average

Monthly average

All-time average

Current Streak

Display:

🔥 12 Day Streak

The streak should represent consecutive days where the user meets a minimum improvement or habit completion threshold.

Current Level

Example:

Level 7

Show:

Current XP

XP needed for next level

Progress bar

Example:

1,250 / 2,000 XP

Habit Completion

Example:

85% Complete

Show how many planned habits were completed today.

3. Categories to Track

The dashboard must track the following major categories:

1. Study and Academics

Track:

Study hours

Subjects studied

Daily study goal

Study completion

Productivity rating

Focus rating from 1–10

Tasks completed

Reading pages

Default goal:

Study: 4 hours per day

2. Exercise and Fitness

Track:

Exercise completed

Exercise duration

Type of exercise

Daily completion

Fitness rating from 1–10

Default goal:

Exercise: 30 minutes per day

3. Coding and Technical Skills

Track:

Coding completed

Coding hours

Technology or skill practiced

Project progress

Learning progress

Skill rating from 1–10

Default goal:

Coding: 1 hour per day

4. Productivity

Track:

Productivity rating from 1–10

Important tasks completed

Total tasks

Focus level

Distraction level

Daily productivity percentage

5. Diet and Water

Track:

Healthy eating completed

Water intake

Water goal

Diet quality rating from 1–10

Daily completion percentage

Allow customizable water goals.

6. Sleep

Include sleep because it directly affects improvement and performance.

Track:

Hours slept

Sleep quality rating from 1–10

Whether the 8-hour goal was achieved

Default goal:

Sleep: 8 hours per day

7. Reading

Track:

Pages read

Books being read

Reading completion

Default goal:

Reading: 20 pages per day

4. Daily Check-In System

Create a simple but detailed daily check-in page.

The user should be able to enter data using a combination of:

Checkboxes

Hours

Minutes

Ratings from 1–10

Percentages

Number inputs

Automatic calculations where possible

Example daily entry:

Study

Studied today: Yes/No

Study hours: 3.5

Subject: Physics

Focus rating: 8/10

Exercise

Exercised: Yes/No

Duration: 45 minutes

Exercise type: Running

Fitness rating: 9/10

Coding

Coded today: Yes/No

Coding hours: 1.5

Skill/technology: JavaScript

Progress rating: 8/10

Productivity

Productivity rating: 7/10

Focus rating: 8/10

Distraction rating: 4/10

Diet

Ate healthy: Yes/No

Water consumed: 2.5 liters

Diet quality: 8/10

Sleep

Sleep hours: 7.5

Sleep quality: 8/10

Reading

Pages read: 25

Reading completed: Yes/No

Automatically calculate percentages and scores whenever possible.

5. Overall Growth Score

Create an intelligent Growth Score out of 100.

The score should be calculated using multiple aspects:

Study

Exercise

Coding

Productivity

Diet and water

Sleep

Reading

Habit completion

Task completion

Make the scoring system transparent.

The user must be able to:

Customize category weights

Enable or disable categories

Adjust goals

Example:

CategoryWeightStudy20%Productivity15%Coding15%Exercise10%Sleep10%Diet and Water10%Reading10%Habit and Task Completion10%

Ensure all weights always total 100%.

Each category should calculate its own score from 0–100.

The final Growth Score should be the weighted average.

Show a clear explanation of how the score was calculated.

6. Daily Improvement Comparison

Compare today's performance with:

Yesterday

Last 7 days

Previous week

Previous month

Display:

📈 Improving
📉 Declining
➡ Stable

Example:

Your Growth Score increased by 12% compared to yesterday.

Also identify:

Biggest improvement

Biggest decline

Most consistent category

Weakest category

7. Charts and Analytics

Create a dedicated Analytics page.

Include the following visualizations.

Pie Chart

Show how effort or time is distributed between:

Study

Coding

Exercise

Reading

Other productive activities

Growth Score Line Chart

Display:

Daily Growth Score

Weekly average

Monthly average

Allow filters for:

Last 7 days

Last 30 days

Last 3 months

Last 6 months

Last year

Custom date range

Bar Charts

Compare categories such as:

Study performance

Coding performance

Exercise

Productivity

Sleep

Diet

Reading

Allow comparison between:

This week vs last week

This month vs last month

Custom date ranges

Calendar Heatmap

Create a GitHub-style calendar heatmap.

Each day should represent the Growth Score.

The user should immediately see:

Highly productive days

Average days

Low-performance days

Days with no data

Clicking a day should open that day's complete record.

Radar Chart

Create a radar/spider chart comparing:

Study

Exercise

Coding

Productivity

Diet

Sleep

Reading

Use it to compare:

Current week

Previous week

Current month

Previous month

This should help visually identify balanced and unbalanced areas.

Time Breakdown

Show total time spent on:

Studying

Coding

Exercise

Reading

Display daily, weekly, and monthly totals.

8. Streak System

Create an advanced streak system.

Track:

Overall improvement streak

Study streak

Exercise streak

Coding streak

Reading streak

Habit completion streak

Display:

🔥 Current streak
🏆 Longest streak

Example:

🔥 12-day study streak
🏆 Longest streak: 31 days

Allow users to define what counts as a successful day.

For example:

Minimum Growth Score

Minimum percentage of habits completed

Specific important habits completed

9. Best and Worst Day

Automatically calculate:

Best Day 🏆

Show:

Date

Growth Score

Activities completed

Why it was the best day

Example:

August 12, 2026 — Growth Score: 94/100

Worst Day

Show:

Date

Growth Score

Missed goals

Categories that caused the low score

This should help identify patterns rather than simply punish the user.

10. Goals System

Create a dedicated Goals page.

Default goals:

Study: 4 hours/day

Sleep: 8 hours/day

Exercise: 30 minutes/day

Coding: 1 hour/day

Reading: 20 pages/day

Allow the user to:

Create new goals

Edit goals

Delete goals

Pause goals

Set daily goals

Set weekly goals

Set monthly goals

Add target dates

Show progress bars and completion percentages.

Example:

Study This Week

18 / 28 hours

Progress: 64%

11. Task Management System

Create a complete task/to-do system.

The user should be able to:

Add tasks

Edit tasks

Delete tasks

Mark tasks as complete

Set deadlines

Set priorities

Priorities:

High

Medium

Low

Display:

Total tasks

Completed tasks

Remaining tasks

Completion percentage

Allow filtering by:

Today

Upcoming

Completed

High priority

Overdue

Tasks should also influence the Productivity Score.

12. Gamification System

The application should feel motivating but not childish.

XP System

Award XP for positive actions.

Examples:

Complete daily check-in: +10 XP

Complete study goal: +25 XP

Complete coding goal: +20 XP

Complete exercise goal: +15 XP

Complete all daily goals: bonus XP

Maintain a streak: bonus XP

The XP system should be configurable.

Levels

Users gain levels as they earn XP.

Example:

Level 1 — Beginner
Level 2 — Building
Level 5 — Consistent
Level 10 — Focused
Level 20 — High Performer
Level 50 — Elite Growth

Create a scalable level system where XP requirements gradually increase.

Achievements

Create achievements such as:

🔥 First 7-Day Streak
📚 100 Study Hours
💻 100 Coding Hours
🏋️ 30 Exercise Sessions
📖 1,000 Pages Read
🎯 Perfect Day
⚡ 30-Day Consistency
🏆 90+ Growth Score

Show:

Locked achievements

Unlocked achievements

Unlock date

Progress toward achievements

13. Improvement Insights

Create an intelligent insights section.

Based on stored user data, automatically generate observations such as:

Your study performance is improving.

Your productivity drops when you sleep less than your target.

Coding consistency is your weakest area this week.

You perform best on Mondays.

Your best Growth Score usually happens when you exercise and complete your study goal.

Only generate insights based on actual user data.

Clearly distinguish between:

Measured observations

Trends

Predictions

Do not present guesses as facts.

14. Prediction and Future Goals

Create a prediction section based on historical data.

Examples:

Estimated monthly study hours

Expected goal completion

Predicted streak length

Growth Score trend

Predictions must be clearly labeled as estimates based on historical data.

Example:

Based on your last 30 days, your estimated Growth Score next week is 78–84.

15. Automatic Tracking

Where technically possible and with user permission, support automatic tracking.

Potential integrations:

Device screen time

Step count

Calendar

Study timers

Coding activity

However, manual entry must always work.

Do not pretend automatic tracking works unless the necessary integration and permissions are actually implemented.

16. Navigation

Create a clean sidebar or top navigation with:

🏠 Dashboard
📝 Daily Check-In
📊 Analytics
🎯 Goals
✅ Tasks
🔥 Streaks
🏆 Achievements
📈 Insights
⚙️ Settings

17. Design Requirements

The design should combine:

Clean Minimal White Interface + Professional Analytics + Subtle Gamification

Design principles:

Bright white background

Clean modern typography

Plenty of whitespace

Rounded cards

Subtle shadows

Minimal clutter

Professional dashboard appearance

Smooth animations

Responsive design

Mobile-friendly

Desktop-friendly

The interface should not look childish.

Gamification should feel similar to a modern productivity application.

Use visual hierarchy to make the most important information immediately visible.

Prioritize:

Today's Growth Score

Current streak

Today's goals

Today's tasks

Improvement compared to yesterday

Weakest area requiring attention

18. Dashboard Layout

Suggested layout:

Top Section

Greeting

Current date

Growth Score

Improvement percentage

Summary Cards

Growth Score

Streak

Level and XP

Habit Completion

Today's Progress

Show progress for:

Study

Coding

Exercise

Sleep

Diet and Water

Reading

Productivity

Use progress bars and percentages.

Middle Section

Growth Score trend chart

Category performance chart

Bottom Section

Today's tasks

Goals progress

Recent achievements

AI/data-driven insights

19. Data and History

Store historical data permanently.

The user must be able to:

View previous days

Edit previous entries

Compare dates

Search historical data

Filter by date range

Editing old data should automatically recalculate:

Growth Score

Streaks

XP

Statistics

Charts

Achievements where appropriate

20. Settings and Customization

Allow users to customize:

Daily goals

Category weights

Scoring system

Water goal

Habit list

XP rewards

Streak requirements

Notifications

Preferred units

Dashboard preferences

The dashboard should be personalized and flexible.

Technical Requirements

Build a production-quality responsive web application.

Include:

Modern frontend architecture

Cloud database

Secure authentication

User-specific data isolation

Responsive UI

Form validation

Error handling

Loading states

Empty states

Accessible design

Persistent data

Automatic recalculation of statistics

Use a clean and maintainable database structure.

Suggested data models:

Users

Daily Entries

Categories

Habits

Habit Logs

Goals

Tasks

XP Transactions

Levels

Achievements

User Achievements

Growth Score History

Use proper relationships between tables.

Important Logic Rules

Never show fake statistics as real data.

Use realistic empty states when the user has not entered enough data.

Label predictions and estimates clearly.

Recalculate statistics when historical data changes.

Prevent streaks from increasing when a day does not meet the defined requirements.

Allow users to customize scoring weights.

Ensure category weights always total 100%.

Keep the interface fast and simple even when years of data exist.

Make every chart interactive where practical.

Clicking dates should show detailed historical data.

Final Product Vision

The final application should feel like a combination of:

A personal productivity dashboard

A habit tracker

A goal tracker

A data analytics platform

A gamified self-improvement system

The central idea is:

Measure yourself. Understand your patterns. Improve consistently.

Build the application completely rather than creating only a static UI mockup.

Start by creating the database architecture, authentication, and core data models, then build the dashboard, daily tracking system, analytics, goals, tasks, gamification, and insights.

Use sensible defaults, but make the entire system customizable by the user.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8cf62b37-01ae-4ec6-8419-89ba32d5a131).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
