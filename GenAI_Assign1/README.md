# Scaler Persona Studio

A persona-based AI chatbot built for Scaler Academy's Prompt Engineering assignment. Users can switch between three researched Scaler/InterviewBit personalities and chat with each one in a fresh thread.

- Anshuman Singh
- Abhimanyu Saxena
- Kshitij Mishra

## What it includes

- Distinct system prompts per persona
- Persona switcher that resets the conversation
- Suggestion chips for quick-start prompts
- Typing indicator during API calls
- Graceful API error handling
- Responsive UI for desktop and mobile
- `prompts.md` with annotated prompts
- `reflection.md` with assignment reflection

## Tech stack

- Next.js
- React
- Gemini API
- Plain CSS with a custom editorial-style UI

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env.local
```

On Windows PowerShell, you can also run:

```powershell
Copy-Item .env.example .env.local
```

3. Add your Gemini key to `.env.local`:

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
```

4. Start the app:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000).

## Environment variables

- `GEMINI_API_KEY`: required
- `GEMINI_MODEL`: optional, defaults to `gemini-2.5-flash`

## Deployment

This app is ready for Vercel deployment because the frontend and API route live in the same Next.js app.

Recommended steps:

1. Push the repo to GitHub
2. Import the project into Vercel
3. Add `GEMINI_API_KEY` and optional `GEMINI_MODEL` in Vercel
4. Deploy

Live URL:

- Add your deployed URL here before submission

## Repo checklist

- `README.md` with setup and deployment guidance
- `.env.example` with no real secrets
- `prompts.md` with annotated persona prompts
- `reflection.md` with a 300-500 word reflection

## Research basis

The prompts were grounded in public information and public-facing reputation signals such as:

- Scaler about page
- Scaler course and blog pages
- Public LinkedIn profile and post snippets surfaced in search
- Public podcast summaries and interview summaries

## Screenshots

Add desktop and mobile screenshots here after running the app locally or after deployment.
