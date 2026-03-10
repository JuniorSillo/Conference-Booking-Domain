"use client";

import { useEffect, useState } from "react";
import apiClient from "../../lib/apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Room {
  roomID: string;
  roomName: string;
  capacity: number;
  roomType: string;
  amenities: string;
  location: string;
  isActive: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROOM_TYPE_ICONS: Record<string, string> = {
  MeetingRoom:    "🗣️",
  ConferenceHall: "🏛️",
  Boardroom:      "💼",
  TrainingRoom:   "📚",
  Auditorium:     "🎭",
};

const AMENITY_ICONS: Record<string, string> = {
  Projector:    "📽️",
  Whiteboard:   "🖊️",
  VideoConf:    "📹",
  TV:           "📺",
  SoundSystem:  "🔊",
  WiFi:         "📶",
  AirCon:       "❄️",
  Catering:     "🍽️",
};

function parseAmenities(raw: string): string[] {
  if (!raw) return [];
  // Handle comma-separated or flag enum strings like "Projector, Whiteboard"
  return raw.split(",").map(a => a.trim()).filter(Boolean);
}

function RoomTypeBadge({ type }: { type: string }) {
  const icon = ROOM_TYPE_ICONS[type] ?? "🏢";
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
      {icon} {type.replace(/([A-Z])/g, ' $1').trim()}
    </span>
  );
}

function ActiveBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
      ● Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-400 border border-red-500/25">
      ● Inactive
    </span>
  );
}

// ─── Availability checker ─────────────────────────────────────────────────────

function AvailabilityChecker() {
  const [start, setStart]           = useState("");
  const [end, setEnd]               = useState("");
  const [results, setResults]       = useState<Room[] | null>(null);
  const [checking, setChecking]     = useState(false);
  const [error, setError]           = useState("");

  const check = async () => {
    if (!start || !end) { setError("Both times are required."); return; }
    if (new Date(start) >= new Date(end)) { setError("End time must be after start time."); return; }
    setChecking(true); setError(""); setResults(null);
    try {
      const data = await apiClient.get<any, Room[]>(
        `/rooms/available?start=${new Date(start).toISOString()}&end=${new Date(end).toISOString()}`
      );
      setResults(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.response?.data ?? e.message ?? "Check failed.");
    } finally { setChecking(false); }
  };

  const inputCls = "bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all";

  return (
    <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm">🔍</span>
        <h2 className="text-sm font-semibold text-white">Check Room Availability</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div className="space-y-1">
          <label className="text-xs text-zinc-400 uppercase tracking-wider">Start Time</label>
          <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} className={inputCls + " w-full"} />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-400 uppercase tracking-wider">End Time</label>
          <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} className={inputCls + " w-full"} />
        </div>
        <button onClick={check} disabled={checking}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
          {checking && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
          {checking ? "Checking…" : "Check Availability"}
        </button>
      </div>

      {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

      {results !== null && (
        <div className="space-y-2 pt-1">
          <p className="text-xs text-zinc-400">
            {results.length === 0
              ? "No rooms available for that time slot."
              : `${results.length} room${results.length !== 1 ? "s" : ""} available:`}
          </p>
          {results.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {results.map(r => (
                <span key={r.roomID}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  ✓ {r.roomName}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Room card ────────────────────────────────────────────────────────────────

function RoomCard({ room }: { room: Room }) {
  const amenities = parseAmenities(room.amenities);

  return (
    <div className={`bg-zinc-900 border rounded-xl p-5 flex flex-col gap-4 transition-colors hover:border-white/10 ${room.isActive ? "border-white/5" : "border-white/5 opacity-60"}`}>

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-white leading-tight">{room.roomName}</h3>
          <p className="text-[11px] text-zinc-600 mt-0.5 font-mono">ID: {room.roomID}</p>
          {room.location && (
            <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
              📍 {room.location}
            </p>
          )}
        </div>
        <ActiveBadge isActive={room.isActive} />
      </div>

      {/* Type + capacity */}
      <div className="flex items-center gap-3 flex-wrap">
        <RoomTypeBadge type={room.roomType} />
        <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {room.capacity} {room.capacity === 1 ? "person" : "people"}
        </span>
      </div>

      {/* Amenities */}
      {amenities.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Amenities</p>
          <div className="flex flex-wrap gap-1.5">
            {amenities.map(a => (
              <span key={a} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] text-zinc-300 bg-zinc-800 border border-white/5">
                {AMENITY_ICONS[a] ?? "✦"} {a.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function RoomsPage() {
  const [rooms, setRooms]       = useState<Room[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [typeFilter, setType]   = useState("All");
  const [statusFilter, setStatus] = useState("All");

  useEffect(() => {
    apiClient.get<any, Room[]>("/rooms")
      .then(data => setRooms(Array.isArray(data) ? data : []))
      .catch(e => setError(e.message ?? "Failed to load rooms."))
      .finally(() => setLoading(false));
  }, []);

  // Unique room types for filter
  const roomTypes = ["All", ...Array.from(new Set(rooms.map(r => r.roomType)))];

  // Filtered rooms
  const filtered = rooms.filter(r => {
    const matchSearch = r.roomName.toLowerCase().includes(search.toLowerCase()) ||
                        r.location?.toLowerCase().includes(search.toLowerCase());
    const matchType   = typeFilter === "All" || r.roomType === typeFilter;
    const matchStatus = statusFilter === "All" ||
                        (statusFilter === "Active" && r.isActive) ||
                        (statusFilter === "Inactive" && !r.isActive);
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="min-h-screen bg-zinc-950 px-4 sm:px-8 py-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Rooms</h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              {rooms.length} room{rooms.length !== 1 ? "s" : ""} total ·{" "}
              <span className="text-emerald-400">{rooms.filter(r => r.isActive).length} active</span>
            </p>
          </div>
        </div>

        {/* ── Availability checker ── */}
        <AvailabilityChecker />

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text" placeholder="Search by name or location…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg pl-9 pr-3 py-2.5 placeholder-zinc-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all"
            />
          </div>

          {/* Type filter */}
          <select value={typeFilter} onChange={e => setType(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 transition-all">
            {roomTypes.map(t => <option key={t} value={t}>{t === "All" ? "All Types" : t.replace(/([A-Z])/g, ' $1').trim()}</option>)}
          </select>

          {/* Status filter */}
          <select value={statusFilter} onChange={e => setStatus(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 transition-all">
            <option value="All">All Rooms</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>

        {/* ── Results count ── */}
        {!loading && (
          <p className="text-xs text-zinc-500">
            Showing <span className="text-zinc-300 font-medium">{filtered.length}</span> of {rooms.length} rooms
          </p>
        )}

        {/* ── Room grid ── */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="w-6 h-6 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : error ? (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <span className="text-3xl">🏢</span>
            <p className="text-sm text-zinc-500">No rooms match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(room => <RoomCard key={room.roomID} room={room} />)}
          </div>
        )}

      </div>
    </div>
  );
}