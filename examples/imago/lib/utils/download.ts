
import { DOWNLOAD_TIMEOUT_MS, DEFAULT_DOWNLOAD_FILENAME } from "@lib/constants";
import { validateImageUrl, isDataUrl } from "@lib/utils/urlValidation";
import { isAbortError, extractErrorMessage } from "@lib/utils/errorHandling";


async function fetchImageAsBlob(imageUrl: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(imageUrl, {
      mode: "cors",
      credentials: "omit",
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`下载失败：HTTP ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (isAbortError(error)) {
      throw new Error("下载超时，请稍后重试");
    }
    throw error;
  }
}


function triggerDownload(href: string, blobUrl: string | null = null): void {
  const link = document.createElement("a");
  try {
    link.href = href;
    link.download = DEFAULT_DOWNLOAD_FILENAME;
    document.body.appendChild(link);
    link.click();
    
    const linkToClean = link;
    const blobUrlToRevoke = blobUrl;
    requestAnimationFrame(() => {
      cleanupDownloadLink(linkToClean, blobUrlToRevoke);
    });
  } catch {
    cleanupDownloadLink(link, blobUrl);
    throw new Error("创建下载链接失败");
  }
}


function cleanupDownloadLink(link: HTMLAnchorElement | null, blobUrl: string | null): void {
  if (link?.parentNode) {
    link.parentNode.removeChild(link);
  }
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl);
  }
}


export async function downloadImage(imageUrl: string): Promise<void> {
  if (isDataUrl(imageUrl)) {
    triggerDownload(imageUrl);
    return;
  }

  validateImageUrl(imageUrl);

  let blobUrl: string | null = null;
  try {
    blobUrl = await fetchImageAsBlob(imageUrl);
    triggerDownload(blobUrl, blobUrl);
  } catch (error: unknown) {
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
    }
    const message = error instanceof Error ? error.message : "";
    if (message.includes("Failed to fetch") || message.includes("下载失败")) {
      try {
        const proxied = await fetch(`/api/download-image?url=${encodeURIComponent(imageUrl)}`);
        if (!proxied.ok) {
          throw new Error(`Proxy download failed: ${proxied.status}`);
        }
        const blob = await proxied.blob();
        const proxyUrl = URL.createObjectURL(blob);
        triggerDownload(proxyUrl, proxyUrl);
        return;
      } catch {
        try {
          triggerDownload(imageUrl);
          return;
        } catch {
          throw new Error("下载失败：资源不支持跨域获取，且浏览器无法直接打开。请检查图片地址是否可访问。");
        }
      }
    }
    throw new Error(`下载失败：${extractErrorMessage(error, "未知错误")}`);
  }
}