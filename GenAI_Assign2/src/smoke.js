import { createAgentRunner } from "./agent.js";

async function main() {
  const agent = await createAgentRunner({ demoMode: true });

  await agent.runTurn(
    "Clone the Scaler Academy website in a folder named smoke_scaler_site and include header, hero section, and footer."
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
