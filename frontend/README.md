# MentorConnect: Student Mentoring and Career Support Platform

**Guidance that moves you forward.** MentorConnect connects current IITM BS students with alumni and recent graduates. Students create profiles, discover mentors, send requests and track career goals. Mentors set their own capacity and decide on requests. Programme admins monitor participation and manage users.

This is the **frontend-only** submission (Milestone 2 UI, visually redesigned). All data is mock data kept in the browser.

## Technology stack
Vue 3 (Composition API, `<script setup>`), Vite, Vue Router (hash history), JavaScript, composables for shared state, plain CSS with design tokens, mock data. No UI framework and no icon dependency (a small inline SVG icon set is included).

## Prerequisites
Node.js 18 or newer and npm. Check with `node -v` and `npm -v`.

## Install and run
```bash
npm install
npm run dev        # open the URL printed by Vite, normally http://localhost:5173
npm run build      # production build into dist/
npm run preview    # optional: serve the production build
```

## Demo accounts (password for all: `Demo1234`)
| Role | Email |
|---|---|
| Student | student@mentorconnect.demo |
| Mentor | mentor@mentorconnect.demo |
| Coordinator | coordinator@mentorconnect.demo |
| Admin | admin@mentorconnect.demo |

The login page also has one-click demo buttons. New accounts can be registered: students need an email ending in `study.iitm.ac.in`; new mentors are hidden from students until an admin verifies them.

## Design approach
Each role gets a workspace built around its main task, not one shared dashboard.
- **Student (top navigation):** Home shows one *next step* chosen from the student's data, the five-stage mentoring journey, a career roadmap with progress ring, current mentors and pending requests with days left, and recent activity. Find mentors uses a filter panel beside the results, sorts by transparent interest match, and shows each mentor's free places as dots. Career roadmap has a progress ring, a next-milestone panel and the To do / In progress / Done board.
- **Mentor (top navigation):** Home lists requests waiting for a reply first (oldest first, with student interests and a message preview), then mentees with goal progress, and keeps capacity and pause controls beside them.
- **Admin (sidebar):** Overview, Users and Reports sections. Overview shows a figures strip, a needs-attention list, mentor supply versus student demand by career area, and recent mentoring activity (no message content).
- **Auth:** role-first sign in and registration, with a short "How it works" panel.

## Visual design
Retro-editorial workspace: ivory dotted ground, a thin dark frame with a sage gradient title bar, a charcoal context panel on the left, deep-teal content area, and a vertical icon navigation on the right (bottom bar on mobile). Hard borders and offset shadows replace soft shadows. Text on the teal frame is light and text on paper surfaces is dark; every filled control sets both colours (all pairs checked at 4.5:1 or better). The theme lives in `src/assets/theme.css`, loaded after the older stylesheets.

## Features by role
**Student:** profile with skills (level 1 to 5, "want to learn"), mentor directory (search, area, expertise, places, sort, pagination), mentor details (availability when matched, public feedback), request form (50 to 1500 characters, live counter, max 3 pending, attach goals), request tracking with timeline and withdrawal, career goals (kanban, tags, visibility: only me / all mentors anonymous / only my mentor, optional coordinator sharing), sessions (book from your mentor's open slots, log past sessions, notes, action items for either person), feedback (check-in and final, edit within 15 minutes, optional public final feedback), notifications, report a user, anonymous platform feedback, account deletion with confirmation.
**Mentor:** profile with admin verification status, expertise from the approved tag list (suggest new tags), capacity 1 to 10 and pause, incoming requests (accept re-checks capacity and shows a 409 conflict, reject with optional reason up to 500 characters), mentees (read-only goals, anonymous open goals), availability (add, edit, remove; booked slots locked; no past slots; no overlaps), sessions, feedback, notifications, report, deletion.
**Coordinator:** insights (aggregates, supply and demand, stuck requests by status and age only with a reminder action, anonymised unmatched students), matching (capacity-checked assignment, in-app message through an anonymised relay address), my groups, open goals and goals shared with coordinators, anonymous platform feedback.
**Admin:** overview (aggregates, participation trend, needs-attention list), users (verify mentors, block and unblock with pending requests closed and notifications, deletion status, retention purge demo, audit log), matching and coordinator group assignment, content (approve or reject suggested tags, merge duplicates, feedback criteria, all goals, all feedback), reports (status and action taken, evidence name).
**System rules (mock):** requests expire after 14 days and log actor System, withdrawing frees quota, goals switch to "only my mentor" when a mentorship starts, notifications on request, session and account changes, 404-style "not found" for records you cannot see.

## Project structure
`src/pages` (by role), `src/layouts` (auth and app shell), `src/components` (Icon, Avatar, Ring, PageHeader, EmptyState, MentorCard, Badge, ConfirmModal, RequestTimeline), `src/composables/useStore.js` (shared state and all business rules), `src/data/mock.js` (seed data), `src/router`, `src/utils/helpers.js`, `src/assets/styles.css` (design tokens and shared components) and `src/assets/workspace.css` (role layouts).

## Mock data
`src/data/mock.js` seeds 5 students, 6 mentors, 1 admin, requests in every status, mentorships, goals, notifications and 2 reports. State is shared through `useStore.js`, so an action on one page (sending, accepting, moving a goal) updates the other pages. It is saved in `localStorage`. To reset, run `localStorage.removeItem('mentorconnect_demo_v3')` in the browser console and reload.

## Frontend limitations
No backend, real API, database or email service. Authentication is simulated, passwords sit in `localStorage`, and route guards are not real security. Request expiry runs in the browser on navigation, not on a server scheduler. The Manrope font loads from Google Fonts when online and falls back to system fonts offline.

## Troubleshooting
- **`npm install` fails:** check the Node version (18+) and your internet connection, then delete `node_modules` and retry.
- **Blank page or stale data:** hard refresh, or reset the demo data as described above.
- **Port already in use:** Vite picks the next free port; use the URL it prints.
- **Logged out unexpectedly:** the demo session lives in `localStorage`; clearing site data logs you out.

## Contributing
See `docs/GIT_WORKFLOW.md`. Never push directly to `main`; use a feature branch and a pull request.
