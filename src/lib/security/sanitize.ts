const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function isPlainObject(
  value: unknown
): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function sanitizeString(value: string): string {
  return value.replace(/\u0000/g, '').trim();
}

/**
 * Recursively strips MongoDB query operators (keys starting with `$` or containing `.`)
 * and prototype-pollution keys from untrusted input payloads before validation or querying.
 */
export function stripMongoOperators<T>(input: T): T {
  if (typeof input === 'string') {
    return input.replace(/\u0000/g, '') as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => stripMongoOperators(item)) as unknown as T;
  }

  if (isPlainObject(input)) {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      if (
        key.startsWith('$') ||
        key.includes('.') ||
        FORBIDDEN_KEYS.has(key)
      ) {
        continue;
      }
      cleaned[key] = stripMongoOperators(value);
    }
    return cleaned as T;
  }

  return input;
}

export function escapeRegex(raw: string): string {
  return raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
