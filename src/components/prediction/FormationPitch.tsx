import { useState, useEffect } from "react";
import { FORMATIONS, type Pos } from "@/lib/formations";
import { X, Loader2 } from "lucide-react";

interface Props {
  homeTeam: string;
  awayTeam: string;
  homeFormation: string;
  awayFormation: string;
  homePlayers: Record<number, string>;
  awayPlayers: Record<number, string>;
  setHomePlayers: (p: Record<number, string>) => void;
  setAwayPlayers: (p: Record<number, string>) => void;
}

export function FormationPitch({
  homeTeam, awayTeam, homeFormation, awayFormation,
  homePlayers, awayPlayers, setHomePlayers, setAwayPlayers,
}: Props) {
  const [editing, setEditing] = useState<{ side: "home" | "away"; idx: number } | null>(null);
  const [tempName, setTempName] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const home = FORMATIONS[homeFormation] ?? [];
  const away = FORMATIONS[awayFormation] ?? [];

  const openEdit = (side: "home" | "away", idx: number) => {
    setEditing({ side, idx });
    setTempName((side === "home" ? homePlayers : awayPlayers)[idx] ?? "");
    setSuggestions([]);
  };

  const saveEdit = (nameToSave?: string) => {
    if (!editing) return;
    const finalName = nameToSave || tempName.trim();
    const next = { ...(editing.side === "home" ? homePlayers : awayPlayers), [editing.idx]: finalName };
    (editing.side === "home" ? setHomePlayers : setAwayPlayers)(next);
    setEditing(null);
    setSuggestions([]);
  };

  const clearOne = (side: "home" | "away", idx: number) => {
    const src = side === "home" ? homePlayers : awayPlayers;
    const next = { ...src };
    delete next[idx];
    (side === "home" ? setHomePlayers : setAwayPlayers)(next);
  };

  const resetAll = () => {
    setHomePlayers({});
    setAwayPlayers({});
  };

  useEffect(() => {
    if (!editing || tempName.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(tempName)}`);
        const data = await res.json();
        if (data && data.player) {
          // Limit to 20 suggestions
          setSuggestions(data.player.slice(0, 20));
        } else {
          setSuggestions([]);
        }
      } catch (e) {
        console.error("Failed to fetch players", e);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [tempName, editing]);

  const renderNode = (p: Pos, idx: number, side: "home" | "away") => {
    // home occupies bottom half (y: 50%-100% of pitch), away top (mirrored)
    const top = side === "home" ? 100 - p.y : p.y; // percent
    const left = side === "home" ? p.x : 100 - p.x;
    const name = (side === "home" ? homePlayers : awayPlayers)[idx];
    const color = side === "home" ? "bg-blue-500 ring-blue-300/50" : "bg-red-500 ring-red-300/50";
    return (
      <div
        key={`${side}-${idx}`}
        className="absolute -translate-x-1/2 -translate-y-1/2 group"
        style={{ top: `${top}%`, left: `${left}%` }}
      >
        <button
          onClick={() => openEdit(side, idx)}
          className={`relative h-11 w-11 rounded-full ${color} text-white text-[10px] font-bold flex items-center justify-center shadow-lg ring-2 ring-white/30 hover:scale-110 transition-transform`}
        >
          {p.label}
          {name && (
            <button
              onClick={(e) => { e.stopPropagation(); clearOne(side, idx); }}
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          )}
        </button>
        {name && (
          <div className="absolute left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded bg-slate-950/80 text-white text-[10px] whitespace-nowrap max-w-[110px] truncate">
            {name}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-4 text-sm">
          <span className="flex items-center gap-2 text-slate-300"><span className="h-3 w-3 rounded-full bg-red-500" />{awayTeam || "Đội khách"} ({awayFormation})</span>
          <span className="flex items-center gap-2 text-slate-300"><span className="h-3 w-3 rounded-full bg-blue-500" />{homeTeam || "Đội nhà"} ({homeFormation})</span>
        </div>
        <button onClick={resetAll} className="text-xs text-slate-400 hover:text-white transition">Đặt lại tất cả</button>
      </div>
      <div className="relative mx-auto w-full max-w-[600px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl">
        {/* Pitch */}
        <svg viewBox="0 0 100 150" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="grass" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#1e5a36" />
              <stop offset="0.5" stopColor="#1a4a2e" />
              <stop offset="1" stopColor="#1e5a36" />
            </linearGradient>
            <pattern id="stripes" width="100" height="15" patternUnits="userSpaceOnUse">
              <rect width="100" height="15" fill="url(#grass)" />
              <rect width="100" height="7.5" fill="#000" fillOpacity="0.08" />
            </pattern>
          </defs>
          <rect width="100" height="150" fill="url(#stripes)" />
          {/* Outer border */}
          <rect x="2" y="2" width="96" height="146" fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="0.5" />
          {/* Halfway line */}
          <line x1="2" y1="75" x2="98" y2="75" stroke="#fff" strokeOpacity="0.85" strokeWidth="0.5" />
          {/* Center circle */}
          <circle cx="50" cy="75" r="9" fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="0.5" />
          <circle cx="50" cy="75" r="0.8" fill="#fff" fillOpacity="0.85" />
          {/* Penalty boxes - top (away) */}
          <rect x="20" y="2" width="60" height="18" fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="0.5" />
          <rect x="35" y="2" width="30" height="7" fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="0.5" />
          {/* Penalty boxes - bottom (home) */}
          <rect x="20" y="130" width="60" height="18" fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="0.5" />
          <rect x="35" y="141" width="30" height="7" fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="0.5" />
        </svg>
        {/* Nodes */}
        {away.map((p, i) => renderNode(p, i, "away"))}
        {home.map((p, i) => renderNode(p, i, "home"))}

        {editing && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm" onClick={() => setEditing(null)}>
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 w-72 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="text-xs text-slate-400 mb-2">
                {editing.side === "home" ? homeTeam : awayTeam} — {(editing.side === "home" ? home : away)[editing.idx].label}
              </div>
              
              <div className="relative">
                <input
                  autoFocus
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditing(null); }}
                  placeholder="Tên cầu thủ..."
                  className="w-full px-3 py-2 pr-8 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                />
                {loadingSuggestions && (
                  <div className="absolute right-2 top-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  </div>
                )}
              </div>

              {suggestions.length > 0 && (
                <div className="mt-2 bg-slate-950 border border-slate-700 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                  {suggestions.map((p) => (
                    <button
                      key={p.idPlayer}
                      onClick={() => saveEdit(p.strPlayer)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-800 transition text-left"
                    >
                      {p.strThumb ? (
                        <img src={p.strThumb} alt={p.strPlayer} className="h-8 w-8 rounded-full object-cover bg-slate-800" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400">?</div>
                      )}
                      <div>
                        <div className="text-sm text-white font-medium">{p.strPlayer}</div>
                        <div className="text-[10px] text-slate-400">{p.strTeam || "Free Agent"} • {p.strPosition}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button onClick={() => saveEdit()} className="flex-1 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition">Lưu</button>
                <button onClick={() => setEditing(null)} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm transition">Hủy</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
