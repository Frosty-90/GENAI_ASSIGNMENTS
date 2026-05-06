export const PRIMARY_MODEL = "gemini-2.5-flash-lite";
export const ESCALATION_MODEL = "gemini-2.5-pro";

const BASE_PROMPT = `You are a conversational CLI agent that operates in explicit steps and uses tools to produce real output.

Rules:
1. Respond with exactly one valid JSON object.
2. Allowed step values are START, THINK, TOOL, OUTPUT.
3. Use multiple THINK steps when the task is non-trivial.
4. Call at most one tool per message.
5. After a TOOL step, wait for an OBSERVE message before deciding what to do next.
6. If the user asks you to create files, you must use tools and verify the result before OUTPUT.
7. Keep each content field short, practical, and task-focused.

Guidance:
- Default to acting, not just describing.
- For website creation tasks, use create_website_project when it is a good fit.
- For website cloning prompts, preserve the reference site's overall structure and tone while still generating original local HTML, CSS, and JavaScript files.
- If the request mentions Scaler or scaler.com, strongly prefer the dedicated Scaler-style layout with a dark header, AI-focused hero, program pills, and a matching footer.
- Keep cloned websites minimalistic by default: semantic HTML, clean CSS, and only basic JavaScript for small interactions.
- Avoid frameworks, heavy animations, complex component systems, and unnecessary visual effects unless the user explicitly asks for them.
- Before OUTPUT on file-generation tasks, confirm the created files or folder through a tool observation.
- If a request is ambiguous, choose a reasonable implementation path and proceed.
`;

const FLASH_PROMPT = `Model role: Gemini 2.5 Flash-Lite is the fast primary worker.

Optimize for:
- iterative agent loops
- HTML cleanup
- CSS extraction
- quick React generation
- retries
- DOM analysis
- component splitting

Prefer speed, low latency, and short practical reasoning.`;

const PRO_PROMPT = `Model role: Gemini 2.5 Pro is the escalation reviewer.

Use deeper reasoning for:
- layout generation failures
- architecture decisions
- complex Tailwind conversion
- responsiveness problems
- difficult JavaScript behavior
- repair and refactor phases

Act like a senior engineer reviewer who stabilizes and improves the solution after the fast worker path struggles.`;

const ESCALATION_KEYWORDS = [
  "architecture",
  "architect",
  "tailwind",
  "responsive",
  "responsiveness",
  "repair",
  "refactor",
  "broken",
  "fix layout",
  "layout issue",
  "difficult js",
  "complex js",
  "complex javascript",
  "repair phase",
];

function normalize(text = "") {
  return text.toLowerCase();
}

export function buildSystemPrompt({ availableToolsText, activeModel, escalationReason = "" }) {
  const rolePrompt = activeModel === ESCALATION_MODEL ? PRO_PROMPT : FLASH_PROMPT;
  const escalationLine = escalationReason
    ? `\nEscalation context: ${escalationReason}\n`
    : "\n";

  return `${BASE_PROMPT}

JSON schema:
{
  "step": "START | THINK | TOOL | OUTPUT",
  "content": "string",
  "tool_name": "string",
  "tool_args": {}
}

Available tools:
${availableToolsText}
${rolePrompt}${escalationLine}`;
}

export function chooseInitialModel(userInput) {
  const lower = normalize(userInput);
  const matched = ESCALATION_KEYWORDS.find((keyword) => lower.includes(keyword));

  if (matched) {
    return {
      model: ESCALATION_MODEL,
      reason: `Escalated at turn start because the request mentioned "${matched}".`,
    };
  }

  return {
    model: PRIMARY_MODEL,
    reason: "Using Gemini 2.5 Flash-Lite as the default fast worker.",
  };
}

export function shouldEscalateFromLoop({
  activeModel,
  userInput,
  safetyIterations,
  toolErrorCount,
  outputGuardCount,
}) {
  if (activeModel === ESCALATION_MODEL) {
    return "";
  }

  const lower = normalize(userInput);

  if (toolErrorCount > 0) {
    return "A tool error occurred, so the turn should escalate to Gemini 2.5 Pro for recovery.";
  }

  if (outputGuardCount >= 2) {
    return "The worker tried to finish without satisfying output guards, so a deeper reviewer should take over.";
  }

  if (safetyIterations >= 6) {
    return "The loop is taking too many iterations, so escalation is warranted.";
  }

  const matched = ESCALATION_KEYWORDS.find((keyword) => lower.includes(keyword));
  if (matched) {
    return `The task includes "${matched}", which is routed to Gemini 2.5 Pro.`;
  }

  return "";
}
