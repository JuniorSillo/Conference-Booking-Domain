import { useState, useEffect } from "react";

// Base API URL from Vite environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function LoginForm() {
  // ── Form field state ──────────────────────────────────────────────────────
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  // ── UI / async state ──────────────────────────────────────────────────────
  const [errors, setErrors]         = useState({});   // field-level validation errors
  const [serverError, setServerError] = useState(""); // error message returned by the API
  const [success, setSuccess]       = useState(false); // true after a successful login
  const [loading, setLoading]       = useState(false); // true while the fetch is in-flight

  // ── Clear server-level error whenever the user starts typing again ────────
  useEffect(() => {
    if (serverError) setServerError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password]);

  // ── Client-side validation ────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    return newErrors;
  };

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run validation; stop early if there are errors
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Clear previous errors and start loading
    setErrors({});
    setServerError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include", // <-- add this if backend needs cookies (optional)
  body: JSON.stringify({ email, password }),
});

      const data = await response.json();

      if (!response.ok) {
        // Use the backend's error message if available, otherwise a generic one
        setServerError(data?.message || "Login failed. Please try again.");
        return;
      }

      // ── Success path ──────────────────────────────────────────────────────
      // Store the JWT so it is available for subsequent authenticated requests
      localStorage.setItem("token", data.token);
      setSuccess(true);

      // Optional: clear the form
      setEmail("");
      setPassword("");
    } catch {
      // Network error or JSON parse failure
      setServerError("Unable to reach the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Scoped styles ───────────────────────────────────────────────── */}
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

        .lf-success {
          background: #f2faf5;
          border: 1px solid #b7e4c7;
          border-radius: 3px;
          padding: 0.75rem 1rem;
          font-size: 0.85rem;
          color: #1e6b3e;
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

      {/* ── Shell ───────────────────────────────────────────────────────── */}
      <div className="lf-shell">
        <div className="lf-card">
          <p className="lf-eyebrow">Welcome back</p>
          <h1 className="lf-heading">Sign in</h1>

          {/* Server-level success message */}
          {success && (
            <div className="lf-success" role="status">
              You're signed in successfully.
            </div>
          )}

          {/* Server-level error message */}
          {serverError && (
            <div className="lf-server-error" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* ── Email ─────────────────────────────────────────────── */}
            <div className="lf-field">
              <label htmlFor="lf-email" className="lf-label">Email</label>
              <input
                id="lf-email"
                type="email"
                className={`lf-input${errors.email ? " lf-input--error" : ""}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                aria-describedby={errors.email ? "lf-email-err" : undefined}
              />
              {errors.email && (
                <p id="lf-email-err" className="lf-error-msg" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* ── Password ──────────────────────────────────────────── */}
            <div className="lf-field">
              <label htmlFor="lf-password" className="lf-label">Password</label>
              <input
                id="lf-password"
                type="password"
                className={`lf-input${errors.password ? " lf-input--error" : ""}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                aria-describedby={errors.password ? "lf-password-err" : undefined}
              />
              {errors.password && (
                <p id="lf-password-err" className="lf-error-msg" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            {/* ── Submit ────────────────────────────────────────────── */}
            <button type="submit" className="lf-btn" disabled={loading}>
              {loading && <span className="lf-spinner" aria-hidden="true" />}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default LoginForm;