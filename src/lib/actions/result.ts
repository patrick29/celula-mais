export type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export type UploadResult =
  | { url: string; error: null }
  | { url: null; error: string };

const USER_ERROR_PREFIX = "[user] ";
const DEFAULT_MESSAGE =
  "Não foi possível concluir esta ação. Tente novamente em instantes.";

export function toActionError(err: unknown, fallback = DEFAULT_MESSAGE): string {
  if (err instanceof Error && err.message.startsWith(USER_ERROR_PREFIX)) {
    return err.message.slice(USER_ERROR_PREFIX.length);
  }
  return fallback;
}

export function userError(message: string): never {
  throw new Error(`${USER_ERROR_PREFIX}${message}`);
}

export function logActionError(
  action: string,
  err: unknown,
  context?: Record<string, unknown>,
) {
  const payload = {
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    context,
    at: new Date().toISOString(),
  };
  console.error(`[action:${action}]`, payload);
}
