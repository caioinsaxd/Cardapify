const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

export function containsDangerousKeys(obj: unknown, path = ''): string | null {
  if (!isPlainObject(obj)) {
    return null;
  }

  for (const key of Object.keys(obj)) {
    if (DANGEROUS_KEYS.includes(key)) {
      return path + key;
    }
    const value = (obj as Record<string, unknown>)[key];
    if (isPlainObject(value)) {
      const found = containsDangerousKeys(value, path + key + '.');
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export function getDangerousKeys(): string[] {
  return [...DANGEROUS_KEYS];
}

export function isObjectPlain(value: unknown): value is Record<string, unknown> {
  return isPlainObject(value);
}
