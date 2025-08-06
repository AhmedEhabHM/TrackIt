#  TrackIt – Smart Task & Habit Tracker

TrackIt is a modern and intuitive web app for managing daily tasks and tracking habits. Built using **React.js**, it’s designed to reflect the skill level of a CS50 graduate while maintaining a clean and professional UI/UX.

---

##  Project Idea

TrackIt empowers users to:
- Create and manage daily to-dos.
- Build consistent habits (daily or weekly).
- Stay motivated with progress stats and a clean, interactive interface.

No backend is used — data is stored in the browser via `localStorage`, making it lightweight and beginner-friendly.

---

##  Features

###  Authentication
- User registration & login (without backend)
- Session persistence via `localStorage`
- Basic form validation (email, password)
- Route protection for authenticated users

###  Dashboard
- Summary of today’s tasks and active habits
- Simple analytics:  
  - % of tasks completed today  
  - Total habits completed  
- Motivational UI feedback

###  To-Do Management
- Add / edit / delete tasks
- Mark tasks as completed (✔️)
- Optional: Auto-clear or archive completed tasks

###  Habit Tracking
- Add habits (daily or weekly)
- Track progress with streak counters or bars
- Visualize consistency
- Automatically reset based on schedule

###  Dark / Light Theme
- Toggle between light & dark modes
- Persist theme preference in `localStorage`

---

## 💻 Tech Stack

| Area               | Technology                           |
|--------------------|---------------------------------------|
| Frontend           | React.js                              |
| State Management   | useState, useEffect, Context API       |
| Routing            | React Router                          |
| Styling            | CSS Modules + Bootstrap               |
| Icons              | react-icons                           |
| Data Persistence   | LocalStorage                          |
| Unique IDs         | uuid                                  |

---

## Live Demo
https://track-it-gnj5.vercel.app/
