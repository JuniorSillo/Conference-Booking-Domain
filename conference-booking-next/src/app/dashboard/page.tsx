"use client";

import {
  useEffect, useState, useCallback, useMemo
} from "react";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../lib/apiClient";
import { useDebounce } from "../../hooks/useDebounce";


interface BookingSummary {
  id: string;
  roomName: string;
  roomLocation: string;
  roomIsActive: boolean;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
}

interface PagedResult {
  items: BookingSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
}

interface Room {
  roomID: string;
  roomName: string;
  capacity: number;
  roomType: string;
  location: string;
  isActive: boolean;
}

type SortField = "startTime" | "roomName" | "createdAt";
type SortOrder = "asc" | "desc";


function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Approved:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    Pending:   "bg-amber-500/15   text-amber-400   border-amber-500/30",
    Cancelled: "bg-red-500/15     text-red-400     border-red-500/30",
    Completed: "bg-zinc-500/15    text-zinc-400    border-zinc-500/30",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${styles[status] ?? "bg-zinc-700 text-zinc-300 border-zinc-600"}`}>
      {status}
    </span>
  );
}

function fmt(dt: string) {
  return new Date(dt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}


function EditModal({ booking, onClose, onDone }: {
  booking: BookingSummary; onClose: () => void; onDone: () => void;
}) {
  const [start, setStart]   = useState(booking.startTime.slice(0, 16));
  const [end, setEnd]       = useState(booking.endTime.slice(0, 16));
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const save = async () => {
    setSaving(true); setError("");
    try {
      await apiClient.put(`/bookings/${booking.id}`, {
        startTime: new Date(start).toISOString(),
        endTime:   new Date(end).toISOString(),
      });
      onDone(); onClose();
    } catch (e: any) {
      setError(e.response?.data?.message ?? e.message ?? "Update failed.");
    } finally { setSaving(false); }
  };

  const cls = "w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Edit Booking</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors text-lg leading-none">✕</button>
        </div>
        <p className="text-sm text-zinc-400">Room: <span className="text-white font-medium">{booking.roomName}</span></p>
        {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-zinc-400 uppercase tracking-wider">Start Time</label>
            <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} className={cls} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400 uppercase tracking-wider">End Time</label>
            <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} className={cls} />
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={save} disabled={saving}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
            {saving && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}


function CreateBookingForm({ onCreated }: { onCreated: () => void }) {
  const [rooms, setRooms]           = useState<Room[]>([]);
  const [roomId, setRoomId]         = useState("");
  const [startTime, setStartTime]   = useState("");
  const [endTime, setEndTime]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");

  useEffect(() => {
    apiClient.get<any, any>("/rooms")
      .then(data => setRooms(data?.items ?? data ?? []))
      .catch(() => {});
  }, []);

 
  const handleCreate = useCallback(async () => {
    if (!roomId || !startTime || !endTime) { setError("All fields are required."); return; }
    setSubmitting(true); setError(""); setSuccess("");
    try {
      await apiClient.post("/bookings", {
        roomID:    roomId,
        startTime: new Date(startTime).toISOString(),
        endTime:   new Date(endTime).toISOString(),
      });
      setSuccess("Booking created successfully!");
      setRoomId(""); setStartTime(""); setEndTime("");
      onCreated();
    } catch (e: any) {
      setError(e.response?.data?.message ?? e.message ?? "Failed to create booking.");
    } finally { setSubmitting(false); }
  }, [roomId, startTime, endTime, onCreated]);

  const inputCls = "w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all";

  return (
    <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <span className="w-6 h-6 rounded-md bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">+</span>
        New Booking
      </h3>
      {error   && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
      {success && <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">{success}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-zinc-400 uppercase tracking-wider">Room</label>
          <select value={roomId} onChange={e => setRoomId(e.target.value)} className={inputCls}>
            <option value="">Select a room…</option>
            {rooms.map(r => <option key={r.roomID} value={r.roomID}>{r.roomName} — {r.location}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-400 uppercase tracking-wider">Start Time</label>
          <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className={inputCls} />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-400 uppercase tracking-wider">End Time</label>
          <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputCls} />
        </div>
      </div>
      <button onClick={handleCreate} disabled={submitting}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors flex items-center gap-2">
        {submitting && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
        {submitting ? "Creating…" : "Create Booking"}
      </button>
    </div>
  );
}


const ROLE_STYLES: Record<string, string> = {
  Admin:             "bg-violet-500/15 text-violet-300 border-violet-500/30",
  Employee:          "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  Receptionist:      "bg-sky-500/15    text-sky-300    border-sky-500/30",
  FacilitiesManager: "bg-teal-500/15   text-teal-300   border-teal-500/30",
};

const ROLE_CAPS: Record<string, string[]> = {
  Admin:             ["View all bookings", "Edit any booking", "Cancel any booking", "Delete any booking"],
  Employee:          ["View all bookings", "Create bookings"],
  Receptionist:      ["View all bookings", "Create bookings"],
  FacilitiesManager: ["View all bookings", "Edit any booking", "Cancel any booking"],
};



const PAGE_SIZE = 10;

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.roles?.[0] ?? "Employee";


  const [allBookings, setAllBookings] = useState<BookingSummary[]>([]);
  const [totalCount, setTotal]        = useState(0);
  const [page, setPage]               = useState(1);
  const [loading, setLoading]         = useState(true);
  const [actionMsg, setActionMsg]     = useState("");
  const [editTarget, setEditTarget]   = useState<BookingSummary | null>(null);



  const [searchInput, setSearchInput] = useState("");
  const [sortField, setSortField]     = useState<SortField>("startTime");
  const [sortOrder, setSortOrder]     = useState<SortOrder>("asc");

 
  const debouncedSearch = useDebounce(searchInput, 400);

  
  const fetchBookings = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const data = await apiClient.get<any, PagedResult>(
        `/bookings?page=${p}&pageSize=${PAGE_SIZE}&sortBy=${sortField}&sortOrder=${sortOrder}`
      );
      setAllBookings(data.items ?? []);
      setTotal(data.totalCount ?? 0);
      setPage(p);
    } catch (e: any) {
      // Throwing here will be caught by the nearest error.tsx boundary
      throw new Error(e.response?.data?.message ?? e.message ?? "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [sortField, sortOrder]);

  useEffect(() => {
    fetchBookings(1);
  }, [fetchBookings]);

  // useMemo: filtered + sorted bookings 
  const processedBookings = useMemo(() => {
    let result = [...allBookings];

    // Filter by debounced search term
    if (debouncedSearch.trim()) {
      const term = debouncedSearch.toLowerCase();
      result = result.filter(b =>
        b.roomName.toLowerCase().includes(term) ||
        b.roomLocation?.toLowerCase().includes(term) ||
        b.status.toLowerCase().includes(term)
      );
    }

   
    result.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      if (sortField === "startTime" || sortField === "createdAt") {
        aVal = new Date(a[sortField]).getTime();
        bVal = new Date(b[sortField]).getTime();
      } else {
        aVal = a.roomName.toLowerCase();
        bVal = b.roomName.toLowerCase();
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [allBookings, debouncedSearch, sortField, sortOrder]);

  const stats = useMemo(() => ({
    total:     totalCount,
    approved:  allBookings.filter(b => b.status === "Approved").length,
    pending:   allBookings.filter(b => b.status === "Pending").length,
    cancelled: allBookings.filter(b => b.status === "Cancelled").length,
  }), [allBookings, totalCount]);


  const flash = useCallback((msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(""), 3000);
  }, []);

  const handleCancel = useCallback(async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      await apiClient.post(`/bookings/${id}/cancel`, {});
      flash("Booking cancelled.");
      fetchBookings(page);
    } catch (e: any) {
      flash(" " + (e.response?.data?.message ?? "Cancel failed."));
    }
  }, [page, fetchBookings, flash]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Permanently delete this booking?")) return;
    try {
      await apiClient.delete(`/bookings/${id}`);
      flash("Booking deleted.");
      fetchBookings(page);
    } catch (e: any) {
      flash(" " + (e.response?.data?.message ?? "Delete failed."));
    }
  }, [page, fetchBookings, flash]);

  const handleEdit = useCallback((b: BookingSummary) => {
    setEditTarget(b);
  }, []);

  const canCreate  = role === "Employee" || role === "Receptionist";
  const canModify  = role === "Admin" || role === "FacilitiesManager";
  const canDelete  = role === "Admin";

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const inputCls = "bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all";

  return (
    <div className="min-h-screen bg-zinc-950 px-4 sm:px-8 py-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-white tracking-tight">Dashboard</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${ROLE_STYLES[role] ?? "bg-zinc-700 text-zinc-300 border-zinc-600"}`}>
                {role}
              </span>
            </div>
            <p className="text-sm text-zinc-400">
              Welcome back, <span className="text-white font-medium">{user?.email}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(ROLE_CAPS[role] ?? []).map(cap => (
              <span key={cap} className="text-[11px] text-zinc-400 bg-zinc-800 border border-white/5 rounded-full px-2.5 py-1">
                {cap}
              </span>
            ))}
          </div>
        </div>

       
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Bookings", value: stats.total,     icon: "" },
            { label: "Approved",       value: stats.approved,  icon: "" },
            { label: "Pending",        value: stats.pending,   icon: "" },
            { label: "Cancelled",      value: stats.cancelled, icon: "" },
          ].map(s => (
            <div key={s.label} className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className="text-lg font-semibold text-white">{s.value}</p>
                <p className="text-[11px] text-zinc-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        
        {canCreate && <CreateBookingForm onCreated={() => fetchBookings(1)} />}

        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Debounced search input */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by room, location or status… (400ms debounce)"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className={inputCls + " w-full pl-9"}
            />
            
            {searchInput !== debouncedSearch && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 animate-pulse">
                …
              </span>
            )}
          </div>

          
          <select
            value={sortField}
            onChange={e => setSortField(e.target.value as SortField)}
            className={inputCls}
          >
            <option value="startTime">Sort: Start Time</option>
            <option value="roomName">Sort: Room Name</option>
            <option value="createdAt">Sort: Created Date</option>
          </select>

          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as SortOrder)}
            className={inputCls}
          >
            <option value="asc">↑ Ascending</option>
            <option value="desc">↓ Descending</option>
          </select>
        </div>

        
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            Showing <span className="text-zinc-300 font-medium">{processedBookings.length}</span> of{" "}
            <span className="text-zinc-300 font-medium">{totalCount}</span> bookings
            {debouncedSearch && <span className="text-indigo-400"> · filtered by "{debouncedSearch}"</span>}
          </p>
          <button
            onClick={() => fetchBookings(page)}
            className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
          >
            ↻ Refresh
          </button>
        </div>

       
        {actionMsg && (
          <p className={`text-xs px-3 py-2 rounded-lg border ${actionMsg.startsWith("✅")
            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            : "text-red-400 bg-red-500/10 border-red-500/20"}`}>
            {actionMsg}
          </p>
        )}

      
        {loading ? (
          
          <div className="rounded-xl border border-white/5 overflow-hidden animate-pulse">
            <div className="bg-zinc-800/60 h-10" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-zinc-900 border-t border-white/5 h-12" />
            ))}
          </div>
        ) : processedBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <span className="text-3xl">📭</span>
            <p className="text-sm text-zinc-500">
              {debouncedSearch ? `No bookings match "${debouncedSearch}".` : "No bookings found."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-800/60 text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left font-medium">Room</th>
                  <th className="px-4 py-3 text-left font-medium">Location</th>
                  <th className="px-4 py-3 text-left font-medium">Start</th>
                  <th className="px-4 py-3 text-left font-medium">End</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Created</th>
                  {(canModify || canDelete) && <th className="px-4 py-3 text-left font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {processedBookings.map(b => (
                  <tr key={b.id} className="bg-zinc-900 hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{b.roomName}</td>
                    <td className="px-4 py-3 text-zinc-400">{b.roomLocation ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-400">{fmt(b.startTime)}</td>
                    <td className="px-4 py-3 text-zinc-400">{fmt(b.endTime)}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(b.createdAt).toLocaleDateString()}</td>
                    {(canModify || canDelete) && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {canModify && b.status !== "Cancelled" && b.status !== "Completed" && (
                            <>
                              <button onClick={() => handleEdit(b)} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Edit</button>
                              <button onClick={() => handleCancel(b.id)} className="text-xs text-amber-400 hover:text-amber-300 transition-colors">Cancel</button>
                            </>
                          )}
                          {canDelete && (
                            <button onClick={() => handleDelete(b.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Delete</button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 text-sm text-zinc-400">
            <span>Page {page} of {totalPages} · {totalCount} total</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => fetchBookings(page - 1)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs">
                ← Prev
              </button>
              <button disabled={page === totalPages} onClick={() => fetchBookings(page + 1)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs">
                Next →
              </button>
            </div>
          </div>
        )}

      </div>

      
      {editTarget && (
        <EditModal
          booking={editTarget}
          onClose={() => setEditTarget(null)}
          onDone={() => fetchBookings(page)}
        />
      )}
    </div>
  );
}