import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Gauge,
  MapPin,
  ShieldCheck,
  Star,
  Users,
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
  "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=1000&q=80";

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function fmt(date) {
  return date.toISOString().split("T")[0];
}

export default function CarDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [settings, setSettings] = useState({
    driverFeePerDay: 1500,
    insuranceFeePerDay: 800,
    serviceFee: 500,
  });

  const today = new Date();

  const [activeImg, setActiveImg] = useState(0);
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

      setSettings({
        driverFeePerDay:
          Number(data?.driverFeePerDay) || 1500,

        insuranceFeePerDay:
          Number(data?.insuranceFeePerDay) || 800,

        serviceFee:
          Number(data?.serviceFee) || 500,
      });
    } catch (err) {
      // Fallback settings remain active.
    }
  };

  const fetchCar = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get(`/cars/${id}`);

      setCar(data);
      setActiveImg(0);
    } catch (err) {
      setError(
        "Ye car nahi mili — ho sakta hai delete ho gayi ho ya link ghalat ho."
      );
    } finally {
      setLoading(false);
    }
  };

  const days = useMemo(() => {
    if (!pickDate || !dropDate) return 0;

    const pickup = new Date(`${pickDate}T00:00:00`);
    const dropoff = new Date(`${dropDate}T00:00:00`);

    const diff = Math.round(
      (dropoff - pickup) / (1000 * 60 * 60 * 24)
    );

    return diff > 0 ? diff : 0;
  }, [pickDate, dropDate]);

  const pricePerDay = car ? Number(car.pricePerDay) || 0 : 0;

  const driverRate = Number(settings.driverFeePerDay) || 0;
  const insuranceRate = Number(settings.insuranceFeePerDay) || 0;
  const serviceFee = Number(settings.serviceFee) || 0;

  const baseTotal = days * pricePerDay;
  const driverFee = addDriver ? days * driverRate : 0;
  const insuranceFee = addInsurance ? days * insuranceRate : 0;

  const grandTotal =
    baseTotal + driverFee + insuranceFee + serviceFee;

  const images =
    car?.images?.length > 0
      ? car.images
      : [PLACEHOLDER_IMG];

  const handlePreviousImage = () => {
    setActiveImg(
      (current) =>
        (current - 1 + images.length) % images.length
    );
  };

  const handleNextImage = () => {
    setActiveImg(
      (current) => (current + 1) % images.length
    );
  };

  const handleConfirmBooking = async () => {
    setBookingError("");

    if (!user) {
      navigate("/auth");
      return;
    }

    if (days === 0) {
      setBookingError(
        "Drop-off date pick-up date se baad honi chahiye."
      );
      return;
    }

    if (!car?.isAvailable) {
      setBookingError("Ye car filhaal available nahi hai.");
      return;
    }

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
        err?.response?.data?.message ||
        "Booking nahi ho saki, dobara try karein.";

      setBookingError(
        Array.isArray(message) ? message[0] : message
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const handleAccountClick = () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    navigate(
      user.role === "admin"
        ? "/admin"
        : "/my-bookings"
    );
  };

  if (loading) {
    return (
      <div className="font-body bg-[#EDEEF0] min-h-screen flex items-center justify-center px-6">
        {fonts}

        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0F1B2B]/15 border-t-[#FFC93C] rounded-full animate-spin mx-auto mb-4" />

          <p className="font-display text-2xl font-700 text-[#0F1B2B]">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="font-body bg-[#EDEEF0] min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center">
        {fonts}

        <p className="font-display text-3xl md:text-4xl font-800 text-[#0F1B2B]">
          {error || "Car not found"}
        </p>

        <button
          type="button"
          onClick={() => navigate("/fleet")}
          className="bg-[#0F1B2B] text-white text-sm font-semibold px-6 py-3 hover:bg-[#1a2c44] transition-colors"
        >
          Back to fleet
        </button>
      </div>
    );
  }

  return (
    <div className="font-body bg-[#EDEEF0] text-[#0F1B2B] min-h-screen">
      {fonts}

      {/* NAVBAR */}
      <nav className="border-b border-[#0F1B2B]/10 bg-[#EDEEF0]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 py-4 sm:py-5 flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="font-display text-2xl sm:text-3xl font-800 tracking-tight shrink-0"
          >
            DRIVE
            <span className="text-[#FFC93C]">HUB</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#445064]">
            <button
              type="button"
              onClick={() => navigate("/fleet")}
              className="hover:text-[#0F1B2B] transition-colors"
            >
              Fleet
            </button>
          </div>

          {/* Account */}
          <button
            type="button"
            onClick={handleAccountClick}
            className="bg-[#0F1B2B] text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 hover:bg-[#1a2c44] transition-colors whitespace-nowrap"
          >
            {user
              ? user.fullName?.split(" ")[0] || "Account"
              : "Sign in"}
          </button>
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 pt-5 sm:pt-7 pb-16 sm:pb-20">
        {/* Breadcrumb */}
        <div className="mb-5 sm:mb-7 overflow-hidden">
          <p className="text-[11px] sm:text-xs font-semibold text-[#445064] truncate">
            <button
              type="button"
              onClick={() => navigate("/fleet")}
              className="hover:text-[#0F1B2B]"
            >
              Fleet
            </button>

            <span className="mx-1.5">/</span>

            <span>{car.type}</span>

            <span className="mx-1.5">/</span>

            <span className="text-[#0F1B2B]">
              {car.name}
            </span>
          </p>
        </div>

        {/* PAGE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_400px] gap-8 lg:gap-10 xl:gap-12">
          {/* LEFT CONTENT */}
          <section className="min-w-0">
            {/* IMAGE */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] bg-[#0F1B2B] overflow-hidden">
              <img
                src={images[activeImg]}
                alt={car.name}
                className="w-full h-full object-cover"
              />

              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute top-3 right-3 bg-[#0F1B2B]/80 text-white text-[11px] font-semibold px-3 py-1.5 backdrop-blur-sm">
                  {activeImg + 1} / {images.length}
                </div>
              )}

              {/* Previous */}
              {images.length > 1 && (
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={handlePreviousImage}
                  className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
                >
                  <ChevronLeft size={19} />
                </button>
              )}

              {/* Next */}
              {images.length > 1 && (
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={handleNextImage}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
                >
                  <ChevronRight size={19} />
                </button>
              )}
            </div>

            {/* THUMBNAILS */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3 mt-3">
                {images.map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    onClick={() => setActiveImg(index)}
                    aria-label={`View image ${index + 1}`}
                    className={`aspect-[4/3] overflow-hidden border-2 transition-colors ${
                      activeImg === index
                        ? "border-[#FFC93C]"
                        : "border-transparent hover:border-[#0F1B2B]/20"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* CAR TITLE */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mt-7 sm:mt-8 mb-7">
              <div className="min-w-0">
                <span className="bg-[#0F1B2B] text-white text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 mb-3 inline-block uppercase tracking-wide">
                  {car.type}
                </span>

                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-800 leading-[0.9] mb-3 break-words">
                  {car.name}
                </h1>

                <p className="flex items-center gap-1.5 text-xs sm:text-sm text-[#445064]">
                  <MapPin size={14} />
                  <span>
                    Available in {car.city}
                  </span>
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1.5 bg-white border border-[#0F1B2B]/10 px-3.5 sm:px-4 py-2.5 self-start shrink-0">
                <Star
                  size={16}
                  fill="#FFC93C"
                  className="text-[#FFC93C]"
                />

                <span className="font-display text-xl font-700">
                  {Number(car.rating || 0).toFixed(1)}
                </span>

                <span className="text-[11px] sm:text-xs text-[#445064]">
                  ({car.reviewCount || 0} reviews)
                </span>
              </div>
            </div>

            {/* SPECS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
              {[
                {
                  icon: Users,
                  label: "Seats",
                  value: car.seats || "N/A",
                },
                {
                  icon: Fuel,
                  label: "Fuel",
                  value: car.fuel || "N/A",
                },
                {
                  icon: Gauge,
                  label: "Transmission",
                  value: car.transmission || "N/A",
                },
                {
                  icon: Gauge,
                  label: "Mileage",
                  value: car.mileage || "N/A",
                },
              ].map((spec, index) => {
                const Icon = spec.icon;

                return (
                  <div
                    key={index}
                    className="bg-white border border-[#0F1B2B]/10 p-3.5 sm:p-4 flex flex-col gap-2 min-w-0"
                  >
                    <Icon
                      size={18}
                      className="text-[#445064]"
                    />

                    <p className="text-[11px] sm:text-xs text-[#445064]">
                      {spec.label}
                    </p>

                    <p className="font-display text-base sm:text-lg font-700 truncate">
                      {spec.value}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* DESCRIPTION */}
            {car.description && (
              <div className="mb-9 sm:mb-10">
                <h2 className="font-display text-2xl sm:text-3xl font-700 mb-3">
                  About this car
                </h2>

                <p className="text-xs sm:text-sm text-[#445064] leading-7">
                  {car.description}
                </p>
              </div>
            )}

            {/* FEATURES */}
            {car.features?.length > 0 && (
              <div className="mb-9 sm:mb-10">
                <h2 className="font-display text-2xl sm:text-3xl font-700 mb-4">
                  What's included
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {car.features.map((feature, index) => (
                    <div
                      key={`${feature}-${index}`}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-[#0F1B2B]"
                    >
                      <span className="w-5 h-5 bg-[#FFC93C] rounded-full flex items-center justify-center shrink-0 mt-[-1px]">
                        <Check size={13} />
                      </span>

                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* BOOKING CARD */}
          <aside className="lg:sticky lg:top-5 h-fit">
            <div className="bg-white border border-[#0F1B2B]/10 shadow-[5px_5px_0_#0F1B2B] sm:shadow-[7px_7px_0_#0F1B2B] p-4 sm:p-6">
              {/* Price */}
              <div className="flex items-end justify-between gap-3 mb-5">
                <div>
                  <span className="font-display text-3xl sm:text-4xl font-800">
                    Rs {pricePerDay.toLocaleString()}
                  </span>

                  <span className="text-xs sm:text-sm text-[#445064]">
                    {" "}
                    /day
                  </span>
                </div>
              </div>

              {/* SUCCESS */}
              {bookingSuccess ? (
                <div className="text-center py-7 sm:py-8">
                  <div className="w-12 h-12 bg-[#FFC93C] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check
                      size={22}
                      className="text-[#0F1B2B]"
                    />
                  </div>

                  <p className="font-display text-2xl sm:text-3xl font-700 mb-2">
                    Booking confirmed!
                  </p>

                  <p className="text-xs sm:text-sm text-[#445064] mb-6 leading-6">
                    {pickDate} se {dropDate} tak
                    <br />
                    Total Rs {grandTotal.toLocaleString()}
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/fleet")}
                    className="w-full bg-[#0F1B2B] text-white font-display font-700 text-lg py-3.5 hover:bg-[#1a2c44] transition-colors"
                  >
                    Browse more cars
                  </button>
                </div>
              ) : (
                <>
                  {/* Availability */}
                  {!car.isAvailable && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 mb-4">
                      Ye car filhaal available nahi hai.
                    </div>
                  )}

                  {/* DATE PICKERS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-[#445064] mb-1.5">
                        <Calendar size={13} />
                        Pick-up
                      </label>

                      <input
                        type="date"
                        value={pickDate}
                        min={fmt(today)}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPickDate(value);

                          if (
                            dropDate &&
                            value >= dropDate
                          ) {
                            setDropDate(
                              fmt(addDays(new Date(`${value}T00:00:00`), 1))
                            );
                          }
                        }}
                        className="w-full min-w-0 border border-[#0F1B2B]/20 px-2.5 py-2.5 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFC93C]"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-[#445064] mb-1.5">
                        <Calendar size={13} />
                        Drop-off
                      </label>

                      <input
                        type="date"
                        value={dropDate}
                        min={pickDate}
                        onChange={(e) =>
                          setDropDate(e.target.value)
                        }
                        className="w-full min-w-0 border border-[#0F1B2B]/20 px-2.5 py-2.5 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFC93C]"
                      />
                    </div>
                  </div>

                  {/* DAYS */}
                  {days === 0 ? (
                    <p className="text-xs text-red-600 font-medium mb-4">
                      Drop-off date pick-up date se baad
                      honi chahiye.
                    </p>
                  ) : (
                    <p className="text-xs text-[#445064] mb-4">
                      {days}{" "}
                      {days === 1 ? "day" : "days"} rental
                    </p>
                  )}

                  {/* ADDONS */}
                  <div className="flex flex-col gap-3 mb-5 border-y border-[#0F1B2B]/10 py-4">
                    <label className="flex items-center justify-between gap-3 text-xs sm:text-sm cursor-pointer">
                      <span className="flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={addDriver}
                          onChange={(e) =>
                            setAddDriver(
                              e.target.checked
                            )
                          }
                          className="accent-[#FFC93C] w-4 h-4 shrink-0"
                        />

                        <span>Add a driver</span>
                      </span>

                      <span className="text-[#445064] whitespace-nowrap">
                        +Rs{" "}
                        {driverRate.toLocaleString()}
                        /day
                      </span>
                    </label>

                    <label className="flex items-center justify-between gap-3 text-xs sm:text-sm cursor-pointer">
                      <span className="flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={addInsurance}
                          onChange={(e) =>
                            setAddInsurance(
                              e.target.checked
                            )
                          }
                          className="accent-[#FFC93C] w-4 h-4 shrink-0"
                        />

                        <ShieldCheck
                          size={15}
                          className="text-[#445064] shrink-0"
                        />

                        <span>Full insurance</span>
                      </span>

                      <span className="text-[#445064] whitespace-nowrap">
                        +Rs{" "}
                        {insuranceRate.toLocaleString()}
                        /day
                      </span>
                    </label>
                  </div>

                  {/* PRICE BREAKDOWN */}
                  <div className="flex flex-col gap-2.5 mb-5 text-xs sm:text-sm">
                    <div className="flex justify-between gap-4 text-[#445064]">
                      <span>
                        Rs {pricePerDay.toLocaleString()} ×{" "}
                        {days} days
                      </span>

                      <span className="whitespace-nowrap">
                        Rs {baseTotal.toLocaleString()}
                      </span>
                    </div>

                    {addDriver && (
                      <div className="flex justify-between gap-4 text-[#445064]">
                        <span>Driver fee</span>

                        <span className="whitespace-nowrap">
                          Rs {driverFee.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {addInsurance && (
                      <div className="flex justify-between gap-4 text-[#445064]">
                        <span>Insurance</span>

                        <span className="whitespace-nowrap">
                          Rs{" "}
                          {insuranceFee.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between gap-4 text-[#445064]">
                      <span>Service fee</span>

                      <span className="whitespace-nowrap">
                        Rs {serviceFee.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4 font-display text-xl sm:text-2xl font-800 pt-3 mt-1 border-t border-[#0F1B2B]/10">
                      <span>Total</span>

                      <span className="whitespace-nowrap">
                        Rs {grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* ERROR */}
                  {bookingError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 mb-4 leading-5">
                      {bookingError}
                    </div>
                  )}

                  {/* BOOK BUTTON */}
                  <button
                    type="button"
                    onClick={handleConfirmBooking}
                    disabled={
                      days === 0 ||
                      bookingLoading ||
                      !car.isAvailable
                    }
                    className="w-full bg-[#FFC93C] text-[#0F1B2B] font-display font-700 text-lg py-3.5 hover:bg-[#f5bd28] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {bookingLoading
                      ? "Booking..."
                      : user
                      ? "Confirm booking"
                      : "Sign in to book"}
                  </button>

                  <p className="text-[10px] sm:text-[11px] text-[#445064] text-center mt-3 leading-5">
                    Free cancellation up to 24 hours
                    before pick-up.
                  </p>
                </>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}