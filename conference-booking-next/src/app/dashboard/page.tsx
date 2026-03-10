"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../lib/apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Approved:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    Pending:   "bg-amber-500/15  text-amber-400  border-amber-500/30",
    Cancelled: "bg-red-500/15    text-red-400    border-red-500/30",
    Completed: "bg-zinc-500/15   text-zinc-400   border-zinc-500/30",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${styles[status] ?? "bg-zinc-700 text-zinc-300 border-zinc-600"}`}>
      {status}
    </span>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <svg className="w-6 h-6 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-2">
      <span className="text-3xl">📭</span>
      <p className="text-sm text-zinc-500">{message}</p>
    </div>
  );
}

function fmt(dt: string) {
  return new Date(dt).toLocaleString(undefined, {
    dateStyle: "medium", timeStyle: "short",
  });
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ booking, onClose, onDone }: {
  booking: BookingSummary;
  onClose: () => void;
  onDone: () => void;
}) {
  const [start, setStart] = useState(booking.startTime.slice(0, 16));
  const [end, setEnd]     = useState(booking.endTime.slice(0, 16));
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
          <button onClick={save} disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
            {saving && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Booking Form ──────────────────────────────────────────────────────

function CreateBookingForm({ onCreated }: { onCreated: () => void }) {
  const [rooms, setRooms]         = useState<Room[]>([]);
  const [roomId, setRoomId]       = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime]     = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    apiClient.get<any, any>("/rooms")
      .then(data => setRooms(data?.items ?? data ?? []))
      .catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!roomId || !startTime || !endTime) { setError("All fields are required."); return; }
    setSubmitting(true); setError(""); setSuccess("");
    try {
      await apiClient.post("/bookings", {
        roomID:    roomId,
        startTime: new Date(startTime).toISOString(),
        endTime:   new Date(endTime).toISOString(),
      });
      setSuccess("✅ Booking created successfully!");
      setRoomId(""); setStartTime(""); setEndTime("");
      onCreated();
    } catch (e: any) {
      setError(e.response?.data?.message ?? e.message ?? "Failed to create booking.");
    } finally { setSubmitting(false); }
  };

  const cls = "w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all";

  return (
    <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <span className="w-6 h-6 rounded-md bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs">+</span>
        New Booking
      </h3>

      {error   && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
      {success && <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">{success}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-zinc-400 uppercase tracking-wider">Room</label>
          <select value={roomId} onChange={e => setRoomId(e.target.value)} className={cls}>
            <option value="">Select a room…</option>
            {rooms.map(r => (
              <option key={r.roomID} value={r.roomID}>{r.roomName} — {r.location}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-400 uppercase tracking-wider">Start Time</label>
          <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className={cls} />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-400 uppercase tracking-wider">End Time</label>
          <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className={cls} />
        </div>
      </div>

      <button
        onClick={handleCreate}
        disabled={submitting}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors flex items-center gap-2"
      >
        {submitting && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
        {submitting ? "Creating…" : "Create Booking"}
      </button>
    </div>
  );
}

// ─── Bookings Table ───────────────────────────────────────────────────────────

function BookingsTable({ bookings, role, onCancel, onDelete, onEdit }: {
  bookings: BookingSummary[];
  role: string;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit:   (b: BookingSummary) => void;
}) {
  const canModify = role === "Admin" || role === "FacilitiesManager";
  const canDelete = role === "Admin";

  if (bookings.length === 0) return <EmptyState message="No bookings found." />;

  return (
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
          {bookings.map(b => (
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
                        <button onClick={() => onEdit(b)} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Edit</button>
                        <button onClick={() => onCancel(b.id)} className="text-xs text-amber-400 hover:text-amber-300 transition-colors">Cancel</button>
                      </>
                    )}
                    {canDelete && (
                      <button onClick={() => onDelete(b.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Delete</button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, pageSize, totalCount, onChange }: {
  page: number; pageSize: number; totalCount: number; onChange: (p: number) => void;
}) {
  const total = Math.ceil(totalCount / pageSize);
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 text-sm text-zinc-400">
      <span>Page {page} of {total} · {totalCount} bookings</span>
      <div className="flex gap-2">
        <button disabled={page === 1} onClick={() => onChange(page - 1)}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs">
          ← Prev
        </button>
        <button disabled={page === total} onClick={() => onChange(page + 1)}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs">
          Next →
        </button>
      </div>
    </div>
  );
}

// ─── Role badge colors ────────────────────────────────────────────────────────

const ROLE_STYLES: Record<string, string> = {
  Admin:            "bg-violet-500/15 text-violet-300 border-violet-500/30",
  Employee:         "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  Receptionist:     "bg-sky-500/15    text-sky-300    border-sky-500/30",
  FacilitiesManager:"bg-teal-500/15   text-teal-300   border-teal-500/30",
};

// ─── Role capability descriptions ────────────────────────────────────────────

const ROLE_CAPS: Record<string, string[]> = {
  Admin:            ["View all bookings", "Edit any booking", "Cancel any booking", "Delete any booking"],
  Employee:         ["View all bookings", "Create bookings"],
  Receptionist:     ["View all bookings", "Create bookings"],
  FacilitiesManager:["View all bookings", "Edit any booking", "Cancel any booking"],
};

// ─── Main Dashboard Page ──────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.roles?.[0] ?? "Employee";

  const [bookings, setBookings]   = useState<BookingSummary[]>([]);
  const [totalCount, setTotal]    = useState(0);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [editTarget, setEditTarget] = useState<BookingSummary | null>(null);
  const [actionMsg, setActionMsg] = useState("");

  const PAGE_SIZE = 10;

  const fetchBookings = useCallback(async (p = 1) => {
    setLoading(true); setError("");
    try {
      const data = await apiClient.get<any, PagedResult>(`/bookings?page=${p}&pageSize=${PAGE_SIZE}`);
      setBookings(data.items);
      setTotal(data.totalCount);
      setPage(p);
    } catch (e: any) {
      setError(e.response?.data?.message ?? e.message ?? "Failed to load bookings.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBookings(1); }, [fetchBookings]);

  const flash = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(""), 3000);
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      await apiClient.post(`/bookings/${id}/cancel`, {});
      flash("✅ Booking cancelled.");
      fetchBookings(page);
    } catch (e: any) {
      flash("❌ " + (e.response?.data?.message ?? "Cancel failed."));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this booking?")) return;
    try {
      await apiClient.delete(`/bookings/${id}`);
      flash("✅ Booking deleted.");
      fetchBookings(page);
    } catch (e: any) {
      flash("❌ " + (e.response?.data?.message ?? "Delete failed."));
    }
  };

  const canCreate = role === "Employee" || role === "Receptionist";

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

          {/* Capabilities pill list */}
          <div className="flex flex-wrap gap-2">
            {(ROLE_CAPS[role] ?? []).map(cap => (
              <span key={cap} className="text-[11px] text-zinc-400 bg-zinc-800 border border-white/5 rounded-full px-2.5 py-1">
                {cap}
              </span>
            ))}
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Bookings",   value: totalCount,                                          icon: "📋" },
            { label: "Approved",         value: bookings.filter(b => b.status === "Approved").length,  icon: "✅" },
            { label: "Pending",          value: bookings.filter(b => b.status === "Pending").length,   icon: "⏳" },
            { label: "Cancelled",        value: bookings.filter(b => b.status === "Cancelled").length, icon: "❌" },
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

        {/* ── Create booking (Employee / Receptionist only) ── */}
        {canCreate && <CreateBookingForm onCreated={() => fetchBookings(1)} />}

        {/* ── Bookings section ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">All Bookings</h2>
            <button onClick={() => fetchBookings(page)} className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
              ↻ Refresh
            </button>
          </div>

          {/* Action flash message */}
          {actionMsg && (
            <p className={`text-xs px-3 py-2 rounded-lg border ${actionMsg.startsWith("✅")
              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              : "text-red-400 bg-red-500/10 border-red-500/20"}`}>
              {actionMsg}
            </p>
          )}

          {/* Error */}
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}

          {loading ? (
            <Spinner />
          ) : (
            <>
              <BookingsTable
                bookings={bookings}
                role={role}
                onCancel={handleCancel}
                onDelete={handleDelete}
                onEdit={setEditTarget}
              />
              <Pagination
                page={page}
                pageSize={PAGE_SIZE}
                totalCount={totalCount}
                onChange={fetchBookings}
              />
            </>
          )}
        </div>
      </div>

      {/* ── Edit modal ── */}
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