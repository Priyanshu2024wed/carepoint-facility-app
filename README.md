# CarePoint — Virus Quarantine & Treatment Facility Management

A frontend-only React/Vite prototype based on the supplied PRD. Uses fictional seed data and browser `localStorage`.

## Features
- Demo role switcher: Nurse, Doctor, Admin (not real authentication).
- Dashboard: occupancy out of 74, pending checks/visits, discharge eligibility, outcomes and mortality benchmark.
- Patient search and filters; add patient with room/capacity validation.
- Record daily temperature in °C or °F, duplicate-day prevention and correction flow.
- Patient detail modal with temperature history, visit notes, fever-free count and discharge state.
- Doctor visit workflow and doctor-only discharge decision.
- Admin-only completion of discharge after doctor approval.
- Reports with outcome counts, mortality/survival rates and a 15% mortality alert.
- Browser local storage persistence and reset-demo-data action.

## Run locally
Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build
```bash
npm run build
npm run preview
```

## Deploy to Vercel
1. Extract the ZIP and push the project folder to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import that repository.
3. Framework preset: **Vite** (usually detected automatically).
4. Build command: `npm run build`; output directory: `dist`.
5. Deploy. The included `vercel.json` supports client-side route fallback.

You can also use Vercel CLI from this folder: `npx vercel` and follow its prompts.

## Important limitations
- This is a demonstration, not a clinical system. Do not enter real patient data.
- No backend, shared database, secure login, server authorization, audit trail, encryption controls, notifications or multi-device sync.
- Browser local storage is device/browser-specific and can be edited or cleared by users.
- The PRD does not define a clinical fever threshold. The demo uses a configurable threshold of 37.5°C as an illustrative prototype default only; confirm the correct threshold with qualified clinical stakeholders before any real use.
- Fever-free day calculation requires a recorded reading for each full calendar day and treats readings at or above the configured threshold as fever. This is an implementation assumption for demonstration, not a medical recommendation.
- Mortality/survival rates use patients with recorded outcomes as denominator, as specified in the PRD.
- Seed patients and clinical observations are entirely fictional.
