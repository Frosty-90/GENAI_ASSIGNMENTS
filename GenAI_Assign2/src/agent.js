import { loadDotEnv } from "./env.js";
import { createOfflinePlan } from "./demoPlanner.js";
import { buildSystemPrompt, chooseInitialModel, ESCALATION_MODEL, PRIMARY_MODEL, shouldEscalateFromLoop } from "./modelRouter.js";
import { printModelUpdate, printStep } from "./terminal.js";
import { toolDefinitions, toolMap } from "./tools.js";

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    step: {
      type: "string",
      enum: ["START", "THINK", "TOOL", "OUTPUT"],
    },
    content: {
      type: "string",
    },
    tool_name: {
      type: "string",
    },
    tool_args: {
      type: "object",
    },
  },
  required: ["step", "content", "tool_name", "tool_args"],
};

function parseAgentJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");

    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(raw.slice(start, end + 1));
    }

    throw new Error("Model response was not valid JSON.");
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
}

function toGeminiContents(messages) {
  return messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [
        {
          text: String(message.content),
        },
      ],
    }));
}

function extractGeminiTextResponse(data) {
  const candidate = data?.candidates?.[0];
  const parts = candidate?.content?.parts || [];
  const textPart = parts.find((part) => typeof part.text === "string");
  return textPart?.text ?? "";
}

function shouldRetryGeminiStatus(status) {
  return status === 429 || status >= 500;
}

function isSimpleGreeting(text) {
  const normalized = text.trim().toLowerCase();
  return ["hi", "hii", "hello", "hey", "hey there", "hello there"].includes(normalized);
}

function isGreetingLikeStep(step, userInput) {
  if (step.step !== "START") {
    return false;
  }

  return isSimpleGreeting(userInput) && /hello|hi|hey|help you today/i.test(step.content);
}

async function requestGemini(messages, model, maxRetries = 3) {
  const apiKey = getGeminiApiKey();
  const systemMessage = messages.find((message) => message.role === "system");

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  let lastError = new Error("Unknown Gemini request failure.");

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: systemMessage?.content || "",
              },
            ],
          },
          contents: toGeminiContents(messages),
          generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`Gemini API error: ${response.status} ${errorText}`);

        if (attempt < maxRetries && shouldRetryGeminiStatus(response.status)) {
          lastError = error;
          await sleep(600 * (attempt + 1));
          continue;
        }

        throw error;
      }

      const data = await response.json();
      const text = extractGeminiTextResponse(data);

      if (!text) {
        throw new Error("Gemini API returned an empty text response.");
      }

      return text;
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        await sleep(600 * (attempt + 1));
        continue;
      }
    }
  }

  throw lastError;
}

async function executeToolStep(step) {
  const tool = toolMap[step.tool_name];

  if (!tool) {
    return {
      step: "OBSERVE",
      content: `Tool "${step.tool_name}" is not available.`,
    };
  }

  try {
    const result = await tool(step.tool_args || {});
    return {
      step: "OBSERVE",
      content: String(result),
    };
  } catch (error) {
    return {
      step: "OBSERVE",
      content: `Tool error: ${error.message}`,
    };
  }
}

function isFileCreationRequest(text) {
  const lower = text.toLowerCase();
  return ["create", "build", "generate", "write", "clone"].some((word) => lower.includes(word));
}

async function runPlannedSteps(steps) {
  for (const step of steps) {
    printStep(step);

    if (step.step === "TOOL") {
      const observation = await executeToolStep(step);
      printStep(observation);
    }
  }
}

