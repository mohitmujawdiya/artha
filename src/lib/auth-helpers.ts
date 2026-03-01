import { timingSafeEqual } from "crypto";

/**
 * Constant-time comparison for secret tokens.
 * Prevents timing attacks on bearer token verification.
 */
export function verifyBearerSecret(
  authHeader: string | null,
  secret: string | undefined
): boolean {
  if (!authHeader || !secret) return false;
  const expected = `Bearer ${secret}`;
  try {
    const a = Buffer.from(authHeader);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Sanitize a string before interpolating into an LLM prompt.
 * Strips control characters, XML-like tags, and limits length.
 */
export function sanitizeForPrompt(input: string, maxLength = 100): string {
  return input
    .replace(/<[^>]*>/g, "") // Strip XML/HTML tags
    .replace(/[{}[\]]/g, "") // Remove JSON delimiters
    .replace(/\n/g, " ") // Flatten newlines
    .trim()
    .slice(0, maxLength);
}
