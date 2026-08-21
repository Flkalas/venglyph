import { resolve, dirname } from "node:path";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolveInWorkspace, SandboxError } from "./sandbox.js";

const execFileAsync = promisify(execFile);

export type ToolResult = {
  ok: boolean;
  output?: string;
  error?: string;
  truncated?: boolean;
};

export async function runTool(
  workspace: string,
  tool: string,
  args: Record<string, unknown>,
): Promise<ToolResult> {
  try {
    switch (tool) {
      case "fs.read":
        return toolFsRead(workspace, args);
      case "fs.write":
        return toolFsWrite(workspace, args);
      case "shell.exec":
        return await toolShellExec(workspace, args);
      default:
        return { ok: false, error: `unknown tool: ${tool}` };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}

function toolFsRead(
  workspace: string,
  args: Record<string, unknown>,
): ToolResult {
  const path = String(args.path ?? "");
  const maxBytes =
    typeof args.max_bytes === "number" ? args.max_bytes : 256_000;
  const full = resolveInWorkspace(workspace, path);
  if (!existsSync(full)) {
    return { ok: false, error: `file not found: ${path}` };
  }
  const buf = readFileSync(full);
  if (buf.length > maxBytes) {
    return {
      ok: true,
      output: buf.subarray(0, maxBytes).toString("utf8"),
      truncated: true,
    };
  }
  return { ok: true, output: buf.toString("utf8") };
}

function toolFsWrite(
  workspace: string,
  args: Record<string, unknown>,
): ToolResult {
  const path = String(args.path ?? "");
  const content = String(args.content ?? "");
  const full = resolveInWorkspace(workspace, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content, "utf8");
  return { ok: true, output: `wrote ${path} (${content.length} bytes)` };
}

async function toolShellExec(
  workspace: string,
  args: Record<string, unknown>,
): Promise<ToolResult> {
  const cmd = String(args.cmd ?? args.command ?? "");
  if (!cmd.trim()) return { ok: false, error: "empty cmd" };
  let cwd = resolve(workspace);
  if (typeof args.cwd === "string" && args.cwd) {
    cwd = resolveInWorkspace(workspace, args.cwd);
  }
  const timeout =
    typeof args.timeout_ms === "number" ? args.timeout_ms : 30_000;
  const shell = process.platform === "win32" ? "cmd.exe" : "/bin/sh";
  const shellArgs =
    process.platform === "win32" ? ["/d", "/s", "/c", cmd] : ["-c", cmd];
  try {
    const { stdout, stderr } = await execFileAsync(shell, shellArgs, {
      cwd,
      timeout,
      maxBuffer: 1024 * 1024,
      windowsHide: true,
      env: process.env,
    });
    const out = [stdout, stderr].filter(Boolean).join("\n");
    return {
      ok: true,
      output: out.slice(0, 200_000),
      truncated: out.length > 200_000,
    };
  } catch (err) {
    const e = err as {
      message?: string;
      stdout?: string;
      stderr?: string;
      killed?: boolean;
    };
    const out = [e.stdout, e.stderr, e.message].filter(Boolean).join("\n");
    return {
      ok: false,
      error: e.killed ? `timeout after ${timeout}ms` : out.slice(0, 200_000),
    };
  }
}

export { resolveInWorkspace, SandboxError };

