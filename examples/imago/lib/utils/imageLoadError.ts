


export function createImageProxyUrl(originalUrl: string): string {
  return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
}


export function isProxyUrl(url: string): boolean {
  return url.includes("/api/image-proxy");
}


export function handleImageLoadError(
  currentSrc: string,
  originalUrl: string | null,
  setImageSrc: (src: string) => void,
  setError: (error: string | null) => void
): boolean {
  if (isProxyUrl(currentSrc) || !originalUrl) {
    setError(`图片加载失败: ${currentSrc}`);
    return false;
  }
  
  const proxyUrl = createImageProxyUrl(originalUrl);
  setImageSrc(proxyUrl);
  setError(null);
  return true;
}
