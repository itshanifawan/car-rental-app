import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  Car,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const fonts = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

    .font-display {
      font-family: 'Big Shoulders Display', sans-serif;
    }

    .font-body {
      font-family: 'Inter', sans-serif;
    }
  `}</style>
);

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (key) => (e) => {
    setForm((current) => ({
      ...current,
      [key]: e.target.value,
    }));

    if (errors[key]) {
      setErrors((current) => ({
        ...current,
        [key]: "",
      }));
    }
  };

  const validate = () => {
    const validationErrors = {};

    if (
      mode === "register" &&
      form.name.trim().length < 2
    ) {
      validationErrors.name = "Please enter your full name.";
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      validationErrors.email = "Please enter a valid email address.";
    }

    if (
      mode === "register" &&
      !/^0\d{10}$/.test(form.phone)
    ) {
      validationErrors.phone =
        "Please enter a valid phone number (03xxxxxxxxx).";
    }

    if (form.password.length < 6) {
      validationErrors.password =
        "Password must contain at least 6 characters.";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setApiError("");

    if (!validate()) return;

    setLoading(true);

    try {
      let loggedInUser;

      if (mode === "login") {
        loggedInUser = await login(
          form.email,
          form.password
        );
      } else {
        loggedInUser = await register(
          form.name,
          form.email,
          form.phone,
          form.password
        );
      }

      setSubmitted(true);

      setTimeout(() => {
        navigate(
          loggedInUser.role === "admin"
            ? "/admin"
            : "/"
        );
      }, 1000);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";

      setApiError(
        Array.isArray(message)
          ? message[0]
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrors({});
    setApiError("");
    setSubmitted(false);
    setShowPassword(false);
  };

  return (
    <div className="font-body min-h-screen bg-[#F5F6F8] text-[#0B1728] overflow-x-hidden">
      {fonts}

      {/* =====================================================
          TOP NAVIGATION
      ====================================================== */}

      <header className="auth-header border-b border-[#0B1728]/10 bg-white">
        <div className="auth-header-inner max-w-[1500px] mx-auto px-5 sm:px-8 lg:px-12 h-[76px] flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="group flex items-center gap-2"
          >
            <div className="auth-logo-mark">
              <Car size={20} strokeWidth={2.5} />
            </div>

            <div className="font-display text-[27px] sm:text-[30px] font-900 tracking-[-0.04em] leading-none">
              DRIVE
              <span className="text-[#F5B800]">
                HUB
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="auth-back-button"
          >
            <span className="hidden sm:inline">
              Back to website
            </span>

            <ArrowRight size={17} />
          </button>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="auth-main">
        <div className="auth-layout max-w-[1500px] mx-auto">

          {/* =================================================
              LEFT / FORM AREA
          ================================================= */}

          <section className="auth-form-side">
            <div className="auth-form-wrapper">

              {/* Small heading */}
              <div className="auth-eyebrow">
                <span className="auth-eyebrow-line" />
                <span>
                  {mode === "login"
                    ? "Member access"
                    : "Get started"}
                </span>
              </div>

              {/* Main heading */}
              <div className="mb-8">
                <h1 className="font-display text-[46px] sm:text-[54px] lg:text-[60px] font-900 tracking-[-0.035em] leading-[0.92] text-[#0B1728]">
                  {mode === "login" ? (
                    <>
                      Welcome
                      <br />
                      <span className="text-[#F5B800]">
                        back.
                      </span>
                    </>
                  ) : (
                    <>
                      Start your
                      <br />
                      <span className="text-[#F5B800]">
                        journey.
                      </span>
                    </>
                  )}
                </h1>

                <p className="mt-5 max-w-[440px] text-[14px] sm:text-[15px] leading-7 text-[#596579]">
                  {mode === "login"
                    ? "Sign in to manage your bookings, explore our fleet, and get back on the road."
                    : "Create your DriveHub account and discover a simpler way to rent the right car for every journey."}
                </p>
              </div>

              {/* Mode switch */}
              <div className="auth-mode-switch">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className={
                    mode === "login"
                      ? "auth-mode-button auth-mode-active"
                      : "auth-mode-button"
                  }
                >
                  Sign in
                </button>

                <button
                  type="button"
                  onClick={() =>
                    switchMode("register")
                  }
                  className={
                    mode === "register"
                      ? "auth-mode-button auth-mode-active"
                      : "auth-mode-button"
                  }
                >
                  Create account
                </button>
              </div>

              {/* Success state */}
              {submitted ? (
                <div className="auth-success-card">
                  <div className="auth-success-icon">
                    <CheckCircle2
                      size={28}
                      strokeWidth={2}
                    />
                  </div>

                  <h2 className="font-display text-3xl font-800">
                    {mode === "login"
                      ? "You're signed in."
                      : "Account created."}
                  </h2>

                  <p className="mt-2 text-sm text-[#647084]">
                    Taking you to DriveHub...
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="auth-form"
                >
                  {/* API Error */}
                  {apiError && (
                    <div className="auth-error">
                      <span className="auth-error-dot" />
                      <span>{apiError}</span>
                    </div>
                  )}

                  {/* ===============================
                      NAME
                  ================================ */}

                  {mode === "register" && (
                    <AuthField
                      label="Full name"
                      icon={User}
                      value={form.name}
                      onChange={update("name")}
                      placeholder="Alex Morgan"
                      error={errors.name}
                      autoComplete="name"
                    />
                  )}

                  {/* ===============================
                      EMAIL
                  ================================ */}

                  <AuthField
                    label="Email address"
                    icon={Mail}
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    placeholder="you@example.com"
                    error={errors.email}
                    autoComplete="email"
                  />

                  {/* ===============================
                      PHONE
                  ================================ */}

                  {mode === "register" && (
                    <AuthField
                      label="Phone number"
                      icon={Phone}
                      type="tel"
                      value={form.phone}
                      onChange={update("phone")}
                      placeholder="03001234567"
                      error={errors.phone}
                      autoComplete="tel"
                    />
                  )}

                  {/* ===============================
                      PASSWORD
                  ================================ */}

                  <div className="auth-field">
                    <div className="auth-label-row">
                      <label className="auth-label">
                        <Lock size={14} />
                        Password
                      </label>

                      {mode === "login" && (
                        <button
                          type="button"
                          className="auth-forgot"
                          onClick={() => {}}
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>

                    <div className="auth-input-wrap">
                      <Lock
                        size={17}
                        className="auth-input-icon"
                      />

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={form.password}
                        onChange={update("password")}
                        placeholder="Enter your password"
                        autoComplete={
                          mode === "login"
                            ? "current-password"
                            : "new-password"
                        }
                        className={
                          errors.password
                            ? "auth-input auth-input-error"
                            : "auth-input"
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (current) => !current
                          )
                        }
                        className="auth-password-toggle"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>

                    {errors.password && (
                      <p className="auth-field-error">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* ===============================
                      SUBMIT
                  ================================ */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="auth-submit-button"
                  >
                    <span>
                      {loading
                        ? "Please wait..."
                        : mode === "login"
                        ? "Sign in to DriveHub"
                        : "Create my account"}
                    </span>

                    {!loading && (
                      <ArrowRight
                        size={19}
                        strokeWidth={2.4}
                      />
                    )}
                  </button>

                  {/* Switch text */}
                  <div className="auth-switch-text">
                    {mode === "login" ? (
                      <>
                        Don't have an account?
                        <button
                          type="button"
                          onClick={() =>
                            switchMode("register")
                          }
                        >
                          Create one
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?
                        <button
                          type="button"
                          onClick={() =>
                            switchMode("login")
                          }
                        >
                          Sign in
                        </button>
                      </>
                    )}
                  </div>
                </form>
              )}

              {/* Trust row */}
              <div className="auth-trust-row">
                <div className="auth-trust-item">
                  <ShieldCheck size={16} />
                  <span>Secure account</span>
                </div>

                <div className="auth-trust-divider" />

                <div className="auth-trust-item">
                  <CheckCircle2 size={16} />
                  <span>Verified fleet</span>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              RIGHT / VISUAL AREA
          ================================================= */}

          <section className="auth-visual-side">
            <div className="auth-visual-image-wrap">
              <img
                src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1400&q=85"
                alt="Premium car on the road"
                className="auth-visual-image"
              />

              <div className="auth-visual-overlay" />

              {/* Top badge */}
              <div className="auth-visual-top">
                <div className="auth-location-badge">
                  <MapPin size={15} />
                  <span>Pakistan</span>
                </div>

                <div className="auth-rating-badge">
                  <span className="auth-rating-star">
                    ★
                  </span>
                  <span>4.9</span>
                  <span className="auth-rating-muted">
                    / 5
                  </span>
                </div>
              </div>

              {/* Bottom content */}
              <div className="auth-visual-content">
                <div className="auth-visual-kicker">
                  DRIVE WITH CONFIDENCE
                </div>

                <h2 className="font-display text-[48px] sm:text-[58px] xl:text-[72px] font-900 leading-[0.86] tracking-[-0.04em] text-white">
                  The road
                  <br />
                  is <span className="text-[#FFC93C]">yours.</span>
                </h2>

                <p className="mt-5 max-w-[440px] text-sm sm:text-[15px] leading-7 text-white/70">
                  From quick city trips to long-distance
                  adventures, choose a car that fits the
                  way you travel.
                </p>

                <div className="auth-visual-stats">
                  <div>
                    <strong className="font-display">
                      4,200+
                    </strong>
                    <span>Trips completed</span>
                  </div>

                  <div>
                    <strong className="font-display">
                      12
                    </strong>
                    <span>Cities covered</span>
                  </div>

                  <div>
                    <strong className="font-display">
                      24/7
                    </strong>
                    <span>Customer support</span>
                  </div>
                </div>
              </div>

              {/* Decorative lines */}
              <div className="auth-visual-line auth-visual-line-one" />
              <div className="auth-visual-line auth-visual-line-two" />
            </div>
          </section>
        </div>
      </main>

      {/* =====================================================
          MOBILE FOOTER
      ====================================================== */}

      <footer className="auth-mobile-footer">
        <span>© 2026 DriveHub</span>
        <span>Premium car rental</span>
      </footer>
    </div>
  );
}

/* ============================================================
   REUSABLE AUTH FIELD
============================================================ */

function AuthField({
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
}) {
  return (
    <div className="auth-field">
      <label className="auth-label">
        <Icon size={14} />
        {label}
      </label>

      <div className="auth-input-wrap">
        <Icon
          size={17}
          className="auth-input-icon"
        />

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={
            error
              ? "auth-input auth-input-error"
              : "auth-input"
          }
        />
      </div>

      {error && (
        <p className="auth-field-error">
          {error}
        </p>
      )}
    </div>
  );
}