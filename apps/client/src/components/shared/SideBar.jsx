import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Globe, FileText,
  ChevronDown, Menu
} from "lucide-react";

const FLAGS = { Kenya: "🇰🇪", Tanzania: "🇹🇿", Zanzibar: "🏝️", Uganda: "🇺🇬" };
const COUNTRIES = ["Kenya", "Tanzania", "Zanzibar", "Uganda"];

const SideBar = () => {
  const [open, setOpen] = useState(true);
  const [countriesOpen, setCountriesOpen] = useState(true);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path) => pathname === path;
  const isCountry = COUNTRIES.some(c => pathname === `/admin/country/${c.toLowerCase()}`);

  return (
    <aside
      className={`${open ? "w-64" : "w-16"} transition-all duration-300 bg-stone-900 flex flex-col shrink-0 overflow-hidden fixed top-0 left-0 bottom-0 z-50`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-stone-800 shrink-0">
        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-white shrink-0">
          J
        </div>
        {open && (
          <div className="ml-3 overflow-hidden">
            <p className="text-white font-bold text-sm leading-tight whitespace-nowrap">Jaye Safaris</p>
            <p className="text-stone-500 text-xs whitespace-nowrap">Admin Panel</p>
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="ml-auto p-1.5 text-stone-500 hover:text-stone-300 transition-colors rounded-lg hover:bg-stone-800"
        >
          <Menu size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {/* Dashboard */}
        <button
          onClick={() => navigate("/admin")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-colors text-left ${
            isActive("/admin") ? "bg-amber-500 text-white" : "text-stone-400 hover:text-white hover:bg-stone-800"
          }`}
        >
          <LayoutDashboard size={18} className="shrink-0" />
          {open && <span className="text-sm font-semibold whitespace-nowrap">Dashboard</span>}
        </button>

        {/* Countries */}
        <div className="mb-1">
          <button
            onClick={() => setCountriesOpen(!countriesOpen)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              isCountry ? "text-white" : "text-stone-400 hover:text-white hover:bg-stone-800"
            }`}
          >
            <Globe size={18} className="shrink-0" />
            {open && (
              <>
                <span className="text-sm font-semibold flex-1 text-left whitespace-nowrap">Countries</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform shrink-0 ${countriesOpen ? "rotate-180" : ""}`}
                />
              </>
            )}
          </button>

          {countriesOpen && open && (
            <div className="ml-4 mt-1 grid gap-0.5">
              {COUNTRIES.map((name) => {
                const path = `/admin/country/${name.toLowerCase()}`;
                return (
                  <button
                    key={name}
                    onClick={() => navigate(path)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive(path)
                        ? "bg-stone-700 text-white"
                        : "text-stone-500 hover:text-stone-200 hover:bg-stone-800"
                    }`}
                  >
                    <span className="text-base">{FLAGS[name]}</span>
                    <span className="text-sm whitespace-nowrap">{name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Inquiries */}
        <button
          onClick={() => navigate("/admin/inquiries")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
            isActive("/admin/inquiries") ? "bg-amber-500 text-white" : "text-stone-400 hover:text-white hover:bg-stone-800"
          }`}
        >
          <FileText size={18} className="shrink-0" />
          {open && (
            <div className="flex items-center justify-between flex-1 min-w-0">
              <span className="text-sm font-semibold whitespace-nowrap">Inquiries</span>
              <span className="bg-rose-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0">2</span>
            </div>
          )}
        </button>
      </nav>

      {/* Footer */}
      {open && (
        <div className="p-4 border-t border-stone-800">
          <p className="text-xs text-stone-600 text-center">Jaye Safaris Admin v1.0</p>
        </div>
      )}
    </aside>
  );
};

export default SideBar;