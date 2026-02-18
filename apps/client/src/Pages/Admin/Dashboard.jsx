import { useNavigate } from "react-router-dom";
import { Globe, Package, MapPin, Mail, ChevronRight } from "lucide-react";
import { useAdminData } from "../../context/AdminDataContext";

// ─── Inline: StatCard ─────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p
        className="text-2xl font-bold text-stone-800"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {value}
      </p>
      <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">{label}</p>
    </div>
  </div>
);

// ─── Inline: StatusBadge ─────────────────────────────────────────────────────
const STATUS_MAP = {
  new:       { label: "New",       bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500"   },
  contacted: { label: "Contacted", bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500"    },
  resolved:  { label: "Resolved",  bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] ?? STATUS_MAP.new;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const FLAGS = { Kenya: "🇰🇪", Tanzania: "🇹🇿", Zanzibar: "🏝️", Uganda: "🇺🇬" };


const Dashboard = () => {
  const navigate = useNavigate();
  const { countries, inquiries } = useAdminData();

  const totalPackages     = Object.values(countries).reduce((a, c) => a + c.packages.length, 0);
  const totalDestinations = Object.values(countries).reduce((a, c) => a + c.destinations.length, 0);
  const newInquiries      = inquiries.filter((i) => i.status === "new").length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2
          className="text-2xl font-bold text-stone-800"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Dashboard
        </h2>
        <p className="text-sm text-stone-500">Welcome back — here's your site at a glance.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Globe}   label="Countries"     value={Object.keys(countries).length} accent="bg-stone-700"   />
        <StatCard icon={Package} label="Packages"      value={totalPackages}                 accent="bg-amber-500"   />
        <StatCard icon={MapPin}  label="Destinations"  value={totalDestinations}              accent="bg-emerald-600" />
        <StatCard icon={Mail}    label="New Inquiries" value={newInquiries}                   accent="bg-rose-500"    />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Country quick-jump */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100">
            <h3
              className="font-bold text-stone-700"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Country Pages
            </h3>
          </div>
          <div className="p-4 grid gap-2">
            {Object.entries(countries).map(([name, data]) => (
              <button
                key={name}
                onClick={() => navigate(`/admin/country/${name.toLowerCase()}`)}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-stone-50 border border-stone-100 hover:border-amber-200 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{FLAGS[name]}</span>
                  <div className="text-left">
                    <p className="font-bold text-stone-800 text-sm">{name}</p>
                    <p className="text-xs text-stone-400">
                      {data.packages.length} packages · {data.destinations.length} destinations
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-stone-300 group-hover:text-amber-500 transition-colors"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Recent inquiries */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <h3
              className="font-bold text-stone-700"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Recent Inquiries
            </h3>
            <button
              onClick={() => navigate("/admin/inquiries")}
              className="text-xs text-amber-600 font-semibold hover:underline"
            >
              View all
            </button>
          </div>
          <div className="p-4 grid gap-2">
            {inquiries.slice(0, 4).map((inq) => (
              <div
                key={inq.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                    {inq.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-700">{inq.name}</p>
                    <p className="text-xs text-stone-400">{inq.destination}</p>
                  </div>
                </div>
                <StatusBadge status={inq.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;