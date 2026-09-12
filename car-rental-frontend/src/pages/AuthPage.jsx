import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone, Eye, EyeOff, Car } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const fonts = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    .font-display { font-family: 'Big Shoulders Display', sans-serif; }
    .font-body { font-family: 'Inter', sans-serif; }
  `}</style>
);

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (mode === "register" && form.name.trim().length < 2) e.name = "Poora naam likhein";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Valid email darj karein";
    if (mode === "register" && !/^0\d{10}$/.test(form.phone)) e.phone = "Valid phone number (03xxxxxxxxx)";
    if (form.password.length < 6) e.password = "Kam se kam 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
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
      }, 1200);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Kuch masla ho gaya, dobara try karein.";
      setApiError(Array.isArray(message) ? message[0] : message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setErrors({});
    setApiError("");
    setSubmitted(false);
  };

  return (
    <div className="font-body bg-[#EDEEF0] text-[#0F1B2B] min-h-screen flex flex-col">
      {fonts}

      {/* NAV */}
      <nav className="flex items-center justify-center sm:justify-start px-6 md:px-12 py-6">
        <div className="font-display text-2xl md:text-3xl font-800 tracking-tight">
          DRIVE<span className="text-[#FFC93C]">HUB</span>
        </div>
      </nav>

      <div className="flex-1 grid lg:grid-cols-2">
        {/* LEFT: form */}
        <div className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            {/* Tabs */}
            <div className="flex border border-[#0F1B2B]/15 mb-8">
              <button
                onClick={() => switchMode("login")}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${mode === "login" ? "bg-[#0F1B2B] text-white" : "bg-white text-[#445064] hover:text-[#0F1B2B]"}`}
              >
                Sign in
              </button>
              <button
                onClick={() => switchMode("register")}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${mode === "register" ? "bg-[#0F1B2B] text-white" : "bg-white text-[#445064] hover:text-[#0F1B2B]"}`}
              >
                Create account
              </button>
            </div>

            <h1 className="font-display text-4xl font-800 mb-2">
              {mode === "login" ? "Welcome back" : "Join DriveHub"}
            </h1>
            <p className="text-sm text-[#445064] mb-8">
              {mode === "login"
                ? "Apna account access karein aur booking jari rakhein."
                : "Account banayein aur seconds mein pehli booking karein."}
            </p>

            {submitted ? (
              <div className="bg-white border border-[#0F1B2B]/10 p-6 text-center">
                <div className="w-12 h-12 bg-[#FFC93C] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Car size={22} className="text-[#0F1B2B]" />
                </div>
                <p className="font-display text-2xl font-700 mb-1">
                  {mode === "login" ? "Signed in!" : "Account created!"}
                </p>
                <p className="text-sm text-[#445064]">
                  {mode === "login" ? "Redirecting to your dashboard..." : "Redirecting..."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                {apiError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5">
                    {apiError}
                  </div>
                )}
                {mode === "register" && (
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-[#445064] mb-1.5">
                      <User size={13} /> Full name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={update("name")}
                      placeholder="Ali Hassan"
                      className={`w-full border px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFC93C] ${errors.name ? "border-red-500" : "border-[#0F1B2B]/20"}`}
                    />
                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#445064] mb-1.5">
                    <Mail size={13} /> Email address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    placeholder="you@example.com"
                    className={`w-full border px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFC93C] ${errors.email ? "border-red-500" : "border-[#0F1B2B]/20"}`}
                  />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>

                {mode === "register" && (
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-[#445064] mb-1.5">
                      <Phone size={13} /> Phone number
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={update("phone")}
                      placeholder="03001234567"
                      className={`w-full border px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFC93C] ${errors.phone ? "border-red-500" : "border-[#0F1B2B]/20"}`}
                    />
                    {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-[#445064]">
                      <Lock size={13} /> Password
                    </label>
                    {mode === "login" && (
                      <a href="#" className="text-xs font-semibold text-[#445064] hover:text-[#0F1B2B]">Forgot password?</a>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={update("password")}
                      placeholder="••••••••"
                      className={`w-full border px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFC93C] pr-10 ${errors.password ? "border-red-500" : "border-[#0F1B2B]/20"}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#445064]"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FFC93C] text-[#0F1B2B] font-display font-700 text-lg py-3 mt-2 hover:bg-[#f5bd28] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
                </button>

                <p className="text-xs text-center text-[#445064] mt-2">
                  {mode === "login" ? (
                    <>Naya account nahi hai? <button type="button" onClick={() => switchMode("register")} className="font-semibold text-[#0F1B2B] underline">Sign up</button></>
                  ) : (
                    <>Pehle se account hai? <button type="button" onClick={() => switchMode("login")} className="font-semibold text-[#0F1B2B] underline">Sign in</button></>
                  )}
                </p>
              </form>
            )}
          </div>
        </div>

        {/* RIGHT: visual panel */}
        <div className="hidden lg:block relative bg-[#0F1B2B] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1000&q=80"
            alt="Car keys handover"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1B2B] via-[#0F1B2B]/40 to-transparent" />
          <div className="absolute bottom-12 left-10 right-10 text-white">
            <p className="font-display text-4xl font-800 leading-tight mb-3">
              Book smarter.
              <br />
              Drive further.
            </p>
            <p className="text-white/70 text-sm max-w-xs">
              4,200+ trips completed, verified fleet, aur transparent pricing — sab ek jagah.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}