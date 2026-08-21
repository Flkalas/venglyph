import { resolve, normalize, relative, isAbsolute } from "node:path";

export class SandboxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SandboxError";
  }
}

/** Resolve path under workspace; reject escape after normalize. */
export function resolveInWorkspace(workspace: string, path: string): string {
  const root = resolve(workspace);
  const candidate = isAbsolute(path) ? resolve(path) : resolve(root, path);
  const normalized = normalize(candidate);
  const rel = relative(root, normalized);
  if (rel.startsWith("..") || isAbsolute(rel)) {
    throw new SandboxError(`path outside workspace: ${path}`);
  }
  if (process.platform === "win32") {
    const rootDrive = root.slice(0, 2).toLowerCase();
    const candDrive = normalized.slice(0, 2).toLowerCase();
    if (rootDrive !== candDrive) {
      throw new SandboxError(`path outside workspace: ${path}`);
    }
  }
  return normalized;
}
