import { useState, useEffect } from "react";
import { useAuth } from '../hooks/useAuth.js'; 
import Button from '../components/Button.jsx';

export default function LoginForm() {
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI states
  const [errors, setErrors] = useState({});         
  const [serverError, setServerError] = useState(''); 
  const [loading, setLoading] = useState(false);     

  // Get login function from auth hook
  const { login } = useAuth();

  // Clear server error when user types again
  useEffect(() => {
    if (serverError) setServerError('');
  }, [email, password]);

  // Client-side validation
  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    return newErrors;
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Client validation
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // 2. Clear errors, start loading
    setErrors({});
    setServerError('');
    setLoading(true);

    try {
      // 3. Call real login from useAuth hook
      await login(email, password);

      // 4. Success → redirect to dashboard
      window.location.href = '/'; // or '/dashboard' if you have routing
    } catch (err) {
      // 5. Show backend error
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Your beautiful scoped styles – unchanged */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lf-shell {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f2ee;
          font-family: 'DM Sans', sans-serif;
          padding: 1.5rem;
        }

        .lf-card {
          background: #ffffff;
          border: 1px solid #e4dfd8;
          border-radius: 4px;
          padding: 3rem 2.5rem;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 2px 24px rgba(0,0,0,0.06);
        }

        .lf-eyebrow {
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #b0a89e;
          margin-bottom: 0.5rem;
        }

        .lf-heading {
          font-family: 'DM Serif Display', serif;
          font-size: 2rem;
          color: #1a1714;
          margin-bottom: 2.25rem;
          line-height: 1.15;
        }

        .lf-field {
          margin-bottom: 1.25rem;
        }

        .lf-label {
          display: block;
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: #5c5650;
          margin-bottom: 0.45rem;
          text-transform: uppercase;
        }

        .lf-input {
          width: 100%;
          padding: 0.7rem 0.9rem;
          border: 1px solid #d8d3cc;
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          color: #1a1714;
          background: #fdfcfb;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .lf-input:focus {
          border-color: #8b7355;
          box-shadow: 0 0 0 3px rgba(139,115,85,0.12);
        }
        .lf-input.lf-input--error {
          border-color: #c0392b;
          box-shadow: 0 0 0 3px rgba(192,57,43,0.1);
        }

        .lf-error-msg {
          font-size: 0.78rem;
          color: #c0392b;
          margin-top: 0.35rem;
        }

        .lf-server-error {
          background: #fdf2f2;
          border: 1px solid #f5c6c6;
          border-radius: 3px;
          padding: 0.75rem 1rem;
          font-size: 0.85rem;
          color: #c0392b;
          margin-bottom: 1.25rem;
        }

        .lf-btn {
          width: 100%;
          padding: 0.8rem;
          background: #1a1714;
          color: #f5f2ee;
          border: none;
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          margin-top: 0.5rem;
        }
        .lf-btn:hover:not(:disabled) {
          background: #3a342e;
        }
        .lf-btn:active:not(:disabled) {
          transform: scale(0.99);
        }
        .lf-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .lf-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(245,242,238,0.4);
          border-top-color: #f5f2ee;
          border-radius: 50%;
          animation: lf-spin 0.6s linear infinite;
          vertical-align: middle;
          margin-right: 0.5rem;
        }
        @keyframes lf-spin { to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
          .lf-card { padding: 2rem 1.5rem; }
        }
      `}</style>

      {/* Shell */}
      <div className="lf-shell">
        <div className="lf-card">
          <p className="lf-eyebrow">Welcome back</p>
          <h1 className="lf-heading">Sign in</h1>

          {/* Server error */}
          {serverError && (
            <div className="lf-server-error" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="lf-field">
              <label htmlFor="lf-email" className="lf-label">Email</label>
              <input
                id="lf-email"
                type="email"
                className={`lf-input${errors.email ? ' lf-input--error' : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                aria-describedby={errors.email ? 'lf-email-err' : undefined}
              />
              {errors.email && (
                <p id="lf-email-err" className="lf-error-msg" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="lf-field">
              <label htmlFor="lf-password" className="lf-label">Password</label>
              <input
                id="lf-password"
                type="password"
                className={`lf-input${errors.password ? ' lf-input--error' : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                aria-describedby={errors.password ? 'lf-password-err' : undefined}
              />
              {errors.password && (
                <p id="lf-password-err" className="lf-error-msg" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button type="submit" className="lf-btn" disabled={loading}>
              {loading && <span className="lf-spinner" aria-hidden="true" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}