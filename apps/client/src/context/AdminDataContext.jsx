import { createContext, useContext, useState } from "react";
import { kenyaData }    from "../data/kenyaData";
import { tanzaniaData } from "../data/tanzaniaData";
import { zanzibarData } from "../data/zanzibarData";
import { ugandaData }   from "../data/ugandaData";

// ─── Initial data ─────────────────────────────────────────────────────────────
const INITIAL_COUNTRIES = {
  Kenya:    { hero: kenyaData.hero,    packages: kenyaData.topPackages.packages,    destinations: kenyaData.featuredDestinations },
  Tanzania: { hero: tanzaniaData.hero, packages: tanzaniaData.topPackages.packages, destinations: tanzaniaData.featuredDestinations },
  Zanzibar: { hero: zanzibarData.hero, packages: zanzibarData.topPackages.packages, destinations: zanzibarData.featuredDestinations },
  Uganda:   { hero: ugandaData.hero,   packages: ugandaData.topPackages.packages,   destinations: ugandaData.featuredDestinations },
};

const INITIAL_INQUIRIES = [
  {
    id: 1,
    name: "Sarah Mitchell",
    email: "sarah@example.com",
    phone: "+1 555 234 5678",
    destination: "Kenya – Masai Mara",
    dates: "2025-08-10 to 2025-08-17",
    travelers: 2,
    message: "We'd love a luxury tented camp experience with early morning game drives.",
    status: "new",
    submitted: "2025-02-14",
  },
  {
    id: 2,
    name: "James Oduya",
    email: "james.o@gmail.com",
    phone: "+44 7700 900123",
    destination: "Uganda – Gorilla Trekking",
    dates: "2025-07-01 to 2025-07-05",
    travelers: 4,
    message: "Family trip with teenagers. Need permits and lodge recommendations.",
    status: "contacted",
    submitted: "2025-02-13",
  },
  {
    id: 3,
    name: "Priya Nair",
    email: "priya.nair@outlook.com",
    phone: "+91 98765 43210",
    destination: "Zanzibar – Beach Holiday",
    dates: "2025-06-20 to 2025-06-27",
    travelers: 2,
    message: "Honeymoon package. Looking for private villa options near Nungwi.",
    status: "resolved",
    submitted: "2025-02-11",
  },
  {
    id: 4,
    name: "Tom Bergmann",
    email: "tberg@mail.de",
    phone: "+49 170 1234567",
    destination: "Tanzania – Serengeti",
    dates: "2025-09-15 to 2025-09-22",
    travelers: 3,
    message: "Interested in migration season timing and photography opportunities.",
    status: "new",
    submitted: "2025-02-15",
  },
];

// ─── Context ──────────────────────────────────────────────────────────────────
const AdminDataContext = createContext(null);

export const AdminDataProvider = ({ children }) => {
  const [countries, setCountries]   = useState(INITIAL_COUNTRIES);
  const [inquiries, setInquiries]   = useState(INITIAL_INQUIRIES);

  /** Update a single field (hero | packages | destinations) for a country */
  const updateCountryData = (country, field, value) => {
    setCountries((prev) => ({
      ...prev,
      [country]: { ...prev[country], [field]: value },
    }));
  };

  /** Update the status of a single inquiry */
  const updateInquiryStatus = (id, status) => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
    );
  };

  return (
    <AdminDataContext.Provider
      value={{ countries, inquiries, updateCountryData, updateInquiryStatus }}
    >
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used inside AdminDataProvider");
  return ctx;
};