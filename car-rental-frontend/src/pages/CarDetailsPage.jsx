import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Users, Fuel, Gauge, MapPin, ShieldCheck, Calendar, ChevronLeft, ChevronRight, Check } from "lucide-react";
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
  "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=1000&q=80";

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function fmt(d) {
  return d.toISOString().split("T")[0];
}

export default function CarDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({ driverFeePerDay: 1500, insuranceFeePerDay: 800, serviceFee: 500 });

  const [activeImg, setActiveImg] = useState(0);
  const today = new Date();
  const [pickDate, setPickDate] = useState(fmt(today));
  const [dropDate, setDropDate] = useState(fmt(addDays(today, 3)));
  const [addDriver, setAddDriver] = useState(false);
  const [addInsurance, setAddInsurance] = useState(true);

  const [bookingError, setBookingError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchCar();
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get("/settings");
      setSettings(data);
    } catch (err) {
      // Keep fallback defaults if this fails — booking still works,
      // the backend recalculates the real total from its own settings anyway.
    }
  };

  const fetchCar = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/cars/${id}`);
      setCar(data);
    } catch (err) {
      setError("Ye car nahi mili — ho sakta hai delete ho gayi ho ya link ghalat ho.");
    } finally {
      setLoading(false);
    }
  };

  const days = useMemo(() => {
    const p = new Date(pickDate);
    const d = new Date(dropDate);
    const diff = Math.round((d - p) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [pickDate, dropDate]);

  const pricePerDay = car ? Number(car.pricePerDay) : 0;
  const baseTotal = days * pricePerDay;
  const driverRate = Number(settings.driverFeePerDay);
  const insuranceRate = Number(settings.insuranceFeePerDay);
  const serviceFee = Number(settings.serviceFee);
  const driverFee = addDriver ? days * driverRate : 0;
  const insuranceFee = addInsurance ? days * insuranceRate : 0;
  const grandTotal = baseTotal + driverFee + insuranceFee + serviceFee;

  const handleConfirmBooking = async () => {
    setBookingError("");

    if (!user) {
      navigate("/auth");
      return;
    }
    if (days === 0) return;

    setBookingLoading(true);
    try {
      await api.post("/bookings", {
        carId: id,
        pickupDate: pickDate,
        dropoffDate: dropDate,
        addDriver,
        addInsurance,
      });
      setBookingSuccess(true);
    } catch (err) {
      const message =
        err.response?.data?.message || "Booking nahi ho saki, dobara try karein.";
      setBookingError(Array.isArray(message) ? message[0] : message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="font-body bg-[#EDEEF0] min-h-screen flex items-center justify-center">
        {fonts}
        <p className="font-display text-2xl font-700 text-[#0F1B2B]">Loading...</p>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="font-body bg-[#EDEEF0] min-h-screen flex flex-col items-center justify-center gap-4">
        {fonts}
        <p className="font-display text-3xl font-800 text-[#0F1B2B]">{error}</p>
        <button onClick={() => navigate("/fleet")} className="bg-[#0F1B2B] text-white text-sm font-semibold px-5 py-2.5">
          Back to fleet
        </button>
      </div>
    );
  }

  const images = car.images?.length ? car.images : [PLACEHOLDER_IMG];

  return (
    <div className="font-body bg-[#EDEEF0] text-[#0F1B2B] min-h-screen">
      {fonts}

      <nav className="flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto">
        <div className="font-display text-2xl md:text-3xl font-800 tracking-tight cursor-pointer" onClick={() => navigate("/")}>
          DRIVE<span className="text-[#FFC93C]">HUB</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#445064]">
          <a href="#" onClick={() => navigate("/fleet")} className="hover:text-[#0F1B2B] transition-colors cursor-pointer">Fleet</a>
        </div>
        <button
          onClick={() => {
            if (!user) navigate("/auth");
            else navigate(user.role === "admin" ? "/admin" : "/my-bookings");
          }}
          className="bg-[#0F1B2B] text-white text-sm font-semibold px-5 py-2.5 hover:bg-[#1a2c44] transition-colors"
        >
          {user ? user.fullName.split(" ")[0] : "Sign in"}
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-20 pt-2">
        <p className="text-xs font-semibold text-[#445064] mb-6">
          Fleet <span className="mx-1">/</span> {car.type} <span className="mx-1">/</span> <span className="text-[#0F1B2B]">{car.name}</span>
        </p>

        <div className="grid lg:grid-cols-[1fr_380px] gap-10">
          <div>
            <div className="relative aspect-[16/10] sm:aspect-[16/9] bg-[#0F1B2B] mb-3 overflow-hidden">
              <img src={images[activeImg]} alt={car.name} className="w-full h-full object-cover" />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg((activeImg - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setActiveImg((activeImg + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3 mb-8">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`aspect-[4/3] overflow-hidden border-2 ${activeImg === i ? "border-[#FFC93C]" : "border-transparent"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-start justify-between gap-4 mb-6 mt-6">
              <div>
                <span className="bg-[#0F1B2B] text-white text-[11px] font-semibold px-2.5 py-1 mb-3 inline-block">{car.type}</span>
                <h1 className="font-display text-4xl md:text-5xl font-800 leading-none mb-2">{car.name}</h1>
                <p className="flex items-center gap-1.5 text-sm text-[#445064]">
                  <MapPin size={14} /> Available in {car.city}
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-[#0F1B2B]/10 px-4 py-2.5">
                <Star size={16} fill="#FFC93C" className="text-[#FFC93C]" />
                <span className="font-display text-xl font-700">{Number(car.rating).toFixed(1)}</span>
                <span className="text-xs text-[#445064]">({car.reviewCount} reviews)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Users, label: "Seats", value: car.seats },
                { icon: Fuel, label: "Fuel", value: car.fuel },
                { icon: Gauge, label: "Transmission", value: car.transmission },
                { icon: Gauge, label: "Mileage", value: car.mileage || "N/A" },
              ].map((s, i) => (
                <div key={i} className="bg-white border border-[#0F1B2B]/10 p-4 flex flex-col gap-2">
                  <s.icon size={18} className="text-[#445064]" />
                  <p className="text-xs text-[#445064]">{s.label}</p>
                  <p className="font-display text-lg font-700">{s.value}</p>
                </div>
              ))}
            </div>

            {car.description && (
              <div className="mb-10">
                <h2 className="font-display text-2xl font-700 mb-3">About this car</h2>
                <p className="text-sm text-[#445064] leading-relaxed">{car.description}</p>
              </div>
            )}

            {car.features?.length > 0 && (
              <div className="mb-10">
                <h2 className="font-display text-2xl font-700 mb-4">What's included</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {car.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Check size={16} className="text-[#0F1B2B]" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: booking card */}
          <div className="lg:sticky lg:top-6 h-fit">
            <div className="bg-white border border-[#0F1B2B]/10 shadow-[6px_6px_0_#0F1B2B] p-6">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <span className="font-display text-3xl font-800">Rs {pricePerDay.toLocaleString()}</span>
                  <span className="text-sm text-[#445064]"> /day</span>
                </div>
              </div>

              {bookingSuccess ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-[#FFC93C] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={22} className="text-[#0F1B2B]" />
                  </div>
                  <p className="font-display text-2xl font-700 mb-1">Booking confirmed!</p>
                  <p className="text-sm text-[#445064] mb-5">
                    {pickDate} se {dropDate} tak — total Rs {grandTotal.toLocaleString()}
                  </p>
                  <button
                    onClick={() => navigate("/fleet")}
                    className="w-full bg-[#0F1B2B] text-white font-display font-700 text-lg py-3"
                  >
                    Browse more cars
                  </button>
                </div>
              ) : (
                <>
                  {!car.isAvailable && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 mb-4">
                      Ye car filhaal available nahi hai.
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-[#445064] mb-1.5">
                        <Calendar size={13} /> Pick-up
                      </label>
                      <input
                        type="date"
                        value={pickDate}
                        min={fmt(today)}
                        onChange={(e) => setPickDate(e.target.value)}
                        className="w-full border border-[#0F1B2B]/20 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC93C]"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-[#445064] mb-1.5">
                        <Calendar size={13} /> Drop-off
                      </label>
                      <input
                        type="date"
                        value={dropDate}
                        min={pickDate}
                        onChange={(e) => setDropDate(e.target.value)}
                        className="w-full border border-[#0F1B2B]/20 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC93C]"
                      />
                    </div>
                  </div>

                  {days === 0 ? (
                    <p className="text-xs text-red-600 font-medium mb-4">Drop-off date pick-up date se baad honi chahiye.</p>
                  ) : (
                    <p className="text-xs text-[#445064] mb-4">{days} {days === 1 ? "day" : "days"} rental</p>
                  )}

                  <div className="flex flex-col gap-3 mb-5 border-y border-[#0F1B2B]/10 py-4">
                    <label className="flex items-center justify-between text-sm cursor-pointer">
                      <span className="flex items-center gap-2">
                        <input type="checkbox" checked={addDriver} onChange={(e) => setAddDriver(e.target.checked)} className="accent-[#FFC93C] w-4 h-4" />
                        Add a driver
                      </span>
                      <span className="text-[#445064]">+Rs {driverRate.toLocaleString()}/day</span>
                    </label>
                    <label className="flex items-center justify-between text-sm cursor-pointer">
                      <span className="flex items-center gap-2">
                        <input type="checkbox" checked={addInsurance} onChange={(e) => setAddInsurance(e.target.checked)} className="accent-[#FFC93C] w-4 h-4" />
                        <ShieldCheck size={15} className="text-[#445064]" /> Full insurance
                      </span>
                      <span className="text-[#445064]">+Rs {insuranceRate.toLocaleString()}/day</span>
                    </label>
                  </div>

                  <div className="flex flex-col gap-2 mb-5 text-sm">
                    <div className="flex justify-between text-[#445064]">
                      <span>Rs {pricePerDay.toLocaleString()} × {days} days</span>
                      <span>Rs {baseTotal.toLocaleString()}</span>
                    </div>
                    {addDriver && (
                      <div className="flex justify-between text-[#445064]">
                        <span>Driver fee</span>
                        <span>Rs {driverFee.toLocaleString()}</span>
                      </div>
                    )}
                    {addInsurance && (
                      <div className="flex justify-between text-[#445064]">
                        <span>Insurance</span>
                        <span>Rs {insuranceFee.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#445064]">
                      <span>Service fee</span>
                      <span>Rs {serviceFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-display text-xl font-800 pt-2 border-t border-[#0F1B2B]/10">
                      <span>Total</span>
                      <span>Rs {grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  {bookingError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 mb-4">
                      {bookingError}
                    </div>
                  )}

                  <button
                    onClick={handleConfirmBooking}
                    disabled={days === 0 || bookingLoading || !car.isAvailable}
                    className="w-full bg-[#FFC93C] text-[#0F1B2B] font-display font-700 text-lg py-3.5 hover:bg-[#f5bd28] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {bookingLoading ? "Booking..." : user ? "Confirm booking" : "Sign in to book"}
                  </button>
                  <p className="text-[11px] text-[#445064] text-center mt-3">Free cancellation up to 24 hours before pick-up.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}