import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Search, Fuel, Users, Gauge, Star, ShieldCheck, Clock, Sparkles } from "lucide-react";
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
  "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=600&q=80";

const perks = [
  { icon: ShieldCheck, title: "Verified & insured", body: "Har gaari inspection aur insurance ke sath aati hai — bina kisi chhupay charges ke." },
  { icon: Clock, title: "Book in under 2 minutes", body: "Location, dates aur car choose karein — instant confirmation milta hai." },
  { icon: Sparkles, title: "AI trip assistant", body: "Apni requirement likhein, hamara assistant best-fit car suggest karega." },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [pickup, setPickup] = useState("Islamabad");
  const [dropDate, setDropDate] = useState("");
  const [pickDate, setPickDate] = useState("");

  const [featuredCars, setFeaturedCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(true);

  useEffect(() => {
    fetchFeaturedCars();
  }, []);

  const fetchFeaturedCars = async () => {
    try {
      const { data } = await api.get("/cars", { params: { limit: 4 } });
      setFeaturedCars(data.data || []);
    } catch (err) {
      setFeaturedCars([]);
    } finally {
      setLoadingCars(false);
    }
  };

  const handleSearch = () => {
    navigate("/fleet", { state: { city: pickup } });
  };

  return (
    <div className="font-body bg-[#EDEEF0] text-[#0F1B2B] min-h-screen">
      {fonts}

      {/* NAV */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto">
        <div className="font-display text-2xl md:text-3xl font-800 tracking-tight">
          DRIVE<span className="text-[#FFC93C]">HUB</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#445064]">
          <button onClick={() => navigate("/fleet")} className="hover:text-[#0F1B2B] transition-colors">Fleet</button>
          <a href="#how" className="hover:text-[#0F1B2B] transition-colors">How it works</a>
          <a href="#" className="hover:text-[#0F1B2B] transition-colors">Locations</a>
        </div>
        {user ? (
          <div className="flex items-center gap-3">
            {user.role === "admin" ? (
              <button onClick={() => navigate("/admin")} className="text-sm font-semibold text-[#445064] hover:text-[#0F1B2B]">
                Dashboard
              </button>
            ) : (
              <button onClick={() => navigate("/my-bookings")} className="text-sm font-semibold text-[#445064] hover:text-[#0F1B2B]">
                My Bookings
              </button>
            )}
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="bg-[#0F1B2B] text-white text-sm font-semibold px-5 py-2.5 hover:bg-[#1a2c44] transition-colors"
            >
              {user.fullName.split(" ")[0]} — Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate("/auth")}
            className="bg-[#0F1B2B] text-white text-sm font-semibold px-5 py-2.5 rounded-none hover:bg-[#1a2c44] transition-colors"
          >
            Sign in
          </button>
        )}
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 px-6 md:px-12 pt-8 md:pt-16 pb-12">
          <div className="flex flex-col justify-center z-10">
            <p className="text-xs font-semibold tracking-wide text-[#445064] mb-4 font-body">
              Serving 12 cities across Pakistan
            </p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-800 leading-[0.92] mb-6">
              Your next drive
              <br />
              starts <span className="relative inline-block">
                here
                <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 200 10" preserveAspectRatio="none">
                  <path d="M0,6 Q50,0 100,5 T200,4" stroke="#FFC93C" strokeWidth="6" fill="none" />
                </svg>
              </span>.
            </h1>
            <p className="text-[#445064] text-base md:text-lg mb-8 max-w-md">
              Sedans se lekar luxury tak — verified cars, transparent pricing, aur instant booking. Kahin bhi jayen, hum saath hain.
            </p>

            <div className="bg-white border border-[#0F1B2B]/10 shadow-[6px_6px_0_#0F1B2B] p-5 sm:p-6">
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#445064] mb-1.5">
                    <MapPin size={14} /> Pickup city
                  </label>
                  <select
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full border border-[#0F1B2B]/20 px-3 py-2 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFC93C]"
                  >
                    <option>Islamabad</option>
                    <option>Lahore</option>
                    <option>Karachi</option>
                    <option>Rawalpindi</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#445064] mb-1.5">
                    <Calendar size={14} /> Pick-up date
                  </label>
                  <input
                    type="date"
                    value={pickDate}
                    onChange={(e) => setPickDate(e.target.value)}
                    className="w-full border border-[#0F1B2B]/20 px-3 py-2 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFC93C]"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#445064] mb-1.5">
                    <Calendar size={14} /> Drop-off date
                  </label>
                  <input
                    type="date"
                    value={dropDate}
                    onChange={(e) => setDropDate(e.target.value)}
                    className="w-full border border-[#0F1B2B]/20 px-3 py-2 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFC93C]"
                  />
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="w-full flex items-center justify-center gap-2 bg-[#FFC93C] text-[#0F1B2B] font-display font-700 text-lg py-3 hover:bg-[#f5bd28] transition-colors"
              >
                <Search size={20} strokeWidth={2.5} />
                Search available cars
              </button>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div
              className="absolute inset-0 bg-[#0F1B2B]"
              style={{ clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)" }}
            />
            <img
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=80"
              alt="Car on the road"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)" }}
            />
            <div className="absolute bottom-8 right-8 bg-[#FFC93C] px-5 py-4 max-w-[220px]">
              <p className="font-display text-3xl font-800 text-[#0F1B2B] leading-none">4,200+</p>
              <p className="text-xs font-semibold text-[#0F1B2B]/80 mt-1">Successful trips completed this year</p>
            </div>
          </div>
        </div>
      </section>

      {/* PERKS */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 border-t border-[#0F1B2B]/10">
        <div className="grid sm:grid-cols-3 gap-8">
          {perks.map((p, i) => (
            <div key={i} className="flex flex-col gap-3">
              <p.icon size={28} strokeWidth={1.75} className="text-[#0F1B2B]" />
              <h3 className="font-display text-xl font-700">{p.title}</h3>
              <p className="text-sm text-[#445064] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FLEET */}
      <section id="fleet" className="max-w-7xl mx-auto px-6 md:px-12 py-16 border-t border-[#0F1B2B]/10">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#445064] mb-2">Popular right now</p>
            <h2 className="font-display text-4xl md:text-5xl font-800">Pick your ride</h2>
          </div>
          <button
            onClick={() => navigate("/fleet")}
            className="hidden sm:block text-sm font-semibold border-b-2 border-[#0F1B2B] pb-0.5 hover:text-[#445064] hover:border-[#445064] transition-colors"
          >
            View full fleet
          </button>
        </div>

        {loadingCars ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-[#0F1B2B]/10 animate-pulse">
                <div className="aspect-[4/3] bg-[#EDEEF0]" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-[#EDEEF0] w-3/4" />
                  <div className="h-3 bg-[#EDEEF0] w-1/2" />
                  <div className="h-6 bg-[#EDEEF0] w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredCars.length === 0 ? (
          <div className="bg-white border border-[#0F1B2B]/10 p-10 text-center">
            <p className="text-sm text-[#445064]">Abhi tak koi car add nahi hui hai.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCars.map((car) => (
              <div key={car.id} className="bg-white border border-[#0F1B2B]/10 group hover:shadow-[6px_6px_0_#0F1B2B] transition-shadow">
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img src={car.images?.[0] || PLACEHOLDER_IMG} alt={car.name} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 bg-[#0F1B2B] text-white text-[11px] font-semibold px-2.5 py-1">
                    {car.type}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display text-lg font-700 leading-tight">{car.name}</h3>
                    <div className="flex items-center gap-1 text-xs font-semibold shrink-0 ml-2">
                      <Star size={13} fill="#FFC93C" className="text-[#FFC93C]" />
                      {Number(car.rating).toFixed(1)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[#445064] text-xs mb-4">
                    <span className="flex items-center gap-1"><Users size={13} />{car.seats}</span>
                    <span className="flex items-center gap-1"><Fuel size={13} />{car.fuel}</span>
                    <span className="flex items-center gap-1"><Gauge size={13} />{car.transmission}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="font-display text-2xl font-800">Rs {Number(car.pricePerDay).toLocaleString()}</span>
                      <span className="text-xs text-[#445064]">/day</span>
                    </div>
                    <button
                      onClick={() => navigate(`/cars/${car.id}`)}
                      className="text-xs font-semibold bg-[#EDEEF0] px-3 py-2 hover:bg-[#FFC93C] transition-colors"
                    >
                      Book now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA STRIP */}
      <section className="bg-[#0F1B2B] text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-800 mb-2">List your car, earn every month.</h2>
            <p className="text-white/70 text-sm max-w-md">Apni gaari idle na rakhein — DriveHub par list karein aur passive income shuru karein.</p>
          </div>
          <button className="bg-[#FFC93C] text-[#0F1B2B] font-display font-700 text-lg px-8 py-3.5 whitespace-nowrap hover:bg-[#f5bd28] transition-colors">
            Become a host
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 md:px-12 py-10 text-xs text-[#445064] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="font-display text-lg font-800 text-[#0F1B2B]">
          DRIVE<span className="text-[#FFC93C]">HUB</span>
        </div>
        <p>© 2026 DriveHub. All rights reserved.</p>
      </footer>
    </div>
  );
}