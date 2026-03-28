import React, { useState, useEffect, useCallback } from "react";
import {
  Users, Search, Crown, ChevronLeft, ChevronRight,
  Loader2, RefreshCw, Mail, AlertCircle, CheckCircle, Shield,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "/api";
const LIMIT = 20;

const fmt = (ts) =>
  ts ? new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

const RoleBadge = ({ role }) =>
  role === "admin" ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200">
      <Crown size={9} /> Admin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide bg-stone-100 text-stone-500 border border-stone-200">
      <Users size={9} /> User
    </span>
  );

const Toast = ({ message, type, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-[13px] font-semibold text-white border ${
        type === "error"
          ? "bg-rose-600 border-rose-700"
          : "bg-emerald-600 border-emerald-700"
      }`}
    >
      {type === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
      {message}
    </div>
  );
};

const UsersPage = () => {
  const [users,       setUsers]       = useState([]);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [search,      setSearch]      = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [updating,    setUpdating]    = useState(null);
  const [toast,       setToast]       = useState(null);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const fetchUsers = useCallback(async (pg = page, q = search) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: pg, limit: LIMIT });
      if (q) params.set("query", q);
      const res  = await fetch(`${API}/users?${params}`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load users.");
      setUsers(json.data || []);
      setTotal(json.pagination?.total || 0);
    } catch (err) {
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchUsers(page, search); }, [page, search]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); setSearch(searchInput); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleRoleToggle = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    if (!window.confirm(`${newRole === "admin" ? "Grant admin access to" : "Remove admin from"} ${user.fullName}?`)) return;

    setUpdating(user.id);
    try {
      const res  = await fetch(`${API}/users/${user.id}/role`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ role: newRole }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)));
      setToast({ message: `${user.fullName} is now ${newRole === "admin" ? "an admin" : "a regular user"}.`, type: "success" });
    } catch (err) {
      setToast({ message: err.message || "Failed to update role.", type: "error" });
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-[0.2em] mb-1">
            Administration
          </p>
          <h1 className="text-[28px] font-bold text-stone-900 leading-tight tracking-tight">
            Users
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-white px-4 py-2.5 rounded-xl border border-stone-200/60 shadow-sm text-center">
            <p className="text-[18px] font-bold text-stone-900 leading-tight">{total}</p>
            <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wide mt-0.5">Members</p>
          </div>
          <button
            onClick={() => fetchUsers(page, search)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-stone-200/60 text-stone-500 hover:text-stone-800 text-[12px] font-semibold rounded-xl transition-colors shadow-sm hover:border-stone-300"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm p-3">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-[13px] text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-300 transition-all"
          />
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[13px] font-medium">
          <AlertCircle size={15} className="shrink-0" /> {error}
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm overflow-hidden">
        {/* Table header row */}
        <div className="px-5 py-3.5 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-amber-500" />
            <span className="text-[12px] font-semibold text-stone-600">Registered Users</span>
          </div>
          {!loading && (
            <span className="text-[11px] text-stone-400">
              {users.length > 0
                ? `${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, total)} of ${total}`
                : "No results"}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-stone-300">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-[12px] font-semibold uppercase tracking-widest">Loading…</span>
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center">
            <Shield size={36} className="mx-auto text-stone-200 mb-3" />
            <p className="text-stone-400 text-[13px]">
              {search ? "No users match your search." : "No users found."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-stone-100">
                  {["User", "Email", "Role", "Joined", "Last Sign-In", "Actions"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3 text-[10px] font-bold text-stone-400 uppercase tracking-[0.15em] ${i === 5 ? "text-right" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr
                    key={u.id}
                    className={`group hover:bg-stone-50/40 transition-colors ${idx !== users.length - 1 ? "border-b border-stone-100" : ""}`}
                  >
                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {u.imageUrl ? (
                          <img src={u.imageUrl} alt={u.fullName} className="w-9 h-9 rounded-xl object-cover shrink-0 border border-stone-100" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 font-bold text-[12px] shrink-0">
                            {u.fullName[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                        <span className="text-[13px] font-semibold text-stone-800 whitespace-nowrap">{u.fullName}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4">
                      <a href={`mailto:${u.email}`} className="inline-flex items-center gap-1.5 text-[12px] text-stone-400 hover:text-amber-600 transition-colors">
                        <Mail size={11} /> {u.email}
                      </a>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      <RoleBadge role={u.role} />
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4">
                      <span className="text-[12px] text-stone-400">{fmt(u.createdAt)}</span>
                    </td>

                    {/* Last sign-in */}
                    <td className="px-5 py-4">
                      <span className="text-[12px] text-stone-400">{fmt(u.lastSignIn)}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleRoleToggle(u)}
                        disabled={updating === u.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-50 border ${
                          u.role === "admin"
                            ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                            : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                        }`}
                      >
                        {updating === u.id ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : u.role === "admin" ? (
                          <><Shield size={11} /> Revoke</>
                        ) : (
                          <><Crown size={11} /> Make Admin</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

       
        {!loading && totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-stone-100 flex items-center justify-between bg-stone-50/30">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold text-stone-500 border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40 transition-all"
            >
              <ChevronLeft size={13} /> Prev
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span key={`el-${i}`} className="px-2 text-stone-300 text-[12px]">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-[12px] font-semibold transition-all ${
                        p === page ? "bg-stone-900 text-white shadow-sm" : "text-stone-500 hover:bg-stone-100"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold text-stone-500 border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40 transition-all"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;