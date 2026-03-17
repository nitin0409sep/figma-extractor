const FIGMA_URL_PATTERN = /^https:\/\/(www\.)?figma\.com\/(file|design|board|proto)\/[a-zA-Z0-9]+/;
const FIGMA_TOKEN_PATTERN = /^figd_[a-zA-Z0-9_-]{20,}$/;
const MAX_URL_LENGTH = 2048;
const MAX_TOKEN_LENGTH = 256;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFigmaUrl(url: unknown): ValidationResult {
  if (!url || typeof url !== "string") {
    return { valid: false, error: "Figma URL is required." };
  }

  const trimmed = url.trim();

  if (trimmed.length > MAX_URL_LENGTH) {
    return { valid: false, error: "URL is too long." };
  }

  if (!FIGMA_URL_PATTERN.test(trimmed)) {
    return {
      valid: false,
      error:
        "Invalid Figma URL. Expected format: https://www.figma.com/design/FILE_KEY/... or https://www.figma.com/board/FILE_KEY/...",
    };
  }

  return { valid: true };
}

export function validateFigmaToken(token: unknown): ValidationResult {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Figma Personal Access Token is required." };
  }

  const trimmed = token.trim();

  if (trimmed.length > MAX_TOKEN_LENGTH) {
    return { valid: false, error: "Token is too long." };
  }

  if (!FIGMA_TOKEN_PATTERN.test(trimmed)) {
    return {
      valid: false,
      error: "Invalid token format. Expected a Figma Personal Access Token starting with 'figd_'.",
    };
  }

  return { valid: true };
}

export function sanitizeString(input: string): string {
  return input
    .replace(/[<>"'&]/g, (char) => {
      const entities: Record<string, string> = {
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "&": "&amp;",
      };
      return entities[char] || char;
    })
    .trim();
}
