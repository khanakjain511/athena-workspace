# Athena

An assessment workspace with a React dashboard, an optional Electron desktop shell, and an Express API. Candidates complete their setup, answer multiple-choice questions, and review their results. Navigation preserves the active session, saved answers, camera preview, and elapsed time.

## Run locally

Use Node.js 22.12 or newer and npm. Install each application's dependencies once:

```sh
cd "backend 2"
npm ci
npm run dev
```

In a second terminal:

```sh
cd Athena-Clone-3
npm ci
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`. The API defaults to port 3000; set `PORT` in the backend environment to change it. Set `VITE_API_BASE_URL` before starting Vite when the API uses another address.

To use the desktop shell, run `npm run electron` from `Athena-Clone-3` while the frontend and API are running. The shell expects the frontend on port 5173.

## Project layout

- `Athena-Clone-3/src`: workspace navigation, setup, assessment, results, shared controls, and motion.
- `Athena-Clone-3/app`: Electron window, preload bridge, timer events, and local camera snapshots.
- `Athena-Clone-3/tests`: browser fixtures with simulated camera permissions and API responses.
- `backend 2/server.js`: question retrieval, session creation, answer saving, and submission.
- `backend 2/data/questions.json`: the supplied question bank. Runtime sessions are created locally and excluded from Git.

The interface uses solid colours, shared spacing and radius tokens, Framer Motion interactions, and GSAP page entrances. Both animation systems respect reduced-motion preferences. DevClub component adaptations and their MIT attribution are documented in `Athena-Clone-3/THIRD_PARTY_NOTICES.md`.

## Check changes

```sh
cd Athena-Clone-3
npm run lint
npm run build
```

```sh
cd "backend 2"
npm test
```

Browser regression instructions are in `Athena-Clone-3/tests/README.md`. The API test runs against a temporary data directory and never reads or changes local candidate sessions.

## Current limits

This is a local demonstration project. The API has no authentication or authorization, permits cross-origin requests, and persists sessions through synchronous JSON file writes. It needs access controls, stronger request validation, and transactional persistence before being exposed as a shared service.

The Electron shell loads the development server and stores snapshots locally. Physical camera capture, native dialogs, and packaged desktop distribution require separate integration testing. Build and browser fixture checks do not establish those behaviours.
