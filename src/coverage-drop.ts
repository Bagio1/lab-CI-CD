/**
 * coverage-drop.ts
 *
 * Intentionally untested file added to demonstrate Jest global coverage-threshold
 * failure for CI/CD assignment.  This file is NOT imported anywhere so it has
 * zero effect on runtime, but Jest picks it up via collectCoverageFrom: ['src/**\/*.ts'].
 */

// ──────────────────────────────────────────────────────────────────────────────
// Domain helpers – none of these are exercised by any test
// ──────────────────────────────────────────────────────────────────────────────

export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}

export function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

export function factorial(n: number): number {
  if (n < 0) throw new Error('Negative factorial');
  if (n === 0 || n === 1) return 1;
  return n * factorial(n - 1);
}

export function fibonacci(n: number): number {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    const tmp = a + b;
    a = b;
    b = tmp;
  }
  return b;
}

// ──────────────────────────────────────────────────────────────────────────────
// String utilities
// ──────────────────────────────────────────────────────────────────────────────

export function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function truncate(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen) + '…';
}

export function isPalindrome(s: string): boolean {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean === clean.split('').reverse().join('');
}

export function countWords(s: string): number {
  if (!s.trim()) return 0;
  return s.trim().split(/\s+/).length;
}

// ──────────────────────────────────────────────────────────────────────────────
// Array helpers
// ──────────────────────────────────────────────────────────────────────────────

export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

export function flatten<T>(arr: (T | T[])[]): T[] {
  const result: T[] = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else {
      result.push(item);
    }
  }
  return result;
}

export function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0) throw new Error('Chunk size must be positive');
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = String(item[key]);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

// ──────────────────────────────────────────────────────────────────────────────
// Date helpers
// ──────────────────────────────────────────────────────────────────────────────

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function daysBetween(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round(Math.abs(b.getTime() - a.getTime()) / msPerDay);
}

export function formatDate(date: Date, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// ──────────────────────────────────────────────────────────────────────────────
// Validation helpers
// ──────────────────────────────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidUuid(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

// ──────────────────────────────────────────────────────────────────────────────
// Object helpers
// ──────────────────────────────────────────────────────────────────────────────

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result as Omit<T, K>;
}

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
}

export function mergeDeep<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const output = { ...target };
  for (const key in source) {
    const srcVal = source[key];
    const tgtVal = target[key];
    if (
      srcVal !== null &&
      typeof srcVal === 'object' &&
      !Array.isArray(srcVal) &&
      tgtVal !== null &&
      typeof tgtVal === 'object'
    ) {
      output[key] = mergeDeep(
        tgtVal as Record<string, unknown>,
        srcVal as Record<string, unknown>,
      ) as T[typeof key];
    } else {
      output[key] = srcVal as T[typeof key];
    }
  }
  return output;
}

// ──────────────────────────────────────────────────────────────────────────────
// Async helpers
// ──────────────────────────────────────────────────────────────────────────────

export async function retry<T>(
  fn: () => Promise<T>,
  attempts: number,
  delayMs = 0,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
}

export async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

export async function mapAsync<T, U>(
  arr: T[],
  fn: (item: T, index: number) => Promise<U>,
): Promise<U[]> {
  return Promise.all(arr.map((item, i) => fn(item, i)));
}

// ──────────────────────────────────────────────────────────────────────────────
// Misc
// ──────────────────────────────────────────────────────────────────────────────

export function memoize<T extends (...args: unknown[]) => unknown>(fn: T): T {
  const cache = new Map<string, unknown>();
  return function (...args: unknown[]) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  } as T;
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, wait: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (...args: unknown[]) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  } as T;
}

export function throttle<T extends (...args: unknown[]) => void>(fn: T, limit: number): T {
  let inThrottle = false;
  return function (...args: unknown[]) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  } as T;
}
