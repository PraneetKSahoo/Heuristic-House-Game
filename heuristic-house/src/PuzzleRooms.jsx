import React, { useState, useEffect, useRef } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUZZLE ROOMS — Interactive overlays for Heuristic House
//
// Each room accepts:
//   hasFix  — whether the RPG "fix" item has been found
//   onSolve — called when puzzle is completed
//   onClose — called to return to RPG view
//   sfx     — { click, error, success, pickup }
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const P = {
  room: { width:"100%", display:"flex", flexDirection:"column", alignItems:"center", gap:14, padding:"10px 0" },
  btn: { background:"transparent", border:"2px solid #00ffcc", color:"#00ffcc", padding:"10px 22px", fontFamily:"'Courier New',monospace", fontWeight:"bold", fontSize:"0.9rem", cursor:"pointer", textTransform:"uppercase", letterSpacing:"2px", transition:"all 0.2s", borderRadius:4 },
  back: { background:"transparent", border:"1px solid #555", color:"#888", padding:"6px 14px", fontFamily:"'Courier New',monospace", fontSize:"0.75rem", cursor:"pointer", letterSpacing:1, borderRadius:4, transition:"all 0.2s" },
  hint: { color:"#ff8899", fontSize:"0.8rem", textAlign:"center", lineHeight:1.5, maxWidth:380 },
  fix: { padding:"12px 20px", background:"rgba(0,255,204,0.08)", border:"1px dashed #00ffcc", borderRadius:8, cursor:"pointer", color:"#00ffcc", fontSize:"0.85rem", transition:"all 0.2s" },
  needFix: { padding:"10px 16px", background:"rgba(255,136,153,0.08)", border:"1px dashed #ff8899", borderRadius:8, color:"#ff8899", fontSize:"0.8rem", textAlign:"center", lineHeight:1.5 },
};

const hover = (e, bg, col) => Object.assign(e.target.style, { background:bg, color:col });
const unhover = (e, border="#00ffcc") => Object.assign(e.target.style, { background:"transparent", color:border });

