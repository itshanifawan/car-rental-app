import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  ShieldCheck,
  X,
  User,
  CarFront,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Clock3,
  AlertCircle,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const fonts = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

    .font-display {
      font-family: 'Big Shoulders Display', sans-serif;
    }

    .font-body {
      font-family: 'Inter', sans-serif;
    }
  `}</style>
);

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=800&q=80";

const statusConfig = {
  Pending: {
    label: "Pending",
    className: "bg-[#FFC93C]/20 text-[#8A6500] border-[#FFC93C]/30",
    icon: Clock3,
  },
  Active: {
    label: "Active",
    className: "bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/20",
    icon: CheckCircle2,
  },
  Completed: {
    label: "Completed",
    className: "bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/20",
    icon: CheckCircle2,
  },
  Cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: X,
  },
};

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/bookings/my");

      setBookings(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error("Fetch bookings error:", err);

      setError(
        "We couldn't load your bookings. Please check your connection and try again."
      );

      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    setCancellingId(id);

    try {
      await api.patch(`/bookings/${id}/cancel`);

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id
            ? { ...booking, status: "Cancelled" }
            : booking
        )
      );
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "We couldn't cancel this booking. Please try again."
      );
    } finally {
      setCancellingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="font-body bg-[#F3F3F0] min-h-screen flex items-center justify-center px-6">
        {fonts}

        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-5">
            <div className="absolute inset-0 border-4 border-[#111518]/10 rounded-full" />

            <div className="absolute inset-0 border-4 border-transparent border-t-[#F5C542] rounded-full animate-spin" />
          </div>

          <p className="font-display text-2xl font-700 text-[#111518]">
            Loading your bookings
          </p>

          <p className="text-sm text-[#777E84] mt-1">
            Please wait a moment...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="font-body bg-[#F3F3F0] text-[#111518] min-h-screen">
      {fonts}

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="dh-nav sticky top-0 z-30 border-b border-[#111518]/5 bg-[#F3F3F0]/90">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
          {/* Logo */}

          <button
            type="button"
            onClick={() => navigate("/")}
            className="font-display text-2xl md:text-3xl font-800 tracking-tight select-none"
          >
            DRIVE
            <span className="text-[#F5C542]">HUB</span>
          </button>

          {/* Navigation */}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/fleet")}
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#777E84] hover:text-[#111518] transition-colors"
            >
              Browse fleet
              <ArrowRight size={14} />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(user.role === "admin" ? "/admin" : "/my-bookings")
              }
              className="flex items-center gap-2 bg-[#111518] text-white text-sm font-semibold px-4 sm:px-5 py-2.5 hover:bg-[#252B2F] transition-all duration-200"
            >
              <User size={15} />

              <span className="hidden sm:inline">
                {user.fullName?.split(" ")[0] || "Account"}
              </span>

              <span className="sm:hidden">Account</span>
            </button>
          </div>
        </div>
      </nav>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="max-w-5xl mx-auto px-6 md:px-12 pb-20 pt-8 md:pt-12">
        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-px bg-[#F5C542]" />

              <p className="text-[11px] font-bold tracking-[0.18em] text-[#777E84] uppercase">
                Your account
              </p>
            </div>

            <h1 className="font-display text-5xl md:text-6xl font-800 leading-[0.9] tracking-tight">
              My bookings
            </h1>

            {bookings.length > 0 && (
              <p className="text-sm text-[#777E84] mt-3">
                {bookings.length}{" "}
                {bookings.length === 1 ? "booking" : "bookings"} in your
                account
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={fetchBookings}
            disabled={loading}
            className="dh-button self-start sm:self-auto inline-flex items-center justify-center gap-2 bg-white border border-[#111518]/10 px-4 py-2.5 text-sm font-semibold hover:bg-[#111518] hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />

            Refresh bookings
          </button>
        </div>

        {/* =====================================================
            ERROR STATE
        ===================================================== */}

        {error ? (
          <div className="bg-white border border-red-200 p-10 sm:p-14 text-center shadow-sm">
            <div className="w-14 h-14 bg-red-50 flex items-center justify-center mx-auto mb-5">
              <AlertCircle size={25} className="text-red-600" />
            </div>

            <p className="font-display text-3xl font-700 mb-2">
              Something went wrong
            </p>

            <p className="text-sm text-[#777E84] mb-6 max-w-md mx-auto leading-relaxed">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchBookings}
              className="dh-button inline-flex items-center gap-2 bg-[#111518] text-white px-5 py-3 text-sm font-semibold hover:bg-[#252B2F]"
            >
              <RefreshCw size={14} />
              Try again
            </button>
          </div>
        ) : bookings.length === 0 ? (
          /* =====================================================
             EMPTY STATE
          ===================================================== */

          <div className="bg-white border border-[#111518]/10 p-10 sm:p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-[#F3F3F0] flex items-center justify-center mx-auto mb-6">
              <CarFront size={32} className="text-[#777E84]" />
            </div>

            <p className="font-display text-3xl sm:text-4xl font-700 mb-3">
              No bookings yet
            </p>

            <p className="text-sm text-[#777E84] mb-7 max-w-md mx-auto leading-relaxed">
              You haven't booked a car yet. Explore our fleet and find the
              perfect vehicle for your next trip.
            </p>

            <button
              type="button"
              onClick={() => navigate("/fleet")}
              className="dh-button inline-flex items-center gap-2 bg-[#F5C542] text-[#111518] font-display font-700 text-lg px-7 py-3 hover:bg-[#FFD86B]"
            >
              Browse cars
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          /* =====================================================
             BOOKINGS
          ===================================================== */

          <div className="flex flex-col gap-5">
            {bookings.map((booking) => {
              const car = booking.car;

              const currentStatus =
                statusConfig[booking.status] || statusConfig.Pending;

              const StatusIcon = currentStatus.icon;

              const totalAmount = Number(booking.totalAmount || 0);

              return (
                <article
                  key={booking.id}
                  className="dh-card bg-white border border-[#111518]/10 overflow-hidden hover:shadow-[6px_6px_0_#111518]"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* =================================================
                        CAR IMAGE
                    ================================================= */}

                    <div className="relative w-full md:w-56 lg:w-64 h-52 md:h-auto md:min-h-[215px] shrink-0 bg-[#111518] overflow-hidden">
                      <img
                        src={car?.images?.[0] || PLACEHOLDER_IMG}
                        alt={car?.name || "Rental car"}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = PLACEHOLDER_IMG;
                        }}
                      />

                      {/* Image Overlay */}

                      <div className="absolute inset-0 bg-gradient-to-t from-[#111518]/50 via-transparent to-transparent pointer-events-none" />

                      {/* Car Type */}

                      {car?.type && (
                        <span className="absolute top-3 left-3 bg-[#111518] text-white text-[10px] uppercase tracking-wider font-bold px-2.5 py-1.5">
                          {car.type}
                        </span>
                      )}
                    </div>

                    {/* =================================================
                        BOOKING CONTENT
                    ================================================= */}

                    <div className="flex-1 p-5 md:p-6 lg:p-7">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        {/* LEFT CONTENT */}

                        <div className="flex-1 min-w-0">
                          {/* Name + Status */}

                          <div className="flex flex-wrap items-center gap-2.5 mb-4">
                            <h2 className="font-display text-2xl sm:text-3xl font-700 leading-none tracking-tight">
                              {car?.name || "Rental car"}
                            </h2>

                            <span
                              className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide font-bold px-2.5 py-1.5 border ${
                                currentStatus.className
                              }`}
                            >
                              <StatusIcon size={11} />

                              {currentStatus.label}
                            </span>
                          </div>

                          {/* Booking Details */}

                          <div className="space-y-2.5">
                            {/* Dates */}

                            <div className="flex items-start gap-2.5">
                              <Calendar
                                size={15}
                                className="text-[#777E84] mt-0.5 shrink-0"
                              />

                              <div>
                                <p className="text-sm font-semibold text-[#111518]">
                                  {booking.pickupDate}
                                </p>

                                <p className="text-xs text-[#777E84] mt-0.5">
                                  Drop-off: {booking.dropoffDate}
                                </p>
                              </div>
                            </div>

                            {/* City */}

                            {car?.city && (
                              <div className="flex items-center gap-2.5 text-xs text-[#777E84]">
                                <MapPin size={15} className="shrink-0" />
                                <span>{car.city}</span>
                              </div>
                            )}

                            {/* Insurance */}

                            {booking.addInsurance && (
                              <div className="flex items-center gap-2.5 text-xs text-[#777E84]">
                                <ShieldCheck
                                  size={15}
                                  className="shrink-0"
                                />

                                <span>Full insurance included</span>
                              </div>
                            )}

                            {/* Driver */}

                            {booking.addDriver && (
                              <div className="flex items-center gap-2.5 text-xs text-[#777E84]">
                                <User size={15} className="shrink-0" />

                                <span>Professional driver included</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* RIGHT CONTENT */}

                        <div className="lg:min-w-[155px] flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4 pt-5 lg:pt-0 border-t lg:border-t-0 border-[#111518]/10">
                          {/* Total */}

                          <div className="text-left lg:text-right">
                            <p className="text-[10px] font-bold text-[#777E84] uppercase tracking-[0.16em] mb-1">
                              Booking total
                            </p>

                            <span className="font-display text-2xl sm:text-3xl font-800 tracking-tight">
                              Rs {totalAmount.toLocaleString()}
                            </span>
                          </div>

                          {/* Cancel */}

                          {(booking.status === "Pending" ||
                            booking.status === "Active") && (
                            <button
                              type="button"
                              onClick={() => handleCancel(booking.id)}
                              disabled={cancellingId === booking.id}
                              className="dh-button inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-100 hover:bg-red-100 px-3.5 py-2.5 disabled:opacity-50"
                            >
                              <X size={13} />

                              {cancellingId === booking.id
                                ? "Cancelling..."
                                : "Cancel booking"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* =====================================================
            BOTTOM CTA
        ===================================================== */}

        {bookings.length > 0 && !error && (
          <section className="mt-8 bg-[#111518] text-white p-6 sm:p-8 md:p-9 relative overflow-hidden">
            {/* Decorative element */}

            <div className="absolute -right-10 -bottom-16 w-40 h-40 border-[30px] border-[#F5C542]/10 rounded-full pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-px bg-[#F5C542]" />

                  <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-white/50">
                    Drive your way
                  </span>
                </div>

                <p className="font-display text-2xl sm:text-3xl font-700 mb-1">
                  Need another car?
                </p>

                <p className="text-sm text-white/55">
                  Explore our fleet and find your next ride.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/fleet")}
                className="dh-button inline-flex items-center justify-center gap-2 bg-[#F5C542] text-[#111518] font-display font-700 text-lg px-6 py-3 hover:bg-[#FFD86B] whitespace-nowrap"
              >
                Browse fleet
                <ArrowRight size={18} />
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}