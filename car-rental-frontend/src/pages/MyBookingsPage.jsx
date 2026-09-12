import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, ShieldCheck, X } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const fonts = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    .font-display { font-family: 'Big Shoulders Display', sans-serif; }
    .font-body { font-family: 'Inter', sans-serif; }
  `}</style>
);

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=400&q=80";

const statusColor = {
  Pending: "bg-[#FFC93C]/20 text-[#0F1B2B]",
  Active: "bg-[#FFC93C]/20 text-[#0F1B2B]",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
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
    if (user) fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/bookings/my");
      setBookings(data);
    } catch (err) {
      setError("Bookings load nahi ho sakin.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Kya aap ye booking cancel karna chahte hain?")) return;
    setCancellingId(id);
    try {
      await api.patch(`/bookings/${id}/cancel`);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "Cancelled" } : b))
      );
    } catch (err) {
      alert("Cancel nahi ho saka, dobara try karein.");
    } finally {
      setCancellingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="font-body bg-[#EDEEF0] min-h-screen flex items-center justify-center">
        {fonts}
        <p className="font-display text-2xl font-700 text-[#0F1B2B]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="font-body bg-[#EDEEF0] text-[#0F1B2B] min-h-screen">
      {fonts}

      <nav className="flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto">
        <div
          className="font-display text-2xl md:text-3xl font-800 tracking-tight cursor-pointer"
          onClick={() => navigate("/")}
        >
          DRIVE<span className="text-[#FFC93C]">HUB</span>
        </div>
        <button
          onClick={() => navigate("/fleet")}
          className="text-sm font-semibold text-[#445064] hover:text-[#0F1B2B] transition-colors"
        >
          Browse fleet
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 md:px-12 pb-20 pt-2">
        <h1 className="font-display text-4xl md:text-5xl font-800 mb-8">My bookings</h1>

        {error ? (
          <div className="bg-white border border-[#0F1B2B]/10 p-10 text-center">
            <p className="text-sm text-[#445064] mb-4">{error}</p>
            <button onClick={fetchBookings} className="text-sm font-semibold bg-[#0F1B2B] text-white px-5 py-2.5">
              Dobara try karein
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white border border-[#0F1B2B]/10 p-12 text-center">
            <p className="font-display text-2xl font-700 mb-2">Abhi tak koi booking nahi</p>
            <p className="text-sm text-[#445064] mb-5">Fleet browse karein aur apni pehli booking karein.</p>
            <button
              onClick={() => navigate("/fleet")}
              className="bg-[#FFC93C] text-[#0F1B2B] font-display font-700 text-lg px-6 py-3"
            >
              Browse cars
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white border border-[#0F1B2B]/10 p-5 flex flex-col sm:flex-row gap-5">
                <img
                  src={b.car?.images?.[0] || PLACEHOLDER_IMG}
                  alt={b.car?.name}
                  className="w-full sm:w-40 h-32 object-cover shrink-0"
                />
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-display text-xl font-700">{b.car?.name || "Car"}</h3>
                      <span className={`text-xs font-semibold px-2.5 py-1 ${statusColor[b.status]}`}>
                        {b.status}
                      </span>
                    </div>
                    <p className="flex items-center gap-1.5 text-xs text-[#445064] mb-1">
                      <Calendar size={13} /> {b.pickupDate} → {b.dropoffDate}
                    </p>
                    {b.car?.city && (
                      <p className="flex items-center gap-1.5 text-xs text-[#445064] mb-1">
                        <MapPin size={13} /> {b.car.city}
                      </p>
                    )}
                    {b.addInsurance && (
                      <p className="flex items-center gap-1.5 text-xs text-[#445064]">
                        <ShieldCheck size={13} /> Insurance included
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-3">
                    <span className="font-display text-2xl font-800">
                      Rs {Number(b.totalAmount).toLocaleString()}
                    </span>
                    {(b.status === "Pending" || b.status === "Active") && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        disabled={cancellingId === b.id}
                        className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 disabled:opacity-50"
                      >
                        <X size={13} /> {cancellingId === b.id ? "Cancelling..." : "Cancel booking"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}