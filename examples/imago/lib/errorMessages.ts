import { UI_TEXT } from "@lib/i18n";

type Language = keyof typeof UI_TEXT;

export function resolveGenerationError(code: string, lang: Language) {
  const t = UI_TEXT[lang];
  switch (code) {
    case "guest_limit":
      return t.usage_error_guest_limit;
    case "login_required":
      return t.usage_error_login_required;
    case "insufficient_credits":
      return t.usage_error_insufficient_credits;
    default:
      return code;
  }
}