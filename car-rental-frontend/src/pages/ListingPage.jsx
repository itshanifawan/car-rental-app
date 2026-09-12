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

const gearOptions = [
  "Any",
  "Automatic",
  "Manual",
];

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
        "Cars load nahi ho sakin. Backend chal raha hai check karein."
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
    <div className="flex flex-col gap-6">
      {/* City */}
      <div>
        <label className="text-xs font-semibold text-[#445064] mb-2 block">
          City
        </label>

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full border border-[#0F1B2B]/20 px-3 py-2 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFC93C]"
        >
          {cityOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Car Type */}
      <div>
        <label className="text-xs font-semibold text-[#445064] mb-2 block">
          Car type
        </label>

        <div className="flex flex-wrap gap-2">
          {typeOptions.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`text-xs font-semibold px-3 py-2 border transition-colors ${
                type === t
                  ? "bg-[#0F1B2B] text-white border-[#0F1B2B]"
                  : "bg-white text-[#445064] border-[#0F1B2B]/20 hover:border-[#0F1B2B]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Transmission */}
      <div>
        <label className="text-xs font-semibold text-[#445064] mb-2 block">
          Transmission
        </label>

        <div className="flex gap-2">
          {gearOptions.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGear(g)}
              className={`text-xs font-semibold px-3 py-2 border transition-colors flex-1 ${
                gear === g
                  ? "bg-[#0F1B2B] text-white border-[#0F1B2B]"
                  : "bg-white text-[#445064] border-[#0F1B2B]/20 hover:border-[#0F1B2B]"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-[#445064]">
            Max price / day
          </label>

          <span className="font-display text-lg font-700">
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
          className="w-full accent-[#FFC93C]"
        />

        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-[#445064]">
            Rs 2,000
          </span>

          <span className="text-[10px] text-[#445064]">
            Rs 30,000+
          </span>
        </div>
      </div>

      {/* Reset */}
      <button
        type="button"
        onClick={resetFilters}
        className="text-xs font-semibold text-[#445064] underline self-start hover:text-[#0F1B2B]"
      >
        Reset all filters
      </button>
    </div>
  );

  return (
    <div className="font-body bg-[#EDEEF0] text-[#0F1B2B] min-h-screen">
      {fonts}

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto">
        {/* Logo */}
        <div
          className="font-display text-2xl md:text-3xl font-800 tracking-tight cursor-pointer"
          onClick={() => navigate("/")}
        >
          DRIVE
          <span className="text-[#FFC93C]">
            HUB
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#445064]">
          <button
            type="button"
            onClick={() => navigate("/fleet")}
            className="text-[#0F1B2B] font-semibold"
          >
            Fleet
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="hover:text-[#0F1B2B] transition-colors"
          >
            How it works
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="hover:text-[#0F1B2B] transition-colors"
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
                className="hidden sm:block text-sm font-semibold text-[#445064] hover:text-[#0F1B2B]"
              >
                Dashboard
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/my-bookings")}
                className="hidden sm:block text-sm font-semibold text-[#445064] hover:text-[#0F1B2B]"
              >
                My Bookings
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="bg-[#0F1B2B] text-white text-sm font-semibold px-4 sm:px-5 py-2.5 hover:bg-[#1a2c44] transition-colors"
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
            className="bg-[#0F1B2B] text-white text-sm font-semibold px-5 py-2.5 hover:bg-[#1a2c44] transition-colors"
          >
            Sign in
          </button>
        )}
      </nav>

      {/* HEADER */}
      <header className="max-w-7xl mx-auto px-6 md:px-12 pt-4 pb-8">
        <p className="text-xs font-semibold tracking-wide text-[#445064] mb-2">
          {loading
            ? "Loading..."
            : `${total} ${
                total === 1 ? "car" : "cars"
              } available`}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <h1 className="font-display text-4xl md:text-5xl font-800">
            Browse the fleet
          </h1>

          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#445064]"
            />

            <input
              type="text"
              placeholder="Search by car name..."
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              className="w-full border border-[#0F1B2B]/20 bg-white pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC93C]"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#445064] hover:text-[#0F1B2B]"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-20 grid lg:grid-cols-[260px_1fr] gap-8">
        {/* DESKTOP FILTERS */}
        <aside className="hidden lg:block">
          <div className="bg-white border border-[#0F1B2B]/10 p-5 sticky top-6">
            <h2 className="font-display text-xl font-700 mb-5">
              Filters
            </h2>

            <FilterPanel />
          </div>
        </aside>

        {/* MOBILE FILTER BAR */}
        <div className="lg:hidden flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() =>
              setFiltersOpen(true)
            }
            className="flex items-center gap-2 bg-white border border-[#0F1B2B]/20 px-4 py-2.5 text-sm font-semibold"
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>

          <SortDropdown
            sort={sort}
            setSort={setSort}
          />
        </div>

        {/* MOBILE FILTER DRAWER */}
        {filtersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-[#0F1B2B]/50"
              onClick={() =>
                setFiltersOpen(false)
              }
            />

            {/* Drawer */}
            <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-700">
                  Filters
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setFiltersOpen(false)
                  }
                  className="p-1 hover:bg-[#EDEEF0]"
                >
                  <X size={20} />
                </button>
              </div>

              <FilterPanel />

              <button
                type="button"
                onClick={() =>
                  setFiltersOpen(false)
                }
                className="w-full mt-6 bg-[#FFC93C] text-[#0F1B2B] font-display font-700 text-lg py-3 hover:bg-[#f5bd28] transition-colors"
              >
                Show {sortedCars.length}{" "}
                {sortedCars.length === 1
                  ? "car"
                  : "cars"}
              </button>
            </div>
          </div>
        )}

        {/* RESULTS */}
        <div>
          {/* DESKTOP SORT */}
          <div className="hidden lg:flex justify-end mb-4">
            <SortDropdown
              sort={sort}
              setSort={setSort}
            />
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#0F1B2B]/10 animate-pulse"
                >
                  <div className="aspect-[4/3] bg-[#EDEEF0]" />

                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-[#EDEEF0] w-3/4" />

                    <div className="h-3 bg-[#EDEEF0] w-1/2" />

                    <div className="h-6 bg-[#EDEEF0] w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* ERROR */
            <div className="bg-white border border-[#0F1B2B]/10 p-12 text-center">
              <p className="font-display text-2xl font-700 mb-2">
                Kuch masla ho gaya
              </p>

              <p className="text-sm text-[#445064] mb-4">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchCars}
                className="text-sm font-semibold bg-[#0F1B2B] text-white px-5 py-2.5 hover:bg-[#1a2c44] transition-colors"
              >
                Dobara try karein
              </button>
            </div>
          ) : sortedCars.length === 0 ? (
            /* NO RESULTS */
            <div className="bg-white border border-[#0F1B2B]/10 p-12 text-center">
              <p className="font-display text-2xl font-700 mb-2">
                No cars match those filters
              </p>

              <p className="text-sm text-[#445064] mb-4">
                Try widening your price range
                or clearing a filter.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-semibold bg-[#0F1B2B] text-white px-5 py-2.5 hover:bg-[#1a2c44] transition-colors"
              >
                Reset filters
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
                    className="bg-white border border-[#0F1B2B]/10 group hover:shadow-[6px_6px_0_#0F1B2B] transition-shadow"
                  >
                    {/* IMAGE */}
                    <div className="relative overflow-hidden aspect-[4/3] bg-[#0F1B2B]">
                      <img
                        src={
                          car.images?.[0] ||
                          PLACEHOLDER_IMG
                        }
                        alt={car.name}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src =
                            PLACEHOLDER_IMG;
                        }}
                      />

                      {/* Type */}
                      <span className="absolute top-3 left-3 bg-[#0F1B2B] text-white text-[11px] font-semibold px-2.5 py-1">
                        {car.type}
                      </span>

                      {/* Availability */}
                      {car.isAvailable === false && (
                        <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-semibold px-2.5 py-1">
                          Unavailable
                        </span>
                      )}
                    </div>

                    {/* CONTENT */}
                    <div className="p-4">
                      {/* Name + Rating */}
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-display text-lg font-700 leading-tight">
                          {car.name}
                        </h3>

                        <div className="flex items-center gap-1 text-xs font-semibold shrink-0 ml-2">
                          <Star
                            size={13}
                            fill="#FFC93C"
                            className="text-[#FFC93C]"
                          />

                          {rating.toFixed(1)}
                        </div>
                      </div>

                      {/* City */}
                      <p className="text-xs text-[#445064] mb-3">
                        {car.city}
                      </p>

                      {/* Specs */}
                      <div className="flex items-center gap-3 text-[#445064] text-xs mb-4">
                        <span className="flex items-center gap-1">
                          <Users size={13} />
                          {car.seats}
                        </span>

                        <span className="flex items-center gap-1">
                          <Fuel size={13} />
                          {car.fuel}
                        </span>

                        <span className="flex items-center gap-1">
                          <Gauge size={13} />
                          {car.transmission}
                        </span>
                      </div>

                      {/* Price + Details */}
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <span className="font-display text-2xl font-800">
                            Rs{" "}
                            {price.toLocaleString()}
                          </span>

                          <span className="text-xs text-[#445064]">
                            /day
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/cars/${car.id}`
                            )
                          }
                          className="text-xs font-semibold bg-[#EDEEF0] px-3 py-2 hover:bg-[#FFC93C] transition-colors whitespace-nowrap"
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
  );
}

/* =========================================
   SORT DROPDOWN
========================================= */

function SortDropdown({ sort, setSort }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 bg-white border border-[#0F1B2B]/20 px-4 py-2.5 text-sm font-semibold"
      >
        Sort: {sort}

        <ChevronDown
          size={15}
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

          <div className="absolute right-0 mt-1 bg-white border border-[#0F1B2B]/10 shadow-lg z-10 w-56">
            {sortOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setSort(option);
                  setOpen(false);
                }}
                className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-[#EDEEF0] transition-colors ${
                  sort === option
                    ? "font-semibold bg-[#EDEEF0]"
                    : ""
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}