// ━━━ ROOM 0: ELEVATOR — System Status ━━━
function PuzzleRoom0({ hasFix, onSolve, onClose, sfx }) {
  const [clicks, setClicks] = useState(0);
  const [installed, setInstalled] = useState(false);
  const [floor, setFloor] = useState(5);
  const [arrived, setArrived] = useState(false);
  const silentFloor = useRef(5);

  useEffect(() => {
    if (clicks < 1) return;
    silentFloor.current = 5;
    const id = setInterval(() => { silentFloor.current = Math.max(0, silentFloor.current - 1); }, 2000);
    return () => clearInterval(id);
  }, [clicks >= 1]);

  const install = () => {
    setInstalled(true); sfx.pickup();
    setFloor(silentFloor.current);
    const id = setInterval(() => {
      setFloor(f => { if (f <= 0) { clearInterval(id); return 0; } return f - 1; });
    }, 1200);
  };

  useEffect(() => {
    if (floor === 0 && installed) { setArrived(true); sfx.success(); setTimeout(onSolve, 600); }
  }, [floor, installed]);

  const pct = installed ? ((5 - floor) / 5) * 100 : 0;
  const stuck = clicks >= 3 && !installed;

  return (
    <div style={P.room}>
      <div style={{ width:"100%", maxWidth:280, background:"#0a0814", border:"2px solid #2d1b4e", borderRadius:12, padding:20, display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
        <div style={{ fontSize:"1.8rem", opacity:0.5 }}>🏗️</div>
        <div style={{ width:"100%", height:70, background:"#060410", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
          {installed ? (
            <div style={{ width:"100%", padding:"0 12px" }}>
              <div style={{ color:"#00ffcc", fontSize:"0.75rem", marginBottom:5, textAlign:"center" }}>{arrived ? "▼ ELEVATOR ARRIVED ▼" : `FLOOR ${floor} → GROUND`}</div>
              <div style={{ width:"100%", height:10, background:"#1a1625", borderRadius:5, overflow:"hidden" }}>
                <div style={{ width:`${pct}%`, height:"100%", background:"linear-gradient(90deg,#00ffcc,#00ddaa)", borderRadius:5, transition:"width 0.8s" }} />
              </div>
            </div>
          ) : (
            <div style={{ color:"#333", fontSize:"0.8rem", fontStyle:"italic" }}>{clicks === 0 ? "Dark shaft. No display." : "· · ·"}</div>
          )}
        </div>
        <button style={{...P.btn, width:"100%", opacity:arrived?0.3:1}} disabled={arrived}
          onClick={() => { setClicks(c=>c+1); sfx.click(); }}
          onMouseEnter={e=>hover(e,"#00ffcc","#000")} onMouseLeave={e=>unhover(e)}>
          {clicks === 0 ? "CALL ELEVATOR" : arrived ? "ARRIVED" : "PRESS AGAIN??"}
        </button>
      </div>
      {stuck && !hasFix && (
        <div style={P.needFix}>I pressed the button but nothing happens. No indicator, no sound.<br/>I need to find something in the room that shows the elevator's status.</div>
      )}
      {stuck && hasFix && !installed && (
        <div style={P.fix} onClick={install}>🔧 Install the indicator panel you found</div>
      )}
      {clicks >= 1 && clicks < 3 && !installed && (
        <div style={{ color:"#555", fontSize:"0.8rem", fontStyle:"italic", textAlign:"center" }}>
          {clicks === 1 ? "Nothing happened. No light, no sound." : "Still nothing. Is it even coming?"}
        </div>
      )}
    </div>
  );
}

// ━━━ ROOM 1: PET SHOP — Real World Match ━━━
const PETS = [
  { name:"Dog", emoji:"🐕" }, { name:"Cat", emoji:"🐈" }, { name:"Fish", emoji:"🐠" },
  { name:"Hamster", emoji:"🐹" }, { name:"Cow", emoji:"🐄" }, { name:"Mouse", emoji:"🐭" },
];
const FOODS = [
  { id:0, jargon:"Compressed Grain Cylinder", real:"Kibble", pet:"Dog" },
  { id:1, jargon:"Aqueous Protein Suspension", real:"Wet Food", pet:"Cat" },
  { id:2, jargon:"Dehydrated Algae Flakes", real:"Fish Flakes", pet:"Fish" },
  { id:3, jargon:"Miniature Seed Aggregate", real:"Seed Mix", pet:"Hamster" },
  { id:4, jargon:"Cellulose Fiber Bundle", real:"Hay Bale", pet:"Cow" },
  { id:5, jargon:"Micro-Particulate Casein Block", real:"Cheese", pet:"Mouse" },
];

function PuzzleRoom1({ hasFix, onSolve, onClose, sfx }) {
  const [translated, setTranslated] = useState(false);
  const [selected, setSelected] = useState(null);
  const [fed, setFed] = useState({});
  const [wrongCount, setWrongCount] = useState(0);
  const [shake, setShake] = useState(null);

  const feed = (petName) => {
    if (selected == null || fed[petName]) return;
    const food = FOODS[selected];
    if (food.pet === petName) {
      const newFed = {...fed, [petName]: food.id};
      setFed(newFed); setSelected(null); sfx.success();
      if (Object.keys(newFed).length === 6) setTimeout(onSolve, 600);
    } else {
      sfx.error(); setWrongCount(w=>w+1);
      setShake(petName); setTimeout(() => setShake(null), 500);
    }
  };

  const doTranslate = () => { setTranslated(true); sfx.pickup(); setSelected(null); };
  const stuck = wrongCount >= 2 && !translated;

  return (
    <div style={P.room}>
      <div style={{ color: translated ? "#00ffcc" : "#aaa", fontSize:"0.8rem", textAlign:"center" }}>
        {translated ? "✨ Labels translated! Select food, then click an animal." : "Select food, then click an animal to feed it."}
      </div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent:"center" }}>
        {FOODS.map((f,i) => {
          const used = Object.values(fed).includes(f.id);
          return (
            <div key={i} onClick={() => !used && setSelected(i)}
              style={{ padding:"8px 12px", background: selected===i ? "rgba(0,255,204,0.15)" : "#1a1625",
                border: selected===i ? "2px solid #00ffcc" : "1px solid #3a2d58",
                borderRadius:8, cursor: used?"default":"pointer", opacity: used?0.3:1,
                fontSize:"0.75rem", textAlign:"center", minWidth:115, transition:"all 0.2s" }}>
              <div>📦</div>
              <div style={{ fontWeight:"bold", color:"#fff", marginTop:2 }}>{translated ? f.real : f.jargon}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
        {PETS.map(p => (
          <div key={p.name} onClick={() => feed(p.name)}
            style={{ padding:10, background: fed[p.name]!=null ? "rgba(0,255,204,0.1)" : "#1a1625",
              border: fed[p.name]!=null ? "2px solid #00ffcc" : "1px solid #3a2d58",
              borderRadius:10, cursor: fed[p.name]!=null?"default":"pointer", textAlign:"center", minWidth:60,
              animation: shake===p.name ? "shakeUI 0.4s" : "none", transition:"all 0.2s" }}>
            <div style={{ fontSize:"1.8rem" }}>{p.emoji}</div>
            <div style={{ fontSize:"0.7rem", color:"#aaa", marginTop:2 }}>{p.name}</div>
            {fed[p.name]!=null && <div style={{ color:"#00ffcc", fontSize:"0.65rem" }}>✔ Fed</div>}
          </div>
        ))}
      </div>
      {stuck && !hasFix && (
        <div style={P.needFix}>"Compressed Grain Cylinder"?! These labels are impossible.<br/>I need to find something in the room to translate them.</div>
      )}
      {stuck && hasFix && !translated && (
        <div style={P.fix} onClick={doTranslate}>🏷️ Use the label printer to translate jargon → real words</div>
      )}
      {hasFix && !translated && wrongCount < 2 && (
        <div style={P.fix} onClick={doTranslate}>🏷️ Use the label printer to translate jargon → real words</div>
      )}
    </div>
  );
}

// ━━━ ROOM 2: TRAIN — User Control & Freedom ━━━
const CORRECT_PATH = [1, 0, 1];

function PuzzleRoom2({ hasFix, onSolve, onClose, sfx }) {
  const [sw, setSw] = useState([0,0,0]);
  const [launched, setLaunched] = useState(false);
  const [trainPos, setTrainPos] = useState(0);
  const [crashed, setCrashed] = useState(false);
  const [hasUndo, setHasUndo] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!launched || crashed || success) return;
    const id = setInterval(() => {
      setTrainPos(p => {
        const next = p+1;
        if (next > 3) { clearInterval(id); setSuccess(true); sfx.success(); setTimeout(onSolve, 600); return 4; }
        if (sw[p] !== CORRECT_PATH[p]) { clearInterval(id); setCrashed(true); sfx.error(); return next; }
        sfx.click(); return next;
      });
    }, 800);
    return () => clearInterval(id);
  }, [launched, crashed, success]);

  const reset = () => { setSw([0,0,0]); setLaunched(false); setTrainPos(0); setCrashed(false); };
  const installUndo = () => { setHasUndo(true); sfx.pickup(); reset(); };
  const labels = ["LEFT","RIGHT"];
  const names = ["Fork A","Fork B","Fork C"];
  const stops = ["START","Fork A","Fork B","Fork C","STATION"];

  return (
    <div style={P.room}>
      <div style={{ color:"#aaa", fontSize:"0.8rem", textAlign:"center" }}>Set each fork so the train reaches the station safely.</div>
      <div style={{ width:"100%", maxWidth:460, background:"#0a0814", border: crashed?"1px solid #ff005588":"1px solid #2d1b4e", borderRadius:10, padding:16, transition:"border 0.3s" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
          <span style={{ color:"#ffcc00", fontSize:"0.75rem" }}>🚂 TRACK CONTROL</span>
          <span style={{ color: success?"#50fa7b":crashed?"#ff0055":"#666", fontSize:"0.75rem", fontWeight:"bold" }}>
            {success ? "✔ ARRIVED" : crashed ? "💥 DERAILED" : launched ? "● EN ROUTE" : "READY"}
          </span>
        </div>
        <div style={{ display:"flex", gap:14, justifyContent:"center", marginBottom:12 }}>
          {[0,1,2].map(i => {
            const passed = launched && trainPos > i;
            const ok = passed && sw[i]===CORRECT_PATH[i];
            const bad = passed && sw[i]!==CORRECT_PATH[i];
            return (
              <div key={i} style={{ textAlign:"center" }}>
                <div style={{ fontSize:"0.65rem", color: bad?"#ff5555":ok?"#50fa7b":"#888", marginBottom:4 }}>{names[i]}</div>
                <div style={{ display:"flex", gap:3 }}>
                  {[0,1].map(v => (
                    <button key={v} disabled={launched}
                      onClick={() => { const n=[...sw]; n[i]=v; setSw(n); sfx.click(); }}
                      style={{ padding:"6px 10px", background: sw[i]===v ? (bad?"#4a1a1a":ok?"#1a4a2a":"#1a3a4a") : "#111",
                        border:`1px solid ${sw[i]===v?(bad?"#ff5555":ok?"#50fa7b":"#00ffcc"):"#333"}`,
                        color: sw[i]===v?(bad?"#ff5555":ok?"#50fa7b":"#00ffcc"):"#555",
                        borderRadius:4, cursor:launched?"default":"pointer", fontSize:"0.7rem", fontFamily:"monospace", fontWeight:"bold" }}>
                      {labels[v]}
                    </button>
                  ))}
                </div>
                {bad && <div style={{ fontSize:"0.55rem", marginTop:2, color:"#ff5555" }}>✗</div>}
                {ok && <div style={{ fontSize:"0.55rem", marginTop:2, color:"#50fa7b" }}>✓</div>}
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:3, marginBottom:10 }}>
          {stops.map((name,i) => (
            <React.Fragment key={i}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:1 }}>
                <div style={{ width:20, height:20, borderRadius:"50%",
                  background: trainPos===i?(crashed?"#ff0055":success&&i===4?"#50fa7b":"#ffcc00"):i===4?"#224422":"#222",
                  border:`2px solid ${trainPos===i?(crashed?"#ff0055":"#ffcc00"):"#333"}`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.5rem", transition:"all 0.3s" }}>
                  {trainPos===i && (crashed?"💥":"🚂")} {i===4&&trainPos!==4&&"🏁"}
                </div>
                <div style={{ fontSize:"0.45rem", color:"#555" }}>{name}</div>
              </div>
              {i<4 && <div style={{ flex:1, height:2, background: trainPos>i?"#ffcc00":"#222", transition:"all 0.3s" }}/>}
            </React.Fragment>
          ))}
        </div>
        {!launched && !crashed && !success && (
          <button style={{...P.btn, width:"100%", padding:"8px"}} onClick={()=>setLaunched(true)}
            onMouseEnter={e=>hover(e,"#00ffcc","#000")} onMouseLeave={e=>unhover(e)}>🚀 LAUNCH TRAIN</button>
        )}
        {hasUndo && crashed && (
          <button style={{...P.btn, width:"100%", padding:"8px", borderColor:"#ffcc00", color:"#ffcc00"}} onClick={reset}
            onMouseEnter={e=>hover(e,"#ffcc00","#000")} onMouseLeave={e=>unhover(e,"#ffcc00")}>↩️ UNDO — Reset Train</button>
        )}
      </div>
      {crashed && !hasUndo && !hasFix && (
        <div style={P.needFix}>Crashed! No reset button, no undo, no way to try again.<br/>I need to find an emergency stop somewhere in the room.</div>
      )}
      {crashed && !hasUndo && hasFix && (
        <div style={P.fix} onClick={installUndo}>↩️ Install the Emergency Stop & Reset button</div>
      )}
    </div>
  );
}

// ━━━ ROOM 3: MIRROR HALLWAY — Consistency ━━━
const DOOR_METHODS = ["click","dblclick","hold","drag","type"];

function PuzzleRoom3({ hasFix, onSolve, onClose, sfx }) {
  const [opened, setOpened] = useState([false,false,false,false,false]);
  const [attempts, setAttempts] = useState({});
  const [standardized, setStandardized] = useState(false);
  const [holdTimer, setHoldTimer] = useState(null);
  const [typeInput, setTypeInput] = useState("");
  const totalAttempts = Object.values(attempts).reduce((a,b)=>a+b, 0);

  const openDoor = (i) => {
    if (opened[i]) return;
    const n=[...opened]; n[i]=true; setOpened(n); sfx.success();
    if (n.every(Boolean)) setTimeout(onSolve, 600);
  };
  const failDoor = (i) => { sfx.error(); setAttempts(a=>({...a,[i]:(a[i]||0)+1})); };
  const handleClick = (i) => {
    if (opened[i]) return;
    if (standardized) { openDoor(i); return; }
    if (DOOR_METHODS[i]==="click") openDoor(i); else failDoor(i);
  };
  const handleDbl = (i) => { if (!opened[i]&&!standardized&&DOOR_METHODS[i]==="dblclick") openDoor(i); };
  const handleDown = (i) => {
    if (opened[i]||standardized) return;
    if (DOOR_METHODS[i]==="hold") setHoldTimer(setTimeout(()=>openDoor(i), 1500));
  };
  const handleUp = () => { if (holdTimer) { clearTimeout(holdTimer); setHoldTimer(null); } };

  const doStandardize = () => { setStandardized(true); sfx.pickup(); };
  const stuck = totalAttempts >= 4 && !standardized;
  const allOpen = opened.every(Boolean);

  return (
    <div style={P.room}>
      <div style={{ color:"#aaa", fontSize:"0.8rem", textAlign:"center" }}>
        {standardized ? "✨ All doors standardized — single-click to open." : "Open all 5 doors. They look the same..."}
      </div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
        {[0,1,2,3,4].map(i => (
          <div key={i} onClick={()=>handleClick(i)} onDoubleClick={()=>handleDbl(i)}
            onPointerDown={()=>handleDown(i)} onPointerUp={handleUp}
            style={{ width:75, height:110, background: opened[i]?"rgba(0,255,204,0.1)":"#1a1625",
              border:`2px solid ${opened[i]?"#00ffcc":(attempts[i]>0?"#ff5555":"#3a2d58")}`,
              borderRadius:8, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              cursor: opened[i]?"default":"pointer", transition:"all 0.3s", userSelect:"none" }}>
            <div style={{ fontSize:"2.2rem" }}>{opened[i]?"🚪":"🔒"}</div>
            <div style={{ fontSize:"0.65rem", color: opened[i]?"#00ffcc":"#888", marginTop:4 }}>Door {i+1}</div>
            {opened[i] && <div style={{ fontSize:"0.55rem", color:"#50fa7b" }}>OPEN</div>}
            {!opened[i]&&attempts[i]>0&&!standardized && <div style={{ fontSize:"0.5rem", color:"#ff5555", marginTop:1 }}>{attempts[i]} fail</div>}
          </div>
        ))}
      </div>
      {!standardized && !allOpen && DOOR_METHODS.some((m,i)=>!opened[i]&&m==="type") && totalAttempts > 3 && (
        <input value={typeInput} onChange={e=>{
          setTypeInput(e.target.value);
          if (e.target.value.toLowerCase()==="open") { const idx=DOOR_METHODS.indexOf("type"); if(!opened[idx]) openDoor(idx); setTypeInput(""); }
        }} placeholder='Try typing...' style={{ padding:"5px 8px", background:"#111", border:"1px solid #444", borderRadius:4, color:"#fff", fontFamily:"monospace", fontSize:"0.75rem", width:120 }} />
      )}
      {stuck && !hasFix && (
        <div style={P.needFix}>Same doors, different behaviors! One clicks, another double-clicks, another needs holding...<br/>I need to find something in the room to standardize them.</div>
      )}
      {stuck && hasFix && !standardized && (
        <div style={P.fix} onClick={doStandardize}>🔧 Use the toolbox to standardize all doors</div>
      )}
      {hasFix && !standardized && totalAttempts < 4 && (
        <div style={P.fix} onClick={doStandardize}>🔧 Use the toolbox to standardize all doors</div>
      )}
    </div>
  );
}

// ━━━ ROOM 4: LIBRARY — Error Prevention ━━━
// Safe path: (0,0)→(1,0)→(1,1)→(1,2)→(2,2)→(2,3)→(2,4)→(3,4)→(4,4)→(4,5)→(5,5)
const TRAPS = [[0,0,1,0,0,1],[1,0,1,0,1,0],[1,0,0,1,0,0],[1,1,0,1,0,1],[0,1,0,0,0,1],[1,0,1,0,0,0]];
const SAFE_PATH = [[0,0],[1,0],[1,1],[1,2],[2,2],[2,3],[2,4],[3,4],[4,4],[4,5],[5,5]];

function PuzzleRoom4({ hasFix, onSolve, onClose, sfx }) {
  const [pos, setPos] = useState({x:0,y:0});
  const [goggles, setGoggles] = useState(hasFix); // auto-activate if fix already found
  const [falls, setFalls] = useState(0);
  const [falling, setFalling] = useState(null);
  const [reached, setReached] = useState(false);

  // Also activate if hasFix changes while puzzle is open
  useEffect(() => { if (hasFix && !goggles) { setGoggles(true); sfx.pickup(); } }, [hasFix]);

  const move = (dx, dy) => {
    if (falling || reached) return;
    const nx=pos.x+dx, ny=pos.y+dy;
    if (nx<0||ny<0||nx>=6||ny>=6) return;
    if (TRAPS[ny][nx] && !goggles) {
      setPos({x:nx,y:ny}); setFalling({x:nx,y:ny}); sfx.error();
      setFalls(f=>f+1);
      setTimeout(()=>{ setFalling(null); setPos({x:0,y:0}); }, 800);
      return;
    }
    if (TRAPS[ny][nx] && goggles) return;
    sfx.click(); setPos({x:nx,y:ny});
    if (nx===5 && ny===5) { setReached(true); sfx.success(); setTimeout(onSolve, 600); }
  };

  useEffect(() => {
    const h = (e) => {
      if (e.key==="ArrowUp"||e.key==="w") { e.preventDefault(); move(0,-1); }
      if (e.key==="ArrowDown"||e.key==="s") { e.preventDefault(); move(0,1); }
      if (e.key==="ArrowLeft"||e.key==="a") { e.preventDefault(); move(-1,0); }
      if (e.key==="ArrowRight"||e.key==="d") { e.preventDefault(); move(1,0); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  const doGoggles = () => { setGoggles(true); sfx.pickup(); };
  const stuck = falls >= 2 && !goggles;

  return (
    <div style={P.room}>
      <div style={{ color:"#aaa", fontSize:"0.8rem", textAlign:"center" }}>
        {goggles ? "🔮 UV Goggles on! Traps visible." : "Navigate top-left → bottom-right. Click adjacent tiles or arrow keys."}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(6, 42px)", gap:2 }}>
        {TRAPS.map((row,y) => row.map((trap,x) => {
          const isP = pos.x===x&&pos.y===y;
          const isF = falling&&falling.x===x&&falling.y===y;
          const isT = x===5&&y===5;
          const adj = Math.abs(pos.x-x)+Math.abs(pos.y-y)===1;
          const onSafePath = goggles && SAFE_PATH.some(([sx,sy])=>sx===x&&sy===y);
          return (
            <div key={`${x}-${y}`} onClick={()=>adj&&move(x-pos.x,y-pos.y)}
              style={{ width:42, height:42, borderRadius:3, display:"flex", alignItems:"center", justifyContent:"center",
                background: isF?"#4a0a0a":isP?"rgba(0,255,204,0.2)":isT?"rgba(80,250,123,0.2)"
                  :onSafePath?"rgba(80,250,123,0.12)":(goggles&&trap)?"rgba(255,0,85,0.12)":"#1a1625",
                border:`1px solid ${isF?"#ff0055":isP?"#00ffcc":isT?"#50fa7b"
                  :onSafePath?"#50fa7b44":(goggles&&trap)?"#ff005544":"#2d1b4e"}`,
                cursor: adj?"pointer":"default", transition:"all 0.15s", fontSize:"1rem" }}>
              {isP&&!isF&&"🕵️"}{isF&&"💀"}{isT&&!isP&&"🚪"}
              {goggles&&trap&&!isP&&!isF&&<span style={{opacity:0.4}}>⚠️</span>}
              {onSafePath&&!isP&&!isT&&!trap&&<span style={{opacity:0.25, fontSize:"0.6rem"}}>✦</span>}
            </div>
          );
        }))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,36px)", gridTemplateRows:"repeat(2,36px)", gap:3 }}>
        <div/><button onClick={()=>move(0,-1)} style={{ background:"rgba(255,255,255,0.08)", border:"1px solid #444", borderRadius:5, color:"#fff", fontSize:"0.9rem", cursor:"pointer" }}>▲</button><div/>
        <button onClick={()=>move(-1,0)} style={{ background:"rgba(255,255,255,0.08)", border:"1px solid #444", borderRadius:5, color:"#fff", fontSize:"0.9rem", cursor:"pointer" }}>◀</button>
        <button onClick={()=>move(0,1)} style={{ background:"rgba(255,255,255,0.08)", border:"1px solid #444", borderRadius:5, color:"#fff", fontSize:"0.9rem", cursor:"pointer" }}>▼</button>
        <button onClick={()=>move(1,0)} style={{ background:"rgba(255,255,255,0.08)", border:"1px solid #444", borderRadius:5, color:"#fff", fontSize:"0.9rem", cursor:"pointer" }}>▶</button>
      </div>
      {falls>0&&!goggles && <div style={{ color:"#ff8899", fontSize:"0.75rem" }}>💀 Fell! ({falls}x) No way to see which tiles are safe.</div>}
      {stuck && !hasFix && (
        <div style={P.needFix}>The traps are invisible! I keep falling through.<br/>I need to find something in the room to reveal them.</div>
      )}
      {hasFix && !goggles && (
        <div style={P.fix} onClick={doGoggles}>🔮 Put on the UV Goggles to reveal trap tiles</div>
      )}
    </div>
  );
}

// ━━━ ROOM 5: MUSIC — Recognition Over Recall ━━━
const COLORS = ["#ff5555","#55ff55","#5555ff","#ffff55","#ff55ff"];
const SEQ = [0,3,1,4,2,0,3,1];

function PuzzleRoom5({ hasFix, onSolve, onClose, sfx }) {
  const [phase, setPhase] = useState("watch");
  const [inputIdx, setInputIdx] = useState(0);
  const [hasRef, setHasRef] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [lit, setLit] = useState(-1);

  useEffect(() => {
    if (phase !== "watch") return;
    let i = -1;
    const id = setInterval(() => {
      i++;
      if (i >= SEQ.length) { clearInterval(id); setLit(-1); setTimeout(()=>setPhase("input"), 500); return; }
      setLit(SEQ[i]); setTimeout(()=>setLit(-1), 400);
    }, 600);
    return () => clearInterval(id);
  }, [phase]);

  const press = (c) => {
    if (phase !== "input") return;
    setLit(c); setTimeout(()=>setLit(-1), 200);
    if (c === SEQ[inputIdx]) {
      sfx.click();
      if (inputIdx+1 >= SEQ.length) { setPhase("success"); sfx.success(); setTimeout(onSolve, 600); }
      else setInputIdx(inputIdx+1);
    } else {
      sfx.error(); setFailCount(f=>f+1); setInputIdx(0); setPhase("fail");
    }
  };

  const installRef = () => { setHasRef(true); sfx.pickup(); setInputIdx(0); setPhase("input"); };
  const stuck = failCount >= 1 && !hasRef;

  return (
    <div style={P.room}>
      <div style={{ color:"#aaa", fontSize:"0.8rem", textAlign:"center" }}>
        {phase==="watch" && "🎵 Watch the sequence..."}
        {phase==="input" && `Repeat it! (${inputIdx}/${SEQ.length})${hasRef?" — reference below":""}`}
        {phase==="fail" && "❌ Wrong note!"}
        {phase==="success" && "✨ Perfect melody!"}
      </div>
      <div style={{ display:"flex", gap:7, justifyContent:"center" }}>
        {COLORS.map((c,i) => (
          <div key={i} onClick={()=>press(i)}
            style={{ width:48, height:48, borderRadius:8, background: lit===i?c:`${c}33`,
              border:`2px solid ${c}`, cursor: phase==="input"?"pointer":"default",
              transition:"all 0.15s", boxShadow: lit===i?`0 0 16px ${c}`:"none" }} />
        ))}
      </div>
      {hasRef && phase !== "success" && (
        <div style={{ display:"flex", gap:3, justifyContent:"center", padding:6, background:"rgba(255,121,198,0.1)", borderRadius:6, border:"1px solid #ff79c644" }}>
          <span style={{ color:"#ff79c6", fontSize:"0.7rem", marginRight:6 }}>📋</span>
          {SEQ.map((s,i) => (
            <div key={i} style={{ width:16, height:16, borderRadius:3, background: i<inputIdx?`${COLORS[s]}88`:COLORS[s],
              border: i===inputIdx?"2px solid #fff":"1px solid #444", opacity: i<inputIdx?0.4:1 }} />
          ))}
        </div>
      )}
      {phase==="fail" && (
        <div style={{ textAlign:"center" }}>
          {stuck && !hasFix && (
            <div style={P.needFix}>8 notes, heard once, replay from memory? Impossible.<br/>I need to find something that shows the sequence.</div>
          )}
          {hasFix && !hasRef && (
            <div style={P.fix} onClick={installRef}>🎵 Use the music box — it loops the melody for reference</div>
          )}
          {hasRef && <button style={P.btn} onClick={()=>{setInputIdx(0);setPhase("input");}}>TRY AGAIN</button>}
          {!hasFix && !stuck && <button style={P.btn} onClick={()=>{setPhase("watch");setInputIdx(0);}}>Watch again</button>}
        </div>
      )}
    </div>
  );
}

// ━━━ ROOM 6: CLOCK TOWER — Flexibility & Efficiency ━━━
function PuzzleRoom6({ hasFix, onSolve, onClose, sfx }) {
  const [turns, setTurns] = useState(0);
  const [motorInstalled, setMotorInstalled] = useState(false);
  const [done, setDone] = useState(false);
  const TARGET = 50;

  useEffect(() => {
    if (!motorInstalled) return;
    const id = setInterval(() => {
      setTurns(t => {
        if (t>=TARGET) { clearInterval(id); setDone(true); sfx.success(); setTimeout(onSolve, 500); return TARGET; }
        sfx.click(); return t+1;
      });
    }, 60);
    return () => clearInterval(id);
  }, [motorInstalled]);

  const crank = () => {
    if (done || motorInstalled) return;
    setTurns(t => {
      const next = t+1; sfx.click();
      if (next>=TARGET) { setDone(true); sfx.success(); setTimeout(onSolve, 500); }
      return Math.min(next, TARGET);
    });
  };

  const installMotor = () => { setMotorInstalled(true); sfx.pickup(); };
  const stuck = turns >= 8 && !motorInstalled && !done;

  return (
    <div style={P.room}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:"2.2rem", marginBottom:6, transform:`rotate(${turns*12}deg)`, transition:"transform 0.1s" }}>⚙️</div>
        <div style={{ fontSize:"1.3rem", color: done?"#50fa7b":"#f1fa8c", fontFamily:"monospace" }}>{turns} / {TARGET}</div>
        <div style={{ width:250, height:10, background:"#1a1625", borderRadius:5, overflow:"hidden", margin:"6px auto" }}>
          <div style={{ width:`${(turns/TARGET)*100}%`, height:"100%", background: done?"#50fa7b":"#f1fa8c", borderRadius:5, transition:"width 0.1s" }}/>
        </div>
        {!done && !motorInstalled && (
          <button style={{...P.btn, marginTop:8}} onClick={crank}
            onMouseEnter={e=>hover(e,"#00ffcc","#000")} onMouseLeave={e=>unhover(e)}>
            🔧 CRANK ({TARGET-turns} more)
          </button>
        )}
      </div>
      {turns>=3 && turns<TARGET && !motorInstalled && !done && (
        <div style={{ color:"#666", fontSize:"0.8rem", fontStyle:"italic" }}>
          {turns<8 ? "This is tedious..." : turns<15 ? "Seriously? No faster way?" : "There HAS to be a shortcut."}
        </div>
      )}
      {stuck && !hasFix && (
        <div style={P.needFix}>30 manual cranks?! This is brutally slow.<br/>There must be something in the room that automates this.</div>
      )}
      {stuck && hasFix && (
        <div style={P.fix} onClick={installMotor}>⚡ Install the electric motor to automate the crank</div>
      )}
      {hasFix && !motorInstalled && turns < 8 && (
        <div style={P.fix} onClick={installMotor}>⚡ Install the electric motor to automate the crank</div>
      )}
    </div>
  );
}

// ━━━ ROOM 7: EVIDENCE WALL — Minimalist Design ━━━
const CODE = "7294";
function makeNoise() {
  const texts = ["Meeting 3pm Tue","Call Dr. Smith","MILK EGGS","Receipt: $14.50","Flight DL482","TODO: fix sink",
    "Grandma's recipe","Bus route 17","Dentist 9am","URGENT: read","Party invite ★","Parking ticket",
    "Laundry #33","Book return 12/5","Coupon: 20% off","Map fragment","Lottery 5 18 22","Phone 555-0123",
    "Reward: $500","Key under mat","Old newspaper","Conference badge","Note: see pg 44","⭐ Important?",
    "Dog photo: cute!","Password hunter2","Deadline FRI","Rm 4B unlock?","Bus schedule","Invoice #809",
    "Spin class 6pm","Plumber receipt","Grocery list","Art class Wed","Report Q3"];
  return texts.map((text,i) => ({
    id:i, text, x:Math.random()*85, y:Math.random()*85, rot:(Math.random()-0.5)*25,
    color:`hsl(${Math.random()*360},${30+Math.random()*40}%,${40+Math.random()*20}%)`,
    isCode: i===17 // embed code at index 17
  }));
}

function PuzzleRoom7({ hasFix, onSolve, onClose, sfx }) {
  const [noise] = useState(() => { const n=makeNoise(); n[17]={...n[17], text:`CODE: ${CODE}`, isCode:true}; return n; });
  const [input, setInput] = useState("");
  const [filtered, setFiltered] = useState(false);
  const [timer, setTimer] = useState(10);
  const [expired, setExpired] = useState(false);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    if (solved || filtered) return;
    if (timer<=0) { setExpired(true); return; }
    const id = setInterval(()=>setTimer(t=>t-1), 1000);
    return () => clearInterval(id);
  }, [timer, solved, filtered]);

  const submit = () => {
    if (input===CODE) { setSolved(true); sfx.success(); setTimeout(onSolve, 500); } else sfx.error();
  };
  const doFilter = () => { setFiltered(true); sfx.pickup(); setTimer(999); };
  const stuck = expired && !filtered;

  return (
    <div style={P.room}>
      <div style={{ display:"flex", justifyContent:"space-between", width:"100%", maxWidth:450 }}>
        <span style={{ color:"#aaa", fontSize:"0.75rem" }}>{filtered ? "✨ Filtered! Noise removed." : "Find the 4-digit code."}</span>
        {!solved && !filtered && <span style={{ color: timer<=5?"#ff0055":"#ff8899", fontSize:"0.85rem", fontFamily:"monospace" }}>⏱ {timer}s</span>}
      </div>
      <div style={{ width:"100%", maxWidth:450, height:200, background:"#0a0814", border:"1px solid #2d1b4e", borderRadius:6, position:"relative", overflow:"hidden" }}>
        {(filtered ? noise.filter(n=>n.isCode) : noise).map(item => (
          <div key={item.id} style={{
            position: filtered?"relative":"absolute",
            left: filtered?"auto":`${item.x}%`, top: filtered?"auto":`${item.y}%`,
            transform: filtered?"none":`rotate(${item.rot}deg)`,
            padding: filtered?"10px 16px":"3px 6px",
            background: item.isCode&&filtered?"rgba(0,255,204,0.15)":"rgba(50,40,70,0.5)",
            border:`1px solid ${item.isCode&&filtered?"#00ffcc":"#3a2d5855"}`,
            borderRadius:3, fontSize: filtered?"1.1rem":"0.5rem", color: item.color, whiteSpace:"nowrap",
            margin: filtered?"80px auto":0, fontWeight: item.isCode?"bold":"normal",
          }}>{item.text}</div>
        ))}
      </div>
      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="4-digit code" maxLength={4}
          style={{ padding:"6px 10px", background:"#111", border:"1px solid #444", borderRadius:5, color:"#fff", fontFamily:"monospace", fontSize:"0.9rem", width:120, textAlign:"center", letterSpacing:4 }}
          onKeyDown={e=>e.key==="Enter"&&submit()} />
        <button style={{...P.btn, padding:"6px 14px", fontSize:"0.8rem"}} onClick={submit}>CHECK</button>
      </div>
      {stuck && !hasFix && (
        <div style={P.needFix}>Time's up! Too much noise on that wall.<br/>I need something from the room to filter the clutter.</div>
      )}
      {hasFix && !filtered && (
        <div style={P.fix} onClick={doFilter}>🗂️ Use the filing cabinet to remove irrelevant items</div>
      )}
    </div>
  );
}

// ━━━ ROOM 8: FURNACE — Error Recovery ━━━
function PuzzleRoom8({ hasFix, onSolve, onClose, sfx }) {
  const [attempts, setAttempts] = useState([]);
  const [hasManual, setHasManual] = useState(false);
  const [input, setInput] = useState("");
  const [solved, setSolved] = useState(false);
  const [temp, setTemp] = useState(-12);

  useEffect(() => {
    if (solved) { const id=setInterval(()=>setTemp(t=>Math.min(22,t+2)),200); return ()=>clearInterval(id); }
    const id=setInterval(()=>setTemp(t=>Math.max(-20,t-0.5)),3000);
    return () => clearInterval(id);
  }, [solved]);

  const tryFix = (cmd) => {
    if (cmd.toLowerCase().trim()==="ignite"||cmd.toLowerCase().trim()==="ignite pilot") {
      setSolved(true); sfx.success(); setTimeout(onSolve, 800);
    } else { sfx.error(); setAttempts(a=>[...a,cmd]); setInput(""); }
  };
  const installManual = () => { setHasManual(true); sfx.pickup(); };
  const stuck = attempts.length >= 2 && !hasManual;

  return (
    <div style={P.room}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
        <span style={{ fontSize:"1.3rem" }}>🌡️</span>
        <span style={{ color: solved?"#50fa7b":temp<0?"#88ccff":"#ffcc00", fontFamily:"monospace", fontSize:"1rem" }}>{Math.round(temp)}°C</span>
      </div>
      <div style={{ width:"100%", maxWidth:380, background:"#0a0814", border:"2px solid #2d1b4e", borderRadius:10, padding:16 }}>
        <div style={{ background:"#111", border:"1px solid #333", borderRadius:5, padding:10, fontFamily:"monospace", marginBottom:10 }}>
          <div style={{ color:"#ff3333", fontSize:"0.7rem", marginBottom:4 }}>⚠ FURNACE CONTROL ⚠</div>
          {solved ? (
            <div style={{ color:"#50fa7b", fontSize:"0.75rem" }}>STATUS: RUNNING<br/>PILOT: ● ON<br/>OUTPUT: NOMINAL</div>
          ) : (
            <div style={{ color:"#ff5555", fontSize:"0.7rem" }}>ERR_0x4F2A: THERMAL_OFFSET_INVALID<br/>SUBSYS: IGN_MODULE_PRIMARY<br/>CODE: 0x4F2A-B7<br/>STACK: therm.ctrl → ign.seq → pilot.init</div>
          )}
        </div>
        {!solved && (
          <div style={{ display:"flex", gap:5 }}>
            <input value={input} onChange={e=>setInput(e.target.value)}
              placeholder={hasManual?'Type "ignite"':"???"}
              style={{ flex:1, padding:"6px 8px", background:"#0a0a0a", border:"1px solid #444", borderRadius:4, color:"#fff", fontFamily:"monospace", fontSize:"0.8rem" }}
              onKeyDown={e=>e.key==="Enter"&&tryFix(input)} />
            <button style={{...P.btn, padding:"6px 12px", fontSize:"0.75rem"}} onClick={()=>tryFix(input)}>RUN</button>
          </div>
        )}
        {attempts.length>0 && !solved && (
          <div style={{ marginTop:6, maxHeight:50, overflow:"auto" }}>
            {attempts.map((a,i) => <div key={i} style={{ color:"#ff5555", fontSize:"0.65rem" }}>$ {a} → UNRECOGNIZED</div>)}
          </div>
        )}
      </div>
      {hasManual && !solved && (
        <div style={{ padding:10, background:"rgba(241,250,140,0.08)", border:"1px solid #f1fa8c44", borderRadius:8, maxWidth:380, width:"100%" }}>
          <div style={{ color:"#f1fa8c", fontSize:"0.8rem", fontWeight:"bold", marginBottom:3 }}>📖 Diagnostic Manual</div>
          <div style={{ color:"#ccc", fontSize:"0.75rem", lineHeight:1.4 }}>
            <strong>Error 0x4F2A</strong>: Pilot light went out.<br/>
            <strong>Fix</strong>: Type <code style={{ color:"#50fa7b", background:"#1a2a1a", padding:"1px 3px", borderRadius:2 }}>ignite</code> to restart it.
          </div>
        </div>
      )}
      {stuck && !hasFix && (
        <div style={P.needFix}>"THERMAL_OFFSET_INVALID"? What does that mean?<br/>I need to find something in the room that decodes these errors.</div>
      )}
      {hasFix && !hasManual && (
        <div style={P.fix} onClick={installManual}>📖 Open the diagnostic manual to decode the error</div>
      )}
    </div>
  );
}

// ━━━ ROOM 9: FINAL MACHINE — Help & Documentation ━━━
const CORRECT_SW = [1,0,1,1,0,1,0,1];
const SW_LABELS = ["Power","Coolant","Ignition","Fuel","Exhaust","Lock","Aux","Override"];

function PuzzleRoom9({ hasFix, onSolve, onClose, sfx }) {
  const [sw, setSw] = useState([0,0,0,0,0,0,0,0]);
  const [hasManual, setHasManual] = useState(false);
  const [sparks, setSparks] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);

  const toggle = (i) => { if (solved) return; const n=[...sw]; n[i]=n[i]?0:1; setSw(n); sfx.click(); };
  const submit = () => {
    if (sw.every((v,i)=>v===CORRECT_SW[i])) { setSolved(true); sfx.success(); setTimeout(onSolve, 600); }
    else { sfx.error(); setSparks(true); setAttempts(a=>a+1); setTimeout(()=>setSparks(false), 800); }
  };
  const installManual = () => { setHasManual(true); sfx.pickup(); };
  const stuck = attempts >= 2 && !hasManual;

  return (
    <div style={P.room}>
      <div style={{ color:"#aaa", fontSize:"0.8rem", textAlign:"center" }}>
        {hasManual ? "📖 Manual open. Set switches per diagram." : "Set 6 switches correctly. No labels."}
      </div>
      <div style={{ width:"100%", maxWidth:380, background:"#0a0814", border: sparks?"2px solid #ffcc00":"2px solid #2d1b4e", borderRadius:10, padding:16, transition:"border 0.2s" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(8,1fr)", gap:6, marginBottom:12 }}>
          {[0,1,2,3,4,5,6,7].map(i => (
            <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{ fontSize:"0.55rem", color: hasManual?"#ff79c6":"#333", height:14 }}>{hasManual?SW_LABELS[i]:`SW${i+1}`}</div>
              <div onClick={()=>toggle(i)}
                style={{ width:34, height:52, background: sw[i]?"#2a4a2a":"#1a1a2a", border:`2px solid ${sw[i]?"#50fa7b":"#444"}`,
                  borderRadius:5, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
                <div style={{ width:12, height:18, background: sw[i]?"#50fa7b":"#666", borderRadius:2,
                  transform: sw[i]?"translateY(-6px)":"translateY(6px)", transition:"all 0.2s" }}/>
              </div>
              <div style={{ fontSize:"0.5rem", color: sw[i]?"#50fa7b":"#555" }}>{sw[i]?"ON":"OFF"}</div>
            </div>
          ))}
        </div>
        {sparks && <div style={{ textAlign:"center", color:"#ffcc00", fontSize:"0.8rem" }}>⚡💥 SPARKS!</div>}
        {!solved && (
          <button style={{...P.btn, width:"100%", padding:"8px", marginTop:4}} onClick={submit}
            onMouseEnter={e=>hover(e,"#00ffcc","#000")} onMouseLeave={e=>unhover(e)}>⚡ ACTIVATE</button>
        )}
      </div>
      {hasManual && !solved && (
        <div style={{ padding:10, background:"rgba(255,121,198,0.08)", border:"1px solid #ff79c644", borderRadius:8, maxWidth:380, width:"100%" }}>
          <div style={{ color:"#ff79c6", fontSize:"0.8rem", fontWeight:"bold", marginBottom:4 }}>📖 Correct Configuration:</div>
          <div style={{ display:"flex", gap:6, justifyContent:"center" }}>
            {CORRECT_SW.map((v,i) => (
              <div key={i} style={{ textAlign:"center" }}>
                <div style={{ fontSize:"0.6rem", color:"#ff79c6" }}>{SW_LABELS[i]}</div>
                <div style={{ fontSize:"0.75rem", color: v?"#50fa7b":"#ff5555", fontWeight:"bold" }}>{v?"ON":"OFF"}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {stuck && !hasFix && (
        <div style={P.needFix}>No labels, no instructions. Just sparks and guessing.<br/>I need to find documentation somewhere in the room.</div>
      )}
      {hasFix && !hasManual && (
        <div style={P.fix} onClick={installManual}>📖 Open the operator's manual for labels and configuration</div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PUZZLE OVERLAY WRAPPER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PUZZLE_ROOMS = [PuzzleRoom0, PuzzleRoom1, PuzzleRoom2, PuzzleRoom3, PuzzleRoom4, PuzzleRoom5, PuzzleRoom6, PuzzleRoom7, PuzzleRoom8, PuzzleRoom9];

export default function PuzzleOverlay({ roomIndex, hasFix, onSolve, onClose, sfx }) {
  const puzzleSfx = {
    click: sfx?.step || (()=>{}),
    error: sfx?.error || (()=>{}),
    success: sfx?.solve || (()=>{}),
    pickup: sfx?.pickup || (()=>{}),
  };
  const RoomComp = PUZZLE_ROOMS[roomIndex];
  if (!RoomComp) return null;

  return (
    <div style={{ position:"absolute", inset:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"center" }}>
      {/* Backdrop */}
      <div style={{ position:"absolute", inset:0, background:"rgba(8,6,15,0.88)", backdropFilter:"blur(3px)" }} />
      {/* Panel */}
      <div style={{ position:"relative", zIndex:1, width:"90%", maxWidth:560, maxHeight:"85%", overflowY:"auto",
        background:"linear-gradient(180deg, #12101e, #0a0814)", border:"2px solid #2d1b4e", borderRadius:12,
        padding:"14px 18px", boxShadow:"0 10px 40px rgba(0,0,0,0.8)" }}>
        {/* Header with back button */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <button style={P.back} onClick={onClose}
            onMouseEnter={e=>Object.assign(e.target.style,{borderColor:"#00ffcc",color:"#00ffcc"})}
            onMouseLeave={e=>Object.assign(e.target.style,{borderColor:"#555",color:"#888"})}>
            ← BACK TO ROOM
          </button>
          {!hasFix && <span style={{ color:"#ff889966", fontSize:"0.65rem" }}>🔍 Explore room for the fix</span>}
          {hasFix && <span style={{ color:"#00ffcc66", fontSize:"0.65rem" }}>🔧 Fix available!</span>}
        </div>
        <RoomComp key={`${roomIndex}-${hasFix}`} hasFix={hasFix} onSolve={onSolve} onClose={onClose} sfx={puzzleSfx} />
      </div>
    </div>
  );
}
