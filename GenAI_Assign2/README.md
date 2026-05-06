# CLOVE

`CLOVE` is a polished conversational CLI agent for ML-flavored building workflows, code generation, and website cloning.

A polished terminal-first agent that runs in a visible reasoning loop, uses local tools, and produces real output files. Website cloning and landing-page generation are capabilities the agent can invoke when asked, including Scaler-style clones and other branded sites.

## What it does

- Runs an interactive terminal chat loop
- Uses a visible `START -> THINK -> TOOL -> OBSERVE -> OUTPUT` execution model
- Persists conversation state across turns
- Creates real files and folders inside the workspace
- Can generate a browser-ready HTML/CSS/JS website project from a natural-language request
- Accepts reference sites such as `scaler.com` or other website URLs in clone prompts
- Supports an offline demo mode and a live Gemini-backed dual-model mode

## Why this is stronger

- The project is no longer hardcoded around one pre-generated Scaler clone
- Website cloning is implemented as a reusable agent capability through `create_website_project`
- Gemini 2.5 Flash-Lite is used as the fast worker, while Gemini 2.5 Pro is reserved for escalation and repair phases
- The architecture is split into clear modules for environment loading, agent orchestration, offline planning, terminal rendering, tool execution, and site generation
- The CLI now includes quality-of-life commands such as `/help`, `/tools`, `/models`, `/history`, `/reset`, and `/about`
- The terminal experience is branded around `CLOVE` with a stronger visual shell

## Project structure

```text
src/
  agent.js         Core agent loop and tool orchestration
  demoPlanner.js   Offline planning path for demo mode
  env.js           Lightweight .env loader
  index.js         Interactive CLI entrypoint
  modelRouter.js   Primary/secondary Gemini model routing
  siteBuilder.js   Website project generator capability
  smoke.js         Quick end-to-end smoke runner
  terminal.js      Terminal rendering helpers
  tools.js         Tool registry and implementations
```

## Run

```bash
npm start
```

## Demo mode

Runs without an API key and demonstrates the website-generation workflow:

```bash
npm run demo
```

## Live model mode

Create a `.env` file from `.env.example` or export the variable in your shell:

```bash
GEMINI_API_KEY=your_api_key_here
```

Then run:

```bash
npm start
```

## Example prompts

```text
Clone the Scaler Academy website into a folder named scaler_clone_site.
```

```text
Clone https://stripe.com into a folder named stripe_clone_site.
```

```text
Create a premium landing page for a tech education brand with header, hero section, and footer.
```

## Smoke test

```bash
npm run smoke
```

This runs the offline agent path and verifies that it can create a website project through its own tool loop.

## Notes

- Live requests use the Gemini `generateContent` API with `GEMINI_API_KEY`.
- The agent asks the model for structured JSON steps and then executes local tools one step at a time.
- Clone prompts are treated as local recreations inspired by the reference site's structure and tone, producing original local HTML, CSS, and JavaScript files.
- `Gemini 2.5 Flash-Lite` is the default worker for fast loops, retries, cleanup, and componentization.
- `Gemini 2.5 Pro` is used only for escalation cases such as layout failures, responsiveness issues, architecture-heavy requests, and repair/refactor phases.

## Model pipeline

The intended `CLOVE` flow is:

1. Interpret the website or cloning request
2. Generate or inspect the working structure
3. Route the fast worker path through Gemini 2.5 Flash
4. Escalate to Gemini 2.5 Pro only when the request or loop state justifies deeper review
5. Verify output files before finishing
