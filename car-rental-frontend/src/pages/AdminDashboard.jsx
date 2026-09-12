import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Car,
  CalendarCheck,
  Users,
  Settings,
  LogOut,
  TrendingUp,
  DollarSign,
  Star,
  Menu,
  X,
  Plus,
  Ban,
  CheckCircle2,
  Pencil,
  MapPin,
  Fuel,
  Gauge,
  UserRound,
  ShieldCheck,
  Clock3,
  ArrowUpRight,
  CircleDollarSign,
  Activity,
  ChevronRight,
  Search,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import EditCarModal from "../components/EditCarModal";

/* =========================================================
   THEME
========================================================= */

const fonts = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

    .font-display {
      font-family: 'Big Shoulders Display', sans-serif;
    }

    .font-body {
      font-family: 'Inter', sans-serif;
    }

    @keyframes fadeUp {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-12px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(.97);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .animate-fade-up {
      animation: fadeUp .5s ease-out both;
    }

    .animate-fade-in {
      animation: fadeIn .4s ease-out both;
    }

    .animate-slide-in {
      animation: slideIn .4s ease-out both;
    }

    .animate-scale-in {
      animation: scaleIn .3s ease-out both;
    }

    .dashboard-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    .dashboard-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }

    .dashboard-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(15, 27, 43, .18);
      border-radius: 999px;
    }

    .dashboard-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(15, 27, 43, .3);
    }
  `}</style>
);

/* =========================================================
   CONSTANTS
========================================================= */

const navItems = [
  {
    icon: LayoutDashboard,
    label: "Overview",
    tab: "bookings",
  },
  {
    icon: Car,
    label: "Fleet",
    tab: "fleet",
  },
  {
    icon: CalendarCheck,
    label: "Bookings",
    tab: "bookings",
  },
  {
    icon: Users,
    label: "Customers",
    tab: "customers",
  },
  {
    icon: Settings,
    label: "Settings",
    tab: "settings",
  },
];

const statusColor = {
  Pending:
    "bg-amber-50 text-amber-700 border border-amber-200",
  Active:
    "bg-blue-50 text-blue-700 border border-blue-200",
  Completed:
    "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Cancelled:
    "bg-red-50 text-red-700 border border-red-200",
};

const bookingStatuses = [
  "Pending",
  "Active",
  "Completed",
  "Cancelled",
];

const carTypes = [
  "Sedan",
  "SUV",
  "Hatchback",
  "Luxury",
];

const fuelTypes = [
  "Petrol",
  "Diesel",
  "Hybrid",
  "Electric",
];

const transmissionTypes = [
  "Automatic",
  "Manual",
];

/* =========================================================
   MAIN DASHBOARD
========================================================= */

export default function AdminDashboard() {
  const navigate = useNavigate();

  const {
    user,
    logout,
    loading: authLoading,
    updateProfile,
  } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState("bookings");

  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [settings, setSettings] = useState(null);

  const [loadingData, setLoadingData] = useState(true);

  const [showAddCar, setShowAddCar] = useState(false);
  const [editingCar, setEditingCar] = useState(null);

  const [search, setSearch] = useState("");

  /* ---------------------------------------------------------
     AUTH
  --------------------------------------------------------- */

  useEffect(() => {
    if (
      !authLoading &&
      (!user || user.role !== "admin")
    ) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  /* ---------------------------------------------------------
     FETCH DATA
  --------------------------------------------------------- */

  useEffect(() => {
    if (user?.role === "admin") {
      fetchData();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchData = async () => {
    setLoadingData(true);

    try {
      const [
        carsRes,
        bookingsRes,
        customersRes,
        settingsRes,
      ] = await Promise.all([
        api.get("/cars", {
          params: {
            limit: 100,
            includeUnavailable: "true",
          },
        }),

        api.get("/bookings"),

        api.get("/users"),

        api.get("/settings"),
      ]);

      setCars(carsRes.data.data || []);
      setBookings(bookingsRes.data || []);
      setCustomers(customersRes.data || []);
      setSettings(settingsRes.data);
    } catch (err) {
      console.error(
        "Failed to load admin data",
        err
      );
    } finally {
      setLoadingData(false);
    }
  };

  /* ---------------------------------------------------------
     BOOKING STATUS
  --------------------------------------------------------- */

  const updateBookingStatus = async (
    id,
    status
  ) => {
    try {
      await api.patch(
        `/bookings/${id}/status`,
        { status }
      );

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id
            ? { ...booking, status }
            : booking
        )
      );
    } catch (err) {
      alert("Unable to update booking status.");
    }
  };

  /* ---------------------------------------------------------
     CUSTOMER STATUS
  --------------------------------------------------------- */

  const toggleCustomerStatus = async (
    id,
    currentActive
  ) => {
    try {
      const { data } = await api.patch(
        `/users/${id}/status`,
        {
          isActive: !currentActive,
        }
      );

      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === id
            ? data
            : customer
        )
      );
    } catch (err) {
      alert(
        "Unable to update customer status."
      );
    }
  };

  /* ---------------------------------------------------------
     STATS
  --------------------------------------------------------- */

  const totalRevenue = useMemo(() => {
    return bookings.reduce(
      (sum, booking) =>
        sum +
        Number(
          booking.totalAmount || 0
        ),
      0
    );
  }, [bookings]);

  const activeBookings = useMemo(() => {
    return bookings.filter(
      (booking) =>
        booking.status === "Active"
    ).length;
  }, [bookings]);

  const availableCars = useMemo(() => {
    return cars.filter(
      (car) => car.isAvailable
    ).length;
  }, [cars]);

  const averageRating = useMemo(() => {
    if (!cars.length) return "0.0";

    return (
      cars.reduce(
        (sum, car) =>
          sum +
          Number(car.rating || 0),
        0
      ) / cars.length
    ).toFixed(1);
  }, [cars]);

  const stats = [
    {
      label: "Total revenue",
      value: `Rs ${totalRevenue.toLocaleString()}`,
      icon: CircleDollarSign,
      trend: "All bookings",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Active bookings",
      value: activeBookings,
      icon: CalendarCheck,
      trend: "Currently active",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Fleet size",
      value: cars.length,
      icon: Car,
      trend: `${availableCars} available`,
      iconBg: "bg-[#FFF7D9]",
      iconColor: "text-[#B78300]",
    },
    {
      label: "Average rating",
      value: averageRating,
      icon: Star,
      trend: "Across your fleet",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  /* ---------------------------------------------------------
     LOADING
  --------------------------------------------------------- */

  if (
    authLoading ||
    (user?.role === "admin" &&
      loadingData)
  ) {
    return (
      <div className="font-body bg-[#F5F6F8] min-h-screen flex items-center justify-center">
        {fonts}

        <div className="text-center animate-scale-in">
          <div className="w-14 h-14 bg-[#0F1B2B] text-[#FFC93C] flex items-center justify-center mx-auto mb-5 rounded-2xl shadow-xl">
            <Car
              size={26}
              strokeWidth={2.2}
            />
          </div>

          <h1 className="font-display text-3xl font-800 text-[#0F1B2B]">
            Loading dashboard
          </h1>

          <p className="text-sm text-[#6B7280] mt-2">
            Preparing your workspace...
          </p>

          <div className="w-32 h-1 bg-[#E5E7EB] rounded-full overflow-hidden mx-auto mt-5">
            <div className="h-full w-1/2 bg-[#FFC93C] rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (
    !user ||
    user.role !== "admin"
  ) {
    return null;
  }

  /* ---------------------------------------------------------
     FILTER DATA
  --------------------------------------------------------- */

  const filteredBookings =
    bookings.filter((booking) => {
      const query =
        search.trim().toLowerCase();

      if (!query) return true;

      return (
        booking.user?.fullName
          ?.toLowerCase()
          .includes(query) ||
        booking.car?.name
          ?.toLowerCase()
          .includes(query) ||
        booking.status
          ?.toLowerCase()
          .includes(query)
      );
    });

  const filteredCars =
    cars.filter((car) => {
      const query =
        search.trim().toLowerCase();

      if (!query) return true;

      return (
        car.name
          ?.toLowerCase()
          .includes(query) ||
        car.type
          ?.toLowerCase()
          .includes(query) ||
        car.city
          ?.toLowerCase()
          .includes(query)
      );
    });

  return (
    <div className="font-body bg-[#F5F6F8] text-[#0F1B2B] min-h-screen flex overflow-x-hidden">
      {fonts}

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#07111F]/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`
          fixed lg:sticky
          top-0
          left-0
          h-screen
          w-[280px]
          bg-[#0F1B2B]
          text-white
          flex flex-col
          z-50
          shadow-2xl lg:shadow-none
          transition-transform duration-300 ease-out
          lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Brand */}

        <div className="px-6 pt-7 pb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() =>
                navigate("/")
              }
              className="group text-left"
            >
              <div className="font-display text-[29px] font-800 tracking-tight leading-none">
                DRIVE
                <span className="text-[#FFC93C]">
                  HUB
                </span>
              </div>

              <div className="text-[10px] uppercase tracking-[.22em] text-white/40 mt-2">
                Admin workspace
              </div>
            </button>

            <button
              onClick={() =>
                setSidebarOpen(false)
              }
              className="lg:hidden w-9 h-9 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation label */}

        <div className="px-6 mb-3">
          <span className="text-[10px] uppercase tracking-[.18em] text-white/35 font-semibold">
            Workspace
          </span>
        </div>

        {/* Navigation */}

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map(
            (item, index) => {
              const Icon = item.icon;

              const active =
                item.tab === tab &&
                (
                  item.label ===
                    "Bookings" ||
                  item.label ===
                    "Overview"
                    ? tab ===
                        "bookings"
                    : true
                );

              return (
                <button
                  key={index}
                  onClick={() => {
                    setTab(item.tab);
                    setSearch("");
                    setSidebarOpen(false);
                  }}
                  className={`
                    relative
                    w-full
                    flex items-center gap-3
                    px-4 py-3.5
                    rounded-xl
                    text-sm
                    font-medium
                    text-left
                    transition-all
                    duration-200
                    group
                    ${
                      active
                        ? "bg-[#FFC93C] text-[#0F1B2B] shadow-lg shadow-black/10"
                        : "text-white/60 hover:text-white hover:bg-white/[.07]"
                    }
                  `}
                >
                  <Icon
                    size={18}
                    strokeWidth={
                      active ? 2.3 : 1.9
                    }
                  />

                  <span>
                    {item.label}
                  </span>

                  {active && (
                    <ChevronRight
                      size={15}
                      className="ml-auto"
                    />
                  )}
                </button>
              );
            }
          )}
        </nav>

        {/* Bottom profile */}

        <div className="p-4">
          <div className="rounded-2xl bg-white/[.06] border border-white/[.08] p-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFC93C] text-[#0F1B2B] flex items-center justify-center font-display font-800 text-lg">
                {user.fullName?.charAt(
                  0
                )}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">
                  {user.fullName}
                </p>

                <p className="text-[11px] text-white/40 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/55 hover:text-white hover:bg-white/[.07] transition-all"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="flex-1 min-w-0">
        {/* ===================================================
            TOP HEADER
        =================================================== */}

        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-[#0F1B2B]/[.08]">
          <div className="px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() =>
                  setSidebarOpen(true)
                }
                className="lg:hidden w-10 h-10 rounded-xl bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E9EAED] transition-colors shrink-0"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] uppercase tracking-[.16em] text-[#8A94A4] font-semibold mb-1">
                  DriveHub / Admin
                </p>

                <h1 className="font-display text-2xl sm:text-3xl font-800 leading-none truncate">
                  {tab === "customers"
                    ? "Customers"
                    : tab === "settings"
                    ? "Settings"
                    : tab === "fleet"
                    ? "Fleet management"
                    : "Dashboard"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}

              {(tab === "bookings" ||
                tab === "fleet") && (
                <div className="hidden md:flex items-center bg-[#F5F6F8] rounded-xl px-3 h-10 w-56 border border-transparent focus-within:border-[#FFC93C] focus-within:bg-white transition-all">
                  <Search
                    size={16}
                    className="text-[#8A94A4] mr-2"
                  />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder={
                      tab === "fleet"
                        ? "Search fleet..."
                        : "Search bookings..."
                    }
                    className="w-full bg-transparent outline-none text-xs text-[#0F1B2B] placeholder:text-[#9AA2AE]"
                  />
                </div>
              )}

              {/* Profile */}

              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-semibold">
                    {user.fullName}
                  </p>
                  <p className="text-[10px] text-[#8A94A4]">
                    Administrator
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-[#FFC93C] flex items-center justify-center font-display text-lg font-800 shadow-sm">
                  {user.fullName?.charAt(
                    0
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile search */}

          {(tab === "bookings" ||
            tab === "fleet") && (
            <div className="md:hidden px-4 pb-4">
              <div className="flex items-center bg-[#F5F6F8] rounded-xl px-3 h-10 border border-transparent focus-within:border-[#FFC93C] focus-within:bg-white transition-all">
                <Search
                  size={16}
                  className="text-[#8A94A4] mr-2"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder={
                    tab === "fleet"
                      ? "Search fleet..."
                      : "Search bookings..."
                  }
                  className="w-full bg-transparent outline-none text-xs text-[#0F1B2B] placeholder:text-[#9AA2AE]"
                />
              </div>
            </div>
          )}
        </header>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <main className="px-4 sm:px-6 lg:px-10 py-6 lg:py-8 max-w-[1600px] mx-auto">
          {/* =================================================
              OVERVIEW / FLEET
          ================================================= */}

          {(tab === "bookings" ||
            tab === "fleet") && (
            <>
              {/* Welcome banner */}

              {tab === "bookings" && (
                <section className="mb-7 animate-fade-up">
                  <div className="relative overflow-hidden rounded-2xl bg-[#0F1B2B] text-white p-6 sm:p-8">
                    <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-[#FFC93C]/10 blur-2xl" />

                    <div className="absolute right-10 bottom-0 opacity-[.07]">
                      <Car
                        size={190}
                        strokeWidth={1}
                      />
                    </div>

                    <div className="relative max-w-2xl">
                      <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-3 py-1.5 text-[10px] uppercase tracking-wider text-white/70 mb-4">
                        <Activity
                          size={12}
                        />
                        Live overview
                      </div>

                      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-800 leading-none">
                        Welcome back,{" "}
                        <span className="text-[#FFC93C]">
                          {
                            user.fullName.split(
                              " "
                            )[0]
                          }
                        </span>
                      </h2>

                      <p className="text-sm text-white/55 mt-3 max-w-lg leading-relaxed">
                        Keep an eye on your bookings,
                        fleet availability and customer
                        activity from one place.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* Stats */}

              <section
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5 mb-7"
              >
                {stats.map(
                  (stat, index) => {
                    const Icon =
                      stat.icon;

                    return (
                      <div
                        key={index}
                        className="group bg-white rounded-2xl border border-[#0F1B2B]/[.07] p-5 lg:p-6 shadow-[0_2px_12px_rgba(15,27,43,.03)] hover:shadow-[0_12px_35px_rgba(15,27,43,.08)] hover:-translate-y-1 transition-all duration-300 animate-fade-up"
                        style={{
                          animationDelay: `${
                            index * 70
                          }ms`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className={`w-11 h-11 rounded-xl ${stat.iconBg} ${stat.iconColor} flex items-center justify-center`}
                          >
                            <Icon
                              size={20}
                              strokeWidth={
                                2
                              }
                            />
                          </div>

                          <ArrowUpRight
                            size={16}
                            className="text-[#C4CAD3] group-hover:text-[#0F1B2B] transition-colors"
                          />
                        </div>

                        <div className="mt-5">
                          <p className="font-display text-3xl lg:text-4xl font-800 tracking-tight leading-none">
                            {stat.value}
                          </p>

                          <div className="flex items-center justify-between gap-2 mt-2">
                            <p className="text-xs text-[#687385]">
                              {stat.label}
                            </p>

                            <span className="text-[10px] text-[#9AA2AE]">
                              {stat.trend}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </section>

              {/* Main management panel */}

              <section className="bg-white rounded-2xl border border-[#0F1B2B]/[.07] shadow-[0_2px_12px_rgba(15,27,43,.03)] overflow-hidden animate-fade-up">
                {/* Panel header */}

                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[#0F1B2B]/[.07]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-[#FFC93C]" />

                        <span className="text-[10px] uppercase tracking-[.15em] font-semibold text-[#8A94A4]">
                          Management
                        </span>
                      </div>

                      <h2 className="font-display text-2xl sm:text-3xl font-800">
                        {tab === "bookings"
                          ? "Recent bookings"
                          : "Your fleet"}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setTab(
                            "bookings"
                          )
                        }
                        className={`
                          px-3.5 py-2 rounded-lg
                          text-xs font-semibold
                          transition-all
                          ${
                            tab ===
                            "bookings"
                              ? "bg-[#0F1B2B] text-white"
                              : "bg-[#F4F5F7] text-[#687385] hover:text-[#0F1B2B]"
                          }
                        `}
                      >
                        Bookings{" "}
                        <span className="ml-1 opacity-60">
                          {bookings.length}
                        </span>
                      </button>

                      <button
                        onClick={() =>
                          setTab(
                            "fleet"
                          )
                        }
                        className={`
                          px-3.5 py-2 rounded-lg
                          text-xs font-semibold
                          transition-all
                          ${
                            tab === "fleet"
                              ? "bg-[#0F1B2B] text-white"
                              : "bg-[#F4F5F7] text-[#687385] hover:text-[#0F1B2B]"
                          }
                        `}
                      >
                        Fleet{" "}
                        <span className="ml-1 opacity-60">
                          {cars.length}
                        </span>
                      </button>

                      {tab === "fleet" && (
                        <button
                          onClick={() =>
                            setShowAddCar(
                              true
                            )
                          }
                          className="flex items-center gap-2 bg-[#FFC93C] text-[#0F1B2B] px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-[#F4BD25] hover:-translate-y-0.5 transition-all shadow-sm"
                        >
                          <Plus
                            size={15}
                          />
                          <span className="hidden sm:inline">
                            Add car
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile tabs */}

                <div className="sm:hidden px-4 pt-4">
                  <div className="flex gap-2">
                    {tab === "bookings" ? (
                      <span className="text-[11px] text-[#8A94A4]">
                        Showing latest booking
                        activity
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#8A94A4]">
                        Manage your vehicle
                        inventory
                      </span>
                    )}
                  </div>
                </div>

                {/* Table */}

                <div className="overflow-x-auto dashboard-scrollbar">
                  {tab ===
                  "bookings" ? (
                    filteredBookings.length ===
                    0 ? (
                      <EmptyState
                        icon={CalendarCheck}
                        title="No bookings found"
                        description={
                          search
                            ? "Try a different search term."
                            : "Bookings will appear here when customers make reservations."
                        }
                      />
                    ) : (
                      <table className="w-full text-sm min-w-[850px]">
                        <thead>
                          <tr className="text-left text-[10px] uppercase tracking-[.1em] font-semibold text-[#929BA8] border-b border-[#0F1B2B]/[.07]">
                            <th className="px-5 lg:px-6 py-4">
                              Customer
                            </th>

                            <th className="px-3 py-4">
                              Vehicle
                            </th>

                            <th className="px-3 py-4">
                              Rental dates
                            </th>

                            <th className="px-3 py-4">
                              Amount
                            </th>

                            <th className="px-3 py-4">
                              Status
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredBookings.map(
                            (
                              booking,
                              index
                            ) => (
                              <tr
                                key={
                                  booking.id
                                }
                                className="border-b border-[#0F1B2B]/[.045] hover:bg-[#FAFBFC] transition-colors animate-fade-in"
                                style={{
                                  animationDelay: `${
                                    index *
                                    30
                                  }ms`,
                                }}
                              >
                                <td className="px-5 lg:px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-[#F1F3F5] flex items-center justify-center text-[#0F1B2B] font-display font-800">
                                      {booking.user?.fullName?.charAt(
                                        0
                                      ) ||
                                        "?"}
                                    </div>

                                    <div>
                                      <p className="font-semibold text-[#172235]">
                                        {booking
                                          .user
                                          ?.fullName ||
                                          "Unknown customer"}
                                      </p>

                                      <p className="text-[10px] text-[#9AA2AE] mt-0.5">
                                        Customer
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-3 py-4">
                                  <div className="flex items-center gap-2">
                                    <Car
                                      size={15}
                                      className="text-[#8A94A4]"
                                    />

                                    <span className="font-medium">
                                      {booking
                                        .car
                                        ?.name ||
                                        "—"}
                                    </span>
                                  </div>
                                </td>

                                <td className="px-3 py-4">
                                  <div>
                                    <p className="text-xs font-medium text-[#374151]">
                                      {
                                        booking.pickupDate
                                      }
                                    </p>

                                    <p className="text-[10px] text-[#9AA2AE] mt-1">
                                      to{" "}
                                      {
                                        booking.dropoffDate
                                      }
                                    </p>
                                  </div>
                                </td>

                                <td className="px-3 py-4">
                                  <span className="font-display text-lg font-800">
                                    Rs{" "}
                                    {Number(
                                      booking.totalAmount ||
                                        0
                                    ).toLocaleString()}
                                  </span>
                                </td>

                                <td className="px-3 py-4">
                                  <select
                                    value={
                                      booking.status
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      updateBookingStatus(
                                        booking.id,
                                        e.target
                                          .value
                                      )
                                    }
                                    className={`
                                      appearance-none
                                      text-[10px]
                                      font-bold
                                      px-3 py-1.5
                                      rounded-full
                                      outline-none
                                      cursor-pointer
                                      ${
                                        statusColor[
                                          booking
                                            .status
                                        ] ||
                                        "bg-gray-100 text-gray-700"
                                      }
                                    `}
                                  >
                                    {bookingStatuses.map(
                                      (
                                        status
                                      ) => (
                                        <option
                                          key={
                                            status
                                          }
                                          value={
                                            status
                                          }
                                        >
                                          {
                                            status
                                          }
                                        </option>
                                      )
                                    )}
                                  </select>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    )
                  ) : filteredCars.length ===
                    0 ? (
                    <EmptyState
                      icon={Car}
                      title="No vehicles found"
                      description={
                        search
                          ? "Try a different search term."
                          : "Add your first vehicle to start building the fleet."
                      }
                      action={
                        !search
                          ? {
                              label:
                                "Add your first car",
                              onClick: () =>
                                setShowAddCar(
                                  true
                                ),
                            }
                          : null
                      }
                    />
                  ) : (
                    <table className="w-full text-sm min-w-[850px]">
                      <thead>
                        <tr className="text-left text-[10px] uppercase tracking-[.1em] font-semibold text-[#929BA8] border-b border-[#0F1B2B]/[.07]">
                          <th className="px-5 lg:px-6 py-4">
                            Vehicle
                          </th>

                          <th className="px-3 py-4">
                            Category
                          </th>

                          <th className="px-3 py-4">
                            Location
                          </th>

                          <th className="px-3 py-4">
                            Rate
                          </th>

                          <th className="px-3 py-4">
                            Availability
                          </th>

                          <th className="px-3 py-4 text-right">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredCars.map(
                          (
                            car,
                            index
                          ) => (
                            <tr
                              key={car.id}
                              className="border-b border-[#0F1B2B]/[.045] hover:bg-[#FAFBFC] transition-colors animate-fade-in"
                              style={{
                                animationDelay: `${
                                  index *
                                  30
                                }ms`,
                              }}
                            >
                              <td className="px-5 lg:px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-10 rounded-lg overflow-hidden bg-[#F0F2F4] shrink-0">
                                    {car.images?.[0] ? (
                                      <img
                                        src={
                                          car
                                            .images[0]
                                        }
                                        alt={
                                          car.name
                                        }
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Car
                                          size={
                                            17
                                          }
                                          className="text-[#9AA2AE]"
                                        />
                                      </div>
                                    )}
                                  </div>

                                  <div>
                                    <p className="font-semibold text-[#172235]">
                                      {car.name}
                                    </p>

                                    <div className="flex items-center gap-2 mt-1 text-[10px] text-[#9AA2AE]">
                                      <span>
                                        {
                                          car.seats
                                        }{" "}
                                        seats
                                      </span>

                                      <span>
                                        •
                                      </span>

                                      <span>
                                        {
                                          car.transmission
                                        }
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-3 py-4">
                                <span className="inline-flex px-2.5 py-1 rounded-md bg-[#F4F5F7] text-[10px] font-bold text-[#596577]">
                                  {
                                    car.type
                                  }
                                </span>
                              </td>

                              <td className="px-3 py-4">
                                <div className="flex items-center gap-1.5 text-[#596577]">
                                  <MapPin
                                    size={
                                      13
                                    }
                                  />
                                  <span>
                                    {
                                      car.city
                                    }
                                  </span>
                                </div>
                              </td>

                              <td className="px-3 py-4">
                                <span className="font-display text-lg font-800">
                                  Rs{" "}
                                  {Number(
                                    car.pricePerDay ||
                                      0
                                  ).toLocaleString()}
                                </span>

                                <span className="text-[10px] text-[#9AA2AE] ml-1">
                                  / day
                                </span>
                              </td>

                              <td className="px-3 py-4">
                                <span
                                  className={`
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    px-2.5 py-1.5
                                    rounded-full
                                    text-[10px]
                                    font-bold
                                    ${
                                      car.isAvailable
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-red-50 text-red-700"
                                    }
                                  `}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      car.isAvailable
                                        ? "bg-emerald-500"
                                        : "bg-red-500"
                                    }`}
                                  />

                                  {car.isAvailable
                                    ? "Available"
                                    : "Unavailable"}
                                </span>
                              </td>

                              <td className="px-3 py-4">
                                <div className="flex justify-end">
                                  <button
                                    onClick={() =>
                                      setEditingCar(
                                        car
                                      )
                                    }
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F4F5F7] hover:bg-[#FFC93C] text-[#596577] hover:text-[#0F1B2B] text-[10px] font-bold transition-all"
                                  >
                                    <Pencil
                                      size={
                                        13
                                      }
                                    />
                                    Edit
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            </>
          )}

          {/* =================================================
              CUSTOMERS
          ================================================= */}

          {tab === "customers" && (
            <CustomersTab
              customers={customers}
              onToggleStatus={
                toggleCustomerStatus
              }
            />
          )}

          {/* =================================================
              SETTINGS
          ================================================= */}

          {tab === "settings" && (
            <SettingsTab
              user={user}
              settings={settings}
              onProfileSave={
                updateProfile
              }
              onSettingsSave={async (
                dto
              ) => {
                const { data } =
                  await api.patch(
                    "/settings",
                    dto
                  );

                setSettings(data);
              }}
            />
          )}
        </main>
      </div>

      {/* =====================================================
          ADD CAR
      ===================================================== */}

      {showAddCar && (
        <AddCarModal
          onClose={() =>
            setShowAddCar(false)
          }
          onSuccess={() => {
            setShowAddCar(false);
            fetchData();
          }}
        />
      )}

      {/* =====================================================
          EDIT CAR
      ===================================================== */}

      {editingCar && (
        <EditCarModal
          car={editingCar}
          onClose={() =>
            setEditingCar(null)
          }
          onSuccess={() => {
            setEditingCar(null);
            fetchData();
          }}
          onDeleted={() => {
            setEditingCar(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}) {
  return (
    <div className="py-16 px-6 text-center animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-[#F3F4F6] flex items-center justify-center mx-auto mb-4 text-[#8A94A4]">
        <Icon
          size={23}
          strokeWidth={1.8}
        />
      </div>

      <h3 className="font-display text-2xl font-800">
        {title}
      </h3>

      <p className="text-xs text-[#8A94A4] mt-2 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 inline-flex items-center gap-2 bg-[#FFC93C] text-[#0F1B2B] px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-[#F4BD25] transition-all"
        >
          <Plus size={15} />
          {action.label}
        </button>
      )}
    </div>
  );
}

/* =========================================================
   CUSTOMERS TAB
========================================================= */

function CustomersTab({
  customers,
  onToggleStatus,
}) {
  const [search, setSearch] =
    useState("");

  const filteredCustomers =
    customers.filter((customer) => {
      const query =
        search.trim().toLowerCase();

      if (!query) return true;

      return (
        customer.fullName
          ?.toLowerCase()
          .includes(query) ||
        customer.email
          ?.toLowerCase()
          .includes(query) ||
        customer.phone
          ?.toLowerCase()
          .includes(query)
      );
    });

  return (
    <section className="animate-fade-up">
      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[.16em] text-[#8A94A4] font-semibold mb-2">
            User management
          </p>

          <h2 className="font-display text-4xl sm:text-5xl font-800 leading-none">
            Customers
          </h2>

          <p className="text-xs text-[#7B8492] mt-2">
            Manage registered customers and
            account access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#0F1B2B]/[.07] flex items-center justify-center">
            <Users
              size={17}
              className="text-[#687385]"
            />
          </div>

          <div>
            <p className="font-display text-2xl font-800 leading-none">
              {customers.length}
            </p>

            <p className="text-[10px] text-[#9AA2AE]">
              Total accounts
            </p>
          </div>
        </div>
      </div>

      {/* Card */}

      <div className="bg-white rounded-2xl border border-[#0F1B2B]/[.07] overflow-hidden shadow-[0_2px_12px_rgba(15,27,43,.03)]">
        <div className="px-4 sm:px-6 py-4 border-b border-[#0F1B2B]/[.07] flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
          <div>
            <h3 className="font-display text-2xl font-800">
              Customer directory
            </h3>

            <p className="text-[10px] text-[#9AA2AE] mt-1">
              {filteredCustomers.length}{" "}
              customers shown
            </p>
          </div>

          <div className="flex items-center bg-[#F5F6F8] rounded-xl px-3 h-10 w-full sm:w-64 border border-transparent focus-within:border-[#FFC93C] focus-within:bg-white transition-all">
            <Search
              size={15}
              className="text-[#8A94A4] mr-2"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search customers..."
              className="w-full bg-transparent outline-none text-xs placeholder:text-[#9AA2AE]"
            />
          </div>
        </div>

        <div className="overflow-x-auto dashboard-scrollbar">
          {filteredCustomers.length ===
          0 ? (
            <EmptyState
              icon={Users}
              title="No customers found"
              description={
                search
                  ? "Try a different search term."
                  : "Registered customers will appear here."
              }
            />
          ) : (
            <table className="w-full text-sm min-w-[850px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-[.1em] font-semibold text-[#929BA8] border-b border-[#0F1B2B]/[.07]">
                  <th className="px-5 lg:px-6 py-4">
                    Customer
                  </th>

                  <th className="px-3 py-4">
                    Email
                  </th>

                  <th className="px-3 py-4">
                    Phone
                  </th>

                  <th className="px-3 py-4">
                    Role
                  </th>

                  <th className="px-3 py-4">
                    Status
                  </th>

                  <th className="px-3 py-4 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map(
                  (
                    customer,
                    index
                  ) => (
                    <tr
                      key={customer.id}
                      className="border-b border-[#0F1B2B]/[.045] hover:bg-[#FAFBFC] transition-colors animate-fade-in"
                      style={{
                        animationDelay: `${
                          index * 30
                        }ms`,
                      }}
                    >
                      <td className="px-5 lg:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#F1F3F5] flex items-center justify-center font-display font-800">
                            {customer.fullName?.charAt(
                              0
                            ) ||
                              "?"}
                          </div>

                          <div>
                            <p className="font-semibold">
                              {
                                customer.fullName
                              }
                            </p>

                            <p className="text-[10px] text-[#9AA2AE] mt-0.5">
                              Customer account
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-4 text-[#687385]">
                        {customer.email}
                      </td>

                      <td className="px-3 py-4 text-[#687385]">
                        {customer.phone ||
                          "Not provided"}
                      </td>

                      <td className="px-3 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F4F5F7] text-[10px] font-bold text-[#596577] capitalize">
                          <ShieldCheck
                            size={12}
                          />
                          {
                            customer.role
                          }
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`
                            inline-flex
                            items-center
                            gap-1.5
                            px-2.5 py-1.5
                            rounded-full
                            text-[10px]
                            font-bold
                            ${
                              customer.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }
                          `}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              customer.isActive
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            }`}
                          />

                          {customer.isActive
                            ? "Active"
                            : "Blocked"}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <div className="flex justify-end">
                          {customer.role !==
                            "admin" && (
                            <button
                              onClick={() =>
                                onToggleStatus(
                                  customer.id,
                                  customer.isActive
                                )
                              }
                              className={`
                                flex
                                items-center
                                gap-1.5
                                px-3
                                py-2
                                rounded-lg
                                text-[10px]
                                font-bold
                                transition-all
                                ${
                                  customer.isActive
                                    ? "bg-red-50 text-red-700 hover:bg-red-100"
                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                }
                              `}
                            >
                              {customer.isActive ? (
                                <>
                                  <Ban
                                    size={
                                      13
                                    }
                                  />
                                  Block
                                </>
                              ) : (
                                <>
                                  <CheckCircle2
                                    size={
                                      13
                                    }
                                  />
                                  Unblock
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   SETTINGS TAB
========================================================= */

function SettingsTab({
  user,
  settings,
  onProfileSave,
  onSettingsSave,
}) {
  const [fullName, setFullName] =
    useState(user.fullName);

  const [phone, setPhone] =
    useState(user.phone || "");

  const [profileSaving, setProfileSaving] =
    useState(false);

  const [profileMessage, setProfileMessage] =
    useState("");

  const [driverFeePerDay, setDriverFeePerDay] =
    useState(
      settings?.driverFeePerDay || 1500
    );

  const [insuranceFeePerDay, setInsuranceFeePerDay] =
    useState(
      settings?.insuranceFeePerDay || 800
    );

  const [serviceFee, setServiceFee] =
    useState(
      settings?.serviceFee || 500
    );

  const [feesSaving, setFeesSaving] =
    useState(false);

  const [feesMessage, setFeesMessage] =
    useState("");

  /* ---------------------------------------------------------
     PROFILE
  --------------------------------------------------------- */

  const handleProfileSubmit =
    async (e) => {
      e.preventDefault();

      setProfileSaving(true);
      setProfileMessage("");

      try {
        await onProfileSave(
          fullName,
          phone
        );

        setProfileMessage(
          "Profile updated successfully."
        );
      } catch (err) {
        setProfileMessage(
          "Unable to update profile."
        );
      } finally {
        setProfileSaving(false);
      }
    };

  /* ---------------------------------------------------------
     BUSINESS SETTINGS
  --------------------------------------------------------- */

  const handleFeesSubmit =
    async (e) => {
      e.preventDefault();

      setFeesSaving(true);
      setFeesMessage("");

      try {
        await onSettingsSave({
          driverFeePerDay:
            Number(
              driverFeePerDay
            ),

          insuranceFeePerDay:
            Number(
              insuranceFeePerDay
            ),

          serviceFee:
            Number(serviceFee),
        });

        setFeesMessage(
          "Business settings updated successfully."
        );
      } catch (err) {
        setFeesMessage(
          "Unable to update business settings."
        );
      } finally {
        setFeesSaving(false);
      }
    };

  return (
    <section className="animate-fade-up">
      {/* Page intro */}

      <div className="mb-7">
        <p className="text-[10px] uppercase tracking-[.16em] text-[#8A94A4] font-semibold mb-2">
          Workspace configuration
        </p>

        <h2 className="font-display text-4xl sm:text-5xl font-800 leading-none">
          Settings
        </h2>

        <p className="text-xs text-[#7B8492] mt-2 max-w-xl">
          Manage your administrator profile and
          configure pricing used throughout the
          booking system.
        </p>
      </div>

      <div className="grid xl:grid-cols-2 gap-5 lg:gap-6">
        {/* =================================================
            PROFILE
        ================================================= */}

        <div className="bg-white rounded-2xl border border-[#0F1B2B]/[.07] shadow-[0_2px_12px_rgba(15,27,43,.03)] overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-[#0F1B2B]/[.07]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#FFF7D9] text-[#B78300] flex items-center justify-center">
                <UserRound
                  size={19}
                />
              </div>

              <div>
                <h3 className="font-display text-2xl font-800">
                  My profile
                </h3>

                <p className="text-[10px] text-[#9AA2AE] mt-0.5">
                  Personal administrator details
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={
              handleProfileSubmit
            }
            className="p-5 sm:p-6 space-y-5"
          >
            <ModernInput
              label="Full name"
              value={fullName}
              onChange={(e) =>
                setFullName(
                  e.target.value
                )
              }
              placeholder="Your full name"
            />

            <ModernInput
              label="Email address"
              value={user.email}
              disabled
              hint="Email cannot be changed from this panel."
            />

            <ModernInput
              label="Phone number"
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }
              placeholder="03XX XXXXXXX"
            />

            {profileMessage && (
              <MessageBox
                message={
                  profileMessage
                }
              />
            )}

            <button
              type="submit"
              disabled={
                profileSaving
              }
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0F1B2B] text-white px-5 py-3 rounded-xl text-xs font-bold hover:bg-[#182B43] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {profileSaving
                ? "Saving..."
                : "Save profile"}
            </button>
          </form>
        </div>

        {/* =================================================
            BUSINESS SETTINGS
        ================================================= */}

        <div className="bg-white rounded-2xl border border-[#0F1B2B]/[.07] shadow-[0_2px_12px_rgba(15,27,43,.03)] overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-[#0F1B2B]/[.07]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#F0F5FF] text-blue-600 flex items-center justify-center">
                <CircleDollarSign
                  size={19}
                />
              </div>

              <div>
                <h3 className="font-display text-2xl font-800">
                  Business settings
                </h3>

                <p className="text-[10px] text-[#9AA2AE] mt-0.5">
                  Pricing and booking configuration
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={
              handleFeesSubmit
            }
            className="p-5 sm:p-6 space-y-5"
          >
            <ModernInput
              label="Driver fee"
              suffix="Rs / day"
              type="number"
              min="0"
              value={
                driverFeePerDay
              }
              onChange={(e) =>
                setDriverFeePerDay(
                  e.target.value
                )
              }
            />

            <ModernInput
              label="Insurance fee"
              suffix="Rs / day"
              type="number"
              min="0"
              value={
                insuranceFeePerDay
              }
              onChange={(e) =>
                setInsuranceFeePerDay(
                  e.target.value
                )
              }
            />

            <ModernInput
              label="Service fee"
              suffix="Rs / booking"
              type="number"
              min="0"
              value={serviceFee}
              onChange={(e) =>
                setServiceFee(
                  e.target.value
                )
              }
            />

            <div className="rounded-xl bg-[#F8F9FA] border border-[#0F1B2B]/[.06] p-4 flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                <Clock3
                  size={15}
                  className="text-[#8A94A4]"
                />
              </div>

              <p className="text-[10px] text-[#7B8492] leading-relaxed">
                These fees are automatically used
                when calculating the final booking
                amount.
              </p>
            </div>

            {feesMessage && (
              <MessageBox
                message={feesMessage}
              />
            )}

            <button
              type="submit"
              disabled={
                feesSaving
              }
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FFC93C] text-[#0F1B2B] px-5 py-3 rounded-xl text-xs font-bold hover:bg-[#F4BD25] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {feesSaving
                ? "Saving..."
                : "Save settings"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   MODERN INPUT
========================================================= */

function ModernInput({
  label,
  hint,
  suffix,
  ...props
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <label className="text-[10px] uppercase tracking-[.08em] font-bold text-[#596577]">
          {label}
        </label>

        {suffix && (
          <span className="text-[9px] text-[#9AA2AE]">
            {suffix}
          </span>
        )}
      </div>

      <input
        {...props}
        className={`
          w-full
          h-11
          rounded-xl
          border
          border-[#DDE1E6]
          bg-[#FAFBFC]
          px-3.5
          text-sm
          text-[#172235]
          outline-none
          transition-all
          placeholder:text-[#A6ADB8]
          hover:border-[#C9CED6]
          focus:border-[#FFC93C]
          focus:ring-4
          focus:ring-[#FFC93C]/10
          disabled:bg-[#F0F2F4]
          disabled:text-[#8A94A4]
          disabled:cursor-not-allowed
        `}
      />

      {hint && (
        <p className="text-[9px] text-[#9AA2AE] mt-1.5">
          {hint}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   MESSAGE
========================================================= */

function MessageBox({
  message,
}) {
  return (
    <div className="rounded-xl bg-[#F4F5F7] border border-[#E4E7EB] px-3.5 py-3 text-[10px] text-[#596577]">
      {message}
    </div>
  );
}

/* =========================================================
   ADD CAR MODAL
========================================================= */

function AddCarModal({
  onClose,
  onSuccess,
}) {
  const [form, setForm] =
    useState({
      name: "",
      type: "Sedan",
      city: "",
      pricePerDay: "",
      seats: "",
      fuel: "Petrol",
      transmission:
        "Automatic",
      mileage: "",
      description: "",
    });

  const [featureInput, setFeatureInput] =
    useState("");

  const [features, setFeatures] =
    useState([]);

  const [images, setImages] =
    useState([]);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const update = (key) => (
    e
  ) => {
    setForm((current) => ({
      ...current,
      [key]: e.target.value,
    }));
  };

  const addFeature = () => {
    const trimmed =
      featureInput.trim();

    if (
      trimmed &&
      !features.includes(trimmed)
    ) {
      setFeatures([
        ...features,
        trimmed,
      ]);
    }

    setFeatureInput("");
  };

  const removeFeature = (
    feature
  ) => {
    setFeatures(
      features.filter(
        (item) =>
          item !== feature
      )
    );
  };

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    setError("");

    if (
      !form.name ||
      !form.city ||
      !form.pricePerDay ||
      !form.seats
    ) {
      setError(
        "Please complete all required fields: car name, city, price and seats."
      );

      return;
    }

    setLoading(true);

    try {
      const formData =
        new FormData();

      Object.entries(form).forEach(
        ([key, value]) => {
          if (value !== "") {
            formData.append(
              key,
              value
            );
          }
        }
      );

      features.forEach(
        (feature) => {
          formData.append(
            "features",
            feature
          );
        }
      );

      images.forEach((image) => {
        formData.append(
          "images",
          image
        );
      });

      await api.post(
        "/cars",
        formData
      );

      onSuccess();
    } catch (err) {
      const message =
        err.response?.data
          ?.message ||
        "Unable to add the car.";

      setError(
        Array.isArray(message)
          ? message[0]
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5">
      {/* Overlay */}

      <div
        className="absolute inset-0 bg-[#07111F]/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}

      <div className="relative w-full max-w-3xl max-h-[94vh] overflow-hidden bg-white rounded-2xl sm:rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,.3)] animate-scale-in flex flex-col">
        {/* Header */}

        <div className="px-5 sm:px-7 py-5 border-b border-[#0F1B2B]/[.07] flex items-center justify-between shrink-0">
          <div>
            <p className="text-[9px] uppercase tracking-[.16em] text-[#8A94A4] font-bold mb-1">
              Fleet management
            </p>

            <h2 className="font-display text-3xl sm:text-4xl font-800 leading-none">
              Add new car
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-[#F3F4F6] hover:bg-[#E7E9EC] flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}

        <div className="overflow-y-auto dashboard-scrollbar p-5 sm:p-7">
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs font-medium">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Basic */}

            <div>
              <SectionTitle
                number="01"
                title="Basic information"
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <ModernInput
                  label="Car name *"
                  value={form.name}
                  onChange={update(
                    "name"
                  )}
                  placeholder="Toyota Corolla Altis"
                />

                <ModernInput
                  label="City *"
                  value={form.city}
                  onChange={update(
                    "city"
                  )}
                  placeholder="Islamabad"
                />
              </div>
            </div>

            {/* Specifications */}

            <div>
              <SectionTitle
                number="02"
                title="Specifications"
              />

              <div className="grid sm:grid-cols-3 gap-4">
                <ModernSelect
                  label="Type"
                  value={form.type}
                  onChange={update(
                    "type"
                  )}
                  options={
                    carTypes
                  }
                />

                <ModernSelect
                  label="Fuel"
                  value={form.fuel}
                  onChange={update(
                    "fuel"
                  )}
                  options={
                    fuelTypes
                  }
                />

                <ModernSelect
                  label="Transmission"
                  value={
                    form.transmission
                  }
                  onChange={update(
                    "transmission"
                  )}
                  options={
                    transmissionTypes
                  }
                />
              </div>
            </div>

            {/* Pricing */}

            <div>
              <SectionTitle
                number="03"
                title="Pricing & capacity"
              />

              <div className="grid sm:grid-cols-3 gap-4">
                <ModernInput
                  label="Price / day *"
                  type="number"
                  min="0"
                  value={
                    form.pricePerDay
                  }
                  onChange={update(
                    "pricePerDay"
                  )}
                  placeholder="6500"
                />

                <ModernInput
                  label="Seats *"
                  type="number"
                  min="1"
                  value={form.seats}
                  onChange={update(
                    "seats"
                  )}
                  placeholder="5"
                />

                <ModernInput
                  label="Mileage"
                  value={
                    form.mileage
                  }
                  onChange={update(
                    "mileage"
                  )}
                  placeholder="15 km/l"
                />
              </div>
            </div>

            {/* Description */}

            <div>
              <SectionTitle
                number="04"
                title="Description"
              />

              <textarea
                value={
                  form.description
                }
                onChange={update(
                  "description"
                )}
                rows={4}
                placeholder="Describe the vehicle, its condition and what makes it a great rental choice..."
                className="w-full rounded-xl border border-[#DDE1E6] bg-[#FAFBFC] px-3.5 py-3 text-sm outline-none transition-all placeholder:text-[#A6ADB8] hover:border-[#C9CED6] focus:border-[#FFC93C] focus:ring-4 focus:ring-[#FFC93C]/10 resize-none"
              />
            </div>

            {/* Features */}

            <div>
              <SectionTitle
                number="05"
                title="Features"
              />

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={
                    featureInput
                  }
                  onChange={(e) =>
                    setFeatureInput(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key ===
                      "Enter"
                    ) {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                  placeholder="Air conditioning, GPS, Bluetooth..."
                  className="flex-1 h-11 rounded-xl border border-[#DDE1E6] bg-[#FAFBFC] px-3.5 text-sm outline-none focus:border-[#FFC93C] focus:ring-4 focus:ring-[#FFC93C]/10"
                />

                <button
                  type="button"
                  onClick={
                    addFeature
                  }
                  className="h-11 px-5 rounded-xl bg-[#0F1B2B] text-white text-xs font-bold hover:bg-[#182B43] transition-colors"
                >
                  Add feature
                </button>
              </div>

              {features.length >
                0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {features.map(
                    (
                      feature
                    ) => (
                      <span
                        key={
                          feature
                        }
                        className="inline-flex items-center gap-2 bg-[#FFF7D9] text-[#765800] px-3 py-1.5 rounded-lg text-[10px] font-bold"
                      >
                        {
                          feature
                        }

                        <button
                          type="button"
                          onClick={() =>
                            removeFeature(
                              feature
                            )
                          }
                          className="hover:text-red-600"
                        >
                          <X
                            size={
                              12
                            }
                          />
                        </button>
                      </span>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Images */}

            <div>
              <SectionTitle
                number="06"
                title="Vehicle images"
              />

              <label className="block rounded-2xl border-2 border-dashed border-[#DDE1E6] bg-[#FAFBFC] hover:border-[#FFC93C] transition-colors cursor-pointer p-6 text-center">
                <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center mx-auto mb-3">
                  <Car
                    size={19}
                    className="text-[#8A94A4]"
                  />
                </div>

                <p className="text-xs font-bold text-[#374151]">
                  Choose vehicle images
                </p>

                <p className="text-[10px] text-[#9AA2AE] mt-1">
                  JPG, PNG or WEBP • Up to 6 images
                </p>

                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) =>
                    setImages(
                      Array.from(
                        e.target.files
                      ).slice(
                        0,
                        6
                      )
                    )
                  }
                  className="hidden"
                />
              </label>

              {images.length >
                0 && (
                <div className="mt-3 flex items-center gap-2">
                  <CheckCircle2
                    size={15}
                    className="text-emerald-600"
                  />

                  <p className="text-[10px] text-[#687385]">
                    {images.length}{" "}
                    image
                    {images.length >
                    1
                      ? "s"
                      : ""}{" "}
                    selected
                  </p>
                </div>
              )}
            </div>

            {/* Submit */}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-[#FFC93C] text-[#0F1B2B] font-display text-xl font-800 hover:bg-[#F4BD25] hover:-translate-y-0.5 transition-all shadow-sm disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {loading
                  ? "Adding vehicle..."
                  : "Add vehicle to fleet"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MODERN SELECT
========================================================= */

function ModernSelect({
  label,
  options,
  ...props
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[.08em] font-bold text-[#596577] block mb-2">
        {label}
      </label>

      <select
        {...props}
        className="w-full h-11 rounded-xl border border-[#DDE1E6] bg-[#FAFBFC] px-3.5 text-sm text-[#172235] outline-none transition-all hover:border-[#C9CED6] focus:border-[#FFC93C] focus:ring-4 focus:ring-[#FFC93C]/10"
      >
        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          )
        )}
      </select>
    </div>
  );
}

/* =========================================================
   MODAL SECTION TITLE
========================================================= */

function SectionTitle({
  number,
  title,
}) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="font-display text-sm font-800 text-[#C0C6CF]">
        {number}
      </span>

      <div className="h-px flex-1 bg-[#E8EAED]" />

      <span className="text-[10px] uppercase tracking-[.12em] font-bold text-[#596577]">
        {title}
      </span>
    </div>
  );
}