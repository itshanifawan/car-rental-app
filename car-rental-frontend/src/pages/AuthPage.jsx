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
    .font-display { font-family: 'Big Shoulders Display', sans-serif; }
    .font-body { font-family: 'Inter', sans-serif; }
  `}</style>
);

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (key) => (e) => {
    setForm((current) => ({ ...current, [key]: e.target.value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: "" }));
  };

  const validate = () => {
    const validationErrors = {};
    if (mode === "register" && form.name.trim().length < 2) {
      validationErrors.name = "Please enter your full name.";
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      validationErrors.email = "Please enter a valid email address.";
    }
    if (mode === "register" && !/^0\d{10}$/.test(form.phone)) {
      validationErrors.phone = "Please enter a valid phone number (03xxxxxxxxx).";
    }
    if (form.password.length < 6) {
      validationErrors.password = "Password must contain at least 6 characters.";
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
        loggedInUser = await login(form.email, form.password);
      } else {
        loggedInUser = await register(form.name, form.email, form.phone, form.password);
      }
      setSubmitted(true);
      setTimeout(() => {
        navigate(loggedInUser.role === "admin" ? "/admin" : "/");
      }, 1000);
    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong. Please try again.";
      setApiError(Array.isArray(message) ? message[0] : message);
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

      {/* HEADER */}
      <header className="border-b border-[#0B1728]/10 bg-white">
        <div className="max-w-[1500px] mx-auto px-5 sm:px-8 lg:px-12 h-[76px] flex items-center justify-between">
          <button type="button" onClick={() => navigate("/")} className="group flex items-center gap-2">
            <div className="w-9 h-9 bg-[#0B1728] text-white flex items-center justify-center rounded">
              <Car size={20} strokeWidth={2.5} />
            </div>
            <div className="font-display text-[27px] sm:text-[30px] font-900 tracking-[-0.04em] leading-none">
              DRIVE<span className="text-[#F5B800]">HUB</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-semibold text-[#596579] hover:text-[#0B1728] transition-colors"
          >
            <span className="hidden sm:inline">Back to website</span>
            <ArrowRight size={17} />
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main>
        <div className="max-w-[1500px] mx-auto grid lg:grid-cols-2 min-h-[calc(100vh-76px)]">
          {/* LEFT / FORM SIDE */}
          <section className="flex items-center justify-center px-5 sm:px-8 lg:px-16 py-12">
            <div className="w-full max-w-md">
              {/* Eyebrow */}
              <div className="flex items-center gap-2 mb-5">
                <span className="w-8 h-[2px] bg-[#F5B800]" />
                <span className="text-xs font-semibold uppercase tracking-wide text-[#596579]">
                  {mode === "login" ? "Member access" : "Get started"}
                </span>
              </div>

              {/* Heading */}
              <div className="mb-8">
                <h1 className="font-display text-[46px] sm:text-[54px] lg:text-[60px] font-900 tracking-[-0.035em] leading-[0.92] text-[#0B1728]">
                  {mode === "login" ? (
                    <>Welcome<br /><span className="text-[#F5B800]">back.</span></>
                  ) : (
                    <>Start your<br /><span className="text-[#F5B800]">journey.</span></>
                  )}
                </h1>
                <p className="mt-5 max-w-[440px] text-[14px] sm:text-[15px] leading-7 text-[#596579]">
                  {mode === "login"
                    ? "Sign in to manage your bookings, explore our fleet, and get back on the road."
                    : "Create your DriveHub account and discover a simpler way to rent the right car for every journey."}
                </p>
              </div>

              {/* Mode switch */}
              <div className="flex border border-[#0B1728]/15 rounded overflow-hidden mb-7">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors ${mode === "login" ? "bg-[#0B1728] text-white" : "text-[#596579] hover:text-[#0B1728]"}`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors ${mode === "register" ? "bg-[#0B1728] text-white" : "text-[#596579] hover:text-[#0B1728]"}`}
                >
                  Create account
                </button>
              </div>

              {submitted ? (
                <div className="flex flex-col items-center text-center gap-3 py-10">
                  <div className="w-14 h-14 rounded-full bg-[#F5B800]/20 flex items-center justify-center text-[#0B1728]">
                    <CheckCircle2 size={28} strokeWidth={2} />
                  </div>
                  <h2 className="font-display text-3xl font-800">
                    {mode === "login" ? "You're signed in." : "Account created."}
                  </h2>
                  <p className="mt-1 text-sm text-[#647084]">Taking you to DriveHub...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                  {apiError && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      <span>{apiError}</span>
                    </div>
                  )}

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

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-[#596579]">
                        <Lock size={14} />
                        Password
                      </label>
                      {mode === "login" && (
                        <button
                          type="button"
                          className="text-xs font-semibold text-[#596579] hover:text-[#0B1728]"
                          onClick={() => {}}
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#96a0b3]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={update("password")}
                        placeholder="Enter your password"
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                        className={`w-full border rounded px-3 py-2.5 pl-10 pr-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F5B800] ${errors.password ? "border-red-400" : "border-[#0B1728]/15"}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#596579]"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0B1728] text-white font-display font-700 text-lg py-3.5 rounded flex items-center justify-center gap-2 hover:bg-[#0B1728]/90 transition-colors disabled:opacity-50"
                  >
                    <span>{loading ? "Please wait..." : mode === "login" ? "Sign in to DriveHub" : "Create my account"}</span>
                    {!loading && <ArrowRight size={19} strokeWidth={2.4} />}
                  </button>

                  <div className="text-center text-sm text-[#596579] mt-1">
                    {mode === "login" ? (
                      <>
                        Don't have an account?{" "}
                        <button type="button" onClick={() => switchMode("register")} className="font-semibold text-[#0B1728] underline">
                          Create one
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{" "}
                        <button type="button" onClick={() => switchMode("login")} className="font-semibold text-[#0B1728] underline">
                          Sign in
                        </button>
                      </>
                    )}
                  </div>
                </form>
              )}

              {/* Trust row */}
              <div className="flex items-center justify-center gap-4 mt-8 text-xs text-[#596579]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={16} />
                  <span>Secure account</span>
                </div>
                <div className="w-px h-4 bg-[#0B1728]/15" />
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} />
                  <span>Verified fleet</span>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT / VISUAL SIDE */}
          <section className="hidden lg:block relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1400&q=85"
              alt="Premium car on the road"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1728] via-[#0B1728]/30 to-[#0B1728]/10" />

            <div className="absolute top-8 left-8 right-8 flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-white/90 text-[#0B1728] text-xs font-semibold px-3 py-2 rounded">
                <MapPin size={15} />
                <span>Pakistan</span>
              </div>
              <div className="flex items-center gap-1 bg-white/90 text-[#0B1728] text-xs font-semibold px-3 py-2 rounded">
                <span className="text-[#F5B800]">★</span>
                <span>4.9</span>
                <span className="text-[#596579]">/ 5</span>
              </div>
            </div>

            <div className="absolute bottom-12 left-10 right-10 text-white">
              <div className="text-xs font-semibold tracking-wide text-white/70 mb-3">DRIVE WITH CONFIDENCE</div>
              <h2 className="font-display text-[48px] sm:text-[58px] xl:text-[64px] font-900 leading-[0.86] tracking-[-0.04em]">
                The road<br />is <span className="text-[#FFC93C]">yours.</span>
              </h2>
              <p className="mt-5 max-w-[440px] text-sm sm:text-[15px] leading-7 text-white/70">
                From quick city trips to long-distance adventures, choose a car that fits the way you travel.
              </p>

              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
                <div>
                  <strong className="font-display text-2xl block">4,200+</strong>
                  <span className="text-xs text-white/60">Trips completed</span>
                </div>
                <div>
                  <strong className="font-display text-2xl block">12</strong>
                  <span className="text-xs text-white/60">Cities covered</span>
                </div>
                <div>
                  <strong className="font-display text-2xl block">24/7</strong>
                  <span className="text-xs text-white/60">Customer support</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* MOBILE FOOTER */}
      <footer className="lg:hidden flex items-center justify-between px-6 py-4 border-t border-[#0B1728]/10 bg-white text-xs text-[#596579]">
        <span>© 2026 DriveHub</span>
        <span>Premium car rental</span>
      </footer>
    </div>
  );
}

function AuthField({ label, icon: Icon, type = "text", value, onChange, placeholder, error, autoComplete }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-[#596579] mb-1.5">
        <Icon size={14} />
        {label}
      </label>
      <div className="relative">
        <Icon size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#96a0b3]" />
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full border rounded px-3 py-2.5 pl-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F5B800] ${error ? "border-red-400" : "border-[#0B1728]/15"}`}
        />
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}