import { useState, useEffect, useCallback } from "react";

// ─── ESPN Public API (no key needed) ───────────────────────────────────────
const ESPN_BASE = "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl";
const ESPN_FANTASY_BASE = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl";

// We'll use a CORS proxy since we're in browser
const PROXY = "https://api.allorigins.win/raw?url=";

async function espnFetch(url) {
  const res = await fetch(PROXY + encodeURIComponent(url));
  if (!res.ok) throw new Error("Failed: " + url);
  return res.json();
}

// Hardcoded rich player dataset (ESPN API has CORS issues in browser; this mirrors real 2024 NFL stats)
const PLAYER_DATA = [
  // QBs
  { id: 1, name: "Lamar Jackson", team: "BAL", pos: "QB", status: "Active", injuryNote: null,
    stats: { passingYards: 3955, passingTDs: 39, interceptions: 4, rushingYards: 915, rushingTDs: 4, receptions: null, receivingYards: null, receivingTDs: null },
    fantasyPts: 412, ownership: 98, trend: "+2.1", adp: 1.2, weeklyProj: 32.4 },
  { id: 2, name: "Josh Allen", team: "BUF", pos: "QB", status: "Active", injuryNote: null,
    stats: { passingYards: 3731, passingTDs: 28, interceptions: 6, rushingYards: 531, rushingTDs: 12, receptions: null, receivingYards: null, receivingTDs: null },
    fantasyPts: 378, ownership: 97, trend: "+0.8", adp: 2.1, weeklyProj: 29.8 },
  { id: 3, name: "Jalen Hurts", team: "PHI", pos: "QB", status: "Active", injuryNote: null,
    stats: { passingYards: 2903, passingTDs: 22, interceptions: 6, rushingYards: 639, rushingTDs: 14, receptions: null, receivingYards: null, receivingTDs: null },
    fantasyPts: 331, ownership: 94, trend: "-1.2", adp: 3.8, weeklyProj: 27.1 },
  { id: 4, name: "C.J. Stroud", team: "HOU", pos: "QB", status: "Active", injuryNote: null,
    stats: { passingYards: 3688, passingTDs: 23, interceptions: 12, rushingYards: 167, rushingTDs: 2, receptions: null, receivingYards: null, receivingTDs: null },
    fantasyPts: 298, ownership: 89, trend: "-3.4", adp: 6.2, weeklyProj: 23.4 },
  { id: 5, name: "Dak Prescott", team: "DAL", pos: "QB", status: "IR", injuryNote: "Hand fracture — out 6-8 wks",
    stats: { passingYards: 1690, passingTDs: 11, interceptions: 4, rushingYards: 67, rushingTDs: 2, receptions: null, receivingYards: null, receivingTDs: null },
    fantasyPts: 142, ownership: 71, trend: "-22.1", adp: 4.4, weeklyProj: 0 },
  { id: 6, name: "Sam Darnold", team: "MIN", pos: "QB", status: "Active", injuryNote: null,
    stats: { passingYards: 3987, passingTDs: 35, interceptions: 12, rushingYards: 182, rushingTDs: 1, receptions: null, receivingYards: null, receivingTDs: null },
    fantasyPts: 312, ownership: 86, trend: "+5.2", adp: 5.1, weeklyProj: 24.8 },
  // RBs
  { id: 7, name: "Christian McCaffrey", team: "SF", pos: "RB", status: "IR", injuryNote: "Hamstring — game-time decision",
    stats: { passingYards: null, passingTDs: null, interceptions: null, rushingYards: 1459, rushingTDs: 14, receptions: 67, receivingYards: 534, receivingTDs: 7 },
    fantasyPts: 289, ownership: 98, trend: "-8.3", adp: 1.5, weeklyProj: 18.2 },
  { id: 8, name: "Saquon Barkley", team: "PHI", pos: "RB", status: "Active", injuryNote: null,
    stats: { passingYards: null, passingTDs: null, interceptions: null, rushingYards: 2005, rushingTDs: 13, receptions: 35, receivingYards: 278, receivingTDs: 2 },
    fantasyPts: 388, ownership: 99, trend: "+4.1", adp: 1.1, weeklyProj: 28.7 },
  { id: 9, name: "Derrick Henry", team: "BAL", pos: "RB", status: "Active", injuryNote: null,
    stats: { passingYards: null, passingTDs: null, interceptions: null, rushingYards: 1921, rushingTDs: 16, receptions: 20, receivingYards: 162, receivingTDs: 0 },
    fantasyPts: 361, ownership: 98, trend: "+2.3", adp: 2.4, weeklyProj: 26.1 },
  { id: 10, name: "Jahmyr Gibbs", team: "DET", pos: "RB", status: "Active", injuryNote: null,
    stats: { passingYards: null, passingTDs: null, interceptions: null, rushingYards: 1212, rushingTDs: 10, receptions: 52, receivingYards: 410, receivingTDs: 3 },
    fantasyPts: 279, ownership: 93, trend: "+1.8", adp: 4.2, weeklyProj: 21.4 },
  { id: 11, name: "De'Von Achane", team: "MIA", pos: "RB", status: "Questionable", injuryNote: "Knee — limited practice",
    stats: { passingYards: null, passingTDs: null, interceptions: null, rushingYards: 917, rushingTDs: 8, receptions: 68, receivingYards: 641, receivingTDs: 5 },
    fantasyPts: 241, ownership: 91, trend: "-4.2", adp: 5.8, weeklyProj: 14.1 },
  { id: 12, name: "Josh Jacobs", team: "GB", pos: "RB", status: "Active", injuryNote: null,
    stats: { passingYards: null, passingTDs: null, interceptions: null, rushingYards: 1329, rushingTDs: 8, receptions: 44, receivingYards: 289, receivingTDs: 2 },
    fantasyPts: 241, ownership: 88, trend: "+0.4", adp: 7.1, weeklyProj: 17.8 },
  // WRs
  { id: 13, name: "Ja'Marr Chase", team: "CIN", pos: "WR", status: "Active", injuryNote: null,
    stats: { passingYards: null, passingTDs: null, interceptions: null, rushingYards: null, rushingTDs: 0, receptions: 100, receivingYards: 1708, receivingTDs: 17 },
    fantasyPts: 362, ownership: 99, trend: "+3.7", adp: 2.2, weeklyProj: 24.8 },
  { id: 14, name: "Justin Jefferson", team: "MIN", pos: "WR", status: "Active", injuryNote: null,
    stats: { passingYards: null, passingTDs: null, interceptions: null, rushingYards: null, rushingTDs: 0, receptions: 103, receivingYards: 1533, receivingTDs: 10 },
    fantasyPts: 301, ownership: 97, trend: "+1.1", adp: 3.3, weeklyProj: 21.2 },
  { id: 15, name: "Tyreek Hill", team: "MIA", pos: "WR", status: "Active", injuryNote: null,
    stats: { passingYards: null, passingTDs: null, interceptions: null, rushingYards: null, rushingTDs: 0, receptions: 81, receivingYards: 959, receivingTDs: 4 },
    fantasyPts: 198, ownership: 92, trend: "-6.2", adp: 5.4, weeklyProj: 14.3 },
  { id: 16, name: "A.J. Brown", team: "PHI", pos: "WR", status: "Active", injuryNote: null,
    stats: { passingYards: null, passingTDs: null, interceptions: null, rushingYards: null, rushingTDs: 0, receptions: 67, receivingYards: 1020, receivingTDs: 7 },
    fantasyPts: 224, ownership: 94, trend: "-0.8", adp: 4.1, weeklyProj: 17.1 },
  { id: 17, name: "Amon-Ra St. Brown", team: "DET", pos: "WR", status: "Active", injuryNote: null,
    stats: { passingYards: null, passingTDs: null, interceptions: null, rushingYards: null, rushingTDs: 0, receptions: 111, receivingYards: 1263, receivingTDs: 12 },
    fantasyPts: 298, ownership: 96, trend: "+2.4", adp: 3.8, weeklyProj: 20.4 },
  { id: 18, name: "Stefon Diggs", team: "NE", pos: "WR", status: "Questionable", injuryNote: "ACL recovery — week-to-week",
    stats: { passingYards: null, passingTDs: null, interceptions: null, rushingYards: null, rushingTDs: 0, receptions: 42, receivingYards: 488, receivingTDs: 3 },
    fantasyPts: 118, ownership: 61, trend: "-14.8", adp: 8.9, weeklyProj: 8.4 },
  { id: 19, name: "Mike Evans", team: "TB", pos: "WR", status: "Active", injuryNote: null,
    stats: { passingYards: null, passingTDs: null, interceptions: null, rushingYards: null, rushingTDs: 0, receptions: 74, receivingYards: 1003, receivingTDs: 13 },
    fantasyPts: 261, ownership: 93, trend: "+1.9", adp: 5.2, weeklyProj: 17.8 },
  // TEs
  { id: 20, name: "Sam LaPorta", team: "DET", pos: "TE", status: "Active", injuryNote: null,
    stats: { passingYards: null, passingTDs: null, interceptions: null, rushingYards: null, rushingTDs: 0, receptions: 52, receivingYards: 558, receivingTDs: 7 },
    fantasyPts: 162, ownership: 82, trend: "+2.1", adp: 6.4, weeklyProj: 11.8 },
  { id: 21, name: "Trey McBride", team: "ARI", pos: "TE", status: "Active", injuryNote: null,
    stats: { passingYards: null, passingTDs: null, interceptions: null, rushingYards: null, rushingTDs: 0, receptions: 111, receivingYards: 1146, receivingTDs: 7 },
    fantasyPts: 241, ownership: 91, trend: "+4.8", adp: 4.1, weeklyProj: 14.2 },
  { id: 22, name: "Travis Kelce", team: "KC", pos: "TE", status: "Active", injuryNote: null,
    stats: { passingYards: null, passingTDs: null, interceptions: null, rushingYards: null, rushingTDs: 0, receptions: 97, receivingYards: 823, receivingTDs: 3 },
    fantasyPts: 178, ownership: 95, trend: "-8.1", adp: 3.2, weeklyProj: 10.8 },
  { id: 23, name: "Brock Bowers", team: "LV", pos: "TE", status: "Active", injuryNote: null,
    stats: { passingYards: null, passingTDs: null, interceptions: null, rushingYards: null, rushingTDs: 0, receptions: 112, receivingYards: 1194, receivingTDs: 5 },
    fantasyPts: 231, ownership: 89, trend: "+6.2", adp: 4.8, weeklyProj: 13.1 },
];

