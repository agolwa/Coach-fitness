/**
 * Shared error utilities
 * - getErrorMessage: converts unknown error shapes (FastAPI, fetch, Axios-like) into readable strings
 */

import { APIError } from './api-client';

/**
 * Extract a human-readable message from diverse error shapes
 */
export function getErrorMessage(error: unknown): string {
  // Strings
  if (typeof error === 'string') return error;

  // Error subclasses
  if (error instanceof APIError || error instanceof Error) {
    return (error as Error).message || 'An error occurred';
  }

  // Objects with common shapes
  if (error && typeof error === 'object') {
    const e: any = error;

    // Simple wrappers
    if (e?.error && typeof e.error === 'string') return e.error;
    if (typeof e?.message === 'string') return e.message;

    // FastAPI: { detail: string | Array<{ msg, loc, ... }> | { message } }
    if (e?.detail) {
      const d = e.detail;
      if (typeof d === 'string') return d;
      if (Array.isArray(d)) {
        const parts = d
          .map((item) => {
            if (!item) return '';
            const msg = item.msg || item.message;
            const loc = Array.isArray(item.loc) ? ` at ${item.loc.join('.')}` : '';
            return msg ? `${msg}${loc}` : '';
          })
          .filter(Boolean);
        if (parts.length) return parts.join('; ');
      }
      if (typeof d === 'object') {
        if (typeof d.message === 'string') return d.message;
      }
    }

    // Axios-like shapes
    if (e?.response?.data) {
      const data = e.response.data;
      if (typeof data === 'string') return data;
      if (typeof data?.message === 'string') return data.message;
      if (typeof data?.detail === 'string') return data.detail;
      if (Array.isArray(data?.detail)) {
        const msgs = data.detail.map((x: any) => x?.msg).filter(Boolean);
        if (msgs.length) return msgs.join('; ');
      }
    }

    // Last resort: safe JSON stringify
    try {
      return JSON.stringify(e);
    } catch {
      // fall through
    }
  }

  return error ? String(error) : 'An unknown error occurred';
}

