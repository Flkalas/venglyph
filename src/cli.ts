import { loadEnv } from "./cli/env.js";
import { runHub } from "./cli/hub.js";

async function main(): Promise<void> {
  loadEnv();
  const args = process.argv.slice(2);
  if (args[0] === "hub") {
    await runHub(args.slice(1));
    return;
  }
  printHelp();
  process.exitCode = 1;
}

function printHelp(): void {
  console.log(`venglyph — VenGlyph control plane CLI

Usage:
  venglyph hub server              Start the hub HTTP server
  venglyph hub chat [text]         Chat via SSE (M1)
  venglyph hub worker              Connect local worker (M1)

Env: see .env.example
`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