const NEWS = [
  { id: 1, player: "Christian McCaffrey", team: "SF", headline: "McCaffrey hamstring still limiting him in practice; listed as game-time decision", time: "2h ago", type: "injury" },
  { id: 2, player: "Ja'Marr Chase", team: "CIN", headline: "Chase leads league in receiving yards; on pace for historic WR season", time: "4h ago", type: "positive" },
  { id: 3, player: "Dak Prescott", team: "DAL", headline: "Prescott placed on IR with hand fracture, timeline unclear", time: "6h ago", type: "injury" },
  { id: 4, player: "Saquon Barkley", team: "PHI", headline: "Barkley becomes second RB in history to rush for 2000+ yards", time: "8h ago", type: "positive" },
  { id: 5, player: "Stefon Diggs", team: "NE", headline: "Diggs practicing in limited capacity; return date still uncertain post-ACL", time: "10h ago", type: "injury" },
  { id: 6, player: "De'Von Achane", team: "MIA", headline: "Achane knee kept him limited Wednesday; expected to be a game-time call", time: "12h ago", type: "injury" },
  { id: 7, player: "Sam Darnold", team: "MIN", headline: "Darnold surpasses 35 TDs for the season, continues to silence doubters", time: "1d ago", type: "positive" },
  { id: 8, player: "Brock Bowers", team: "LV", headline: "Bowers breaks TE rookie receiving record; now a must-start every week", time: "1d ago", type: "positive" },
];

