

export const NETWORK_TIMEOUT_MS = 30000; // 30s

export const DOWNLOAD_TIMEOUT_MS = 30000; // 30s

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const DEFAULT_FILE_EXTENSION = "png";

export const DEFAULT_DOWNLOAD_FILENAME = "generated-image.png";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif"
] as const;

export const PROGRESS_UPDATE_INTERVAL_MS = 100;

export const PROGRESS_MESSAGE_UPDATE_INTERVAL_MS = 1000;

export const PROGRESS_RESET_DELAY_MS = 1500;

export const GENERATE_MODE_DURATION_MS = 12500; // ~12.5s avg
export const REFERENCE_MODE_DURATION_MS = 17500; // ~17.5s avg

export const TARGET_PROGRESS_BEFORE_COMPLETE = 95;

export const INITIAL_PROGRESS_GENERATE = 5;
export const INITIAL_PROGRESS_REFERENCE = 2;