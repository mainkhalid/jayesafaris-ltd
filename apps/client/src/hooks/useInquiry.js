import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

// ─── Public hook: submit an inquiry ───────────────────────────────────────────
export const useSubmitInquiry = () => {
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState(null);

  const submit = useCallback(async (formData) => {
    setSubmitting(true);
    setSuccess(false);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/inquiries`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? `Error ${res.status}`);
      setSuccess(true);
      return json.data;
    } catch (err) {
      setError(err.message ?? "Failed to submit");
      return null;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { submit, submitting, success, error };
};

// ─── Admin hook: manage inquiries ─────────────────────────────────────────────
export const useInquiries = () => {
  const { getToken } = useAuth();

  const [inquiries, setInquiries] = useState([]);
  const [stats,     setStats]     = useState({ total: 0, new: 0, contacted: 0, resolved: 0 });
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  // Authenticated fetch helper
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

  // Fetch all + stats
  const fetchAll = useCallback(async (status = "all") => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, statsRes] = await Promise.all([
        authFetch(`${API_BASE}/inquiries?status=${status}&limit=100`),
        authFetch(`${API_BASE}/inquiries/stats`),
      ]);
      const listJson  = await listRes.json();
      const statsJson = await statsRes.json();
      if (!listRes.ok)  throw new Error(listJson.message);
      if (!statsRes.ok) throw new Error(statsJson.message);
      setInquiries(listJson.data);
      setStats(statsJson.data);
    } catch (err) {
      setError(err.message ?? "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Update status + optional notes
  const updateInquiry = useCallback(async (id, updates) => {
    try {
      const res  = await authFetch(`${API_BASE}/inquiries/${id}`, {
        method: "PUT",
        body:   JSON.stringify(updates),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setInquiries((prev) =>
        prev.map((inq) => (inq._id === id ? { ...inq, ...json.data } : inq))
      );
      // Update stats counts if status changed
      if (updates.status) {
        fetchAll();
      }
      return json.data;
    } catch (err) {
      setError(err.message ?? "Failed to update");
      return null;
    }
  }, [authFetch, fetchAll]);

  // Delete
  const deleteInquiry = useCallback(async (id) => {
    try {
      const res = await authFetch(`${API_BASE}/inquiries/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setInquiries((prev) => prev.filter((inq) => inq._id !== id));
      fetchAll(); // refresh stats
      return true;
    } catch (err) {
      setError(err.message ?? "Failed to delete");
      return false;
    }
  }, [authFetch, fetchAll]);

  return {
    inquiries, stats, loading, error,
    updateInquiry, deleteInquiry,
    refetch: fetchAll,
  };
};