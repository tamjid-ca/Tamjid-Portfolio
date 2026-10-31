'use client';

import React, { useState } from 'react';

interface AdminLoginFormProps {
  onSuccessRedirect?: string;
}

export function AdminLoginForm({
  onSuccessRedirect = '/admin/dashboard',
}: AdminLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        setErrorMessage(payload.error ?? 'Invalid email or password.');
        return;
      }

      if (typeof window !== 'undefined') {
        window.location.assign(onSuccessRedirect);
      }
    } catch {
      setErrorMessage('Network error while signing in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <h1 className="admin-login-title">Admin CMS Sign In</h1>
        <p className="admin-login-subtitle">
          Manage MD. Tamjid Hossain&apos;s dynamic portfolio content
        </p>

        {errorMessage && (
          <div className="admin-alert admin-alert-error" role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} data-admin-login-form>
          <div className="admin-field">
            <label htmlFor="admin-email" className="admin-label">
              Admin Email
            </label>
            <input
              id="admin-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="admin-input"
              placeholder="admin@tamjid.ca"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="admin-field">
            <label htmlFor="admin-password" className="admin-label">
              Password
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="admin-input"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In to Admin CMS'}
          </button>
        </form>
      </div>
    </div>
  );
}
