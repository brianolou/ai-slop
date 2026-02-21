import { useState, useEffect, useRef } from "react";

// ─── DATA ──────────────────────────────────────────────────────────────────

const TEAMS = {
  NYY: { name: "Yankees",    city: "New York",    lg: "AL", div: "East", color: "#C4CED4", runs: 810, ra: 680, era: 3.71, whip: 1.18, woba: .332, bullpenERA: 3.45, parkFactor: 1.02, sp: ["Gerrit Cole","Carlos Rodón","Luis Gil","Clarke Schmidt","Marcus Stroman"] },
  BOS: { name: "Red Sox",    city: "Boston",      lg: "AL", div: "East", color: "#BD3039", runs: 756, ra: 741, era: 4.12, whip: 1.31, woba: .318, bullpenERA: 4.01, parkFactor: 1.05, sp: ["Brayan Bello","Tanner Houck","Garrett Whitlock","Nick Pivetta","James Paxton"] },
  BAL: { name: "Orioles",    city: "Baltimore",   lg: "AL", div: "East", color: "#DF4601", runs: 807, ra: 680, era: 3.81, whip: 1.22, woba: .331, bullpenERA: 3.55, parkFactor: 0.98, sp: ["Corbin Burnes","Zach Eflin","Dean Kremer","Kyle Bradish","Grayson Rodriguez"] },
  TOR: { name: "Blue Jays",  city: "Toronto",     lg: "AL", div: "East", color: "#134A8E", runs: 746, ra: 748, era: 4.18, whip: 1.29, woba: .315, bullpenERA: 4.21, parkFactor: 1.01, sp: ["Kevin Gausman","José Berríos","Chris Bassitt","Yusei Kikuchi","Alek Manoah"] },
  TBR: { name: "Rays",       city: "Tampa Bay",   lg: "AL", div: "East", color: "#092C5C", runs: 724, ra: 697, era: 3.92, whip: 1.24, woba: .313, bullpenERA: 3.68, parkFactor: 0.96, sp: ["Zach Eflin","Shane McClanahan","Aaron Civale","Taj Bradley","Zack Littell"] },
  HOU: { name: "Astros",     city: "Houston",     lg: "AL", div: "West", color: "#EB6E1F", runs: 784, ra: 669, era: 3.62, whip: 1.19, woba: .325, bullpenERA: 3.31, parkFactor: 0.97, sp: ["Framber Valdez","Hunter Brown","Ronel Blanco","Spencer Arrighetti","Yusei Kikuchi"] },
  SEA: { name: "Mariners",   city: "Seattle",     lg: "AL", div: "West", color: "#0C2C56", runs: 719, ra: 647, era: 3.51, whip: 1.18, woba: .310, bullpenERA: 3.22, parkFactor: 0.92, sp: ["Luis Castillo","Logan Gilbert","George Kirby","Bryan Woo","Emerson Hancock"] },
  TEX: { name: "Rangers",    city: "Texas",       lg: "AL", div: "West", color: "#003278", runs: 753, ra: 716, era: 4.03, whip: 1.27, woba: .320, bullpenERA: 3.89, parkFactor: 1.06, sp: ["Nathan Eovaldi","Jon Gray","Andrew Heaney","Kumar Rocker","Michael Lorenzen"] },
  MIN: { name: "Twins",      city: "Minnesota",   lg: "AL", div: "Central", color: "#002B5C", runs: 762, ra: 713, era: 3.88, whip: 1.23, woba: .322, bullpenERA: 3.61, parkFactor: 0.98, sp: ["Pablo López","Bailey Ober","Joe Ryan","Zebby Matthews","Chris Paddack"] },
  CLE: { name: "Guardians",  city: "Cleveland",   lg: "AL", div: "Central", color: "#E31937", runs: 698, ra: 631, era: 3.44, whip: 1.16, woba: .305, bullpenERA: 3.15, parkFactor: 0.95, sp: ["Tanner Bibee","Shane Bieber","Triston McKenzie","Logan Allen","Gavin Williams"] },
  LAD: { name: "Dodgers",    city: "Los Angeles", lg: "NL", div: "West", color: "#005A9C", runs: 906, ra: 631, era: 3.12, whip: 1.09, woba: .348, bullpenERA: 2.98, parkFactor: 0.94, sp: ["Yoshinobu Yamamoto","Tyler Glasnow","Shohei Ohtani","Clayton Kershaw","Bobby Miller"] },
  ATL: { name: "Braves",     city: "Atlanta",     lg: "NL", div: "East", color: "#CE1141", runs: 857, ra: 659, era: 3.48, whip: 1.17, woba: .341, bullpenERA: 3.21, parkFactor: 1.00, sp: ["Spencer Strider","Chris Sale","Max Fried","Reynaldo López","Bryce Elder"] },
  PHI: { name: "Phillies",   city: "Philadelphia",lg: "NL", div: "East", color: "#E81828", runs: 798, ra: 672, era: 3.68, whip: 1.21, woba: .329, bullpenERA: 3.44, parkFactor: 1.03, sp: ["Zack Wheeler","Aaron Nola","Cristopher Sánchez","Ranger Suárez","Spencer Turnbull"] },
  MIL: { name: "Brewers",    city: "Milwaukee",   lg: "NL", div: "Central", color: "#12284B", runs: 745, ra: 668, era: 3.61, whip: 1.20, woba: .316, bullpenERA: 3.38, parkFactor: 0.99, sp: ["Freddy Peralta","Brandon Woodruff","Colin Rea","Wade Miley","Joey Wiemer"] },
  ARI: { name: "Diamondbacks",city: "Arizona",    lg: "NL", div: "West", color: "#A71930", runs: 779, ra: 709, era: 3.91, whip: 1.26, woba: .321, bullpenERA: 3.72, parkFactor: 1.04, sp: ["Zac Gallen","Merrill Kelly","Eduardo Rodriguez","Brandon Pfaadt","Ryne Nelson"] },
  NYM: { name: "Mets",       city: "New York",    lg: "NL", div: "East", color: "#002D72", runs: 741, ra: 703, era: 3.94, whip: 1.25, woba: .314, bullpenERA: 3.81, parkFactor: 0.97, sp: ["Kodai Senga","David Peterson","Luis Severino","Jose Quintana","Sean Manaea"] },
  CHC: { name: "Cubs",       city: "Chicago",     lg: "NL", div: "Central", color: "#0E3386", runs: 729, ra: 718, era: 4.08, whip: 1.28, woba: .311, bullpenERA: 4.02, parkFactor: 1.08, sp: ["Justin Steele","Jameson Taillon","Kyle Hendricks","Hayden Wesneski","Shota Imanaga"] },
  SFG: { name: "Giants",     city: "San Francisco",lg: "NL", div: "West", color: "#FD5A1E", runs: 718, ra: 698, era: 3.89, whip: 1.24, woba: .309, bullpenERA: 3.61, parkFactor: 0.88, sp: ["Logan Webb","Blake Snell","Jordan Hicks","Kyle Harrison","Robbie Ray"] },
  SDN: { name: "Padres",     city: "San Diego",   lg: "NL", div: "West", color: "#2F241D", runs: 763, ra: 682, era: 3.72, whip: 1.21, woba: .323, bullpenERA: 3.48, parkFactor: 0.93, sp: ["Dylan Cease","Yu Darvish","Joe Musgrove","Michael King","Matt Waldron"] },
  CIN: { name: "Reds",       city: "Cincinnati",  lg: "NL", div: "Central", color: "#C6011F", runs: 769, ra: 748, era: 4.14, whip: 1.30, woba: .326, bullpenERA: 4.18, parkFactor: 1.07, sp: ["Hunter Greene","Frankie Montas","Andrew Abbott","Nick Martinez","Graham Ashcraft"] },
};

