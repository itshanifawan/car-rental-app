import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Fuel,
  Gauge,
  Globe2,
  MapPin,
  Menu,
  MoveUpRight,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  X,
  Zap,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=2000&q=90";

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=1200&q=85";

const locations = [
  {
    city: "Islamabad",
    label: "Capital City",
    image:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=900&q=85",
  },
  {
    city: "Lahore",
    label: "Cultural Capital",
    image:
      "https://images.unsplash.com/photo-1595406917862-2c9a5f9f8f5b?w=900&q=85",
  },
  {
    city: "Karachi",
    label: "The City of Lights",
    image:
      "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=900&q=85",
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Verified vehicles",
    text: "Every vehicle is inspected and prepared before every rental.",
  },
  {
    icon: Zap,
    title: "Easy booking",
    text: "Search, select and reserve your vehicle without unnecessary steps.",
  },
  {
    icon: Clock3,
    title: "Flexible rentals",
    text: "Plans change. Our rental experience is built to stay flexible.",
  },
  {
    icon: Sparkles,
    title: "Premium experience",
    text: "From economy cars to premium vehicles, choose what fits your journey.",
  },
];

const steps = [
  {
    number: "01",
    title: "Search",
    text: "Choose your pickup location and rental dates.",
  },
  {
    number: "02",
    title: "Choose",
    text: "Explore the fleet and select the vehicle that suits you.",
  },
  {
    number: "03",
    title: "Reserve",
    text: "Confirm your booking and receive your reservation details.",
  },
  {
    number: "04",
    title: "Drive",
    text: "Pick up your vehicle and enjoy the journey.",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [pickup, setPickup] = useState("Islamabad");
  const [pickDate, setPickDate] = useState("");
  const [dropDate, setDropDate] = useState("");

  const [featuredCars, setFeaturedCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(true);

  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    fetchFeaturedCars();
  }, []);

  const fetchFeaturedCars = async () => {
    try {
      const { data } = await api.get("/cars", {
        params: {
          limit: 4,
        },
      });

      setFeaturedCars(data?.data || []);
    } catch (error) {
      console.error("Failed to fetch cars:", error);
      setFeaturedCars([]);
    } finally {
      setLoadingCars(false);
    }
  };

  const handleSearch = () => {
    navigate("/fleet", {
      state: {
        city: pickup,
        pickDate,
        dropDate,
      },
    });
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });

    setMobileMenu(false);
  };

  return (
    <div className="min-h-screen bg-[#f3f3f0] text-[#111518] overflow-x-hidden">

      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <header className="absolute top-0 left-0 right-0 z-[100]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">

          <nav className="h-[82px] flex items-center justify-between border-b border-white/15">

            {/* Logo */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center tracking-[-0.07em]"
            >
              <span className="text-2xl sm:text-[28px] font-black text-white">
                DRIVE
              </span>

              <span className="text-2xl sm:text-[28px] font-black text-[#f5c542]">
                HUB
              </span>
            </button>

            {/* Desktop navigation */}
            <div className="hidden lg:flex items-center gap-10 text-[13px] font-semibold text-white/70">

              <button
                onClick={() => navigate("/")}
                className="text-white hover:text-[#f5c542] transition-colors"
              >
                Home
              </button>

              <button
                onClick={() => navigate("/fleet")}
                className="hover:text-white transition-colors"
              >
                Our Fleet
              </button>

              <button
                onClick={() => scrollTo("why-us")}
                className="hover:text-white transition-colors"
              >
                Why DriveHub
              </button>

              <button
                onClick={() => scrollTo("how-it-works")}
                className="hover:text-white transition-colors"
              >
                How It Works
              </button>

              <button
                onClick={() => scrollTo("locations")}
                className="hover:text-white transition-colors"
              >
                Locations
              </button>
            </div>

            {/* Desktop actions */}
            <div className="hidden lg:flex items-center gap-3">

              {user ? (
                <>
                  <button
                    onClick={() =>
                      navigate(
                        user.role === "admin"
                          ? "/admin"
                          : "/my-bookings"
                      )
                    }
                    className="text-sm font-semibold text-white/80 hover:text-white px-4 py-3"
                  >
                    {user.role === "admin"
                      ? "Dashboard"
                      : "My Bookings"}
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="bg-white text-[#111518] px-5 py-3 text-sm font-bold hover:bg-[#f5c542] transition-colors"
                  >
                    {user.fullName?.split(" ")[0] || "Account"} · Sign out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/auth")}
                    className="text-sm font-semibold text-white/80 hover:text-white px-4 py-3"
                  >
                    Sign in
                  </button>

                  <button
                    onClick={() => navigate("/auth")}
                    className="bg-[#f5c542] text-[#111518] px-5 py-3 text-sm font-bold hover:bg-[#ffd96c] transition-colors"
                  >
                    Get Started
                  </button>
                </>
              )}

            </div>

            {/* Mobile button */}
            <button
              onClick={() => setMobileMenu((prev) => !prev)}
              className="lg:hidden text-white p-2"
            >
              {mobileMenu ? <X size={25} /> : <Menu size={25} />}
            </button>

          </nav>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="lg:hidden bg-[#101417]/95 backdrop-blur-2xl border-b border-white/10">

            <div className="max-w-[1440px] mx-auto px-6 py-7 flex flex-col gap-5">

              <button
                onClick={() => {
                  navigate("/");
                  setMobileMenu(false);
                }}
                className="text-left text-white font-semibold"
              >
                Home
              </button>

              <button
                onClick={() => navigate("/fleet")}
                className="text-left text-white/70"
              >
                Our Fleet
              </button>

              <button
                onClick={() => scrollTo("why-us")}
                className="text-left text-white/70"
              >
                Why DriveHub
              </button>

              <button
                onClick={() => scrollTo("how-it-works")}
                className="text-left text-white/70"
              >
                How It Works
              </button>

              <button
                onClick={() => scrollTo("locations")}
                className="text-left text-white/70"
              >
                Locations
              </button>

              <div className="h-px bg-white/10 my-1" />

              {user ? (
                <>
                  <button
                    onClick={() =>
                      navigate(
                        user.role === "admin"
                          ? "/admin"
                          : "/my-bookings"
                      )
                    }
                    className="text-left text-white"
                  >
                    {user.role === "admin"
                      ? "Dashboard"
                      : "My Bookings"}
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="text-left text-[#f5c542]"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate("/auth")}
                  className="text-left text-[#f5c542]"
                >
                  Sign in
                </button>
              )}

            </div>
          </div>
        )}
      </header>

      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="relative min-h-[850px] lg:min-h-[900px] overflow-hidden flex items-center">

        {/* Image */}
        <div className="absolute inset-0">

          <img
            src={HERO_IMAGE}
            alt="Premium vehicle"
            className="w-full h-full object-cover object-center scale-105 animate-slowZoom"
          />

          <div className="absolute inset-0 bg-black/45" />

          <div className="absolute inset-0 bg-gradient-to-r from-[#070a0d]/95 via-[#070a0d]/65 to-[#070a0d]/10" />

          <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#f3f3f0] to-transparent" />

        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-[1440px] mx-auto w-full px-5 sm:px-8 lg:px-12 pt-28 pb-80">

          <div className="max-w-[800px]">

            <div className="flex items-center gap-3 mb-7 animate-fadeUp">

              <span className="w-12 h-[2px] bg-[#f5c542]" />

              <span className="text-[#f5c542] text-[11px] sm:text-xs font-black uppercase tracking-[0.24em]">
                Premium Car Rental
              </span>

            </div>

            <h1 className="text-white font-black uppercase tracking-[-0.065em] leading-[0.84] text-[58px] sm:text-[76px] md:text-[92px] lg:text-[112px] animate-fadeUp">

              Move
              <br />

              <span className="text-white">
                Your Way.
              </span>

              <br />

              <span className="text-[#f5c542]">
                Anywhere.
              </span>

            </h1>

            <p className="mt-8 text-white/70 text-base sm:text-lg leading-7 max-w-[570px] animate-fadeUp animation-delay-100">
              Premium and reliable vehicles for business trips,
              weekend escapes, family journeys and everything
              between. Your journey starts with the right car.
            </p>

            {/* Stats */}
            <div className="mt-9 flex flex-wrap items-center gap-6 sm:gap-9 animate-fadeUp animation-delay-200">

              <div>
                <div className="flex items-center gap-1">
                  <span className="text-white text-2xl font-black">
                    4.9
                  </span>

                  <Star
                    size={15}
                    fill="#f5c542"
                    className="text-[#f5c542]"
                  />
                </div>

                <p className="text-[11px] text-white/45 mt-1">
                  Customer rating
                </p>
              </div>

              <div className="w-px h-9 bg-white/15" />

              <div>
                <span className="text-white text-2xl font-black">
                  4,200+
                </span>

                <p className="text-[11px] text-white/45 mt-1">
                  Completed trips
                </p>
              </div>

              <div className="w-px h-9 bg-white/15 hidden sm:block" />

              <div>
                <span className="text-white text-2xl font-black">
                  12+
                </span>

                <p className="text-[11px] text-white/45 mt-1">
                  Cities
                </p>
              </div>

            </div>

          </div>
        </div>

        {/* =====================================================
            BOOKING PANEL
        ===================================================== */}

        <div className="absolute bottom-0 left-0 right-0 z-30">

          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">

            <div className="bg-white shadow-[0_25px_80px_rgba(0,0,0,0.20)]">

              {/* Header */}
              <div className="px-5 sm:px-7 lg:px-9 py-5 border-b border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] font-black text-[#969ba0]">
                    Find your vehicle
                  </div>

                  <div className="text-xl sm:text-2xl font-black uppercase tracking-[-0.035em] mt-1">
                    Start your journey
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#7e858b]">
                  <ShieldCheck size={15} />
                  Secure & reliable booking
                </div>

              </div>

              {/* Form */}
              <div className="p-5 sm:p-7 lg:p-9">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_175px] gap-4">

                  {/* Location */}
                  <div>
                    <label className="block mb-2 text-[10px] uppercase tracking-[0.15em] font-black text-[#7d8489]">
                      Pickup location
                    </label>

                    <div className="relative">

                      <MapPin
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a8085]"
                      />

                      <select
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        className="w-full h-[56px] bg-[#f5f5f3] border border-black/10 appearance-none pl-11 pr-10 text-sm font-bold outline-none focus:border-[#f5c542] transition-colors"
                      >
                        <option>Islamabad</option>
                        <option>Lahore</option>
                        <option>Karachi</option>
                        <option>Rawalpindi</option>
                      </select>

                      <ChevronDown
                        size={17}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#777] pointer-events-none"
                      />

                    </div>
                  </div>

                  {/* Pickup */}
                  <div>
                    <label className="block mb-2 text-[10px] uppercase tracking-[0.15em] font-black text-[#7d8489]">
                      Pick-up date
                    </label>

                    <div className="relative">

                      <CalendarDays
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a8085]"
                      />

                      <input
                        type="date"
                        value={pickDate}
                        onChange={(e) => setPickDate(e.target.value)}
                        className="w-full h-[56px] bg-[#f5f5f3] border border-black/10 pl-11 pr-4 text-sm font-bold outline-none focus:border-[#f5c542] transition-colors"
                      />

                    </div>
                  </div>

                  {/* Return */}
                  <div>
                    <label className="block mb-2 text-[10px] uppercase tracking-[0.15em] font-black text-[#7d8489]">
                      Return date
                    </label>

                    <div className="relative">

                      <CalendarDays
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a8085]"
                      />

                      <input
                        type="date"
                        value={dropDate}
                        onChange={(e) => setDropDate(e.target.value)}
                        className="w-full h-[56px] bg-[#f5f5f3] border border-black/10 pl-11 pr-4 text-sm font-bold outline-none focus:border-[#f5c542] transition-colors"
                      />

                    </div>
                  </div>

                  {/* Search */}
                  <div className="flex items-end">

                    <button
                      onClick={handleSearch}
                      className="group w-full h-[56px] bg-[#f5c542] flex items-center justify-center gap-2 text-[#111518] text-sm font-black uppercase tracking-wide hover:bg-[#ffd86b] transition-all"
                    >
                      <Search size={18} />

                      Search Cars

                      <ArrowRight
                        size={17}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </button>

                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>

      </section>

      {/* =========================================================
          TRUST BAR
      ========================================================= */}

      <section className="bg-white border-b border-black/10">

        <div className="max-w-[1240px] mx-auto">

          <div className="grid grid-cols-2 md:grid-cols-4">

            {[
              ["4,200+", "Trips completed"],
              ["12+", "Cities available"],
              ["4.9/5", "Average rating"],
              ["24/7", "Booking availability"],
            ].map(([number, text], index) => (

              <div
                key={text}
                className={`px-5 sm:px-8 py-7 sm:py-8 ${
                  index !== 0
                    ? "border-l border-black/10"
                    : ""
                }`}
              >
                <div className="text-2xl sm:text-3xl font-black tracking-[-0.05em]">
                  {number}
                </div>

                <div className="text-[11px] sm:text-xs text-[#858b90] mt-1 uppercase tracking-wide font-semibold">
                  {text}
                </div>
              </div>

            ))}

          </div>

        </div>
      </section>

      {/* =========================================================
          FLEET
      ========================================================= */}

      <section
        id="fleet"
        className="max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-0 py-24 sm:py-32"
      >

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-7 mb-12">

          <div>

            <div className="flex items-center gap-3 mb-5">
              <span className="w-9 h-[2px] bg-[#f5c542]" />

              <span className="text-[11px] uppercase tracking-[0.2em] font-black text-[#777e84]">
                Explore the collection
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-[-0.06em] leading-[0.9]">
              Find your
              <br />
              perfect ride.
            </h2>

          </div>

          <div className="max-w-sm">

            <p className="text-sm text-[#777e84] leading-6 mb-5">
              From practical city cars to premium vehicles,
              discover a fleet designed around different kinds
              of journeys.
            </p>

            <button
              onClick={() => navigate("/fleet")}
              className="group inline-flex items-center gap-2 text-xs uppercase tracking-wide font-black border-b-2 border-black pb-2"
            >
              View all vehicles

              <ArrowRight
                size={15}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>

          </div>

        </div>

        {loadingCars ? (

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {[1, 2, 3, 4].map((item) => (

              <div
                key={item}
                className="bg-white animate-pulse"
              >
                <div className="aspect-[4/3] bg-[#e6e6e3]" />

                <div className="p-5">
                  <div className="h-5 w-3/4 bg-[#e6e6e3]" />
                  <div className="h-3 w-1/2 bg-[#e6e6e3] mt-4" />
                  <div className="h-7 w-1/3 bg-[#e6e6e3] mt-6" />
                </div>
              </div>

            ))}

          </div>

        ) : featuredCars.length === 0 ? (

          <div className="bg-white border border-black/10 py-24 text-center">

            <div className="text-4xl mb-4">
              🚗
            </div>

            <p className="text-sm text-[#777e84]">
              No vehicles are currently available.
            </p>

            <button
              onClick={() => navigate("/fleet")}
              className="mt-6 bg-[#111518] text-white px-6 py-3 text-xs font-black uppercase tracking-wide"
            >
              Browse Fleet
            </button>

          </div>

        ) : (

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {featuredCars.map((car) => (

              <article
                key={car.id}
                className="group bg-white border border-black/10 overflow-hidden hover:-translate-y-2 hover:shadow-[0_25px_55px_rgba(0,0,0,0.11)] transition-all duration-500"
              >

                <div className="relative aspect-[4/3] overflow-hidden">

                  <img
                    src={car.images?.[0] || PLACEHOLDER_IMG}
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <span className="absolute top-4 left-4 bg-[#111518] text-white px-3 py-1.5 text-[9px] uppercase tracking-[0.14em] font-black">
                    {car.type || "Vehicle"}
                  </span>

                  <div className="absolute top-4 right-4 bg-white px-2.5 py-1.5 flex items-center gap-1">
                    <Star
                      size={11}
                      fill="#f5c542"
                      className="text-[#f5c542]"
                    />

                    <span className="text-[11px] font-black">
                      {Number(car.rating || 0).toFixed(1)}
                    </span>
                  </div>

                </div>

                <div className="p-5">

                  <h3 className="text-xl font-black tracking-[-0.04em]">
                    {car.name}
                  </h3>

                  <div className="flex items-center gap-4 mt-4 text-[11px] text-[#777e84]">

                    <span className="flex items-center gap-1.5">
                      <Users size={14} />
                      {car.seats}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Fuel size={14} />
                      {car.fuel}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Gauge size={14} />
                      {car.transmission}
                    </span>

                  </div>

                  <div className="h-px bg-black/10 my-5" />

                  <div className="flex items-end justify-between">

                    <div>
                      <span className="text-2xl font-black tracking-[-0.05em]">
                        Rs {Number(car.pricePerDay || 0).toLocaleString()}
                      </span>

                      <span className="text-xs text-[#888] ml-1">
                        / day
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(`/cars/${car.id}`)}
                      className="bg-[#111518] text-white px-4 py-2.5 text-[10px] uppercase tracking-wide font-black hover:bg-[#f5c542] hover:text-[#111518] transition-colors"
                    >
                      View
                    </button>

                  </div>

                </div>

              </article>

            ))}

          </div>
        )}

      </section>

      {/* =========================================================
          WHY DRIVEHUB
      ========================================================= */}

      <section
        id="why-us"
        className="bg-[#111518] text-white overflow-hidden"
      >

        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-0 py-24 sm:py-32">

          <div className="grid lg:grid-cols-2 gap-14 lg:gap-24 items-center">

            {/* Left */}
            <div>

              <div className="flex items-center gap-3 mb-6">

                <span className="w-9 h-[2px] bg-[#f5c542]" />

                <span className="text-[#f5c542] text-[11px] uppercase tracking-[0.2em] font-black">
                  Why DriveHub
                </span>

              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-[-0.06em] leading-[0.9]">
                More than
                <br />
                just a rental.
              </h2>

              <p className="mt-7 text-white/50 text-sm sm:text-base leading-7 max-w-lg">
                We focus on making every part of the rental journey
                simple — from finding the right vehicle to getting
                behind the wheel.
              </p>

              <div className="mt-9 flex items-center gap-3 text-sm font-semibold">
                <CheckCircle2
                  size={18}
                  className="text-[#f5c542]"
                />

                Transparent rental experience
              </div>

              <div className="mt-4 flex items-center gap-3 text-sm font-semibold">
                <CheckCircle2
                  size={18}
                  className="text-[#f5c542]"
                />

                Carefully maintained vehicles
              </div>

              <div className="mt-4 flex items-center gap-3 text-sm font-semibold">
                <CheckCircle2
                  size={18}
                  className="text-[#f5c542]"
                />

                Straightforward online booking
              </div>

            </div>

            {/* Right feature cards */}
            <div className="grid sm:grid-cols-2 gap-px bg-white/10">

              {features.map((feature) => {

                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="bg-[#111518] border border-white/10 p-7 sm:p-8 hover:bg-white/[0.04] transition-colors"
                  >

                    <div className="w-11 h-11 border border-white/10 flex items-center justify-center">
                      <Icon
                        size={20}
                        className="text-[#f5c542]"
                      />
                    </div>

                    <h3 className="mt-9 text-lg font-black">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm text-white/40 leading-6">
                      {feature.text}
                    </p>

                  </div>
                );
              })}

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}

      <section
        id="how-it-works"
        className="max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-0 py-24 sm:py-32"
      >

        <div className="max-w-2xl mb-16">

          <div className="flex items-center gap-3 mb-5">

            <span className="w-9 h-[2px] bg-[#f5c542]" />

            <span className="text-[11px] uppercase tracking-[0.2em] font-black text-[#777e84]">
              How it works
            </span>

          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-[-0.06em] leading-[0.9]">
            Four steps.
            <br />
            One easy journey.
          </h2>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 border-t border-l border-black/10">

          {steps.map((step, index) => (

            <div
              key={step.number}
              className="relative p-7 sm:p-9 lg:p-8 border-r border-b border-black/10 group hover:bg-white transition-colors"
            >

              <div className="flex items-start justify-between">

                <span className="text-sm font-black text-[#f0bb26]">
                  {step.number}
                </span>

                <ArrowDownRight
                  size={20}
                  className="text-black/20 group-hover:text-black transition-colors"
                />

              </div>

              <h3 className="mt-14 text-2xl font-black tracking-[-0.04em]">
                {step.title}
              </h3>

              <p className="mt-4 text-sm text-[#777e84] leading-6">
                {step.text}
              </p>

            </div>

          ))}

        </div>

      </section>

      {/* =========================================================
          LOCATIONS
      ========================================================= */}

      <section
        id="locations"
        className="bg-white border-y border-black/10"
      >

        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-0 py-24 sm:py-32">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">

            <div>

              <div className="flex items-center gap-3 mb-5">

                <span className="w-9 h-[2px] bg-[#f5c542]" />

                <span className="text-[11px] uppercase tracking-[0.2em] font-black text-[#777e84]">
                  Our locations
                </span>

              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-[-0.06em] leading-[0.9]">
                Wherever
                <br />
                you're going.
              </h2>

            </div>

            <div className="flex items-center gap-2 text-sm text-[#777e84]">
              <Globe2 size={17} />
              Growing across Pakistan
            </div>

          </div>

          <div className="grid md:grid-cols-3 gap-5">

            {locations.map((location) => (

              <button
                key={location.city}
                onClick={() => {
                  setPickup(location.city);
                  scrollTo("fleet");
                }}
                className="group relative aspect-[4/3] overflow-hidden text-left"
              >

                <img
                  src={location.image}
                  alt={location.city}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7">

                  <div className="text-white/60 text-[10px] uppercase tracking-[0.16em] font-black">
                    {location.label}
                  </div>

                  <div className="flex items-end justify-between gap-3 mt-2">

                    <h3 className="text-3xl sm:text-4xl font-black text-white tracking-[-0.05em]">
                      {location.city}
                    </h3>

                    <span className="w-10 h-10 bg-[#f5c542] text-[#111518] flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
                      <MoveUpRight size={18} />
                    </span>

                  </div>

                </div>

              </button>

            ))}

          </div>

        </div>

      </section>

      {/* =========================================================
          LARGE CTA
      ========================================================= */}

      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10 bg-[#f3f3f0]">

        <div className="max-w-[1400px] mx-auto relative overflow-hidden bg-[#f5c542]">

          {/* Decorative circles */}
          <div className="absolute right-[-150px] top-[-170px] w-[430px] h-[430px] rounded-full border-[80px] border-black/5" />

          <div className="absolute right-[120px] bottom-[-220px] w-[400px] h-[400px] rounded-full border-[60px] border-black/5 hidden lg:block" />

          <div className="relative z-10 px-7 sm:px-12 lg:px-20 py-16 sm:py-20 lg:py-24 flex flex-col lg:flex-row lg:items-end justify-between gap-10">

            <div className="max-w-3xl">

              <div className="text-[11px] uppercase tracking-[0.2em] font-black text-black/45 mb-5">
                Your next journey
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black uppercase tracking-[-0.065em] leading-[0.86]">
                Ready to
                <br />
                hit the road?
              </h2>

            </div>

            <button
              onClick={() => navigate("/fleet")}
              className="group flex items-center justify-center gap-3 bg-[#111518] text-white px-8 py-4 text-xs sm:text-sm uppercase tracking-wide font-black hover:bg-white hover:text-[#111518] transition-colors shrink-0"
            >
              Explore the fleet

              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>

          </div>

        </div>

      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="bg-[#111518] text-white">

        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-0">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-12 py-16">

            {/* Brand */}
            <div>

              <button
                onClick={() => navigate("/")}
                className="text-2xl font-black tracking-[-0.07em]"
              >
                DRIVE<span className="text-[#f5c542]">HUB</span>
              </button>

              <p className="mt-5 max-w-sm text-sm leading-6 text-white/40">
                A better way to rent a car. Reliable vehicles,
                straightforward booking and journeys built around
                your plans.
              </p>

            </div>

            {/* Explore */}
            <div>

              <h4 className="text-[10px] uppercase tracking-[0.18em] font-black text-white/40">
                Explore
              </h4>

              <div className="mt-5 flex flex-col gap-3 text-sm text-white/70">

                <button
                  onClick={() => navigate("/fleet")}
                  className="text-left hover:text-[#f5c542]"
                >
                  Our Fleet
                </button>

                <button
                  onClick={() => scrollTo("how-it-works")}
                  className="text-left hover:text-[#f5c542]"
                >
                  How It Works
                </button>

                <button
                  onClick={() => scrollTo("locations")}
                  className="text-left hover:text-[#f5c542]"
                >
                  Locations
                </button>

              </div>

            </div>

            {/* Company */}
            <div>

              <h4 className="text-[10px] uppercase tracking-[0.18em] font-black text-white/40">
                Company
              </h4>

              <div className="mt-5 flex flex-col gap-3 text-sm text-white/70">

                <button className="text-left hover:text-[#f5c542]">
                  About DriveHub
                </button>

                <button className="text-left hover:text-[#f5c542]">
                  Contact
                </button>

                <button className="text-left hover:text-[#f5c542]">
                  Terms & Conditions
                </button>

              </div>

            </div>

            {/* Account */}
            <div>

              <h4 className="text-[10px] uppercase tracking-[0.18em] font-black text-white/40">
                Account
              </h4>

              <div className="mt-5 flex flex-col gap-3 text-sm text-white/70">

                {user ? (
                  <button
                    onClick={() =>
                      navigate(
                        user.role === "admin"
                          ? "/admin"
                          : "/my-bookings"
                      )
                    }
                    className="text-left hover:text-[#f5c542]"
                  >
                    {user.role === "admin"
                      ? "Dashboard"
                      : "My Bookings"}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/auth")}
                    className="text-left hover:text-[#f5c542]"
                  >
                    Sign in
                  </button>
                )}

                <button
                  onClick={() => navigate("/fleet")}
                  className="text-left hover:text-[#f5c542]"
                >
                  Book a vehicle
                </button>

              </div>

            </div>

          </div>

          <div className="border-t border-white/10 py-7 flex flex-col sm:flex-row items-center justify-between gap-4">

            <p className="text-[11px] text-white/30">
              © 2026 DriveHub. All rights reserved.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-white/30">
              <ShieldCheck size={13} />
              Secure booking experience
            </div>

          </div>

        </div>

      </footer>

      {/* =========================================================
          ANIMATIONS
      ========================================================= */}

      <style>{`

        @keyframes slowZoom {
          from {
            transform: scale(1.04);
          }

          to {
            transform: scale(1.10);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(25px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slowZoom {
          animation: slowZoom 20s ease-in-out infinite alternate;
        }

        .animate-fadeUp {
          opacity: 0;
          animation: fadeUp 0.8s ease-out forwards;
        }

        .animation-delay-100 {
          animation-delay: 100ms;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .group-hover\\:scale-108 {
          transition-property: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-slowZoom,
          .animate-fadeUp {
            animation: none;
            opacity: 1;
          }
        }

      `}</style>

    </div>
  );
}