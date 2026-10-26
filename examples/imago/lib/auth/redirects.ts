type CallbackSearchParams = {
  code: string | null;
  type?: string | null;
  next?: string | null;
};

export function buildCallbackSearchParams({ code, type, next }: CallbackSearchParams): string | null {
  if (!code) return null;
  const params = new URLSearchParams();
  params.set("code", code);
  if (type) params.set("type", type);
  if (next) params.set("next", next);
  return params.toString();
}