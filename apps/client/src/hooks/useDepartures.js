import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

// ─── Public hook: fetch available departures for a package ───────────────────
// Used on PackageDetailPage and BookingPage
export const useDepartures = (packageId) => {
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  const fetchDepartures = useCallback(async () => {
    if (!packageId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/departures/by-package/${packageId}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const { data } = await res.json();
      setDepartures(data);
    } catch (err) {
      setError(err.message ?? "Failed to load departures");
    } finally {
      setLoading(false);
    }
  }, [packageId]);

  useEffect(() => { fetchDepartures(); }, [fetchDepartures]);

  return { departures, loading, error, refetch: fetchDepartures };
};

// ─── Admin hook: full CRUD for departures ────────────────────────────────────
export const useAdminDepartures = () => {
  const { getToken } = useAuth();

  const [departures, setDepartures] = useState([]);
  const [stats, setStats]           = useState({});
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const authFetch = useCallback(async (url, options = {}) => {
    const token = await getToken();
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  }, [getToken]);

  const fetchAll = useCallback(async (params = "") => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, statsRes] = await Promise.all([
        authFetch(`${API_BASE}/departures${params}`),
        authFetch(`${API_BASE}/departures/stats`),
      ]);
      const listJson  = await listRes.json();
      const statsJson = await statsRes.json();
      if (!listRes.ok)  throw new Error(listJson.message);
      if (!statsRes.ok) throw new Error(statsJson.message);
      setDepartures(listJson.data);
      setStats(statsJson.data);
    } catch (err) {
      setError(err.message ?? "Failed to load departures");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const createDeparture = useCallback(async (payload) => {
    try {
      const res  = await authFetch(`${API_BASE}/departures`, {
        method: "POST",
        body:   JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setDepartures((prev) => [...prev, json.data]);
      fetchAll();
      return json.data;
    } catch (err) {
      setError(err.message ?? "Failed to create departure");
      return null;
    }
  }, [authFetch, fetchAll]);

  const updateDeparture = useCallback(async (id, updates) => {
    try {
      const res  = await authFetch(`${API_BASE}/departures/${id}`, {
        method: "PUT",
        body:   JSON.stringify(updates),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setDepartures((prev) =>
        prev.map((d) => (d._id === id ? { ...d, ...json.data } : d))
      );
      fetchAll();
      return json.data;
    } catch (err) {
      setError(err.message ?? "Failed to update departure");
      return null;
    }
  }, [authFetch, fetchAll]);

  const deleteDeparture = useCallback(async (id) => {
    try {
      const res = await authFetch(`${API_BASE}/departures/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setDepartures((prev) => prev.filter((d) => d._id !== id));
      fetchAll();
      return true;
    } catch (err) {
      setError(err.message ?? "Failed to delete departure");
      return false;
    }
  }, [authFetch, fetchAll]);

  return {
    departures, stats, loading, error,
    createDeparture, updateDeparture, deleteDeparture,
    refetch: fetchAll,
  };
};