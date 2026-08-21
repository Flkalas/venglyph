import { resolve } from "node:path";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import type { SseEvent } from "../shared/protocol.js";

function parseArgs(args: string[]): {
  workspace: string;
  hubUrl: string;
  text: string | null;
  channel: string;
} {
  let workspace = process.cwd();
  let hubUrl = process.env.HUB_URL ?? "http://127.0.0.1:8787";
  let channel = "cli";
  const positional: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i]!;
    if (a === "--workspace" || a === "-w") {
      workspace = resolve(args[++i] ?? workspace);
    } else if (a === "--hub") {
      hubUrl = args[++i] ?? hubUrl;
    } else if (a === "--channel") {
      channel = args[++i] ?? channel;
    } else if (!a.startsWith("-")) {
      positional.push(a);
    }
  }
  return {
    workspace,
    hubUrl: hubUrl.replace(/\/$/, ""),
    text: positional.length ? positional.join(" ") : null,
    channel,
  };
}

export async function runChatCli(args: string[]): Promise<void> {
  const opts = parseArgs(args);
  const sessionRes = await fetch(`${opts.hubUrl}/v1/hub/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      workspace: opts.workspace,
      channel: opts.channel,
    }),
  });
  if (!sessionRes.ok) {
    throw new Error(`sessions failed: ${sessionRes.status}`);
  }
  const session = (await sessionRes.json()) as {
    id: string;
    resumed: boolean;
  };
  console.log(
    `session ${session.id} resumed=${session.resumed} workspace=${opts.workspace}`,
  );

  const rl = readline.createInterface({ input, output });
  try {
    if (opts.text) {
      await chatOnce(opts.hubUrl, opts.workspace, opts.channel, session.id, opts.text, rl);
      return;
    }
    console.log('Type a message (or "exit"). Confirm prompts: y/n');
    while (true) {
      const line = (await rl.question("> ")).trim();
      if (!line) continue;
      if (line === "exit" || line === "quit") break;
      await chatOnce(opts.hubUrl, opts.workspace, opts.channel, session.id, line, rl);
    }
  } finally {
    rl.close();
  }
}

async function chatOnce(
  hubUrl: string,
  workspace: string,
  channel: string,
  sessionId: string,
  text: string,
  rl: readline.Interface,
): Promise<void> {
  const res = await fetch(`${hubUrl}/v1/hub/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      workspace,
      channel,
      text,
      session_id: sessionId,
    }),
  });
  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => "");
    throw new Error(`chat failed: ${res.status} ${body}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let eventName = "message";
  let dataLines: string[] = [];

  const flush = async () => {
    if (!dataLines.length) return;
    const data = dataLines.join("\n");
    dataLines = [];
    let event: SseEvent;
    try {
      event = JSON.parse(data) as SseEvent;
    } catch {
      return;
    }
    await handleEvent(hubUrl, event, rl, eventName);
    eventName = "message";
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split(/\r?\n/);
    buffer = parts.pop() ?? "";
    for (const line of parts) {
      if (line === "") {
        await flush();
        continue;
      }
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trimStart());
      }
    }
  }
  await flush();
}

async function handleEvent(
  hubUrl: string,
  event: SseEvent,
  rl: readline.Interface,
  _eventName: string,
): Promise<void> {
  switch (event.type) {
    case "delta":
      process.stdout.write(event.text);
      break;
    case "tool_call":
      console.log(`\n[tool_call] ${event.tool} ${JSON.stringify(event.args)}`);
      break;
    case "tool_result":
      console.log(
        `\n[tool_result] ok=${event.ok} ${(event.output ?? event.error ?? "").slice(0, 500)}`,
      );
      break;
    case "confirm": {
      console.log(
        `\n[confirm] ${event.tool} ${JSON.stringify(event.args)}\n  reason: ${event.reason}`,
      );
      const ans = (await rl.question("Approve? [y/N] ")).trim().toLowerCase();
      const approved = ans === "y" || ans === "yes";
      const apr = await fetch(`${hubUrl}/v1/hub/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: event.token, approved }),
      });
      if (!apr.ok) {
        console.error(`approve failed: ${apr.status}`);
      }
      break;
    }
    case "truncated":
      console.log(`\n[truncated] dropped ${event.dropped_turns} turns`);
      break;
    case "done":
      if (event.error) console.error(`\n[done] error: ${event.error}`);
      else console.log("\n[done]");
      break;
  }
}
