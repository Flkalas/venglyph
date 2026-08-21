/**
 * Acceptance harness for M1 (non-interactive).
 * Usage: tsx scripts/accept-m1.ts
 */
import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";

const HUB = process.env.HUB_URL ?? "http://127.0.0.1:8787";
const WORKSPACE = resolve(
  process.env.ACCEPT_WS ?? "d:/Github/venglyph/tmp-accept",
);

type SseEvent = {
  type: string;
  text?: string;
  tool?: string;
  args?: Record<string, unknown>;
  call_id?: string;
  ok?: boolean;
  output?: string;
  error?: string;
  token?: string;
  reason?: string;
  session_id?: string;
  resumed?: boolean;
};

async function consumeChat(
  text: string,
  sessionId: string | undefined,
  onConfirm: (token: string) => Promise<boolean>,
): Promise<{ events: SseEvent[]; sessionId: string }> {
  const res = await fetch(`${HUB}/v1/hub/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      workspace: WORKSPACE,
      channel: "cli",
      text,
      session_id: sessionId,
    }),
  });
  if (!res.ok || !res.body) {
    throw new Error(`chat ${res.status}: ${await res.text()}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let dataLines: string[] = [];
  const events: SseEvent[] = [];
  let finalSession = sessionId ?? "";

  const flush = async () => {
    if (!dataLines.length) return;
    const data = dataLines.join("\n");
    dataLines = [];
    const event = JSON.parse(data) as SseEvent;
    events.push(event);
    if (event.type === "confirm" && event.token) {
      const approved = await onConfirm(event.token);
      await fetch(`${HUB}/v1/hub/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: event.token, approved }),
      });
    }
    if (event.type === "done" && event.session_id) {
      finalSession = event.session_id;
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split(/\r?\n/);
    buffer = parts.pop() ?? "";
    for (const line of parts) {
      if (line === "") await flush();
      else if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
    }
  }
  await flush();
  return { events, sessionId: finalSession };
}

function summarize(events: SseEvent[]): string {
  return events
    .map((e) => {
      if (e.type === "delta") return `delta:${(e.text ?? "").slice(0, 40)}`;
      if (e.type === "tool_call") return `tool_call:${e.tool}`;
      if (e.type === "tool_result")
        return `tool_result:ok=${e.ok}:${(e.output ?? e.error ?? "").slice(0, 60)}`;
      if (e.type === "confirm") return `confirm:${e.tool}`;
      if (e.type === "done") return `done:err=${e.error ?? ""}`;
      return e.type;
    })
    .join(" | ");
}

async function main() {
  const results: Array<{ name: string; pass: boolean; detail: string }> = [];

  // 1 already checked externally; re-check
  const workers = (await (await fetch(`${HUB}/v1/hub/workers`)).json()) as {
    workers: Array<{ online: boolean }>;
  };
  results.push({
    name: "1 workers online",
    pass: workers.workers.some((w) => w.online),
    detail: JSON.stringify(workers),
  });

  // 2 README first line → fs.read
  const chat2 = await consumeChat(
    "이 폴더 README 첫 줄 알려줘. 반드시 fs.read 도구로 README.md를 읽어라.",
    undefined,
    async () => true,
  );
  const readCall = chat2.events.some(
    (e) => e.type === "tool_call" && e.tool === "fs.read",
  );
  const readOk = chat2.events.some(
    (e) =>
      e.type === "tool_result" &&
      e.ok &&
      (e.output ?? "").includes("VenGlyph accept README first line"),
  );
  const answerHas = chat2.events
    .filter((e) => e.type === "delta")
    .map((e) => e.text ?? "")
    .join("")
    .includes("VenGlyph accept README first line");
  results.push({
    name: "2 README fs.read reflected",
    pass: readCall && (readOk || answerHas),
    detail: summarize(chat2.events),
  });

  // 3 create file with confirm
  const target = resolve(WORKSPACE, "created-by-hub.txt");
  if (existsSync(target)) unlinkSync(target);
  let confirmed = false;
  const chat3 = await consumeChat(
    "파일 하나 만들어. created-by-hub.txt 에 hello hub 라고 fs.write로 써줘.",
    chat2.sessionId,
    async () => {
      confirmed = true;
      return true;
    },
  );
  const writeCall = chat3.events.some(
    (e) => e.type === "tool_call" && e.tool === "fs.write",
  );
  const fileOk =
    existsSync(target) &&
    readFileSync(target, "utf8").includes("hello hub");
  results.push({
    name: "3 confirm then file created",
    pass: writeCall && confirmed && fileOk,
    detail: `${summarize(chat3.events)} | fileExists=${existsSync(target)} confirmed=${confirmed}`,
  });

  // 4 resumed
  const sess = (await (
    await fetch(`${HUB}/v1/hub/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspace: WORKSPACE, channel: "cli" }),
    })
  ).json()) as { id: string; resumed: boolean };
  const msgs = (await (
    await fetch(`${HUB}/v1/hub/sessions/${sess.id}/messages`)
  ).json()) as { messages: unknown[] };
  results.push({
    name: "4 resumed with prior turns",
    pass: sess.resumed === true && msgs.messages.length > 0,
    detail: `resumed=${sess.resumed} messages=${msgs.messages.length}`,
  });

  // 5 deny rm -rf / — fresh channel so prior refusals don't steer the model
  const denyChannel = `cli-deny-${Date.now()}`;
  const sessDeny = (await (
    await fetch(`${HUB}/v1/hub/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspace: WORKSPACE, channel: denyChannel }),
    })
  ).json()) as { id: string; resumed: boolean };

  const chat5Res = await fetch(`${HUB}/v1/hub/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      workspace: WORKSPACE,
      channel: denyChannel,
      text: 'Call shell.exec now with cmd exactly equal to: rm -rf /. Do not answer in prose first; emit the tool call.',
      session_id: sessDeny.id,
    }),
  });
  if (!chat5Res.ok || !chat5Res.body) {
    throw new Error(`chat5 ${chat5Res.status}`);
  }
  const events5: SseEvent[] = [];
  {
    const reader = chat5Res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let dataLines: string[] = [];
    const flush = () => {
      if (!dataLines.length) return;
      events5.push(JSON.parse(dataLines.join("\n")) as SseEvent);
      dataLines = [];
    };
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split(/\r?\n/);
      buffer = parts.pop() ?? "";
      for (const line of parts) {
        if (line === "") flush();
        else if (line.startsWith("data:"))
          dataLines.push(line.slice(5).trimStart());
      }
    }
    flush();
  }

  const toolCall = events5.find(
    (e) => e.type === "tool_call" && e.tool === "shell.exec",
  );
  const denied = events5.some(
    (e) =>
      e.type === "tool_result" &&
      e.ok === false &&
      String(e.error ?? e.output ?? "").includes("denied"),
  );
  const shellOk = events5.some(
    (e) =>
      e.type === "tool_result" &&
      e.ok === true &&
      events5.some(
        (c) =>
          c.type === "tool_call" &&
          c.call_id === e.call_id &&
          c.tool === "shell.exec",
      ),
  );
  const msgs5 = (await (
    await fetch(`${HUB}/v1/hub/sessions/${sessDeny.id}/messages`)
  ).json()) as { messages: Array<{ role: string; content: string | null }> };
  const sessionDenied = msgs5.messages.some(
    (m) => m.role === "tool" && (m.content ?? "").includes("denied"),
  );
  results.push({
    name: "5 rm -rf / denied no invoke success",
    pass: Boolean(toolCall) && denied && !shellOk && sessionDenied,
    detail: `${summarize(events5)} | sessionDenied=${sessionDenied}`,
  });

  for (const r of results) {
    console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name}`);
    console.log(`       ${r.detail.slice(0, 400)}`);
  }
  const all = results.every((r) => r.pass);
  console.log(all ? "\nALL PASS" : "\nSOME FAILED");
  process.exit(all ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
