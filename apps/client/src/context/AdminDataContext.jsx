import { createContext, useContext, useState } from "react";
import { kenyaData }    from "../data/kenyaData";
import { tanzaniaData } from "../data/tanzaniaData";
import { zanzibarData } from "../data/zanzibarData";
import { ugandaData }   from "../data/ugandaData";
import { useInquiries } from "../hooks/useInquiry";
import { useAdminResource } from "../hooks/useAdminResource";
import { useAdminDepartures } from "../hooks/useDepartures";

const INITIAL_COUNTRIES = {
  Kenya:    { hero: kenyaData.hero,    packages: kenyaData.topPackages.packages,    destinations: kenyaData.featuredDestinations },
  Tanzania: { hero: tanzaniaData.hero, packages: tanzaniaData.topPackages.packages, destinations: tanzaniaData.featuredDestinations },
  Zanzibar: { hero: zanzibarData.hero, packages: zanzibarData.topPackages.packages, destinations: zanzibarData.featuredDestinations },
  Uganda:   { hero: ugandaData.hero,   packages: ugandaData.topPackages.packages,   destinations: ugandaData.featuredDestinations },
};

const AdminDataContext = createContext(null);

export const AdminDataProvider = ({ children }) => {
  const [countries, setCountries] = useState(INITIAL_COUNTRIES);

  const {
    inquiries,
    stats: inquiryStats,
    loading: inquiriesLoading,
    updateInquiry,
    deleteInquiry,
  } = useInquiries();

  const {
    data: bookings,
    stats: bookingStats,
    loading: bookingsLoading,
    updateResource: updateBooking,
    deleteResource: deleteBooking,
  } = useAdminResource("bookings");

  const {
    data: customQuotes,
    stats: customQuoteStats,
    loading: customQuotesLoading,
    updateResource: updateCustomQuote,
    deleteResource: deleteCustomQuote,
  } = useAdminResource("custom-quotes");

  // ── Departures ──────────────────────────────────────────────────────────
  const {
    departures,
    stats: departureStats,
    loading: departuresLoading,
    createDeparture,
    updateDeparture,
    deleteDeparture,
    refetch: refetchDepartures,
  } = useAdminDepartures();

  const updateCountryData = (country, field, value) => {
    setCountries((prev) => ({
      ...prev,
      [country]: { ...prev[country], [field]: value },
    }));
  };

  return (
    <AdminDataContext.Provider
      value={{
        countries,
        inquiries,    inquiryStats,    inquiriesLoading,    updateInquiry,    deleteInquiry,
        bookings,     bookingStats,    bookingsLoading,     updateBooking,    deleteBooking,
        customQuotes, customQuoteStats, customQuotesLoading, updateCustomQuote, deleteCustomQuote,
        departures,   departureStats,  departuresLoading,   createDeparture,  updateDeparture, deleteDeparture, refetchDepartures,
        updateCountryData,
      }}
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