import { UI_TEXT } from "@lib/i18n";

type Language = keyof typeof UI_TEXT;




export function extractErrorMessage(error: unknown, defaultMessage: string): string {
  return error instanceof Error ? error.message : defaultMessage;
}


export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}


export function isNetworkError(error: unknown): boolean {
  return error instanceof Error && (
    error.message.includes("network") ||
    error.message.includes("fetch") ||
    error.message.includes("Failed to fetch")
  );
}


export function isModerationError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes("output_moderation") ||
    message.includes("moderation") ||
    message.includes("content policy") ||
    message.includes("content moderation") ||
    message.includes("violate") ||
    message.includes("policy")
  );
}


export function formatErrorMessage(error: unknown, lang: Language = "zh"): string {
  const t = UI_TEXT[lang];
  if (!(error instanceof Error)) {
    return String(error);
  }

  const message = error.message;
  const messageLower = message.toLowerCase();

  if (isModerationError(error) ||
    messageLower.includes("output_moderation") ||
    messageLower === "moderation" ||
    messageLower.startsWith("moderation") ||
    messageLower.includes("content policy") ||
    messageLower.includes("violate content")) {
    return t.moderation_error_message;
  }

  if (isNetworkError(error)) {
    return lang === "zh"
      ? "网络连接失败，请检查网络设置后重试。"
      : "Network connection failed. Please check your network settings.";
  }

  if (message.includes("timeout") || message.includes("timed out")) {
    return lang === "zh"
      ? "请求超时，请稍后重试。"
      : "Request timed out. Please try again later.";
  }

  if (message.includes("Task failed")) {
    return lang === "zh"
      ? "图片生成失败，请稍后重试。"
      : "Image generation failed. Please try again later.";
  }

  if (message.includes("Provider error") || message.includes("Provider")) {
    const match = message.match(/Provider error[^:]*:\s*(.+)/);
    if (match) {
      const details = match[1].trim();
      const detailsLower = details.toLowerCase();
      if (detailsLower.includes("moderation") ||
        detailsLower.includes("output_moderation") ||
        detailsLower.includes("content policy") ||
        detailsLower.includes("violate")) {
        return t.moderation_error_message;
      }
      return lang === "zh" ? `服务错误：${details}` : `Service error: ${details}`;
    }
    return lang === "zh"
      ? "服务提供商返回错误，请稍后重试。"
      : "Provider returned an error. Please try again later.";
  }

  if (messageLower === "output_moderation" ||
    messageLower === "moderation" ||
    messageLower.trim() === "output_moderation" ||
    messageLower.trim() === "moderation") {
    return t.moderation_error_message;
  }

  if (messageLower === "error") {
    return lang === "zh"
      ? "模型维护中，请稍后再试"
      : "Model is under maintenance. Please try again later.";
  }

  return message;
}