export async function createAgentRunner({
  demoMode = false,
  primaryModel = PRIMARY_MODEL,
  escalationModel = ESCALATION_MODEL,
} = {}) {
  loadDotEnv();

  const availableToolsText = JSON.stringify(toolDefinitions, null, 2);
  const history = [
    {
      role: "system",
      content: buildSystemPrompt({
        availableToolsText,
        activeModel: primaryModel,
      }),
    },
  ];

  const usingLiveModel = !demoMode && Boolean(getGeminiApiKey());

  return {
    model: primaryModel,
    primaryModel,
    escalationModel,
    usingLiveModel,
    getHistory() {
      return history.slice(1);
    },
    resetHistory() {
      history.length = 1;
    },
    async runTurn(userInput) {
      if (isSimpleGreeting(userInput)) {
        printStep({
          step: "OUTPUT",
          content: "Hi! I’m CLOVE. Tell me which website you want cloned, or give me a folder name and I’ll build the project there.",
          tool_name: "",
          tool_args: {},
        });
        return;
      }

      if (!usingLiveModel) {
        await runPlannedSteps(createOfflinePlan(userInput));
        return;
      }

      const initialChoice = chooseInitialModel(userInput);
      let activeModel = initialChoice.model === ESCALATION_MODEL ? escalationModel : primaryModel;
      let escalationReason = initialChoice.reason;
      const initialHistoryLength = history.length;
      const messages = [...history, { role: "user", content: userInput }];
      let usedTool = false;
      let verifiedFiles = false;
      let safetyIterations = 0;
      let toolErrorCount = 0;
      let outputGuardCount = 0;
      let seenStart = false;

      printModelUpdate(activeModel, escalationReason);

      while (safetyIterations < 16) {
        safetyIterations += 1;

        const loopEscalationReason = shouldEscalateFromLoop({
          activeModel,
          userInput,
          safetyIterations,
          toolErrorCount,
          outputGuardCount,
        });

        if (loopEscalationReason && activeModel !== escalationModel) {
          activeModel = escalationModel;
          escalationReason = loopEscalationReason;
          messages.push({
            role: "developer",
            content: JSON.stringify({
              step: "OBSERVE",
              content: `Model escalation requested: ${loopEscalationReason}`,
            }),
          });
          printModelUpdate(activeModel, escalationReason);
        }

        let step;
        try {
          const raw = await requestGemini(
            [
              {
                role: "system",
                content: buildSystemPrompt({
                  availableToolsText,
                  activeModel,
                  escalationReason,
                }),
              },
              ...messages.slice(1),
            ],
            activeModel
          );
          step = parseAgentJson(raw);
        } catch (error) {
          step = {
            step: "OUTPUT",
            content: `The model request failed: ${error.message}`,
            tool_name: "",
            tool_args: {},
          };
        }

        step.tool_name ??= "";
        step.tool_args ??= {};

        if (step.step === "START") {
          if (seenStart || isGreetingLikeStep(step, userInput)) {
            messages.push({
              role: "developer",
              content: JSON.stringify({
                step: "OBSERVE",
                content: "START can only be used once per turn. Move directly to THINK, TOOL, or OUTPUT.",
              }),
            });
            continue;
          }

          seenStart = true;
        }

        messages.push({
          role: "assistant",
          content: JSON.stringify(step),
        });

        printStep(step);

        if (step.step === "OUTPUT") {
          if (isFileCreationRequest(userInput) && !usedTool) {
            outputGuardCount += 1;
            messages.push({
              role: "developer",
              content: JSON.stringify({
                step: "OBSERVE",
                content: "You must use tools to create the requested output before finishing.",
              }),
            });
            continue;
          }

          if (isFileCreationRequest(userInput) && !verifiedFiles) {
            outputGuardCount += 1;
            messages.push({
              role: "developer",
              content: JSON.stringify({
                step: "OBSERVE",
                content: "Verify the created files or target folder with a tool observation before OUTPUT.",
              }),
            });
            continue;
          }

          history.push({ role: "user", content: userInput });
          history.push(...messages.slice(initialHistoryLength + 1));
          return;
        }

        if (step.step === "TOOL") {
          usedTool = true;
          const observation = await executeToolStep(step);
          if (observation.content.startsWith("Tool error:")) {
            toolErrorCount += 1;
          }

          if (
            observation.content.includes("Generated website project") ||
            observation.content.includes("Wrote file") ||
            observation.content.includes("Listing for")
          ) {
            verifiedFiles = true;
          }

          printStep(observation);
          messages.push({
            role: "developer",
            content: JSON.stringify(observation),
          });
        }
      }

      printStep({
        step: "OUTPUT",
        content: "The agent stopped after reaching the safety iteration limit for this turn.",
      });
    },
  };
}
