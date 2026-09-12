import React, { useState } from "react";
import { X, Trash2 } from "lucide-react";
import api from "../services/api";

const carTypes = ["Sedan", "SUV", "Hatchback", "Luxury"];
const fuelTypes = ["Petrol", "Diesel", "Hybrid", "Electric"];
const transmissionTypes = ["Automatic", "Manual"];

export default function EditCarModal({ car, onClose, onSuccess, onDeleted }) {
  const [form, setForm] = useState({
    name: car.name || "",
    type: car.type || "Sedan",
    city: car.city || "",
    pricePerDay: car.pricePerDay || "",
    seats: car.seats || "",
    fuel: car.fuel || "Petrol",
    transmission: car.transmission || "Automatic",
    mileage: car.mileage || "",
    description: car.description || "",
  });
  const [isAvailable, setIsAvailable] = useState(car.isAvailable);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.patch(`/cars/${car.id}`, form);
      if (isAvailable !== car.isAvailable) {
        await api.patch(`/cars/${car.id}/availability`, { isAvailable });
      }
      onSuccess();
    } catch (err) {
      const message = err.response?.data?.message || "Update nahi ho saka.";
      setError(Array.isArray(message) ? message[0] : message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`"${car.name}" ko permanently delete karna hai?`)) return;
    setDeleting(true);
    try {
      await api.delete(`/cars/${car.id}`);
      onDeleted();
    } catch (err) {
      setError("Delete nahi ho saka.");
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0F1B2B]/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-700">Edit car</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#445064] mb-1.5 block">Car name</label>
              <input
                type="text"
                value={form.name}
                onChange={update("name")}
                className="w-full border border-[#0F1B2B]/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC93C]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#445064] mb-1.5 block">City</label>
              <input
                type="text"
                value={form.city}
                onChange={update("city")}
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
              <label className="text-xs font-semibold text-[#445064] mb-1.5 block">Price/day (Rs)</label>
              <input
                type="number"
                min="0"
                value={form.pricePerDay}
                onChange={update("pricePerDay")}
                className="w-full border border-[#0F1B2B]/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC93C]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#445064] mb-1.5 block">Seats</label>
              <input
                type="number"
                min="1"
                value={form.seats}
                onChange={update("seats")}
                className="w-full border border-[#0F1B2B]/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC93C]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#445064] mb-1.5 block">Mileage</label>
              <input
                type="text"
                value={form.mileage}
                onChange={update("mileage")}
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
              className="w-full border border-[#0F1B2B]/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC93C]"
            />
          </div>

          <label className="flex items-center justify-between bg-[#EDEEF0] px-4 py-3 cursor-pointer">
            <span className="text-sm font-semibold">Available for booking</span>
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="accent-[#FFC93C] w-5 h-5"
            />
          </label>

          <div className="flex items-center justify-between gap-3 mt-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2.5 disabled:opacity-50"
            >
              <Trash2 size={15} /> {deleting ? "Deleting..." : "Delete car"}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#FFC93C] text-[#0F1B2B] font-display font-700 text-lg px-8 py-2.5 hover:bg-[#f5bd28] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}