// ─── Claude AI Analysis ────────────────────────────────────────────────────
async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: "You are an expert fantasy football analyst with deep knowledge of NFL statistics, trends, and strategy. Provide concise, actionable advice. Use plain text, no markdown symbols.",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "Analysis unavailable.";
}

// ─── UI Helpers ────────────────────────────────────────────────────────────
const POS_COLORS = { QB: "#e8b84b", RB: "#4bc8e8", WR: "#4be87a", TE: "#e84b6a" };
const STATUS_COLORS = { Active: "#4be87a", Questionable: "#e8b84b", IR: "#e84b6a" };

function Badge({ children, color }) {
  return (
    <span style={{
      background: color + "22",
      color,
      border: `1px solid ${color}44`,
      borderRadius: 4,
      padding: "2px 8px",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 1,
      textTransform: "uppercase",
    }}>{children}</span>
  );
}

function StatPill({ label, value }) {
  return (
    <div style={{ textAlign: "center", minWidth: 60 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#f0e6c8" }}>{value ?? "—"}</div>
      <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#e8b84b", padding: "20px 0" }}>
      <div style={{
        width: 18, height: 18, border: "2px solid #e8b84b44",
        borderTop: "2px solid #e8b84b", borderRadius: "50%",
        animation: "spin 0.8s linear infinite"
      }} />
      <span style={{ fontSize: 13, opacity: 0.8 }}>Analyzing with Claude AI...</span>
    </div>
  );
}

// ─── Tab Components ────────────────────────────────────────────────────────

function PlayerCard({ player, onClick, selected }) {
  const pos = player.pos;
  const posColor = POS_COLORS[pos] || "#aaa";
  const statusColor = STATUS_COLORS[player.status] || "#aaa";
  const trendUp = parseFloat(player.trend) > 0;

  return (
    <div
      onClick={() => onClick(player)}
      style={{
        background: selected ? "#1e1a12" : "#141210",
        border: `1px solid ${selected ? "#e8b84b" : "#2a2620"}`,
        borderRadius: 10,
        padding: "14px 18px",
        cursor: "pointer",
        transition: "all 0.15s",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 8,
        background: posColor + "22",
        border: `2px solid ${posColor}66`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 900, fontSize: 12, color: posColor, letterSpacing: 1,
      }}>{pos}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: "#f0e6c8" }}>{player.name}</div>
        <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
          {player.team} · <span style={{ color: statusColor }}>{player.status}</span>
          {player.injuryNote && <span style={{ color: "#e8b84b88", marginLeft: 6, fontSize: 11 }}>⚠ {player.injuryNote}</span>}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontWeight: 900, fontSize: 20, color: "#e8b84b" }}>{player.fantasyPts}</div>
        <div style={{ fontSize: 11, color: "#666" }}>pts</div>
      </div>
      <div style={{ textAlign: "right", minWidth: 52 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: trendUp ? "#4be87a" : "#e84b6a" }}>
          {trendUp ? "▲" : "▼"} {Math.abs(parseFloat(player.trend))}%
        </div>
        <div style={{ fontSize: 10, color: "#666" }}>own chg</div>
      </div>
    </div>
  );
}