const PARK_NAMES = {
  NYY:"Yankee Stadium", BOS:"Fenway Park", BAL:"Camden Yards", TOR:"Rogers Centre", TBR:"Tropicana Field",
  HOU:"Minute Maid Park", SEA:"T-Mobile Park", TEX:"Globe Life Field", MIN:"Target Field", CLE:"Progressive Field",
  LAD:"Dodger Stadium", ATL:"Truist Park", PHI:"Citizens Bank Park", MIL:"American Family Field", ARI:"Chase Field",
  NYM:"Citi Field", CHC:"Wrigley Field", SFG:"Oracle Park", SDN:"Petco Park", CIN:"Great American Ball Park",
};

// ─── PREDICTION MODEL ──────────────────────────────────────────────────────

function pythagorean(runs, ra, exp = 1.83) {
  return Math.pow(runs, exp) / (Math.pow(runs, exp) + Math.pow(ra, exp));
}

function logFiveWinPct(pctA, pctB) {
  return (pctA - pctA * pctB) / (pctA + pctB - 2 * pctA * pctB);
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function buildFactors(awayTeam, homeTeam, awaySpIdx, homeSpIdx, weather, venue) {
  const away = TEAMS[awayTeam];
  const home = TEAMS[homeTeam];

  // Base expected runs per game (season average / 162 games)
  const awayOffRPG = away.runs / 162;
  const homeOffRPG = home.runs / 162;
  const awayDefRPG = away.ra / 162;
  const homeDefRPG = home.ra / 162;

  // SP quality adjustment (index 0 = ace, 4 = #5)
  const spQuality = [1.0, 1.1, 1.2, 1.35, 1.5]; // ERA multiplier by slot
  const awaySpMult = spQuality[clamp(awaySpIdx, 0, 4)];
  const homeSpMult = spQuality[clamp(homeSpIdx, 0, 4)];

  // Park factor
  const pf = (venue === "home") ? home.parkFactor : 1.00;

  // Weather adjustments (temp & wind)
  const tempAdj = weather.temp < 50 ? 0.92 : weather.temp > 85 ? 1.06 : 1.0;
  const windAdj = weather.windDir === "out" ? 1.08 : weather.windDir === "in" ? 0.93 : 1.0;
  const windMag = clamp(1 + (weather.windSpeed - 8) * 0.004, 0.95, 1.10);
  const envMult = tempAdj * windAdj * windMag;

  // Home field advantage (historically ~+0.07 runs/game)
  const hfaAdj = 0.07;

  // Compute runs allowed by each SP (mix of SP ERA effect + bullpen)
  const leagueAvgERA = 4.00;
  const awayRunsScored = awayOffRPG * (leagueAvgERA / (home.era * homeSpMult)) * pf * envMult;
  const homeRunsScored = (homeOffRPG + hfaAdj) * (leagueAvgERA / (away.era * awaySpMult)) * pf * envMult;

  // wOBA lineup boost
  const leagueWOBA = 0.318;
  const awayWOBABoost = away.woba / leagueWOBA;
  const homeWOBABoost = home.woba / leagueWOBA;

  // Bullpen factor (late innings, assume 40% of total runs allowed)
  const leagueAvgBullpen = 3.80;
  const awayBullpenAdj = 0.6 + 0.4 * (leagueAvgBullpen / home.bullpenERA);
  const homeBullpenAdj = 0.6 + 0.4 * (leagueAvgBullpen / away.bullpenERA);

  const awayFinal = clamp(awayRunsScored * awayWOBABoost * awayBullpenAdj, 1.8, 11.5);
  const homeFinal = clamp(homeRunsScored * homeWOBABoost * homeBullpenAdj, 1.8, 11.5);

  // Win probability via logFive on pythagorean expectations
  const awayPythPct = pythagorean(away.runs, away.ra);
  const homePythPct = pythagorean(home.runs, home.ra);
  let homeWinPct = logFiveWinPct(homePythPct, awayPythPct);
  // Apply home field
  homeWinPct = clamp(homeWinPct + 0.04, 0.20, 0.80);
  const awayWinPct = 1 - homeWinPct;

  // Confidence score (how decisive the model thinks this is)
  const confidence = clamp(50 + Math.abs(homeWinPct - 0.5) * 200, 50, 92);

  return {
    awayScore: awayFinal,
    homeScore: homeFinal,
    awayWinPct,
    homeWinPct,
    confidence: Math.round(confidence),
    totalRuns: awayFinal + homeFinal,
    factors: {
      parkFactor: pf,
      tempAdj: Math.round((tempAdj - 1) * 100),
      windAdj: Math.round(((windAdj * windMag) - 1) * 100),
      awaySpMult: awaySpMult.toFixed(2),
      homeSpMult: homeSpMult.toFixed(2),
      awayWOBA: (awayWOBABoost * 100 - 100).toFixed(1),
      homeWOBA: (homeWOBABoost * 100 - 100).toFixed(1),
      awayBullpen: (awayBullpenAdj * 100 - 100).toFixed(1),
      homeBullpen: (homeBullpenAdj * 100 - 100).toFixed(1),
    },
  };
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────

function FlipNumber({ value, decimals = 1 }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef();
  useEffect(() => {
    const target = parseFloat(value);
    const start = performance.now();
    const dur = 900;
    const animate = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(ease * target);
      if (t < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);
  return <>{display.toFixed(decimals)}</>;
}

function WinBar({ awayPct, homePct, awayColor, homeColor }) {
  return (
    <div style={{ width: "100%", height: 10, borderRadius: 5, overflow: "hidden", display: "flex", background: "#111" }}>
      <div style={{ width: `${awayPct * 100}%`, background: awayColor, transition: "width 1s cubic-bezier(.4,0,.2,1)" }} />
      <div style={{ flex: 1, background: homeColor }} />
    </div>
  );
}

function FactorBar({ label, value, max = 10, color }) {
  const pct = clamp((parseFloat(value) + max) / (max * 2) * 100, 0, 100);
  const isPos = parseFloat(value) >= 0;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
        <span style={{ color: "#7a7060", letterSpacing: 0.5 }}>{label}</span>
        <span style={{ color: isPos ? "#a8e87a" : "#e87a7a", fontWeight: 700, fontFamily: "monospace" }}>
          {isPos ? "+" : ""}{value}%
        </span>
      </div>
      <div style={{ height: 4, background: "#1a1810", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.8s ease" }} />
      </div>
    </div>
  );
}

function TeamSelect({ value, onChange, label, exclude }) {
  const options = Object.entries(TEAMS).filter(([k]) => k !== exclude);
  const byLeague = { AL: options.filter(([,v]) => v.lg === "AL"), NL: options.filter(([,v]) => v.lg === "NL") };
  return (
    <div>
      <label style={{ fontSize: 10, letterSpacing: 2, color: "#5a5040", textTransform: "uppercase", display: "block", marginBottom: 6 }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", background: "#0c0a07", border: "1px solid #2a2418",
          borderRadius: 4, padding: "10px 12px", color: "#d4c89a",
          fontSize: 14, outline: "none", fontFamily: "inherit",
          cursor: "pointer",
        }}
      >
        <option value="">-- Select Team --</option>
        {["AL","NL"].map(lg => (
          <optgroup key={lg} label={`── ${lg} ──`} style={{ background: "#0c0a07" }}>
            {byLeague[lg].map(([k, v]) => (
              <option key={k} value={k} style={{ background: "#0c0a07" }}>
                {v.city} {v.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

function SPSelect({ team, value, onChange, label }) {
  if (!team) return (
    <div>
      <label style={{ fontSize: 10, letterSpacing: 2, color: "#5a5040", textTransform: "uppercase", display: "block", marginBottom: 6 }}>{label}</label>
      <div style={{ padding: "10px 12px", background: "#0c0a07", border: "1px solid #1a1810", borderRadius: 4, color: "#3a3020", fontSize: 13 }}>Select team first</div>
    </div>
  );
  const sps = TEAMS[team].sp;
  return (
    <div>
      <label style={{ fontSize: 10, letterSpacing: 2, color: "#5a5040", textTransform: "uppercase", display: "block", marginBottom: 6 }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        style={{
          width: "100%", background: "#0c0a07", border: "1px solid #2a2418",
          borderRadius: 4, padding: "10px 12px", color: "#d4c89a",
          fontSize: 13, outline: "none", fontFamily: "inherit", cursor: "pointer",
        }}
      >
        {sps.map((sp, i) => (
          <option key={i} value={i} style={{ background: "#0c0a07" }}>#{i + 1} {sp}</option>
        ))}
      </select>
    </div>
  );
}

function Gauge({ value, label, color }) {
  const pct = clamp(value, 0, 100);
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * (circ * 0.75);
  const offset = circ * 0.125;

  return (
    <div style={{ textAlign: "center" }}>
      <svg width={100} height={80} viewBox="0 0 100 80" style={{ overflow: "visible" }}>
        <circle cx={50} cy={60} r={r} fill="none" stroke="#1a1810" strokeWidth={8}
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
          strokeDashoffset={-offset}
          strokeLinecap="round" />
        <circle cx={50} cy={60} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={-offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s cubic-bezier(.4,0,.2,1)" }} />
        <text x={50} y={58} textAnchor="middle" fill={color} fontSize={16} fontWeight={800} fontFamily="monospace">
          {Math.round(pct)}%
        </text>
      </svg>
      <div style={{ fontSize: 10, letterSpacing: 2, color: "#5a5040", textTransform: "uppercase", marginTop: -8 }}>{label}</div>
    </div>
  );
}

function ScoreDisplay({ score, team, teamKey, side }) {
  const t = TEAMS[teamKey];
  return (
    <div style={{
      flex: 1, textAlign: side === "away" ? "left" : "right",
      padding: side === "away" ? "0 24px 0 0" : "0 0 0 24px",
    }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#5a5040", textTransform: "uppercase", marginBottom: 4 }}>
        {side === "home" ? "HOME" : "AWAY"}
      </div>
      <div style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: "#7a6840", marginBottom: 8 }}>
        {t.lg} · {t.div}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#d4c89a", marginBottom: 4 }}>
        {t.city} <span style={{ color: t.color, textShadow: `0 0 20px ${t.color}66` }}>{t.name}</span>
      </div>
      <div style={{
        fontFamily: "'Courier New', monospace",
        fontSize: 64,
        fontWeight: 900,
        lineHeight: 1,
        color: "#f0e0a0",
        textShadow: "0 0 40px #c8a84866",
        letterSpacing: -2,
      }}>
        <FlipNumber value={score} decimals={1} />
      </div>
      <div style={{ fontSize: 12, color: "#5a5040", fontFamily: "monospace", marginTop: 4 }}>projected runs</div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────

export default function App() {
  const [awayTeam, setAwayTeam] = useState("NYY");
  const [homeTeam, setHomeTeam] = useState("LAD");
  const [awaySpIdx, setAwaySpIdx] = useState(0);
  const [homeSpIdx, setHomeSpIdx] = useState(0);
  const [weather, setWeather] = useState({ temp: 72, windSpeed: 8, windDir: "none" });
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [tab, setTab] = useState("predict");
  const [simResults, setSimResults] = useState(null);
  const [simRunning, setSimRunning] = useState(false);

  const runPrediction = () => {
    if (!awayTeam || !homeTeam || awayTeam === homeTeam) return;
    setRunning(true);
    setTimeout(() => {
      const r = buildFactors(awayTeam, homeTeam, awaySpIdx, homeSpIdx, weather, "home");
      setResult(r);
      setSimResults(null);
      setRunning(false);
    }, 600);
  };

  const runSimulation = () => {
    if (!result) return;
    setSimRunning(true);
    const N = 10000;
    setTimeout(() => {
      let awayWins = 0, homeWins = 0, ties = 0;
      const scores = [];
      for (let i = 0; i < N; i++) {
        // Poisson simulation
        const awayR = poissonSample(result.awayScore);
        const homeR = poissonSample(result.homeScore);
        scores.push([awayR, homeR]);
        if (awayR > homeR) awayWins++;
        else if (homeR > awayR) homeWins++;
        else ties++;
      }
      // Common scores
      const scoreMap = {};
      scores.forEach(([a, h]) => {
        const k = `${a}-${h}`;
        scoreMap[k] = (scoreMap[k] || 0) + 1;
      });
      const topScores = Object.entries(scoreMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([k, v]) => ({ score: k, pct: (v / N * 100).toFixed(1) }));

      setSimResults({
        awayWinPct: awayWins / N,
        homeWinPct: homeWins / N,
        tiePct: ties / N,
        topScores,
        n: N,
      });
      setSimRunning(false);
    }, 100);
  };

  // Poisson random sample
  function poissonSample(lambda) {
    const L = Math.exp(-lambda);
    let k = 0, p = 1;
    do { k++; p *= Math.random(); } while (p > L);
    return k - 1;
  }

  const away = awayTeam ? TEAMS[awayTeam] : null;
  const home = homeTeam ? TEAMS[homeTeam] : null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#070603",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: "#d4c89a",
      backgroundImage: `
        radial-gradient(ellipse at 20% 0%, #1a1400 0%, transparent 60%),
        radial-gradient(ellipse at 80% 100%, #0a1200 0%, transparent 60%)
      `,
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        select option, select optgroup { background: #0c0a07; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2a2418; border-radius: 2px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fadeUp { animation: fadeUp 0.5s ease forwards; }
      `}</style>

      {/* Scanline overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100,
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
      }} />

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1e1a10",
        padding: "0 40px",
        background: "linear-gradient(180deg, #0e0c06 0%, #080603 100%)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 36, height: 36, border: "2px solid #c8a848",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, color: "#c8a848",
            }}>⚾</div>
            <div>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 16, fontWeight: 900, letterSpacing: 4, color: "#c8a848" }}>
                DIAMOND MODEL
              </div>
              <div style={{ fontSize: 9, color: "#5a5040", letterSpacing: 3, textTransform: "uppercase" }}>
                MLB Score Prediction Engine
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            {["predict", "compare", "about"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: "none", border: "none",
                borderBottom: tab === t ? "2px solid #c8a848" : "2px solid transparent",
                color: tab === t ? "#c8a848" : "#5a5040",
                padding: "8px 18px", cursor: "pointer",
                fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                fontFamily: "monospace", transition: "all 0.15s",
              }}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px" }}>

        {/* ─── PREDICT TAB ─── */}
        {tab === "predict" && (
          <div className="fadeUp">
            {/* Input Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              {/* Away */}
              <div style={{ background: "#0c0a07", border: "1px solid #1e1a10", borderRadius: 6, padding: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: 3, color: "#c8a848", textTransform: "uppercase", marginBottom: 16, fontFamily: "monospace" }}>
                  ◦ Away Team
                </div>
                <TeamSelect value={awayTeam} onChange={v => { setAwayTeam(v); setAwaySpIdx(0); }} label="Team" exclude={homeTeam} />
                <div style={{ marginTop: 12 }}>
                  <SPSelect team={awayTeam} value={awaySpIdx} onChange={setAwaySpIdx} label="Starting Pitcher" />
                </div>
                {away && (
                  <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {[["R/G", (away.runs/162).toFixed(1)], ["ERA", away.era], ["wOBA", away.woba]].map(([l,v]) => (
                      <div key={l} style={{ background: "#0a0807", border: "1px solid #151210", borderRadius: 4, padding: "8px 10px", textAlign: "center" }}>
                        <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "monospace", color: "#d4c89a" }}>{v}</div>
                        <div style={{ fontSize: 10, color: "#5a5040", letterSpacing: 1 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Home */}
              <div style={{ background: "#0c0a07", border: "1px solid #1e1a10", borderRadius: 6, padding: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: 3, color: "#c8a848", textTransform: "uppercase", marginBottom: 16, fontFamily: "monospace" }}>
                  ◦ Home Team
                </div>
                <TeamSelect value={homeTeam} onChange={v => { setHomeTeam(v); setHomeSpIdx(0); }} label="Team" exclude={awayTeam} />
                <div style={{ marginTop: 12 }}>
                  <SPSelect team={homeTeam} value={homeSpIdx} onChange={setHomeSpIdx} label="Starting Pitcher" />
                </div>
                {home && (
                  <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {[["R/G", (home.runs/162).toFixed(1)], ["ERA", home.era], ["wOBA", home.woba]].map(([l,v]) => (
                      <div key={l} style={{ background: "#0a0807", border: "1px solid #151210", borderRadius: 4, padding: "8px 10px", textAlign: "center" }}>
                        <div style={{ fontSize: 17, fontWeight: 800, fontFamily: "monospace", color: "#d4c89a" }}>{v}</div>
                        <div style={{ fontSize: 10, color: "#5a5040", letterSpacing: 1 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Weather */}
            <div style={{ background: "#0c0a07", border: "1px solid #1e1a10", borderRadius: 6, padding: 20, marginBottom: 24 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#c8a848", textTransform: "uppercase", marginBottom: 16, fontFamily: "monospace" }}>
                ◦ Game Conditions — {homeTeam ? PARK_NAMES[homeTeam] : "Ballpark"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
                <div>
                  <label style={{ fontSize: 10, letterSpacing: 2, color: "#5a5040", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                    Temperature — {weather.temp}°F
                  </label>
                  <input type="range" min={35} max={100} value={weather.temp}
                    onChange={e => setWeather(w => ({ ...w, temp: +e.target.value }))}
                    style={{ width: "100%", accentColor: "#c8a848" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#3a3020", marginTop: 3 }}>
                    <span>35°F</span><span>100°F</span>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 10, letterSpacing: 2, color: "#5a5040", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                    Wind Speed — {weather.windSpeed} mph
                  </label>
                  <input type="range" min={0} max={30} value={weather.windSpeed}
                    onChange={e => setWeather(w => ({ ...w, windSpeed: +e.target.value }))}
                    style={{ width: "100%", accentColor: "#c8a848" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#3a3020", marginTop: 3 }}>
                    <span>Calm</span><span>30 mph</span>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 10, letterSpacing: 2, color: "#5a5040", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Wind Direction</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[["none","—"],["out","↑ Out"],["in","↓ In"]].map(([v,l]) => (
                      <button key={v} onClick={() => setWeather(w => ({ ...w, windDir: v }))} style={{
                        flex: 1, padding: "8px 4px",
                        background: weather.windDir === v ? "#c8a84820" : "#0a0807",
                        border: `1px solid ${weather.windDir === v ? "#c8a848" : "#1a1810"}`,
                        borderRadius: 4, color: weather.windDir === v ? "#c8a848" : "#5a5040",
                        cursor: "pointer", fontSize: 12, fontFamily: "monospace",
                      }}>{l}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Run button */}
            <button
              onClick={runPrediction}
              disabled={!awayTeam || !homeTeam || awayTeam === homeTeam || running}
              style={{
                width: "100%", padding: "16px 0",
                background: "none",
                border: `2px solid ${running ? "#3a3020" : "#c8a848"}`,
                borderRadius: 4, cursor: "pointer",
                fontSize: 13, fontFamily: "monospace", letterSpacing: 4,
                textTransform: "uppercase",
                color: running ? "#3a3020" : "#c8a848",
                transition: "all 0.2s",
                marginBottom: 28,
              }}
            >
              {running ? "⟳  Computing..." : "▶  Run Prediction Model"}
            </button>

            {/* Results */}
            {result && (
              <div className="fadeUp">
                {/* Scoreboard */}
                <div style={{
                  background: "linear-gradient(135deg, #0e0c07 0%, #0a0805 100%)",
                  border: "1px solid #2a2418",
                  borderRadius: 8,
                  padding: "32px 28px",
                  marginBottom: 20,
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: "radial-gradient(ellipse at 50% 50%, #c8a84808 0%, transparent 70%)",
                    pointerEvents: "none",
                  }} />
                  <div style={{ textAlign: "center", fontSize: 10, letterSpacing: 4, color: "#3a3020", textTransform: "uppercase", marginBottom: 20, fontFamily: "monospace" }}>
                    {PARK_NAMES[homeTeam] || "Ballpark"} · Predicted Final Score
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                    <ScoreDisplay score={result.awayScore} team={away} teamKey={awayTeam} side="away" />
                    <div style={{ textAlign: "center", padding: "0 16px", paddingBottom: 8 }}>
                      <div style={{ fontSize: 10, letterSpacing: 4, color: "#3a3020", marginBottom: 8, fontFamily: "monospace" }}>AT</div>
                      <div style={{ fontSize: 28, color: "#2a2418", fontFamily: "monospace" }}>|</div>
                    </div>
                    <ScoreDisplay score={result.homeScore} team={home} teamKey={homeTeam} side="home" />
                  </div>

                  <div style={{ marginTop: 24 }}>
                    <WinBar awayPct={result.awayWinPct} homePct={result.homeWinPct} awayColor={away.color} homeColor={home.color} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                      <span style={{ fontSize: 13, fontFamily: "monospace", color: "#d4c89a", fontWeight: 700 }}>
                        {(result.awayWinPct * 100).toFixed(1)}% win
                      </span>
                      <span style={{ fontSize: 11, color: "#5a5040", fontFamily: "monospace" }}>Win Probability</span>
                      <span style={{ fontSize: 13, fontFamily: "monospace", color: "#d4c89a", fontWeight: 700 }}>
                        {(result.homeWinPct * 100).toFixed(1)}% win
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
                  <div style={{ background: "#0c0a07", border: "1px solid #1e1a10", borderRadius: 6, padding: 16, textAlign: "center" }}>
                    <Gauge value={result.confidence} label="Confidence" color="#c8a848" />
                  </div>
                  <div style={{ background: "#0c0a07", border: "1px solid #1e1a10", borderRadius: 6, padding: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 9, letterSpacing: 2, color: "#5a5040", textTransform: "uppercase", marginBottom: 12, fontFamily: "monospace" }}>Total Runs (O/U)</div>
                    <div style={{ fontSize: 52, fontFamily: "monospace", fontWeight: 900, color: "#c8a848", lineHeight: 1 }}>
                      <FlipNumber value={result.totalRuns} decimals={1} />
                    </div>
                    <div style={{ fontSize: 10, color: "#5a5040", marginTop: 6, fontFamily: "monospace" }}>projected total</div>
                  </div>
                  <div style={{ background: "#0c0a07", border: "1px solid #1e1a10", borderRadius: 6, padding: 16 }}>
                    <div style={{ fontSize: 9, letterSpacing: 2, color: "#5a5040", textTransform: "uppercase", marginBottom: 12, fontFamily: "monospace" }}>Park Factor</div>
                    <div style={{ fontSize: 40, fontFamily: "monospace", fontWeight: 900, color: result.factors.parkFactor > 1 ? "#e8a87a" : "#7ae8a8", textAlign: "center" }}>
                      {result.factors.parkFactor.toFixed(2)}×
                    </div>
                    <div style={{ fontSize: 11, textAlign: "center", color: "#5a5040", marginTop: 4, fontFamily: "monospace" }}>
                      {result.factors.parkFactor > 1.03 ? "Hitter-friendly" : result.factors.parkFactor < 0.97 ? "Pitcher-friendly" : "Neutral park"}
                    </div>
                  </div>
                </div>

                {/* Model Factors */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                  <div style={{ background: "#0c0a07", border: "1px solid #1e1a10", borderRadius: 6, padding: 20 }}>
                    <div style={{ fontSize: 10, letterSpacing: 3, color: "#c8a848", textTransform: "uppercase", marginBottom: 16, fontFamily: "monospace" }}>Model Adjustments</div>
                    <FactorBar label="Temperature Effect" value={result.factors.tempAdj} color="#e8c87a" />
                    <FactorBar label="Wind Effect" value={result.factors.windAdj} color="#7ac8e8" />
                    <FactorBar label={`${away?.name} wOBA Boost`} value={result.factors.awayWOBA} color="#a8e87a" />
                    <FactorBar label={`${home?.name} wOBA Boost`} value={result.factors.homeWOBA} color="#a8e87a" />
                    <FactorBar label={`${away?.name} Bullpen`} value={result.factors.awayBullpen} color="#e8a87a" />
                    <FactorBar label={`${home?.name} Bullpen`} value={result.factors.homeBullpen} color="#e8a87a" />
                  </div>
                  <div style={{ background: "#0c0a07", border: "1px solid #1e1a10", borderRadius: 6, padding: 20 }}>
                    <div style={{ fontSize: 10, letterSpacing: 3, color: "#c8a848", textTransform: "uppercase", marginBottom: 16, fontFamily: "monospace" }}>Starting Pitcher Depth</div>
                    <div style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #151210" }}>
                      <div style={{ fontSize: 11, color: "#5a5040", marginBottom: 4 }}>
                        {away?.name} — {away?.sp[awaySpIdx]}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, height: 4, background: "#1a1810", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${(1 / parseFloat(result.factors.awaySpMult)) * 100}%`, height: "100%", background: "#7ae8a8" }} />
                        </div>
                        <span style={{ fontSize: 11, fontFamily: "monospace", color: "#d4c89a" }}>
                          {parseFloat(result.factors.awaySpMult) < 1.1 ? "Ace" : parseFloat(result.factors.awaySpMult) < 1.25 ? "Mid-rotation" : "Back-end"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#5a5040", marginBottom: 4 }}>
                        {home?.name} — {home?.sp[homeSpIdx]}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, height: 4, background: "#1a1810", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${(1 / parseFloat(result.factors.homeSpMult)) * 100}%`, height: "100%", background: "#7ae8a8" }} />
                        </div>
                        <span style={{ fontSize: 11, fontFamily: "monospace", color: "#d4c89a" }}>
                          {parseFloat(result.factors.homeSpMult) < 1.1 ? "Ace" : parseFloat(result.factors.homeSpMult) < 1.25 ? "Mid-rotation" : "Back-end"}
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: 20 }}>
                      <div style={{ fontSize: 10, letterSpacing: 2, color: "#5a5040", textTransform: "uppercase", marginBottom: 12, fontFamily: "monospace" }}>Pythagorean Win%</div>
                      {[awayTeam, homeTeam].map((tk, i) => {
                        const t = TEAMS[tk];
                        const pyth = (pythagorean(t.runs, t.ra) * 100).toFixed(1);
                        return (
                          <div key={tk} style={{ marginBottom: 8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                              <span style={{ color: "#7a7060" }}>{t.name}</span>
                              <span style={{ fontFamily: "monospace", color: "#d4c89a" }}>{pyth}%</span>
                            </div>
                            <div style={{ height: 3, background: "#1a1810", borderRadius: 2, overflow: "hidden" }}>
                              <div style={{ width: `${pyth}%`, height: "100%", background: t.color, transition: "width 0.8s ease" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Monte Carlo Simulation */}
                <div style={{ background: "#0c0a07", border: "1px solid #1e1a10", borderRadius: 6, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ fontSize: 10, letterSpacing: 3, color: "#c8a848", textTransform: "uppercase", fontFamily: "monospace" }}>
                      Monte Carlo Simulation — 10,000 Games
                    </div>
                    <button
                      onClick={runSimulation}
                      disabled={simRunning}
                      style={{
                        background: "none", border: "1px solid #2a2418",
                        borderRadius: 4, padding: "6px 16px",
                        color: simRunning ? "#3a3020" : "#c8a848",
                        cursor: "pointer", fontSize: 11, fontFamily: "monospace",
                        letterSpacing: 2,
                      }}
                    >{simRunning ? "Running..." : "▶ Simulate"}</button>
                  </div>
                  {simResults ? (
                    <div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                        {[
                          [away?.name + " wins", (simResults.awayWinPct * 100).toFixed(1) + "%", "#d4c89a"],
                          [home?.name + " wins", (simResults.homeWinPct * 100).toFixed(1) + "%", "#d4c89a"],
                          ["Extra innings", (simResults.tiePct * 100).toFixed(1) + "%", "#5a5040"],
                        ].map(([l, v, c]) => (
                          <div key={l} style={{ background: "#0a0807", borderRadius: 4, padding: "12px 14px", textAlign: "center" }}>
                            <div style={{ fontSize: 24, fontFamily: "monospace", fontWeight: 800, color: c }}>{v}</div>
                            <div style={{ fontSize: 10, color: "#5a5040", letterSpacing: 1, marginTop: 4 }}>{l}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: 10, color: "#5a5040", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10, fontFamily: "monospace" }}>Most Likely Final Scores</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                        {simResults.topScores.map(({ score, pct }) => (
                          <div key={score} style={{
                            background: "#0a0807", borderRadius: 4, padding: "10px 12px", textAlign: "center",
                            border: "1px solid #151210",
                          }}>
                            <div style={{ fontSize: 17, fontFamily: "monospace", fontWeight: 800, color: "#c8a848" }}>{score}</div>
                            <div style={{ fontSize: 10, color: "#5a5040", marginTop: 2 }}>{pct}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "24px 0", color: "#3a3020", fontSize: 13, fontFamily: "monospace" }}>
                      Run the simulator to see score distribution across 10,000 game simulations
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── COMPARE TAB ─── */}
        {tab === "compare" && (
          <div className="fadeUp">
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#c8a848", textTransform: "uppercase", marginBottom: 16, fontFamily: "monospace" }}>
                ◦ Team Metrics — 2024 Season
              </div>
            </div>
            {["AL", "NL"].map(lg => (
              <div key={lg} style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 11, letterSpacing: 4, color: "#5a5040", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #1a1810" }}>
                  {lg} — American {lg === "AL" ? "" : "... wait"}{lg === "NL" ? "National" : "American"} League
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "monospace", fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #1e1a10" }}>
                        {["Team","R/G","RA/G","ERA","wOBA","Bullpen ERA","Park"].map(h => (
                          <th key={h} style={{ padding: "8px 14px", textAlign: h === "Team" ? "left" : "center", fontSize: 10, letterSpacing: 2, color: "#5a5040", textTransform: "uppercase", fontWeight: 400 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(TEAMS)
                        .filter(([,v]) => v.lg === lg)
                        .sort((a, b) => b[1].runs - a[1].runs)
                        .map(([k, t]) => (
                          <tr key={k} style={{ borderBottom: "1px solid #0e0c08" }}>
                            <td style={{ padding: "10px 14px" }}>
                              <span style={{ color: t.color, fontWeight: 700 }}>{t.city} {t.name}</span>
                            </td>
                            {[
                              (t.runs/162).toFixed(2),
                              (t.ra/162).toFixed(2),
                              t.era,
                              t.woba,
                              t.bullpenERA,
                              t.parkFactor + "×",
                            ].map((v, i) => (
                              <td key={i} style={{ padding: "10px 14px", textAlign: "center", color: "#a09070" }}>{v}</td>
                            ))}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── ABOUT TAB ─── */}
        {tab === "about" && (
          <div className="fadeUp" style={{ maxWidth: 700 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "#c8a848", textTransform: "uppercase", marginBottom: 24, fontFamily: "monospace" }}>
              ◦ Model Documentation
            </div>
            {[
              ["Pythagorean Expectation", "Win probability is derived from the Pythagorean expectation formula (exponent 1.83), which converts a team's runs scored and runs allowed into an expected winning percentage. Teams are then compared head-to-head using the Log5 formula."],
              ["Run Environment Modeling", "Expected runs per game are calculated from each team's offensive output and defensive ERA, adjusted for the opposing SP's rotation slot (ace through #5), using a quality multiplier that reflects real-world performance spread."],
              ["wOBA Lineup Adjustment", "Each team's weighted on-base average (wOBA) is compared to the 2024 league average (.318). Teams with above-average lineups receive a proportional run boost; below-average lineups are penalized."],
              ["Bullpen Strength", "Bullpen ERA adjusts the final score projection assuming relievers handle roughly 40% of outs. Elite bullpens suppress opponent scoring; weak ones inflate it."],
              ["Park Factors", "Each ballpark has a run factor (e.g., Coors Field inflates, Petco suppresses). This multiplier scales both teams' expected runs to reflect the true scoring environment."],
              ["Weather Adjustments", "Temperature below 50°F reduces run scoring by ~8%. High temperatures slightly increase it. Wind blowing out boosts totals ~8%; wind blowing in reduces ~7%. Effect scales with wind speed."],
              ["Monte Carlo Simulation", "After computing expected scores, the model samples 10,000 independent games using Poisson-distributed random variables (appropriate for count data like runs). This produces a full distribution of outcomes and true win probabilities."],
            ].map(([title, desc]) => (
              <div key={title} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #111" }}>
                <div style={{ fontFamily: "monospace", fontSize: 13, color: "#c8a848", marginBottom: 8 }}>» {title}</div>
                <p style={{ fontSize: 13, color: "#8a7a5a", lineHeight: 1.8 }}>{desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
