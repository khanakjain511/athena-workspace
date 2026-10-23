# Athena assessment workspace

A React assessment interface for candidate setup, multiple-choice questions, and results, with an optional Electron desktop shell.

## Development

Run `npm install` and `npm run dev` in this directory. Run `npm run dev` in `../backend 2` to start the assessment API on port 3000. Set `VITE_API_BASE_URL` to use another API location.

Run `npm run electron` while the Vite server is running to open the desktop app.

## Interface

The workspace uses solid blue accents, white panels, neutral surfaces, and a consistent dashboard layout across all three stages. Readiness metrics reflect current permission state, setup includes checklist and guidelines views, and the sidebar provides assessment and privacy guidance. Panels and controls use shared corner-radius tokens and adapt to narrow screens. DevClub UI Candy Button, Hook Sidebar, and Segmented Progress are adapted locally to the solid-colour palette; source details and licensing are in `THIRD_PARTY_NOTICES.md`. Candidates must enter their name, connect a camera, and enter full screen before starting. The camera preview remains connected during the assessment and its tracks stop after submission. The assessment supports question navigation, automatic answer saving, an elapsed timer, and a results breakdown. Saved answers cannot be changed.

Setup, Assessment, and Results are clickable workspace destinations. Before starting, Assessment shows the required checks and Results shows an empty state. Navigation preserves an active session’s answers, camera, question position, and elapsed time. Candidate details become read-only after starting, and returning to Setup resumes the existing session. After submission, Assessment links to the saved results and the camera is released.

The sidebar stays within the viewport on desktop and becomes a sticky compact navigation bar on mobile. Framer Motion handles spring feedback, shared navigation indicators, question transitions, and dialogs. GSAP handles scoped, staggered page entrances using matchMedia cleanup. Both respect reduced-motion preferences. Motion settings are maintained in `src/animation/transitions.js`; sidebar styles live in `src/components/Workspace.css`.

The assessment guide is available in the header. Full-screen changes, camera failures, and API errors are surfaced in the interface. Desktop camera snapshots are stored locally by the existing Electron integration.

## Validation

- `npm run lint` checks the project with ESLint.
- `npm run build` creates the production bundle.
- `npm run preview` serves the production bundle locally.

Camera access requires localhost or HTTPS and a connected camera. End-to-end assessment checks require the API, camera permission, and browser full-screen support.
