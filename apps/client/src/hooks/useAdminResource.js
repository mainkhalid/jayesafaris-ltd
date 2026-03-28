import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

// ─── Generic hook for Admin Resource management ──────────────────────────────
export const useAdminResource = (resourcePath) => {
  const { getToken } = useAuth();
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const fetchData = useCallback(async (params = "") => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, statsRes] = await Promise.all([
        authFetch(`${API_BASE}/${resourcePath}${params}`),
        authFetch(`${API_BASE}/${resourcePath}/stats`),
      ]);
      const listJson = await listRes.json();
      const statsJson = await statsRes.json();
      if (!listRes.ok) throw new Error(listJson.message);
      if (!statsRes.ok) throw new Error(statsJson.message);
      setData(listJson.data);
      setStats(statsJson.data);
    } catch (err) {
      setError(err.message ?? `Failed to load ${resourcePath}`);
    } finally {
      setLoading(false);
    }
  }, [authFetch, resourcePath]);

  const updateResource = useCallback(async (id, updates) => {
    try {
      const res = await authFetch(`${API_BASE}/${resourcePath}/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setData((prev) => prev.map((item) => (item._id === id ? { ...item, ...json.data } : item)));
      if (updates.status) fetchData(); // refresh stats
      return json.data;
    } catch (err) {
      setError(err.message ?? "Failed to update");
      return null;
    }
  }, [authFetch, resourcePath, fetchData]);

  const deleteResource = useCallback(async (id) => {
    try {
      const res = await authFetch(`${API_BASE}/${resourcePath}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setData((prev) => prev.filter((item) => item._id !== id));
      fetchData(); // refresh stats
      return true;
    } catch (err) {
      setError(err.message ?? "Failed to delete");
      return false;
    }
  }, [authFetch, resourcePath, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, stats, loading, error, updateResource, deleteResource, refetch: fetchData };
};
