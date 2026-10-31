export class CsrfValidationError extends Error {
  constructor(message = 'Cross-origin state-changing request blocked by CSRF policy.') {
    super(message);
    this.name = 'CsrfValidationError';
  }
}

export const ADMIN_SECURITY_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Verifies that state-changing admin requests originate from the same host/origin.
 */
export function verifyCsrfOrigin(request: Request): void {
  const method = request.method.toUpperCase();
  if (!STATE_CHANGING_METHODS.has(method)) {
    return;
  }

  const originHeader = request.headers.get('origin')?.trim();
  if (!originHeader) {
    return;
  }

  let originHost: string;
  try {
    originHost = new URL(originHeader).host.toLowerCase();
  } catch {
    throw new CsrfValidationError('Malformed Origin header.');
  }

  const hostHeader =
    request.headers.get('x-forwarded-host')?.trim().toLowerCase() ||
    request.headers.get('host')?.trim().toLowerCase();

  let requestUrlHost = '';
  try {
    requestUrlHost = new URL(request.url).host.toLowerCase();
  } catch {
    // ignore
  }

  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  let configuredHost = '';
  if (configuredSiteUrl) {
    try {
      configuredHost = new URL(configuredSiteUrl).host.toLowerCase();
    } catch {
      // ignore
    }
  }

  const allowedHosts = new Set(
    [hostHeader, requestUrlHost, configuredHost].filter(Boolean)
  );

  if (allowedHosts.size > 0 && !allowedHosts.has(originHost)) {
    throw new CsrfValidationError(
      `Origin "${originHost}" does not match expected host.`
    );
  }
}