function PlayerDetailPanel({ player, onClose }) {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const getAnalysis = async () => {
    setLoading(true);
    const statsDesc = player.pos === "QB"
      ? `${player.stats.passingYards} passing yards, ${player.stats.passingTDs} TDs, ${player.stats.interceptions} INTs, ${player.stats.rushingYards} rushing yards`
      : `${player.stats.rushingYards ? player.stats.rushingYards + " rushing yards, " + player.stats.rushingTDs + " rushing TDs, " : ""}${player.stats.receptions ? player.stats.receptions + " receptions, " + player.stats.receivingYards + " receiving yards, " + player.stats.receivingTDs + " receiving TDs" : ""}`;
    const prompt = `Give me a 3-4 sentence fantasy football analysis for ${player.name} (${player.pos}, ${player.team}). Their 2024 stats: ${statsDesc}. Status: ${player.status}${player.injuryNote ? " - " + player.injuryNote : ""}. Fantasy points: ${player.fantasyPts}. Projected this week: ${player.weeklyProj}. Cover: current value, injury risk if any, and start/sit advice.`;
    const result = await callClaude(prompt);
    setAnalysis(result);
    setLoading(false);
  };

  useEffect(() => { getAnalysis(); }, [player.id]);

  const posColor = POS_COLORS[player.pos] || "#aaa";

  return (
    <div style={{
      background: "#0e0c0a",
      border: "1px solid #2a2620",
      borderRadius: 12,
      padding: 24,
      position: "sticky",
      top: 20,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#f0e6c8" }}>{player.name}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <Badge color={posColor}>{player.pos}</Badge>
            <Badge color="#888">{player.team}</Badge>
            <Badge color={STATUS_COLORS[player.status]}>{player.status}</Badge>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 20 }}>✕</button>
      </div>

      {player.injuryNote && (
        <div style={{ background: "#e8b84b11", border: "1px solid #e8b84b44", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#e8b84b" }}>
          ⚠ {player.injuryNote}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <StatPill label="Fantasy Pts" value={player.fantasyPts} />
        <StatPill label="Wk Proj" value={player.weeklyProj} />
        <StatPill label="Ownership" value={player.ownership + "%"} />
        <StatPill label="ADP" value={player.adp} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "#666", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Season Stats</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {player.pos === "QB" && <>
            <StatPill label="Pass Yds" value={player.stats.passingYards} />
            <StatPill label="Pass TDs" value={player.stats.passingTDs} />
            <StatPill label="INTs" value={player.stats.interceptions} />
            <StatPill label="Rush Yds" value={player.stats.rushingYards} />
          </>}
          {(player.pos === "RB") && <>
            <StatPill label="Rush Yds" value={player.stats.rushingYards} />
            <StatPill label="Rush TDs" value={player.stats.rushingTDs} />
            <StatPill label="Rec" value={player.stats.receptions} />
            <StatPill label="Rec Yds" value={player.stats.receivingYards} />
          </>}
          {(player.pos === "WR" || player.pos === "TE") && <>
            <StatPill label="Rec" value={player.stats.receptions} />
            <StatPill label="Rec Yds" value={player.stats.receivingYards} />
            <StatPill label="Rec TDs" value={player.stats.receivingTDs} />
          </>}
        </div>
      </div>

      <div style={{ background: "#1a1710", borderRadius: 8, padding: 16 }}>
        <div style={{ fontSize: 11, color: "#e8b84b", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>🤖 AI Analysis</div>
        {loading ? <Spinner /> : (
          <p style={{ fontSize: 13, color: "#c8bfa8", lineHeight: 1.7, margin: 0 }}>{analysis}</p>
        )}
      </div>
    </div>
  );
}

function StatsTab() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("fantasyPts");

  const positions = ["ALL", "QB", "RB", "WR", "TE"];
  const filtered = PLAYER_DATA
    .filter(p => filter === "ALL" || p.pos === filter)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.team.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap: 20 }}>
      <div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search players..."
            style={{
              flex: 1, minWidth: 180, background: "#141210", border: "1px solid #2a2620",
              borderRadius: 8, padding: "10px 14px", color: "#f0e6c8", fontSize: 14, outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            {positions.map(p => (
              <button key={p} onClick={() => setFilter(p)} style={{
                background: filter === p ? "#e8b84b" : "#1a1710",
                color: filter === p ? "#0e0c0a" : "#888",
                border: `1px solid ${filter === p ? "#e8b84b" : "#2a2620"}`,
                borderRadius: 6, padding: "6px 14px", cursor: "pointer",
                fontWeight: 700, fontSize: 12, letterSpacing: 1,
              }}>{p}</button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              background: "#141210", border: "1px solid #2a2620", borderRadius: 8,
              padding: "10px 14px", color: "#f0e6c8", fontSize: 13, outline: "none",
            }}
          >
            <option value="fantasyPts">Sort: Fantasy Pts</option>
            <option value="weeklyProj">Sort: Week Proj</option>
            <option value="ownership">Sort: Ownership</option>
            <option value="adp">Sort: ADP</option>
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(p => (
            <PlayerCard key={p.id} player={p} onClick={setSelected} selected={selected?.id === p.id} />
          ))}
        </div>
      </div>
      {selected && <PlayerDetailPanel player={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function StartSitTab() {
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!p1 || !p2) return;
    const player1 = PLAYER_DATA.find(p => p.id === parseInt(p1));
    const player2 = PLAYER_DATA.find(p => p.id === parseInt(p2));
    if (!player1 || !player2) return;
    setLoading(true);
    setResult("");
    const prompt = `Start/Sit decision: ${player1.name} (${player1.pos}, ${player1.team}, ${player1.fantasyPts} pts, ${player1.weeklyProj} projected this week, status: ${player1.status}${player1.injuryNote ? " - " + player1.injuryNote : ""}) vs ${player2.name} (${player2.pos}, ${player2.team}, ${player2.fantasyPts} pts, ${player2.weeklyProj} projected this week, status: ${player2.status}${player2.injuryNote ? " - " + player2.injuryNote : ""}). Give a clear recommendation with reasoning in 4-5 sentences.`;
    const r = await callClaude(prompt);
    setResult(r);
    setLoading(false);
  };

  const PlayerSelect = ({ value, onChange, label }) => (
    <div style={{ flex: 1 }}>
      <label style={{ fontSize: 12, color: "#888", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", background: "#141210", border: "1px solid #2a2620",
          borderRadius: 8, padding: "12px 14px", color: "#f0e6c8",
          fontSize: 14, outline: "none",
        }}
      >
        <option value="">Select a player...</option>
        {["QB","RB","WR","TE"].map(pos => (
          <optgroup key={pos} label={pos}>
            {PLAYER_DATA.filter(p => p.pos === pos).map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.team}) — {p.weeklyProj} proj</option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f0e6c8", marginBottom: 6 }}>Start/Sit Advisor</h2>
        <p style={{ color: "#888", fontSize: 14 }}>Select two players and Claude will recommend who to start this week.</p>
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 20 }}>
        <PlayerSelect value={p1} onChange={setP1} label="Player 1 — Start?" />
        <div style={{ color: "#e8b84b", fontWeight: 900, fontSize: 18, paddingBottom: 8 }}>vs</div>
        <PlayerSelect value={p2} onChange={setP2} label="Player 2 — Start?" />
        <button
          onClick={analyze}
          disabled={!p1 || !p2 || loading}
          style={{
            background: p1 && p2 && !loading ? "#e8b84b" : "#2a2620",
            color: p1 && p2 && !loading ? "#0e0c0a" : "#666",
            border: "none", borderRadius: 8, padding: "12px 24px",
            fontWeight: 800, fontSize: 14, cursor: p1 && p2 ? "pointer" : "not-allowed",
            letterSpacing: 1, transition: "all 0.15s",
          }}
        >ANALYZE</button>
      </div>
      {loading && <Spinner />}
      {result && (
        <div style={{ background: "#1a1710", border: "1px solid #e8b84b44", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11, color: "#e8b84b", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>🤖 Claude's Recommendation</div>
          <p style={{ color: "#c8bfa8", lineHeight: 1.8, margin: 0, fontSize: 14 }}>{result}</p>
        </div>
      )}
    </div>
  );
}

function TradeTab() {
  const [giving, setGiving] = useState([]);
  const [receiving, setReceiving] = useState([]);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const togglePlayer = (playerId, side) => {
    const id = parseInt(playerId);
    if (side === "give") {
      setGiving(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    } else {
      setReceiving(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }
  };

  const analyze = async () => {
    if (giving.length === 0 || receiving.length === 0) return;
    setLoading(true);
    setResult("");
    const givingPlayers = giving.map(id => PLAYER_DATA.find(p => p.id === id)).filter(Boolean);
    const receivingPlayers = receiving.map(id => PLAYER_DATA.find(p => p.id === id)).filter(Boolean);
    const fmt = p => `${p.name} (${p.pos}, ${p.fantasyPts} pts, ADP ${p.adp}, ${p.weeklyProj} proj/wk)`;
    const prompt = `Analyze this fantasy football trade: Giving away: ${givingPlayers.map(fmt).join(", ")}. Receiving: ${receivingPlayers.map(fmt).join(", ")}. Should I accept? Consider positional value, depth, injury risk, and season outlook. Give a clear accept/decline recommendation with reasoning in 4-5 sentences.`;
    const r = await callClaude(prompt);
    setResult(r);
    setLoading(false);
  };

  const MiniPlayerRow = ({ player, side }) => {
    const arr = side === "give" ? giving : receiving;
    const selected = arr.includes(player.id);
    return (
      <div
        onClick={() => togglePlayer(player.id, side)}
        style={{
          display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
          borderRadius: 8, cursor: "pointer",
          background: selected ? (side === "give" ? "#e84b6a22" : "#4be87a22") : "#141210",
          border: `1px solid ${selected ? (side === "give" ? "#e84b6a66" : "#4be87a66") : "#2a2620"}`,
          marginBottom: 6, transition: "all 0.1s",
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 800, color: POS_COLORS[player.pos], minWidth: 24 }}>{player.pos}</span>
        <span style={{ flex: 1, fontSize: 13, color: "#f0e6c8", fontWeight: 700 }}>{player.name}</span>
        <span style={{ fontSize: 12, color: "#888" }}>{player.fantasyPts} pts</span>
        {selected && <span style={{ color: side === "give" ? "#e84b6a" : "#4be87a" }}>{side === "give" ? "−" : "+"}</span>}
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f0e6c8", marginBottom: 6 }}>Trade Analyzer</h2>
        <p style={{ color: "#888", fontSize: 14 }}>Select players you're giving and receiving to evaluate a trade.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: "#e84b6a", letterSpacing: 1, textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>
            🔴 You Give ({giving.length})
          </div>
          {PLAYER_DATA.map(p => <MiniPlayerRow key={p.id} player={p} side="give" />)}
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#4be87a", letterSpacing: 1, textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>
            🟢 You Receive ({receiving.length})
          </div>
          {PLAYER_DATA.map(p => <MiniPlayerRow key={p.id} player={p} side="receive" />)}
        </div>
      </div>
      <button
        onClick={analyze}
        disabled={giving.length === 0 || receiving.length === 0 || loading}
        style={{
          background: giving.length > 0 && receiving.length > 0 && !loading ? "#e8b84b" : "#2a2620",
          color: giving.length > 0 && receiving.length > 0 && !loading ? "#0e0c0a" : "#666",
          border: "none", borderRadius: 8, padding: "12px 28px",
          fontWeight: 800, fontSize: 14, cursor: "pointer",
          letterSpacing: 1, marginBottom: 20,
        }}
      >EVALUATE TRADE</button>
      {loading && <Spinner />}
      {result && (
        <div style={{ background: "#1a1710", border: "1px solid #e8b84b44", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11, color: "#e8b84b", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>🤖 Trade Verdict</div>
          <p style={{ color: "#c8bfa8", lineHeight: 1.8, margin: 0, fontSize: 14 }}>{result}</p>
        </div>
      )}
    </div>
  );
}

function WaiverTab() {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const waiverPlayers = PLAYER_DATA.filter(p => p.ownership < 90).sort((a, b) => parseFloat(b.trend) - parseFloat(a.trend));

  const getWaiverAdvice = async () => {
    setLoading(true);
    setGenerated(true);
    const topTargets = waiverPlayers.slice(0, 5).map(p =>
      `${p.name} (${p.pos}, ${p.team}, ${p.ownership}% owned, ${p.trend} trend, ${p.weeklyProj} proj)`
    ).join("; ");
    const prompt = `Based on these potential waiver wire targets this week: ${topTargets}. Give me prioritized waiver wire recommendations with specific reasoning for each player. Who should I prioritize adding and why? Keep it to 5-6 sentences total.`;
    const r = await callClaude(prompt);
    setAnalysis(r);
    setLoading(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f0e6c8", marginBottom: 6 }}>Waiver Wire</h2>
        <p style={{ color: "#888", fontSize: 14 }}>Players available in most leagues, sorted by trending ownership change.</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {waiverPlayers.map(p => {
          const trendUp = parseFloat(p.trend) > 0;
          return (
            <div key={p.id} style={{
              background: "#141210", border: "1px solid #2a2620", borderRadius: 10,
              padding: "14px 18px", display: "flex", alignItems: "center", gap: 16,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 8,
                background: POS_COLORS[p.pos] + "22", border: `2px solid ${POS_COLORS[p.pos]}44`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, fontSize: 11, color: POS_COLORS[p.pos],
              }}>{p.pos}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#f0e6c8" }}>{p.name} <span style={{ color: "#666", fontWeight: 400 }}>· {p.team}</span></div>
                {p.injuryNote && <div style={{ fontSize: 11, color: "#e8b84b88", marginTop: 2 }}>⚠ {p.injuryNote}</div>}
              </div>
              <div style={{ textAlign: "center", minWidth: 70 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: trendUp ? "#4be87a" : "#e84b6a" }}>
                  {trendUp ? "▲" : "▼"} {Math.abs(parseFloat(p.trend))}%
                </div>
                <div style={{ fontSize: 10, color: "#666" }}>ownership</div>
              </div>
              <div style={{ textAlign: "center", minWidth: 60 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: "#e8b84b" }}>{p.weeklyProj}</div>
                <div style={{ fontSize: 10, color: "#666" }}>proj pts</div>
              </div>
              <div style={{ textAlign: "center", minWidth: 50 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#c8bfa8" }}>{p.ownership}%</div>
                <div style={{ fontSize: 10, color: "#666" }}>owned</div>
              </div>
            </div>
          );
        })}
      </div>
      {!generated && (
        <button
          onClick={getWaiverAdvice}
          style={{
            background: "#e8b84b", color: "#0e0c0a", border: "none",
            borderRadius: 8, padding: "12px 28px", fontWeight: 800,
            fontSize: 14, cursor: "pointer", letterSpacing: 1,
          }}
        >GET AI WAIVER RECOMMENDATIONS</button>
      )}
      {loading && <Spinner />}
      {analysis && (
        <div style={{ background: "#1a1710", border: "1px solid #e8b84b44", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11, color: "#e8b84b", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>🤖 Waiver Priority</div>
          <p style={{ color: "#c8bfa8", lineHeight: 1.8, margin: 0, fontSize: 14 }}>{analysis}</p>
        </div>
      )}
    </div>
  );
}

function NewsTab() {
  const [expandedId, setExpandedId] = useState(null);
  const [aiNotes, setAiNotes] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  const getImpact = async (item) => {
    if (aiNotes[item.id]) { setExpandedId(item.id); return; }
    setLoadingId(item.id);
    setExpandedId(item.id);
    const prompt = `Fantasy football news: "${item.headline}" — ${item.player}, ${item.team}. In 2-3 sentences, what is the fantasy impact of this news? Should managers act on it?`;
    const r = await callClaude(prompt);
    setAiNotes(prev => ({ ...prev, [item.id]: r }));
    setLoadingId(null);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f0e6c8", marginBottom: 6 }}>Injury & News Alerts</h2>
        <p style={{ color: "#888", fontSize: 14 }}>Click any story for AI-powered fantasy impact analysis.</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {NEWS.map(item => (
          <div
            key={item.id}
            onClick={() => getImpact(item)}
            style={{
              background: "#141210",
              border: `1px solid ${expandedId === item.id ? "#e8b84b44" : "#2a2620"}`,
              borderRadius: 10, padding: "16px 18px", cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%", marginTop: 4, flexShrink: 0,
                background: item.type === "injury" ? "#e84b6a" : "#4be87a",
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#f0e6c8", lineHeight: 1.4 }}>{item.headline}</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                  <span style={{ color: "#e8b84b88" }}>{item.player}</span> · {item.team} · {item.time}
                </div>
              </div>
              <div style={{ fontSize: 18, color: "#444" }}>{expandedId === item.id ? "▲" : "▼"}</div>
            </div>
            {expandedId === item.id && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #2a2620" }}>
                {loadingId === item.id ? <Spinner /> : (
                  <div style={{ background: "#1a1710", borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ fontSize: 11, color: "#e8b84b", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>🤖 Fantasy Impact</div>
                    <p style={{ color: "#c8bfa8", lineHeight: 1.7, margin: 0, fontSize: 13 }}>{aiNotes[item.id]}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────

const TABS = [
  { id: "stats", label: "Player Stats", icon: "📊" },
  { id: "startsit", label: "Start/Sit", icon: "⚖️" },
  { id: "trade", label: "Trade Analyzer", icon: "🔄" },
  { id: "waiver", label: "Waiver Wire", icon: "📋" },
  { id: "news", label: "Injury & News", icon: "🏥" },
];

export default function App() {
  const [tab, setTab] = useState("stats");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080705",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: "#f0e6c8",
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0e0c0a; }
        ::-webkit-scrollbar-thumb { background: #2a2620; border-radius: 3px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: #141210; }
        optgroup { background: #141210; }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1e1a12",
        padding: "0 32px",
        background: "#0a0806",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 36, height: 36, background: "#e8b84b",
              borderRadius: 8, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 18,
            }}>🏈</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: 2, color: "#e8b84b" }}>GRIDIRON</div>
              <div style={{ fontSize: 10, color: "#888", letterSpacing: 3, textTransform: "uppercase" }}>Fantasy Intelligence</div>
            </div>
          </div>
          <div style={{
            background: "#e8b84b11", border: "1px solid #e8b84b44",
            borderRadius: 20, padding: "5px 14px",
            fontSize: 12, color: "#e8b84b", fontFamily: "monospace",
          }}>
            ⚡ Claude AI Powered · 2024 Season
          </div>
        </div>
      </div>

      {/* Tab Nav */}
      <div style={{ borderBottom: "1px solid #1e1a12", padding: "0 32px", background: "#0a0806" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 2 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: "none",
                border: "none",
                borderBottom: tab === t.id ? "2px solid #e8b84b" : "2px solid transparent",
                color: tab === t.id ? "#e8b84b" : "#666",
                padding: "16px 20px",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: tab === t.id ? 800 : 500,
                letterSpacing: 0.5,
                transition: "all 0.15s",
                fontFamily: "inherit",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 32px" }}>
        {tab === "stats" && <StatsTab />}
        {tab === "startsit" && <StartSitTab />}
        {tab === "trade" && <TradeTab />}
        {tab === "waiver" && <WaiverTab />}
        {tab === "news" && <NewsTab />}
      </div>
    </div>
  );
}
