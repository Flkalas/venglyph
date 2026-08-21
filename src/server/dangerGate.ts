/**
 * Danger-gate: classify tool calls before Worker invoke.
 * Tier: allow | confirm | deny
 * FA (HUB_FA) may auto-approve confirm only — never deny.
 */

export type GateTier = "allow" | "confirm" | "deny";

export type GateDecision = {
  tier: GateTier;
  reason: string;
};

export type ToolCallInput = {
  tool: string;
  args: Record<string, unknown>;
};

const ALLOW_SHELL = [
  /^git\s+status\b/i,
  /^git\s+diff\b/i,
  /^git\s+log\b/i,
  /^git\s+show\b/i,
  /^ls\b/i,
  /^dir\b/i,
  /^rg\b/i,
  /^grep\b/i,
  /^find\b/i,
  /^cat\b/i,
  /^type\b/i,
  /^head\b/i,
  /^tail\b/i,
  /^pwd\b/i,
  /^echo\b/i,
  /^which\b/i,
  /^where\b/i,
];

const DENY_SHELL = [
  /\brm\s+(-[a-zA-Z]*f[a-zA-Z]*\s+|--force\s+)?\/(\s|$)/i,
  /\brm\s+-rf\s+\/\b/i,
  /\brm\s+-fr\s+\/\b/i,
  /\bsudo\b/i,
  /\bmkfs\b/i,
  /\bdd\b.*\bof=\/dev\//i,
  /\bcurl\b.*\|\s*(ba)?sh\b/i,
  /\bwget\b.*\|\s*(ba)?sh\b/i,
  /\bhistory\s+-c\b/i,
  /\b>\s*\/dev\/sd/i,
  /\bformat\s+[a-z]:/i,
  /\bRemove-Item\b.*-Recurse\b.*-Force\b.*[\\/]\s*$/i,
  /\bdel\s+\/[sq]\b.*\\/i,
];

function shellCmd(args: Record<string, unknown>): string {
  const cmd = args.cmd ?? args.command ?? "";
  return typeof cmd === "string" ? cmd.trim() : "";
}

export function dangerGate(input: ToolCallInput): GateDecision {
  const tool = input.tool.trim();

  if (tool === "fs.read") {
    return { tier: "allow", reason: "fs.read is read-only" };
  }

  if (tool === "fs.write") {
    return { tier: "confirm", reason: "fs.write modifies the workspace" };
  }

  if (tool === "shell.exec") {
    const cmd = shellCmd(input.args);
    if (!cmd) {
      return { tier: "deny", reason: "shell.exec requires a non-empty cmd" };
    }
    for (const re of DENY_SHELL) {
      if (re.test(cmd)) {
        return { tier: "deny", reason: `dangerous shell pattern: ${re}` };
      }
    }
    for (const re of ALLOW_SHELL) {
      if (re.test(cmd)) {
        return { tier: "allow", reason: `whitelisted shell: ${cmd}` };
      }
    }
    return { tier: "confirm", reason: "shell.exec requires confirmation" };
  }

  return { tier: "deny", reason: `unknown tool: ${tool}` };
}

/** Whether FA should skip the confirm prompt (deny never). */
export function faAutoApprove(tier: GateTier, faEnabled: boolean): boolean {
  return faEnabled && tier === "confirm";
}

export function isFaEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const v = (env.HUB_FA ?? "0").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}
