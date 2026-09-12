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

const statusColor = {
  Pending: "bg-[#FFC93C]/20 text-[#0F1B2B]",
  Active: "bg-[#FFC93C]/20 text-[#0F1B2B]",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const statusLabel = {
  Pending: "Pending",
  Active: "Active",
  Completed: "Completed",
  Cancelled: "Cancelled",
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
      setError("Bookings load nahi ho sakin.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    const confirmed = window.confirm(
      "Kya aap ye booking cancel karna chahte hain?"
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
          "Cancel nahi ho saka, dobara try karein."
      );
    } finally {
      setCancellingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="font-body bg-[#EDEEF0] min-h-screen flex items-center justify-center">
        {fonts}

        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#0F1B2B]/20 border-t-[#FFC93C] rounded-full animate-spin mx-auto mb-4" />

          <p className="font-display text-2xl font-700 text-[#0F1B2B]">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="font-body bg-[#EDEEF0] text-[#0F1B2B] min-h-screen">
      {fonts}

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto">
        <div
          onClick={() => navigate("/")}
          className="font-display text-2xl md:text-3xl font-800 tracking-tight cursor-pointer select-none"
        >
          DRIVE
          <span className="text-[#FFC93C]">HUB</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/fleet")}
            className="hidden sm:block text-sm font-semibold text-[#445064] hover:text-[#0F1B2B] transition-colors"
          >
            Browse fleet
          </button>

          <button
            onClick={() =>
              navigate(user.role === "admin" ? "/admin" : "/my-bookings")
            }
            className="flex items-center gap-2 bg-[#0F1B2B] text-white text-sm font-semibold px-4 sm:px-5 py-2.5 hover:bg-[#1a2c44] transition-colors"
          >
            <User size={15} />

            <span className="hidden sm:inline">
              {user.fullName?.split(" ")[0] || "Account"}
            </span>

            <span className="sm:hidden">Account</span>
          </button>
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-5xl mx-auto px-6 md:px-12 pb-20 pt-3">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#445064] uppercase mb-2">
              Account
            </p>

            <h1 className="font-display text-4xl md:text-5xl font-800 leading-none">
              My bookings
            </h1>

            {bookings.length > 0 && (
              <p className="text-sm text-[#445064] mt-2">
                {bookings.length}{" "}
                {bookings.length === 1 ? "booking" : "bookings"} in your
                account
              </p>
            )}
          </div>

          <button
            onClick={fetchBookings}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-2 bg-white border border-[#0F1B2B]/20 px-4 py-2.5 text-sm font-semibold hover:bg-[#F7F7F7] transition-colors disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* ERROR */}
        {error ? (
          <div className="bg-white border border-red-200 p-10 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <X size={22} className="text-red-600" />
            </div>

            <p className="font-display text-2xl font-700 mb-2">
              Kuch masla ho gaya
            </p>

            <p className="text-sm text-[#445064] mb-5">
              {error}
            </p>

            <button
              onClick={fetchBookings}
              className="inline-flex items-center gap-2 text-sm font-semibold bg-[#0F1B2B] text-white px-5 py-2.5 hover:bg-[#1a2c44] transition-colors"
            >
              <RefreshCw size={14} />
              Dobara try karein
            </button>
          </div>
        ) : bookings.length === 0 ? (
          /* EMPTY STATE */
          <div className="bg-white border border-[#0F1B2B]/10 p-10 sm:p-14 text-center">
            <div className="w-16 h-16 bg-[#EDEEF0] flex items-center justify-center mx-auto mb-5">
              <CarFront size={28} className="text-[#445064]" />
            </div>

            <p className="font-display text-3xl font-700 mb-2">
              Abhi tak koi booking nahi
            </p>

            <p className="text-sm text-[#445064] mb-6 max-w-md mx-auto">
              Fleet browse karein aur apni pehli car booking karein.
            </p>

            <button
              onClick={() => navigate("/fleet")}
              className="bg-[#FFC93C] text-[#0F1B2B] font-display font-700 text-lg px-7 py-3 hover:bg-[#f5bd28] transition-colors"
            >
              Browse cars
            </button>
          </div>
        ) : (
          /* BOOKINGS */
          <div className="flex flex-col gap-5">
            {bookings.map((booking) => {
              const car = booking.car;

              return (
                <div
                  key={booking.id}
                  className="bg-white border border-[#0F1B2B]/10 overflow-hidden hover:shadow-[5px_5px_0_#0F1B2B] transition-shadow"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* CAR IMAGE */}
                    <div className="relative w-full md:w-52 lg:w-60 h-48 md:h-auto md:min-h-[190px] shrink-0 bg-[#0F1B2B]">
                      <img
                        src={car?.images?.[0] || PLACEHOLDER_IMG}
                        alt={car?.name || "Car"}
                        className="w-full h-full object-cover"
                      />

                      {car?.type && (
                        <span className="absolute top-3 left-3 bg-[#0F1B2B] text-white text-[11px] font-semibold px-2.5 py-1">
                          {car.type}
                        </span>
                      )}
                    </div>

                    {/* BOOKING CONTENT */}
                    <div className="flex-1 p-5 md:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                        {/* LEFT */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2.5 mb-3">
                            <h3 className="font-display text-2xl font-700 leading-none">
                              {car?.name || "Car"}
                            </h3>

                            <span
                              className={`text-[11px] font-semibold px-2.5 py-1 ${
                                statusColor[booking.status] ||
                                "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {statusLabel[booking.status] ||
                                booking.status}
                            </span>
                          </div>

                          {/* DATES */}
                          <div className="flex items-start gap-2 text-sm text-[#445064] mb-2">
                            <Calendar
                              size={15}
                              className="mt-0.5 shrink-0"
                            />

                            <div>
                              <p className="font-medium text-[#0F1B2B]">
                                {booking.pickupDate}
                              </p>

                              <p className="text-xs">
                                to {booking.dropoffDate}
                              </p>
                            </div>
                          </div>

                          {/* CITY */}
                          {car?.city && (
                            <p className="flex items-center gap-2 text-xs text-[#445064] mb-2">
                              <MapPin size={14} />
                              {car.city}
                            </p>
                          )}

                          {/* INSURANCE */}
                          {booking.addInsurance && (
                            <p className="flex items-center gap-2 text-xs text-[#445064]">
                              <ShieldCheck size={14} />
                              Full insurance included
                            </p>
                          )}

                          {/* DRIVER */}
                          {booking.addDriver && (
                            <p className="flex items-center gap-2 text-xs text-[#445064] mt-2">
                              <User size={14} />
                              Driver included
                            </p>
                          )}
                        </div>

                        {/* RIGHT */}
                        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#0F1B2B]/10">
                          <div className="text-left lg:text-right">
                            <p className="text-[11px] font-semibold text-[#445064] uppercase tracking-wide mb-1">
                              Total
                            </p>

                            <span className="font-display text-2xl sm:text-3xl font-800">
                              Rs{" "}
                              {Number(
                                booking.totalAmount || 0
                              ).toLocaleString()}
                            </span>
                          </div>

                          {(booking.status === "Pending" ||
                            booking.status === "Active") && (
                            <button
                              onClick={() =>
                                handleCancel(booking.id)
                              }
                              disabled={
                                cancellingId === booking.id
                              }
                              className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2.5 transition-colors disabled:opacity-50"
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
                </div>
              );
            })}
          </div>
        )}

        {/* BOTTOM CTA */}
        {bookings.length > 0 && (
          <div className="mt-8 bg-[#0F1B2B] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <p className="font-display text-2xl font-700 mb-1">
                Need another car?
              </p>

              <p className="text-sm text-white/60">
                Browse our fleet and find your next ride.
              </p>
            </div>

            <button
              onClick={() => navigate("/fleet")}
              className="bg-[#FFC93C] text-[#0F1B2B] font-display font-700 text-lg px-6 py-3 hover:bg-[#f5bd28] transition-colors whitespace-nowrap"
            >
              Browse fleet
            </button>
          </div>
        )}
      </main>
    </div>
  );
}