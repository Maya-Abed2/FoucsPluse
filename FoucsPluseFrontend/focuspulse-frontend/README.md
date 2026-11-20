# FocusPulse 🚀

An interactive focus and task management platform designed to help overcome distractions and enter deep focus—combining work/break timer sessions, task breakdown into micro-steps, an XP and leveling system, an embedded Spotify focus player, and progress sharing with an accountability partner.

---

## ✨ Key Features

* **Interactive Focus Timer (`FocusTimer`):** Work and break sessions with a dynamic circular progress ring (`SVG Progress Ring`), plus play/pause and reset controls.
* **Task & Micro-Step Management (`TaskManager`):**
  * Create tasks with required energy levels (`Low / Medium / High`) and estimated durations.
  * Break tasks down into actionable micro-steps (`Micro Steps`) and toggle completion status.
  * Built-in per-task stopwatch to track actual time spent when completing a task.
  * Send completion reports to an accountability partner.
* **XP & Leveling System:** Tracks progress and updates user XP and level upon task and step completion, persisting state across reloads.
* **Focus Music & Soundscapes (`SoundscapesPlayer`):** Play curated focus playlists via an embedded Spotify player, with optional account connection to browse personal playlists.
* **Companion & Focus Support (`AiRobotCompanion` & `PanicButton`):** Supportive UI elements to help stay on track during distracting moments.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide Icons, Axios.
* **Backend:** ASP.NET Core Web API / REST API (task services and Spotify integration).
* **State & Persistence:** React Hooks (`useState`, `useEffect`) and `localStorage` for session and state management.

---

## 📁 Project Structure

```text
├── app/                  # Next.js App Router pages and routing
├── components/           # UI components (FocusTimer, TaskManager, SoundscapesPlayer, etc.)
├── services/             # API client services (e.g., taskService)
├── public/               # Static images, backgrounds, and icons (e.g., bg.png, wood.png, cup.png, char6.png)
└── README.md             # Project documentation