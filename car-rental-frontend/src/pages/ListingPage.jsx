import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  SlidersHorizontal,
  Star,
  Users,
  Fuel,
  Gauge,
  Search,
  X,
  ChevronDown,
  MapPin,
  ArrowUpDown,
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
  "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=600&q=80";

const cityOptions = [
  "All cities",
  "Islamabad",
  "Lahore",
  "Karachi",
  "Rawalpindi",
];

const typeOptions = [
  "All types",
  "Sedan",
  "SUV",
  "Hatchback",
  "Luxury",
];

const gearOptions = ["Any", "Automatic", "Manual"];

const sortOptions = [
  "Recommended",
  "Price: Low to High",
  "Price: High to Low",
  "Rating",
];

export default function ListingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [query, setQuery] = useState("");
  const [city, setCity] = useState(
    location.state?.city || "All cities"
  );
  const [type, setType] = useState("All types");
  const [gear, setGear] = useState("Any");
  const [maxPrice, setMaxPrice] = useState(30000);
  const [sort, setSort] = useState("Recommended");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [cars, setCars] = useState([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchCars();
    }, 400);

    return () => clearTimeout(timeout);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, city, type, gear, maxPrice]);

  const fetchCars = async () => {
    setLoading(true);
    setError("");

    try {
      const params = {};

      if (query.trim()) {
        params.search = query.trim();
      }

      if (city !== "All cities") {
        params.city = city;
      }

      if (type !== "All types") {
        params.type = type;
      }

      if (gear !== "Any") {
        params.transmission = gear;
      }

      if (maxPrice < 30000) {
        params.maxPrice = maxPrice;
      }

      const { data } = await api.get("/cars", {
        params,
      });

      const carData = Array.isArray(data.data)
        ? data.data
        : [];

      setCars(carData);

      setTotal(
        data.meta?.total ??
          carData.length
      );
    } catch (err) {
      console.error("Fetch cars error:", err);

      setError(
        "We couldn't load the fleet. Please make sure the server is running and try again."
      );

      setCars([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const sortedCars = useMemo(() => {
    const list = [...cars];

    switch (sort) {
      case "Price: Low to High":
        return list.sort(
          (a, b) =>
            Number(a.pricePerDay || 0) -
            Number(b.pricePerDay || 0)
        );

      case "Price: High to Low":
        return list.sort(
          (a, b) =>
            Number(b.pricePerDay || 0) -
            Number(a.pricePerDay || 0)
        );

      case "Rating":
        return list.sort(
          (a, b) =>
            Number(b.rating || 0) -
            Number(a.rating || 0)
        );

      case "Recommended":
      default:
        return list;
    }
  }, [cars, sort]);

  const resetFilters = () => {
    setQuery("");
    setCity("All cities");
    setType("All types");
    setGear("Any");
    setMaxPrice(30000);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const FilterPanel = () => (
    <div className="flex flex-col gap-7">
      {/* City */}
      <div>
        <label className="text-[11px] uppercase tracking-wider font-bold text-[#777e84] mb-2 block">
          Location
        </label>

        <div className="relative">
          <MapPin
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777e84]"
          />

          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full appearance-none border border-[#111518]/10 bg-[#f8f8f6] pl-9 pr-8 py-3 text-sm font-medium text-[#111518] focus:outline-none focus:border-[#f5c542] transition-colors"
          >
            {cityOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <ChevronDown
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#777e84]"
          />
        </div>
      </div>

      {/* Car Type */}
      <div>
        <label className="text-[11px] uppercase tracking-wider font-bold text-[#777e84] mb-3 block">
          Vehicle type
        </label>

        <div className="grid grid-cols-2 gap-2">
          {typeOptions.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`text-xs font-semibold px-3 py-2.5 border transition-all duration-200 ${
                type === t
                  ? "bg-[#111518] text-white border-[#111518] shadow-[3px_3px_0_#f5c542]"
                  : "bg-white text-[#777e84] border-[#111518]/10 hover:border-[#111518]/30 hover:text-[#111518]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Transmission */}
      <div>
        <label className="text-[11px] uppercase tracking-wider font-bold text-[#777e84] mb-3 block">
          Transmission
        </label>

        <div className="grid grid-cols-3 gap-2">
          {gearOptions.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGear(g)}
              className={`text-xs font-semibold px-2 py-2.5 border transition-all duration-200 ${
                gear === g
                  ? "bg-[#111518] text-white border-[#111518]"
                  : "bg-white text-[#777e84] border-[#111518]/10 hover:border-[#111518]/30 hover:text-[#111518]"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <div className="flex items-end justify-between mb-3">
          <div>
            <label className="text-[11px] uppercase tracking-wider font-bold text-[#777e84] block">
              Daily budget
            </label>
            <span className="text-xs text-[#777e84]">
              Maximum price per day
            </span>
          </div>

          <span className="font-display text-xl font-800 text-[#111518]">
            Rs {maxPrice.toLocaleString()}
          </span>
        </div>

        <input
          type="range"
          min="2000"
          max="30000"
          step="500"
          value={maxPrice}
          onChange={(e) =>
            setMaxPrice(Number(e.target.value))
          }
          className="w-full accent-[#f5c542]"
        />

        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-[#777e84]">
            Rs 2,000
          </span>

          <span className="text-[10px] text-[#777e84]">
            Rs 30,000+
          </span>
        </div>
      </div>

      {/* Reset */}
      <button
        type="button"
        onClick={resetFilters}
        className="flex items-center gap-2 text-xs font-bold text-[#777e84] hover:text-[#111518] transition-colors self-start"
      >
        <X size={13} />
        Clear all filters
      </button>
    </div>
  );

  return (
    <div className="font-body bg-[#f3f3f0] text-[#111518] min-h-screen">
      {fonts}

      {/* NAVBAR */}
      <nav className="dh-nav sticky top-0 z-40 bg-[#f3f3f0]/90 border-b border-[#111518]/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="font-display text-2xl md:text-3xl font-800 tracking-tight"
          >
            DRIVE<span className="text-[#f5c542]">HUB</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#777e84]">
            <button
              type="button"
              onClick={() => navigate("/fleet")}
              className="text-[#111518] font-bold"
            >
              Fleet
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="hover:text-[#111518] transition-colors"
            >
              How it works
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="hover:text-[#111518] transition-colors"
            >
              Locations
            </button>
          </div>

          {/* User Area */}
          {user ? (
            <div className="flex items-center gap-3">
              {user.role === "admin" ? (
                <button
                  type="button"
                  onClick={() => navigate("/admin")}
                  className="hidden sm:block text-sm font-bold text-[#777e84] hover:text-[#111518] transition-colors"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/my-bookings")}
                  className="hidden sm:block text-sm font-bold text-[#777e84] hover:text-[#111518] transition-colors"
                >
                  My Bookings
                </button>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="bg-[#111518] text-white text-sm font-bold px-4 sm:px-5 py-2.5 hover:bg-[#252b2f] transition-colors"
              >
                {user.fullName?.split(" ")[0] || "Account"}
                <span className="hidden sm:inline">
                  {" "}
                  — Sign out
                </span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="bg-[#111518] text-white text-sm font-bold px-5 py-2.5 hover:bg-[#252b2f] transition-colors"
            >
              Sign in
            </button>
          )}
        </div>
      </nav>

      {/* HEADER */}
      <header className="max-w-7xl mx-auto px-6 md:px-12 pt-10 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-7">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-[2px] bg-[#f5c542]" />

              <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#777e84]">
                DriveHub Fleet
              </p>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-800 tracking-tight leading-none">
              Find your next ride.
            </h1>

            <p className="text-sm md:text-base text-[#777e84] mt-4 max-w-xl">
              Explore our collection of reliable, comfortable and
              premium vehicles available for your next journey.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-96 shrink-0">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#777e84]"
            />

            <input
              type="text"
              placeholder="Search vehicles..."
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              className="w-full border border-[#111518]/10 bg-white pl-11 pr-11 py-3.5 text-sm font-medium focus:outline-none focus:border-[#f5c542] transition-colors shadow-sm"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#777e84] hover:text-[#111518]"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* RESULTS AREA */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        <div className="grid lg:grid-cols-[270px_1fr] gap-8">
          {/* DESKTOP FILTERS */}
          <aside className="hidden lg:block">
            <div className="bg-white border border-[#111518]/10 p-6 sticky top-28 shadow-sm">
              <div className="flex items-center justify-between mb-7">
                <div>
                  <p className="font-display text-2xl font-800">
                    Refine
                  </p>

                  <p className="text-xs text-[#777e84] mt-1">
                    Narrow your search
                  </p>
                </div>

                <SlidersHorizontal
                  size={18}
                  className="text-[#777e84]"
                />
              </div>

              <FilterPanel />
            </div>
          </aside>

          {/* RESULTS */}
          <div>
            {/* TOP TOOLBAR */}
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-bold text-[#777e84]">
                  {loading
                    ? "Finding available vehicles..."
                    : `${total} ${
                        total === 1
                          ? "vehicle"
                          : "vehicles"
                      } available`}
                </p>

                {!loading &&
                  (city !== "All cities" ||
                    type !== "All types" ||
                    gear !== "Any" ||
                    maxPrice < 30000 ||
                    query) && (
                    <p className="text-[11px] text-[#999] mt-1">
                      Showing results based on your filters
                    </p>
                  )}
              </div>

              {/* Mobile Filters */}
              <div className="lg:hidden flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFiltersOpen(true)
                  }
                  className="flex items-center gap-2 bg-white border border-[#111518]/10 px-3.5 py-2.5 text-xs font-bold hover:border-[#111518]/30 transition-colors"
                >
                  <SlidersHorizontal size={14} />
                  Filters
                </button>

                <SortDropdown
                  sort={sort}
                  setSort={setSort}
                />
              </div>

              {/* Desktop Sort */}
              <div className="hidden lg:block">
                <SortDropdown
                  sort={sort}
                  setSort={setSort}
                />
              </div>
            </div>

            {/* MOBILE FILTER DRAWER */}
            {filtersOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div
                  className="absolute inset-0 bg-[#111518]/60 backdrop-blur-sm"
                  onClick={() =>
                    setFiltersOpen(false)
                  }
                />

                <div className="absolute right-0 top-0 h-full w-[88%] max-w-sm bg-white p-6 overflow-y-auto shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="font-display text-2xl font-800">
                        Refine your search
                      </p>

                      <p className="text-xs text-[#777e84] mt-1">
                        Choose your preferences
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setFiltersOpen(false)
                      }
                      className="p-2 bg-[#f3f3f0] hover:bg-[#e8e8e5] transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <FilterPanel />

                  <button
                    type="button"
                    onClick={() =>
                      setFiltersOpen(false)
                    }
                    className="w-full mt-8 bg-[#f5c542] text-[#111518] font-display font-800 text-xl py-3.5 hover:bg-[#ffd86b] transition-colors shadow-[4px_4px_0_#111518]"
                  >
                    Show {sortedCars.length}{" "}
                    {sortedCars.length === 1
                      ? "vehicle"
                      : "vehicles"}
                  </button>
                </div>
              </div>
            )}

            {/* LOADING */}
            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white border border-[#111518]/10 overflow-hidden"
                  >
                    <div className="aspect-[4/3] dh-skeleton" />

                    <div className="p-5 space-y-4">
                      <div className="h-5 dh-skeleton w-3/4" />
                      <div className="h-3 dh-skeleton w-1/2" />

                      <div className="flex gap-2">
                        <div className="h-3 dh-skeleton w-14" />
                        <div className="h-3 dh-skeleton w-14" />
                        <div className="h-3 dh-skeleton w-14" />
                      </div>

                      <div className="h-8 dh-skeleton w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              /* ERROR */
              <div className="bg-white border border-[#111518]/10 p-12 md:p-16 text-center">
                <div className="w-12 h-12 bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-5">
                  <X size={20} />
                </div>

                <p className="font-display text-3xl font-800 mb-2">
                  Something went wrong
                </p>

                <p className="text-sm text-[#777e84] mb-6 max-w-md mx-auto">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={fetchCars}
                  className="bg-[#111518] text-white text-sm font-bold px-6 py-3 hover:bg-[#252b2f] transition-colors"
                >
                  Try again
                </button>
              </div>
            ) : sortedCars.length === 0 ? (
              /* NO RESULTS */
              <div className="bg-white border border-[#111518]/10 p-12 md:p-16 text-center">
                <div className="w-14 h-14 bg-[#f3f3f0] flex items-center justify-center mx-auto mb-5">
                  <Search size={21} className="text-[#777e84]" />
                </div>

                <p className="font-display text-3xl font-800 mb-2">
                  No vehicles found
                </p>

                <p className="text-sm text-[#777e84] mb-6 max-w-md mx-auto">
                  We couldn't find any vehicles matching
                  your current search criteria. Try adjusting
                  your filters.
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="bg-[#111518] text-white text-sm font-bold px-6 py-3 hover:bg-[#252b2f] transition-colors"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              /* CAR GRID */
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedCars.map((car) => {
                  const price = Number(
                    car.pricePerDay || 0
                  );

                  const rating = Number(
                    car.rating || 0
                  );

                  return (
                    <div
                      key={car.id}
                      className="dh-card bg-white border border-[#111518]/10 group overflow-hidden hover:shadow-[6px_6px_0_#111518]"
                    >
                      {/* IMAGE */}
                      <div className="relative overflow-hidden aspect-[4/3] bg-[#111518]">
                        <img
                          src={
                            car.images?.[0] ||
                            PLACEHOLDER_IMG
                          }
                          alt={car.name}
                          className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700"
                          onError={(e) => {
                            e.currentTarget.src =
                              PLACEHOLDER_IMG;
                          }}
                        />

                        {/* Image Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111518]/40 via-transparent to-transparent pointer-events-none" />

                        {/* Type */}
                        <span className="absolute top-3 left-3 bg-[#111518] text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1.5">
                          {car.type}
                        </span>

                        {/* Availability */}
                        {car.isAvailable === false ? (
                          <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1.5">
                            Unavailable
                          </span>
                        ) : (
                          <span className="absolute top-3 right-3 bg-white text-[#111518] text-[10px] uppercase tracking-wider font-bold px-3 py-1.5">
                            Available
                          </span>
                        )}

                        {/* City */}
                        {car.city && (
                          <span className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-[11px] font-semibold">
                            <MapPin size={12} />
                            {car.city}
                          </span>
                        )}
                      </div>

                      {/* CONTENT */}
                      <div className="p-5">
                        {/* Name + Rating */}
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h3 className="font-display text-xl font-800 leading-tight">
                            {car.name}
                          </h3>

                          <div className="flex items-center gap-1 bg-[#f3f3f0] px-2 py-1 text-xs font-bold shrink-0">
                            <Star
                              size={12}
                              fill="#f5c542"
                              className="text-[#f5c542]"
                            />

                            {rating.toFixed(1)}
                          </div>
                        </div>

                        {/* Vehicle description */}
                        <p className="text-xs text-[#777e84] mb-4">
                          Premium {car.type?.toLowerCase() || "vehicle"} for your journey
                        </p>

                        {/* Specs */}
                        <div className="grid grid-cols-3 border-y border-[#111518]/8 py-3 mb-5">
                          <div className="flex items-center gap-1.5 text-[#777e84] text-[11px]">
                            <Users size={13} />
                            <span>{car.seats} Seats</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[#777e84] text-[11px]">
                            <Fuel size={13} />
                            <span>{car.fuel}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[#777e84] text-[11px]">
                            <Gauge size={13} />
                            <span>{car.transmission}</span>
                          </div>
                        </div>

                        {/* Price + Details */}
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-[#777e84] mb-0.5">
                              Starting from
                            </p>

                            <div className="flex items-baseline">
                              <span className="font-display text-2xl font-800">
                                Rs {price.toLocaleString()}
                              </span>

                              <span className="text-xs text-[#777e84] ml-1">
                                / day
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/cars/${car.id}`)
                            }
                            className="dh-button bg-[#111518] text-white text-xs font-bold px-4 py-2.5 hover:bg-[#f5c542] hover:text-[#111518]"
                          >
                            View details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SORT DROPDOWN
   ========================================================= */

function SortDropdown({ sort, setSort }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 bg-white border border-[#111518]/10 px-3.5 py-2.5 text-xs font-bold hover:border-[#111518]/30 transition-colors"
      >
        <ArrowUpDown size={14} />

        <span className="hidden sm:inline">
          Sort:
        </span>

        <span>{sort}</span>

        <ChevronDown
          size={14}
          className={`transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <>
          {/* Outside click layer */}
          <div
            className="fixed inset-0 z-0"
            onClick={() => setOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 bg-white border border-[#111518]/10 shadow-xl z-10 w-56 overflow-hidden">
            <div className="px-4 py-3 border-b border-[#111518]/8">
              <p className="text-[10px] uppercase tracking-wider font-bold text-[#777e84]">
                Sort vehicles
              </p>
            </div>

            {sortOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setSort(option);
                  setOpen(false);
                }}
                className={`flex items-center justify-between w-full text-left px-4 py-3 text-xs hover:bg-[#f3f3f0] transition-colors ${
                  sort === option
                    ? "font-bold bg-[#f3f3f0]"
                    : "text-[#777e84]"
                }`}
              >
                {option}

                {sort === option && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f5c542]" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}