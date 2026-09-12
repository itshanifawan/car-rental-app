import React, { useState } from "react";
import { X, Trash2, Save, CarFront, AlertTriangle } from "lucide-react";
import api from "../services/api";

const carTypes = ["Sedan", "SUV", "Hatchback", "Luxury"];
const fuelTypes = ["Petrol", "Diesel", "Hybrid", "Electric"];
const transmissionTypes = ["Automatic", "Manual"];

export default function EditCarModal({
  car,
  onClose,
  onSuccess,
  onDeleted,
}) {
  const [form, setForm] = useState({
    name: car.name || "",
    type: car.type || "Sedan",
    city: car.city || "",
    pricePerDay: car.pricePerDay ?? "",
    seats: car.seats ?? "",
    fuel: car.fuel || "Petrol",
    transmission: car.transmission || "Automatic",
    mileage: car.mileage || "",
    description: car.description || "",
  });

  const [isAvailable, setIsAvailable] = useState(
    Boolean(car.isAvailable)
  );

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const update = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Car name required hai.");
      return;
    }

    if (!form.city.trim()) {
      setError("City required hai.");
      return;
    }

    if (!form.pricePerDay || Number(form.pricePerDay) <= 0) {
      setError("Price/day valid honi chahiye.");
      return;
    }

    if (!form.seats || Number(form.seats) <= 0) {
      setError("Seats ki valid value enter karein.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        city: form.city.trim(),
        pricePerDay: Number(form.pricePerDay),
        seats: Number(form.seats),
      };

      await api.patch(`/cars/${car.id}`, payload);

      if (isAvailable !== Boolean(car.isAvailable)) {
        await api.patch(`/cars/${car.id}/availability`, {
          isAvailable,
        });
      }

      onSuccess();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Update nahi ho saka.";

      setError(
        Array.isArray(message)
          ? message[0]
          : message
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `"${car.name}" ko permanently delete karna hai?`
      )
    ) {
      return;
    }

    setError("");
    setDeleting(true);

    try {
      await api.delete(`/cars/${car.id}`);
      onDeleted();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Delete nahi ho saka.";

      setError(
        Array.isArray(message)
          ? message[0]
          : message
      );

      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-[#0F1B2B]/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative bg-white w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-[8px_8px_0_#0F1B2B]">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-[#0F1B2B]/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFC93C] flex items-center justify-center">
              <CarFront size={20} className="text-[#0F1B2B]" />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#445064]">
                Fleet management
              </p>

              <h2 className="font-display text-2xl md:text-3xl font-700 leading-none">
                Edit car
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving || deleting}
            className="w-9 h-9 flex items-center justify-center hover:bg-[#EDEEF0] transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="overflow-y-auto max-h-[calc(92vh-78px)]">
          <form
            onSubmit={handleSave}
            className="p-6 md:p-8"
          >
            {/* ERROR */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-5">
                <AlertTriangle
                  size={17}
                  className="shrink-0 mt-0.5"
                />

                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-5">
              {/* BASIC INFORMATION */}
              <div>
                <h3 className="font-display text-lg font-700 mb-3">
                  Basic information
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* NAME */}
                  <div>
                    <label className="text-xs font-semibold text-[#445064] mb-1.5 block">
                      Car name
                    </label>

                    <input
                      type="text"
                      value={form.name}
                      onChange={update("name")}
                      placeholder="e.g. Toyota Corolla"
                      disabled={saving || deleting}
                      className="w-full border border-[#0F1B2B]/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC93C] disabled:bg-[#F5F5F5]"
                    />
                  </div>

                  {/* CITY */}
                  <div>
                    <label className="text-xs font-semibold text-[#445064] mb-1.5 block">
                      City
                    </label>

                    <input
                      type="text"
                      value={form.city}
                      onChange={update("city")}
                      placeholder="e.g. Islamabad"
                      disabled={saving || deleting}
                      className="w-full border border-[#0F1B2B]/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC93C] disabled:bg-[#F5F5F5]"
                    />
                  </div>
                </div>
              </div>

              {/* CAR SPECIFICATIONS */}
              <div>
                <h3 className="font-display text-lg font-700 mb-3">
                  Specifications
                </h3>

                <div className="grid sm:grid-cols-3 gap-4">
                  {/* TYPE */}
                  <div>
                    <label className="text-xs font-semibold text-[#445064] mb-1.5 block">
                      Type
                    </label>

                    <select
                      value={form.type}
                      onChange={update("type")}
                      disabled={saving || deleting}
                      className="w-full border border-[#0F1B2B]/20 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFC93C] disabled:bg-[#F5F5F5]"
                    >
                      {carTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* FUEL */}
                  <div>
                    <label className="text-xs font-semibold text-[#445064] mb-1.5 block">
                      Fuel
                    </label>

                    <select
                      value={form.fuel}
                      onChange={update("fuel")}
                      disabled={saving || deleting}
                      className="w-full border border-[#0F1B2B]/20 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFC93C] disabled:bg-[#F5F5F5]"
                    >
                      {fuelTypes.map((fuel) => (
                        <option key={fuel} value={fuel}>
                          {fuel}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* TRANSMISSION */}
                  <div>
                    <label className="text-xs font-semibold text-[#445064] mb-1.5 block">
                      Transmission
                    </label>

                    <select
                      value={form.transmission}
                      onChange={update("transmission")}
                      disabled={saving || deleting}
                      className="w-full border border-[#0F1B2B]/20 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFC93C] disabled:bg-[#F5F5F5]"
                    >
                      {transmissionTypes.map((transmission) => (
                        <option
                          key={transmission}
                          value={transmission}
                        >
                          {transmission}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* PRICING */}
              <div>
                <h3 className="font-display text-lg font-700 mb-3">
                  Pricing & capacity
                </h3>

                <div className="grid sm:grid-cols-3 gap-4">
                  {/* PRICE */}
                  <div>
                    <label className="text-xs font-semibold text-[#445064] mb-1.5 block">
                      Price/day (Rs)
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={form.pricePerDay}
                      onChange={update("pricePerDay")}
                      placeholder="5000"
                      disabled={saving || deleting}
                      className="w-full border border-[#0F1B2B]/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC93C] disabled:bg-[#F5F5F5]"
                    />
                  </div>

                  {/* SEATS */}
                  <div>
                    <label className="text-xs font-semibold text-[#445064] mb-1.5 block">
                      Seats
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={form.seats}
                      onChange={update("seats")}
                      placeholder="5"
                      disabled={saving || deleting}
                      className="w-full border border-[#0F1B2B]/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC93C] disabled:bg-[#F5F5F5]"
                    />
                  </div>

                  {/* MILEAGE */}
                  <div>
                    <label className="text-xs font-semibold text-[#445064] mb-1.5 block">
                      Mileage
                    </label>

                    <input
                      type="text"
                      value={form.mileage}
                      onChange={update("mileage")}
                      placeholder="15 km/l"
                      disabled={saving || deleting}
                      className="w-full border border-[#0F1B2B]/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC93C] disabled:bg-[#F5F5F5]"
                    />
                  </div>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <h3 className="font-display text-lg font-700 mb-3">
                  Description
                </h3>

                <textarea
                  value={form.description}
                  onChange={update("description")}
                  rows={4}
                  placeholder="Describe the car..."
                  disabled={saving || deleting}
                  className="w-full border border-[#0F1B2B]/20 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FFC93C] disabled:bg-[#F5F5F5]"
                />
              </div>

              {/* AVAILABILITY */}
              <label
                className={`flex items-center justify-between gap-4 px-4 py-4 border cursor-pointer transition-colors ${
                  isAvailable
                    ? "bg-[#FFC93C]/10 border-[#FFC93C]/40"
                    : "bg-[#EDEEF0] border-[#0F1B2B]/10"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold">
                    Available for booking
                  </p>

                  <p className="text-xs text-[#445064] mt-1">
                    {isAvailable
                      ? "Customers can currently book this car."
                      : "This car will not be available for new bookings."}
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) =>
                    setIsAvailable(e.target.checked)
                  }
                  disabled={saving || deleting}
                  className="accent-[#FFC93C] w-5 h-5 shrink-0"
                />
              </label>

              {/* ACTIONS */}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={saving || deleting}
                  className="flex items-center justify-center gap-2 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2.5 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={15} />

                  {deleting
                    ? "Deleting..."
                    : "Delete car"}
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={saving || deleting}
                    className="flex-1 sm:flex-none text-sm font-semibold text-[#445064] border border-[#0F1B2B]/20 px-5 py-2.5 hover:bg-[#EDEEF0] transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving || deleting}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#FFC93C] text-[#0F1B2B] font-display font-700 text-lg px-7 py-2.5 hover:bg-[#f5bd28] transition-colors disabled:opacity-50"
                  >
                    <Save size={16} />

                    {saving
                      ? "Saving..."
                      : "Save changes"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}