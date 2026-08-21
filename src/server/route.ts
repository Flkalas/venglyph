export type RouteHint = {
  model: string;
  reason: string;
};

/**
 * Auto stub: default HUB_LLM_MODEL; code hint → HUB_LLM_CODE_MODEL (or same).
 */
export function routeModel(
  text: string,
  env: NodeJS.ProcessEnv = process.env,
): RouteHint {
  const base = env.HUB_LLM_MODEL ?? "qwen/qwen3.5-9b";
  const codeModel = env.HUB_LLM_CODE_MODEL ?? base;
  const codey =
    /\b(code|function|class|typescript|python|refactor|bug|compile|fs\.|shell)\b/i.test(
      text,
    ) || /```/.test(text);
  if (codey) {
    return { model: codeModel, reason: "code hint" };
  }
  return { model: base, reason: "default" };
}
