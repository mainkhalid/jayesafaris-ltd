import { useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

// ─── Normalise DB → frontend shape ───────────────────────────────────────────
const normalize = (pkg) => ({
  ...pkg,
  id: pkg._id,
  // DB stores thumbnail as { url, publicId } — expose as { url, publicId }
  // so PackageEditorPage's normalisePkg() can read thumbnail.url
  thumbnail: pkg.thumbnail ?? { url: "", publicId: "" },
  inclusions: (pkg.inclusions ?? []).map((inc) => ({
    ...inc,
    id: inc._id,
    // Same for inclusion images
    image: inc.image ?? { url: "", publicId: "" },
  })),
  days: (pkg.days ?? []).map((d) => ({ ...d, id: d._id })),
});

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const usePackages = (country) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError]       = useState(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchPackages = useCallback(async () => {
    if (!country) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/packages?country=${country.toLowerCase()}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const { data } = await res.json();
      setPackages(data.map(normalize));
    } catch (err) {
      setError(err.message ?? "Failed to load packages");
    } finally {
      setLoading(false);
    }
  }, [country]);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  // ── Create ────────────────────────────────────────────────────────────────
  // Creates a bare-bones package with no images — just text fields via FormData.
  const createPackage = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("country",     country.toLowerCase());
      fd.append("title",       "Untitled");
      fd.append("price",       "");
      fd.append("duration",    "");
      fd.append("description", "");
      fd.append("thumbnail",   "");           // no image yet
      fd.append("days",        JSON.stringify([]));
      fd.append("inclusions",  JSON.stringify([]));

      const res = await fetch(`${API_BASE}/packages`, {
        method: "POST",
        // ⚠️ No Content-Type header — browser sets it with the correct boundary
        body: fd,
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const { data } = await res.json();
      const normalized = normalize(data);
      setPackages((prev) => [...prev, normalized]);
      return normalized;
    } catch (err) {
      setError(err.message ?? "Failed to create package");
      return null;
    } finally {
      setSaving(false);
    }
  }, [country]);

  // ── Update ────────────────────────────────────────────────────────────────
  // `formData` is a FormData instance built by buildFormData() in PackageEditorPage.
  // `id`       is the MongoDB _id string.
  const updatePackage = useCallback(async (formData, id) => {
    if (!id || id === "undefined") {
      setError("Invalid package ID");
      return null;
    }

    // Always include country in the update payload
    formData.append("country", country.toLowerCase());

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/packages/${id}`, {
        method: "PUT",
        // ⚠️ No Content-Type header — let the browser set multipart/form-data + boundary
        body: formData,
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const { data } = await res.json();
      const normalized = normalize(data);
      setPackages((prev) =>
        prev.map((p) => (p._id === normalized._id ? normalized : p))
      );
      return normalized;
    } catch (err) {
      setError(err.message ?? "Failed to save package");
      return null;
    } finally {
      setSaving(false);
    }
  }, [country]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const deletePackage = useCallback(async (id) => {
    setDeleting(id);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/packages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setPackages((prev) => prev.filter((p) => p._id !== id && p.id !== id));
      return true;
    } catch (err) {
      setError(err.message ?? "Failed to delete package");
      return false;
    } finally {
      setDeleting(null);
    }
  }, []);

  return {
    packages,
    loading,
    saving,
    deleting,
    error,
    createPackage,
    updatePackage,
    deletePackage,
    refetch: fetchPackages,
  };
};