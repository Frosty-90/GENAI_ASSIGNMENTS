import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { createAgentRunner } from "./agent.js";
import { getPromptLabel, printAbout, printBanner, printModels } from "./terminal.js";
import { toolDefinitions } from "./tools.js";

function printHelp() {
  console.log("\nAsk in natural language, for example:");
  console.log('- "Clone scaler.com into a folder named scaler_clone"');
  console.log('- "Clone https://stripe.com into a folder named stripe_clone"');
  console.log('- "Create a premium landing page for an ML brand with header, hero section, and footer"');
  console.log('- "List the files in the workspace"');
}

function printTools() {
  console.log("\nAvailable tools:");
  toolDefinitions.forEach((tool) => {
    console.log(`- ${tool.name}: ${tool.description}`);
  });
}

async function main() {
  const demoMode = process.argv.includes("--demo");
  const agent = await createAgentRunner({ demoMode });
  const rl = readline.createInterface({ input, output });

  printBanner(agent.usingLiveModel, {
    primaryModel: agent.primaryModel,
    escalationModel: agent.escalationModel,
  });

  while (true) {
    const userInput = (await rl.question(`\n${getPromptLabel()}`)).trim();

    if (!userInput) {
      continue;
    }

    if (["exit", "quit"].includes(userInput.toLowerCase())) {
      break;
    }

    if (userInput === "/help") {
      printHelp();
      continue;
    }

    if (userInput === "/tools") {
      printTools();
      continue;
    }

    if (userInput === "/about") {
      printAbout(agent.model, agent.usingLiveModel);
      continue;
    }

    if (userInput === "/models") {
      printModels(agent.primaryModel, agent.escalationModel);
      continue;
    }

    if (userInput === "/history") {
      const turns = agent.getHistory();
      console.log(`\nSaved turns: ${turns.length}`);
      continue;
    }

    if (userInput === "/reset") {
      agent.resetHistory();
      console.log("\nConversation history cleared.");
      continue;
    }

    await agent.runTurn(userInput);
  }

  rl.close();
}

main().catch((error) => {
  console.error("Fatal error:", error.message);
  process.exitCode = 1;
});
