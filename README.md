## Manhaji V2

AI-first learning dashboard for Egyptian students with bilingual UI, adaptive course tracking, and an integrated Gemini-powered tutor.

### Tech Stack
- React + TypeScript + Vite
- Tailwind CSS
- Google Gemini 2.5 Flash via `@google/genai`

### Getting Started
1. **Install deps**
	```bash
	npm install
	```
2. **Create `.env.local`** in the project root:
	```bash
	GEMINI_API_KEY=your_real_key
	```
	`vite.config.ts` exposes this value as both `process.env.GEMINI_API_KEY` and `process.env.API_KEY`, so either property works in code.
3. **Run the app**
	```bash
	npm run dev
	```
4. Open http://localhost:3000 and sign in via the mock flow to reach the dashboard.

### Installation Manual
1. **Clone the repo** (or download the source)
	```bash
	git clone <repo-url>
	cd Manhaji_V2
	```
2. **Verify Node.js 18+**
	```bash
	node -v
	```
	Upgrade if needed so Vite and Gemini SDK work reliably.
3. **Install dependencies**
	```bash
	npm install
	```
4. **Configure Gemini credentials**
	- Create `.env.local` with `GEMINI_API_KEY=...`
	- Restart the dev server whenever this file changes.
5. **Development workflow**
	```bash
	npm run dev          # start UI on http://localhost:3000
	npm run build        # output production bundle to dist/
	npm run preview      # serve the production build
	```
6. **Optional: Static assets**
	- Place logos under `public/`
	- Update `components/Layout.tsx` if you swap branding.

### Available Scripts
- `npm run dev` – Vite dev server
- `npm run build` – production build
- `npm run preview` – preview the production bundle locally

### Gemini Troubleshooting
- Ensure `.env.local` is saved **before** starting the dev server.
- If the tutor stays silent, check the browser console for `Gemini Error` logs.
- Confirm the network tab shows successful requests to Google APIs; 401/403 means the key is invalid or lacks permissions.

### Project Structure (excerpt)
```
components/      UI modules (Dashboard, AIChat, etc.)
contexts/        Language provider
services/        Gemini integration
utils/           Localization helpers
```

### Conventions
- Arabic is RTL; `useLanguage` controls both direction and translations.
- Keep UI text in `constants.ts` under `TRANSLATIONS` to stay bilingual.
- Resist hardcoding Gemini details in components; use `constants` + `geminiService`.
