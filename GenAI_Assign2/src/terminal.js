const ANSI = {
  reset: "\u001b[0m",
  dim: "\u001b[2m",
  bold: "\u001b[1m",
  cyan: "\u001b[36m",
  blue: "\u001b[34m",
  green: "\u001b[32m",
  yellow: "\u001b[33m",
  magenta: "\u001b[35m",
  white: "\u001b[37m",
};

function color(text, shade) {
  return `${shade}${text}${ANSI.reset}`;
}

function rule(width = 72) {
  return "-".repeat(width);
}

function label(key, value) {
  return `${color(key, ANSI.cyan)} ${value}`;
}

export function printBanner(usingLiveModel, model) {
  console.log(color(rule(), ANSI.blue));
  console.log(color("   CLOVE", `${ANSI.bold}${ANSI.white}`));
  console.log(color("   Conversational CLI Agent for ML and Website Cloning", ANSI.magenta));
  console.log(color(rule(), ANSI.blue));
  console.log(
    usingLiveModel
      ? label("Mode :", "Live Gemini dual-model")
      : label("Mode :", "Offline demo")
  );
  console.log(label("Agent:", "CLOVE"));
  console.log(label("User :", "CLOVE"));
  if (usingLiveModel) {
    console.log(label("Flash:", model.primaryModel));
    console.log(label("Pro  :", model.escalationModel));
  }
  console.log(label("Focus:", "Website cloning, code generation, and task execution"));
  console.log(color("Commands: /help  /tools  /models  /history  /reset  /about  exit", ANSI.dim));
}

export function printStep(step) {
  if (step.step === "TOOL") {
    console.log(`\n${color("[TOOL]", `${ANSI.bold}${ANSI.yellow}`)} ${step.tool_name}`);
    console.log(JSON.stringify(step.tool_args, null, 2));
    return;
  }

  const palette = {
    START: ANSI.cyan,
    THINK: ANSI.magenta,
    OBSERVE: ANSI.green,
    OUTPUT: ANSI.green,
  };

  console.log(`\n${color(`[${step.step}]`, `${ANSI.bold}${palette[step.step] || ANSI.cyan}`)} ${step.content}`);
}

export function getPromptLabel() {
  return color("CLOVE> ", `${ANSI.bold}${ANSI.white}`);
}

export function printAbout(model, usingLiveModel) {
  console.log(`\n${color("CLOVE", `${ANSI.bold}${ANSI.white}`)} is your terminal-first website cloning and code agent.`);
  console.log(
    usingLiveModel
      ? `Backed by Gemini 2.5 Flash-Lite as the worker and Gemini 2.5 Pro as the escalation reviewer.`
      : "Running in offline demo mode right now."
  );
  console.log("Give it a reference like scaler.com or another site name, and it will scaffold a browser-ready project through its tool loop.");
}

export function printModelUpdate(model, reason) {
  console.log(`\n${color("[MODEL]", `${ANSI.bold}${ANSI.cyan}`)} ${model}`);
  if (reason) {
    console.log(color(reason, ANSI.dim));
  }
}

export function printModels(primaryModel, escalationModel) {
  console.log(`\nPrimary worker : ${primaryModel}`);
  console.log(`Escalation     : ${escalationModel}`);
}
