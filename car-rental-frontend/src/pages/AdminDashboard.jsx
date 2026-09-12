import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Car, CalendarCheck, Users, Settings, LogOut,
  TrendingUp, DollarSign, Star, Menu, X, Plus, Ban, CheckCircle2, Pencil
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import EditCarModal from "../components/EditCarModal";

const fonts = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    .font-display { font-family: 'Big Shoulders Display', sans-serif; }
    .font-body { font-family: 'Inter', sans-serif; }
  `}</style>
);

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", tab: "bookings" },
  { icon: Car, label: "Fleet", tab: "fleet" },
  { icon: CalendarCheck, label: "Bookings", tab: "bookings" },
  { icon: Users, label: "Customers", tab: "customers" },
  { icon: Settings, label: "Settings", tab: "settings" },
];

const statusColor = {
  Pending: "bg-[#FFC93C]/20 text-[#0F1B2B]",
  Active: "bg-[#FFC93C]/20 text-[#0F1B2B]",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const bookingStatuses = ["Pending", "Active", "Completed", "Cancelled"];
const carTypes = ["Sedan", "SUV", "Hatchback", "Luxury"];
const fuelTypes = ["Petrol", "Diesel", "Hybrid", "Electric"];
const transmissionTypes = ["Automatic", "Manual"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading, updateProfile } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState("bookings");

  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [showAddCar, setShowAddCar] = useState(false);
  const [editingCar, setEditingCar] = useState(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [carsRes, bookingsRes, customersRes, settingsRes] = await Promise.all([
        api.get("/cars", { params: { limit: 100, includeUnavailable: "true" } }),
        api.get("/bookings"),
        api.get("/users"),
        api.get("/settings"),
      ]);
      setCars(carsRes.data.data || []);
      setBookings(bookingsRes.data || []);
      setCustomers(customersRes.data || []);
      setSettings(settingsRes.data);
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoadingData(false);
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    } catch (err) {
      alert("Status update nahi ho saka");
    }
  };

  const toggleCustomerStatus = async (id, currentActive) => {
    try {
      const { data } = await api.patch(`/users/${id}/status`, { isActive: !currentActive });
      setCustomers((prev) => prev.map((c) => (c.id === id ? data : c)));
    } catch (err) {
      alert("Customer status update nahi ho saka");
    }
  };

  const stats = [
    {
      label: "Total revenue",
      value: `Rs ${bookings.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0).toLocaleString()}`,
      icon: DollarSign,
    },
    {
      label: "Active bookings",
      value: bookings.filter((b) => b.status === "Active").length,
      icon: CalendarCheck,
    },
    { label: "Fleet size", value: `${cars.length} cars`, icon: Car },
    {
      label: "Avg. rating",
      value: cars.length
        ? (cars.reduce((sum, c) => sum + Number(c.rating || 0), 0) / cars.length).toFixed(1)
        : "0.0",
      icon: Star,
    },
  ];

  if (authLoading || (user?.role === "admin" && loadingData)) {
    return (
      <div className="font-body bg-[#EDEEF0] min-h-screen flex items-center justify-center">
        {fonts}
        <p className="font-display text-2xl font-700 text-[#0F1B2B]">Loading dashboard...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="font-body bg-[#EDEEF0] text-[#0F1B2B] min-h-screen flex">
      {fonts}

      {sidebarOpen && (
        <div className="fixed inset-0 bg-[#0F1B2B]/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:sticky top-0 h-screen w-64 bg-[#0F1B2B] text-white flex flex-col z-50 transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-6 py-6">
          <div className="font-display text-2xl font-800 tracking-tight">
            DRIVE<span className="text-[#FFC93C]">HUB</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-4 flex flex-col gap-1 mt-4">
          {navItems.map((item, i) => (
            <button
              key={i}
              onClick={() => { setTab(item.tab); setSidebarOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-colors ${tab === item.tab ? "bg-[#FFC93C] text-[#0F1B2B] font-semibold" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-4 pb-6">
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors w-full"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="flex items-center justify-between px-6 md:px-10 py-5 bg-white border-b border-[#0F1B2B]/10 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu size={22} />
            </button>
            <div>
              <h1 className="font-display text-2xl font-800 leading-none">Dashboard</h1>
              <p className="text-xs text-[#445064] mt-1">Welcome back, {user.fullName.split(" ")[0]}</p>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#FFC93C] flex items-center justify-center font-display font-700 text-sm">
            {user.fullName.charAt(0)}
          </div>
        </header>

        <div className="px-6 md:px-10 py-8">
          {(tab === "bookings" || tab === "fleet") && (
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
              {stats.map((s, i) => (
                <div key={i} className="bg-white border border-[#0F1B2B]/10 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-[#EDEEF0] flex items-center justify-center">
                      <s.icon size={18} className="text-[#0F1B2B]" />
                    </div>
                  </div>
                  <p className="font-display text-3xl font-800 mb-1">{s.value}</p>
                  <p className="text-xs text-[#445064]">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {(tab === "bookings" || tab === "fleet") && (
            <div className="bg-white border border-[#0F1B2B]/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 md:px-6 py-5 border-b border-[#0F1B2B]/10">
                <div className="flex gap-2">
                  <button
                    onClick={() => setTab("bookings")}
                    className={`text-sm font-semibold px-4 py-2 transition-colors ${tab === "bookings" ? "bg-[#0F1B2B] text-white" : "text-[#445064] hover:text-[#0F1B2B]"}`}
                  >
                    Bookings ({bookings.length})
                  </button>
                  <button
                    onClick={() => setTab("fleet")}
                    className={`text-sm font-semibold px-4 py-2 transition-colors ${tab === "fleet" ? "bg-[#0F1B2B] text-white" : "text-[#445064] hover:text-[#0F1B2B]"}`}
                  >
                    Fleet ({cars.length})
                  </button>
                </div>
                {tab === "fleet" && (
                  <button
                    onClick={() => setShowAddCar(true)}
                    className="flex items-center justify-center gap-2 bg-[#FFC93C] text-[#0F1B2B] text-sm font-semibold px-4 py-2.5 hover:bg-[#f5bd28] transition-colors"
                  >
                    <Plus size={16} /> Add new car
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                {tab === "bookings" ? (
                  bookings.length === 0 ? (
                    <p className="text-sm text-[#445064] p-8 text-center">Abhi tak koi booking nahi hui.</p>
                  ) : (
                    <table className="w-full text-sm min-w-[720px]">
                      <thead>
                        <tr className="text-left text-xs font-semibold text-[#445064] border-b border-[#0F1B2B]/10">
                          <th className="px-5 md:px-6 py-3">Customer</th>
                          <th className="px-3 py-3">Car</th>
                          <th className="px-3 py-3">Dates</th>
                          <th className="px-3 py-3">Amount</th>
                          <th className="px-3 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((b) => (
                          <tr key={b.id} className="border-b border-[#0F1B2B]/5 hover:bg-[#EDEEF0]/50 transition-colors">
                            <td className="px-5 md:px-6 py-4 font-semibold">{b.user?.fullName || "—"}</td>
                            <td className="px-3 py-4 text-[#445064]">{b.car?.name || "—"}</td>
                            <td className="px-3 py-4 text-[#445064] whitespace-nowrap">{b.pickupDate} → {b.dropoffDate}</td>
                            <td className="px-3 py-4 font-semibold whitespace-nowrap">Rs {Number(b.totalAmount).toLocaleString()}</td>
                            <td className="px-3 py-4">
                              <select
                                value={b.status}
                                onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                                className={`text-xs font-semibold px-2 py-1 border-0 cursor-pointer ${statusColor[b.status]}`}
                              >
                                {bookingStatuses.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                ) : cars.length === 0 ? (
                  <p className="text-sm text-[#445064] p-8 text-center">Abhi tak koi car add nahi hui — "Add new car" se shuru karein.</p>
                ) : (
                  <table className="w-full text-sm min-w-[640px]">
                    <thead>
                      <tr className="text-left text-xs font-semibold text-[#445064] border-b border-[#0F1B2B]/10">
                        <th className="px-5 md:px-6 py-3">Car</th>
                        <th className="px-3 py-3">Type</th>
                        <th className="px-3 py-3">City</th>
                        <th className="px-3 py-3">Price/day</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cars.map((c) => (
                        <tr key={c.id} className="border-b border-[#0F1B2B]/5 hover:bg-[#EDEEF0]/50 transition-colors">
                          <td className="px-5 md:px-6 py-4 font-semibold">{c.name}</td>
                          <td className="px-3 py-4 text-[#445064]">{c.type}</td>
                          <td className="px-3 py-4 text-[#445064]">{c.city}</td>
                          <td className="px-3 py-4 font-semibold whitespace-nowrap">Rs {Number(c.pricePerDay).toLocaleString()}</td>
                          <td className="px-3 py-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 ${c.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {c.isAvailable ? "Available" : "Unavailable"}
                            </span>
                          </td>
                          <td className="px-3 py-4">
                            <button
                              onClick={() => setEditingCar(c)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-[#445064] hover:text-[#0F1B2B]"
                            >
                              <Pencil size={13} /> Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {tab === "customers" && (
            <CustomersTab customers={customers} onToggleStatus={toggleCustomerStatus} />
          )}

          {tab === "settings" && (
            <SettingsTab
              user={user}
              settings={settings}
              onProfileSave={updateProfile}
              onSettingsSave={async (dto) => {
                const { data } = await api.patch("/settings", dto);
                setSettings(data);
              }}
            />
          )}
        </div>
      </div>

      {showAddCar && (
        <AddCarModal
          onClose={() => setShowAddCar(false)}
          onSuccess={() => {
            setShowAddCar(false);
            fetchData();
          }}
        />
      )}

      {editingCar && (
        <EditCarModal
          car={editingCar}
          onClose={() => setEditingCar(null)}
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

function CustomersTab({ customers, onToggleStatus }) {
  return (
    <div className="bg-white border border-[#0F1B2B]/10">
      <div className="px-5 md:px-6 py-5 border-b border-[#0F1B2B]/10">
        <h2 className="font-display text-xl font-700">Customers ({customers.length})</h2>
      </div>
      <div className="overflow-x-auto">
        {customers.length === 0 ? (
          <p className="text-sm text-[#445064] p-8 text-center">Abhi tak koi customer register nahi hua.</p>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-xs font-semibold text-[#445064] border-b border-[#0F1B2B]/10">
                <th className="px-5 md:px-6 py-3">Name</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Phone</th>
                <th className="px-3 py-3">Role</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-[#0F1B2B]/5 hover:bg-[#EDEEF0]/50 transition-colors">
                  <td className="px-5 md:px-6 py-4 font-semibold">{c.fullName}</td>
                  <td className="px-3 py-4 text-[#445064]">{c.email}</td>
                  <td className="px-3 py-4 text-[#445064]">{c.phone}</td>
                  <td className="px-3 py-4">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-[#EDEEF0] capitalize">{c.role}</span>
                  </td>
                  <td className="px-3 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 ${c.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {c.isActive ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    {c.role !== "admin" && (
                      <button
                        onClick={() => onToggleStatus(c.id, c.isActive)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 ${c.isActive ? "bg-red-50 text-red-700 hover:bg-red-100" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
                      >
                        {c.isActive ? <><Ban size={13} /> Block</> : <><CheckCircle2 size={13} /> Unblock</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function SettingsTab({ user, settings, onProfileSave, onSettingsSave }) {
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const [driverFeePerDay, setDriverFeePerDay] = useState(settings?.driverFeePerDay || 1500);
  const [insuranceFeePerDay, setInsuranceFeePerDay] = useState(settings?.insuranceFeePerDay || 800);
  const [serviceFee, setServiceFee] = useState(settings?.serviceFee || 500);
  const [feesSaving, setFeesSaving] = useState(false);
  const [feesMessage, setFeesMessage] = useState("");

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage("");
    try {
      await onProfileSave(fullName, phone);
      setProfileMessage("Profile update ho gaya.");
    } catch (err) {
      setProfileMessage("Profile update nahi ho saka.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleFeesSubmit = async (e) => {
    e.preventDefault();
    setFeesSaving(true);
    setFeesMessage("");
    try {
      await onSettingsSave({
        driverFeePerDay: Number(driverFeePerDay),
        insuranceFeePerDay: Number(insuranceFeePerDay),
        serviceFee: Number(serviceFee),
      });
      setFeesMessage("Business settings update ho gayi.");
    } catch (err) {
      setFeesMessage("Settings update nahi ho saki.");
    } finally {
      setFeesSaving(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* My Profile */}
      <div className="bg-white border border-[#0F1B2B]/10 p-6">
        <h2 className="font-display text-xl font-700 mb-1">My profile</h2>
        <p className="text-xs text-[#445064] mb-5">Apna naam aur phone number update karein.</p>
        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-[#445064] mb-1.5 block">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-[#0F1B2B]/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC93C]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#445064] mb-1.5 block">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full border border-[#0F1B2B]/10 bg-[#EDEEF0] px-3 py-2 text-sm text-[#445064] cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#445064] mb-1.5 block">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-[#0F1B2B]/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC93C]"
            />
          </div>
          {profileMessage && <p className="text-xs text-[#445064]">{profileMessage}</p>}
          <button
            type="submit"
            disabled={profileSaving}
            className="bg-[#0F1B2B] text-white text-sm font-semibold px-5 py-2.5 hover:bg-[#1a2c44] transition-colors disabled:opacity-50 self-start"
          >
            {profileSaving ? "Saving..." : "Save profile"}
          </button>
        </form>
      </div>

      {/* Business Settings */}
      <div className="bg-white border border-[#0F1B2B]/10 p-6">
        <h2 className="font-display text-xl font-700 mb-1">Business settings</h2>
        <p className="text-xs text-[#445064] mb-5">Ye rates har booking ki price calculation mein use hote hain.</p>
        <form onSubmit={handleFeesSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-[#445064] mb-1.5 block">Driver fee (Rs / day)</label>
            <input
              type="number"
              min="0"
              value={driverFeePerDay}
              onChange={(e) => setDriverFeePerDay(e.target.value)}
              className="w-full border border-[#0F1B2B]/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC93C]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#445064] mb-1.5 block">Insurance fee (Rs / day)</label>
            <input
              type="number"
              min="0"
              value={insuranceFeePerDay}
              onChange={(e) => setInsuranceFeePerDay(e.target.value)}
              className="w-full border border-[#0F1B2B]/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC93C]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#445064] mb-1.5 block">Service fee (Rs, flat)</label>
            <input
              type="number"
              min="0"
              value={serviceFee}
              onChange={(e) => setServiceFee(e.target.value)}
              className="w-full border border-[#0F1B2B]/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC93C]"
            />
          </div>
          {feesMessage && <p className="text-xs text-[#445064]">{feesMessage}</p>}
          <button
            type="submit"
            disabled={feesSaving}
            className="bg-[#FFC93C] text-[#0F1B2B] text-sm font-semibold px-5 py-2.5 hover:bg-[#f5bd28] transition-colors disabled:opacity-50 self-start"
          >
            {feesSaving ? "Saving..." : "Save settings"}
          </button>
        </form>
      </div>
    </div>
  );
}

function AddCarModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    type: "Sedan",
    city: "",
    pricePerDay: "",
    seats: "",
    fuel: "Petrol",
    transmission: "Automatic",
    mileage: "",
    description: "",
  });
  const [featureInput, setFeatureInput] = useState("");
  const [features, setFeatures] = useState([]);
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const addFeature = () => {
    const trimmed = featureInput.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures([...features, trimmed]);
    }
    setFeatureInput("");
  };

  const removeFeature = (f) => setFeatures(features.filter((x) => x !== f));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.city || !form.pricePerDay || !form.seats) {
      setError("Zaroori fields bharein: name, city, price, seats.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== "") formData.append(key, value);
      });
      features.forEach((f) => formData.append("features", f));
      images.forEach((img) => formData.append("images", img));

      await api.post("/cars", formData);
      onSuccess();
    } catch (err) {
      const message = err.response?.data?.message || "Car add nahi ho saki.";
      setError(Array.isArray(message) ? message[0] : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0F1B2B]/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-700">Add new car</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#445064] mb-1.5 block">Car name *</label>
              <input
                type="text"
                value={form.name}
                onChange={update("name")}
                placeholder="Toyota Corolla Altis"
                className="w-full border border-[#0F1B2B]/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC93C]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#445064] mb-1.5 block">City *</label>
              <input
                type="text"
                value={form.city}
                onChange={update("city")}
                placeholder="Islamabad"
                className="w-full border border-[#0F1B2B]/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC93C]"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#445064] mb-1.5 block">Type</label>
              <select value={form.type} onChange={update("type")} className="w-full border border-[#0F1B2B]/20 px-3 py-2 text-sm bg-white">
                {carTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#445064] mb-1.5 block">Fuel</label>
              <select value={form.fuel} onChange={update("fuel")} className="w-full border border-[#0F1B2B]/20 px-3 py-2 text-sm bg-white">
                {fuelTypes.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#445064] mb-1.5 block">Transmission</label>
              <select value={form.transmission} onChange={update("transmission")} className="w-full border border-[#0F1B2B]/20 px-3 py-2 text-sm bg-white">
                {transmissionTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#445064] mb-1.5 block">Price/day (Rs) *</label>
              <input
                type="number"
                min="0"
                value={form.pricePerDay}
                onChange={update("pricePerDay")}
                placeholder="6500"
                className="w-full border border-[#0F1B2B]/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC93C]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#445064] mb-1.5 block">Seats *</label>
              <input
                type="number"
                min="1"
                value={form.seats}
                onChange={update("seats")}
                placeholder="5"
                className="w-full border border-[#0F1B2B]/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC93C]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#445064] mb-1.5 block">Mileage</label>
              <input
                type="text"
                value={form.mileage}
                onChange={update("mileage")}
                placeholder="15 km/l"
                className="w-full border border-[#0F1B2B]/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC93C]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#445064] mb-1.5 block">Description</label>
            <textarea
              value={form.description}
              onChange={update("description")}
              rows={3}
              placeholder="Spacious sedan, perfect for city drives..."
              className="w-full border border-[#0F1B2B]/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC93C]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#445064] mb-1.5 block">Features</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                placeholder="e.g. Air conditioning — Enter dabayen"
                className="flex-1 border border-[#0F1B2B]/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC93C]"
              />
              <button type="button" onClick={addFeature} className="bg-[#0F1B2B] text-white px-4 text-sm font-semibold">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {features.map((f) => (
                <span key={f} className="flex items-center gap-1.5 bg-[#EDEEF0] text-xs font-semibold px-2.5 py-1.5">
                  {f}
                  <button type="button" onClick={() => removeFeature(f)}><X size={12} /></button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#445064] mb-1.5 block">Images (up to 6)</label>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setImages(Array.from(e.target.files).slice(0, 6))}
              className="w-full border border-[#0F1B2B]/20 px-3 py-2 text-sm bg-white file:mr-3 file:border-0 file:bg-[#0F1B2B] file:text-white file:px-3 file:py-1.5 file:text-xs file:font-semibold"
            />
            {images.length > 0 && (
              <p className="text-xs text-[#445064] mt-1">{images.length} image(s) selected</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFC93C] text-[#0F1B2B] font-display font-700 text-lg py-3 mt-2 hover:bg-[#f5bd28] transition-colors disabled:opacity-50"
          >
            {loading ? "Adding car..." : "Add car"}
          </button>
        </form>
      </div>
    </div>
  );
}