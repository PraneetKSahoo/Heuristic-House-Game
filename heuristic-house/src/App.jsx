import React, { useState, useEffect, useRef, useCallback } from "react";
import { T, COLS, ROWS, GW, GH, TID, DIRS, isAct, clrAct, fmt, findEntrance, shuffle } from "./engine/constants";
import { useAudio } from "./engine/audio";
import { drawGame } from "./engine/renderer";
import HEURISTICS from "./data/heuristics";
import ROOMS from "./data/rooms";
import Typewriter from "./components/Typewriter";
import PuzzleOverlay from "./PuzzleRooms";
import "./styles.css";

const MOVE_CD = 8;

function loadImg(src) {
  return new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
}

export default function App() {
  const canvasRef = useRef(null);
  const atlasRef = useRef(null);
  const gearsRef = useRef(null);
  const propsRef = useRef(null);
  const { init: initAudio, sfx } = useAudio();

  const [phase, setPhase] = useState("title");
  const [puzzleOpen, setPuzzleOpen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showJump, setShowJump] = useState(false);
  const [jumpInput, setJumpInput] = useState("");
  const [storyStep, setStoryStep] = useState(0);

  // Detect touch device — only show d-pad on mobile/tablet
  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setShowControls(isTouchDevice);
  }, []);
  const [ui, setUi] = useState({
    ri: 0, dlg: null, showCards: false, showReveal: false,
    foundP: false, foundF: false, solved: false,
    wrongCard: null, wrongMsg: null,
    usedCards: [], timer: 0, roomTimes: [], wrongGuesses: [],
    cardChoices: [], narrationShown: false, puzzleCleared: false,
  });

  const gs = useRef({
    pos: { x: 9, y: 12 }, vPos: { x: 9, y: 12 }, facing: "up",
    foundP: false, foundF: false, solved: false, usedCards: [],
    shake: 0, particles: [], keys: {}, mt: 0, ri: 0,
    dlg: null, showCards: false, showReveal: false, narrationShown: false,
    puzzleOpen: false, puzzleCleared: false,
  });
  const roomStart = useRef(Date.now());
  const timerRef = useRef(0);
  const roomTimesRef = useRef([]);
  const wrongRef = useRef([]);
  const interactRef = useRef(null);

  // Load atlas + gear + prop images
  useEffect(() => {
    Promise.all([
      loadImg("/game_atlas.png"),
      loadImg("/home_pack.png"),
      loadImg("/Dungeon_Tileset_at.png"),
      loadImg("/gear_bronze_1.png"), loadImg("/gear_bronze_2.png"), loadImg("/gear_bronze_3.png"),
      loadImg("/gear_silver_1.png"), loadImg("/gear_silver_2.png"), loadImg("/gear_silver_3.png"),
      // Props & vegetation
      loadImg("/Big_Trees.png"), loadImg("/Bushes_With_Berries.png"),
      loadImg("/Red_Flowers.png"), loadImg("/Rocks.png"),
      loadImg("/Elevated_Grass_Tileset.png"),
      loadImg("/Brown_Mushrooms.png"), loadImg("/Water_Tileset.png"),
      loadImg("/new_Dungeon_Tileset.png"), loadImg("/torch_wall_tileset.png"),
      loadImg("/torch.gif"), loadImg("/lava.jpg"),
      // Animals
      loadImg("/dog.png"), loadImg("/chicken.png"), loadImg("/rabbit.png"),
      loadImg("/duck2.png"), loadImg("/cow.png"), loadImg("/mouse.png"), loadImg("/fish.png"),
    ]).then(([atlas, home, dungeon, b1,b2,b3,s1,s2,s3,
      trees, bushes, flowers, rocks, grass, mushrooms, water, newDungeon, torchSheet, torchGif, lava,
      dog, chicken, rabbit, duck, cow, mouse, fish]) => {
      if (atlas) atlasRef.current = { main: atlas, home: home, dungeon: dungeon };
      const bronze = [b1,b2,b3].filter(Boolean);
      const silver = [s1,s2,s3].filter(Boolean);
      if (bronze.length && silver.length) gearsRef.current = { bronze, silver };
      propsRef.current = { trees, bushes, flowers, rocks, grass, mushrooms, water, newDungeon, torchSheet, torchGif, lava, dog, chicken, rabbit, duck, cow, mouse, fish };
      // Debug: log which props loaded
      const p = propsRef.current;
      const loaded = Object.entries(p).filter(([k,v]) => v).map(([k]) => k);
      const failed = Object.entries(p).filter(([k,v]) => !v).map(([k]) => k);
      console.log("[Props] Loaded:", loaded.join(", "));
      if (failed.length) console.warn("[Props] FAILED to load:", failed.join(", "));
    });
  },[]);

  const sync = useCallback(() => {
    const s = gs.current;
    setUi(p => ({
      ...p, ri: s.ri, dlg: s.dlg, showCards: s.showCards, showReveal: s.showReveal,
      foundP: s.foundP, foundF: s.foundF, solved: s.solved,
      usedCards: [...s.usedCards], timer: timerRef.current,
      roomTimes: [...roomTimesRef.current], wrongGuesses: [...wrongRef.current],
      narrationShown: s.narrationShown, puzzleCleared: s.puzzleCleared,
    }));
  }, []);

  const spawn = useCallback((x, y, color, n = 10) => {
    for (let i = 0; i < n; i++)
      gs.current.particles.push({
        x: x*T+T/2, y: y*T+T/2,
        vx: (Math.random()-0.5)*4, vy: (Math.random()-0.5)*4-1,
        life: 30+Math.random()*20, color,
      });
  }, []);

  // ═══════════════════════════════════════════════════════════
  // INTERACT HANDLER — Modified for puzzle overlay integration
  // ═══════════════════════════════════════════════════════════
  interactRef.current = () => {
    const s = gs.current;

    // Don't interact while puzzle is open
    if (s.puzzleOpen) return;

    // Dialog dismiss with post-puzzle auto-card transition
    if (s.dlg) {
      s.dlg = null;
      // After puzzle narration dismiss → auto-trigger card phase
      if (s.puzzleCleared && s.narrationShown && !s.solved && !s.showCards) {
        const room = ROOMS[s.ri];
        s.dlg = "Which usability principle was violated here?";
        sync();
        const choices = shuffle([s.ri, ...room.distractors]);
        setUi(p => ({...p, cardChoices: choices}));
        setTimeout(() => { gs.current.showCards = true; sync(); }, 800);
        return;
      }
      sync();
      return;
    }

    if (s.showCards || s.showReveal) return;
    const room = ROOMS[s.ri], ly = room.layout, th = room.theme;

    for (const d of DIRS) {
      const nx = s.pos.x+d.x, ny = s.pos.y+d.y;
      if (nx<0||ny<0||nx>=COLS||ny>=ROWS) continue;
      const t = ly[ny][nx];

      // Environment objects — flavor text (unchanged)
      if (t>=10) { const obj=room.envObjects?.find(o=>o.id===t); if(obj){s.dlg=obj.dialog;sync();return;} }

      // ── PROBLEM TILE ──
      // First touch: discover the problem
      if (t===TID.PROB && !s.foundP) {
        s.foundP = true;
        s.dlg = room.problemDialog;
        sfx.pickup(); s.shake = 3;
        spawn(nx, ny, th.prob, 15);
        sync(); return;
      }
      // After problem found, puzzle not yet cleared: open puzzle overlay
      if (t===TID.PROB && s.foundP && !s.puzzleCleared && !s.solved) {
        s.puzzleOpen = true;
        setPuzzleOpen(true);
        sync(); return;
      }
      // After puzzle cleared, not yet identified: narration → cards
      if (t===TID.PROB && s.foundP && s.puzzleCleared && !s.solved) {
        if (!s.narrationShown) {
          s.dlg = room.narration;
          s.narrationShown = true;
          sync(); return;
        }
        s.dlg = "Which usability principle was violated here?";
        sync();
        const choices = shuffle([s.ri, ...room.distractors]);
        setUi(p => ({...p, cardChoices: choices}));
        setTimeout(() => { gs.current.showCards = true; sync(); }, 800);
        return;
      }

      // ── FIX TILE ── (unchanged)
      if (t===TID.FIX && s.foundP && !s.foundF) {
        s.foundF = true;
        s.dlg = room.fixDialog;
        sfx.pickup(); s.shake = 3;
        spawn(nx, ny, th.fix, 15);
        sync(); return;
      }
      if (t===TID.FIX && !s.foundP) {
        s.dlg = "Something useful... but I should understand the problem first.";
        sync(); return;
      }
      if (t===TID.FIX && s.foundF) {
        s.dlg = "Already got it. Head back to the problem.";
        sync(); return;
      }

      // ── EXIT TILE ── (unchanged)
      if (t===TID.EXIT && s.solved) {
        const el = Math.round((Date.now()-roomStart.current)/1000);
        roomTimesRef.current = [...roomTimesRef.current, el];
        if (s.ri < 9) {
          const nr = s.ri + 1, en = findEntrance(ROOMS[nr].layout);
          Object.assign(s, {
            pos:{...en}, vPos:{...en}, facing:"up",
            foundP:false, foundF:false, solved:false,
            ri:nr, showCards:false, showReveal:false,
            narrationShown:false, puzzleOpen:false, puzzleCleared:false,
            dlg: ROOMS[nr].intro,
          });
          roomStart.current = Date.now();
          sfx.step(); sync();
        } else {
          sync(); setPhase("caseFile");
        }
        return;
      }
      if (t===TID.EXIT && !s.solved) {
        s.dlg = "Locked. Solve the room first.";
        sfx.error(); s.shake = 2;
        sync(); return;
      }
      if (t===TID.FURN) { s.dlg = "Just old furniture. Nothing useful."; sync(); return; }
    }
  };

  // ═══════════════════════════════════════════════════════════
  // PUZZLE CALLBACKS
  // ═══════════════════════════════════════════════════════════
  const onPuzzleSolve = useCallback(() => {
    const s = gs.current;
    s.puzzleOpen = false;
    s.puzzleCleared = true;
    setPuzzleOpen(false);
    // Auto-show narration dialog
    s.dlg = ROOMS[s.ri].narration;
    s.narrationShown = true;
    sfx.solve();
    s.shake = 5;
    // Particles on problem tiles
    const room = ROOMS[s.ri], ly = room.layout;
    for (let y=0; y<ROWS; y++) for (let x=0; x<COLS; x++)
      if (ly[y][x]===TID.PROB) spawn(x, y, "#00ffcc", 20);
    sync();
  }, [sync, sfx, spawn]);

  const onPuzzleClose = useCallback(() => {
    gs.current.puzzleOpen = false;
    setPuzzleOpen(false);
    sync();
  }, [sync]);

  // Play card (unchanged)
  const playCard = useCallback((id) => {
    const s=gs.current, room=ROOMS[s.ri];
    if (id===s.ri) {
      s.usedCards=[...s.usedCards,id];s.solved=true;s.showCards=false;sfx.solve();s.shake=5;
      for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(room.layout[y][x]===TID.PROB)spawn(x,y,"#00ffcc",20);
      s.dlg=room.summary;sync();setTimeout(()=>{gs.current.showReveal=true;sync();},1200);
    } else {
      const w=(wrongRef.current[s.ri]||0)+1;wrongRef.current[s.ri]=w;
      const rb=room.rebuttals[id]||"Not quite. Think about what you experienced.";
      if(w>=2){const cor=HEURISTICS[s.ri];setUi(p=>({...p,wrongCard:id,wrongMsg:`${rb}\n\nThe answer is #${cor.num}: ${cor.name}. ${cor.desc}`}));
        setTimeout(()=>{const s2=gs.current;s2.usedCards=[...s2.usedCards,s2.ri];s2.solved=true;s2.showCards=false;sfx.solve();s2.shake=5;
          for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(ROOMS[s2.ri].layout[y][x]===TID.PROB)spawn(x,y,"#00ffcc",20);
          s2.dlg=ROOMS[s2.ri].summary;setUi(p=>({...p,wrongCard:null,wrongMsg:null}));sync();
          setTimeout(()=>{gs.current.showReveal=true;sync();},1200);},4000);
      }else{setUi(p=>({...p,wrongCard:id,wrongMsg:rb}));sfx.error();gs.current.shake=4;setTimeout(()=>setUi(p=>({...p,wrongCard:null,wrongMsg:null})),2500);}
    }
  }, [sfx, sync, spawn]);

  // Secret room jump: Ctrl+Shift+[1-9,0] → jump to room 1-10
  const jumpToRoom = useCallback((roomNum) => {
    const ri = roomNum === 0 ? 9 : roomNum - 1; // 0 key = room 10
    if (ri < 0 || ri > 9 || phase !== "playing") return;
    const s = gs.current;
    const en = findEntrance(ROOMS[ri].layout);
    Object.assign(s, {
      pos:{...en}, vPos:{...en}, facing:"up",
      foundP:false, foundF:false, solved:false,
      ri, showCards:false, showReveal:false,
      narrationShown:false, puzzleOpen:false, puzzleCleared:false,
      dlg: ROOMS[ri].intro,
    });
    setPuzzleOpen(false);
    roomStart.current = Date.now();
    sfx.step(); sync();
  }, [phase, sfx, sync]);

  // Keyboard
  useEffect(() => {
    const dn=e=>{
      // Ignore game keys when jump input is open
      if (showJump) return;
      gs.current.keys[e.key]=true;
      if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key) && !gs.current.puzzleOpen) e.preventDefault();
      // Secret: ~ opens room jump
      if((e.key === '`' || e.key === '~') && phase === "playing") {
        e.preventDefault();
        setShowJump(s => !s);
        setJumpInput("");
      }
      initAudio();
    };
    const up=e=>{
      if (showJump) return;
      gs.current.keys[e.key]=false;
    };
    window.addEventListener("keydown",dn);window.addEventListener("keyup",up);
    return()=>{window.removeEventListener("keydown",dn);window.removeEventListener("keyup",up);};
  }, [initAudio, jumpToRoom, showJump, phase]);

  // Timer
  useEffect(() => {
    if(phase!=="playing")return;
    const id=setInterval(()=>{timerRef.current++;setUi(p=>({...p,timer:timerRef.current}));},1000);
    return()=>clearInterval(id);
  }, [phase]);

  // ═══════════════════════════════════════════════════════════
  // GAME LOOP — with puzzle overlay blocking
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if(phase!=="playing")return;
    const canvas=canvasRef.current;if(!canvas)return;
    const ctx=canvas.getContext("2d");
    let animId, tick=0;
    const loop = () => {
      tick++;const s=gs.current,k=s.keys,room=ROOMS[s.ri],ly=room.layout;

      // Skip ALL game-loop input when puzzle overlay is open
      if (!s.puzzleOpen) {
        // Dialog dismiss with auto-card transition
        if(s.dlg&&isAct(k)){
          clrAct(k);
          s.dlg=null;
          // After puzzle narration → auto-trigger cards
          if (s.puzzleCleared && s.narrationShown && !s.solved && !s.showCards) {
            s.dlg = "Which usability principle was violated here?";
            const choices = shuffle([s.ri, ...room.distractors]);
            setUi(p => ({...p, cardChoices: choices}));
            setTimeout(() => { gs.current.showCards = true; sync(); }, 800);
          }
          sync();
        }
        if(s.showReveal&&isAct(k)){clrAct(k);s.showReveal=false;sync();}

        // Movement — blocked during dialog, cards, reveal, AND puzzle
        if(!s.dlg&&!s.showCards&&!s.showReveal&&tick-s.mt>MOVE_CD){
          let dx=0,dy=0,nf=s.facing;
          if(k.ArrowUp||k.w||k.W){dy=-1;nf="up";}else if(k.ArrowDown||k.s||k.S){dy=1;nf="down";}
          else if(k.ArrowLeft||k.a||k.A){dx=-1;nf="left";}else if(k.ArrowRight||k.d||k.D){dx=1;nf="right";}
          if(dx||dy){const nx=s.pos.x+dx,ny=s.pos.y+dy;
            if(nx>=0&&ny>=0&&nx<COLS&&ny<ROWS){const tid=ly[ny][nx];
              // Lava zones per room (impassable)
              const LAVA_ZONES = {
                0: [[12,8],[13,8],[14,8],[12,9],[13,9],[14,9]],
                6: [[1,8],[2,8],[3,8],[1,9],[2,9],[3,9]],
                8: [[1,7],[2,7],[3,7],[4,7],[2,8],[3,8],[15,5],[16,5],[15,6],[16,6],[17,6],[15,7],[16,7]],
                9: [[6,7],[7,7],[8,7],[9,7],[10,7],[11,7],[12,7],[13,7],[6,8],[7,8],[8,8],[9,8],[10,8],[11,8],[12,8],[13,8],[6,9],[7,9],[8,9],[9,9],[10,9],[11,9],[12,9],[13,9]],
              };
              const lavaBlocked = (LAVA_ZONES[s.ri] || []).some(([lx,ly]) => lx===nx && ly===ny);
              const blocked = tid===TID.WALL || (tid===TID.EXIT&&!s.solved) || (s.ri===4&&tid===TID.PROB&&!s.puzzleCleared) || lavaBlocked;
              if(!blocked){s.pos={x:nx,y:ny};s.mt=tick;sfx.step();}
              else{s.vPos.x+=dx*0.3;s.vPos.y+=dy*0.3;}}
            if(nf!==s.facing)s.facing=nf;}
          if(isAct(k)){clrAct(k);interactRef.current();}
        }
      }

      s.vPos.x+=(s.pos.x-s.vPos.x)*0.25;s.vPos.y+=(s.pos.y-s.vPos.y)*0.25;
      drawGame(ctx, atlasRef.current, s, room, s.ri, tick, gearsRef.current, propsRef.current);
      animId=requestAnimationFrame(loop);
    };
    animId=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(animId);
  }, [phase, sfx, sync]);

  // Start game
  const startGame = () => {
    initAudio();const en=findEntrance(ROOMS[0].layout);
    gs.current={pos:{...en},vPos:{...en},facing:"up",foundP:false,foundF:false,solved:false,
      usedCards:[],shake:0,particles:[],keys:gs.current.keys,mt:0,ri:0,
      dlg:ROOMS[0].intro,showCards:false,showReveal:false,narrationShown:false,
      puzzleOpen:false, puzzleCleared:false};
    timerRef.current=0;roomTimesRef.current=[];wrongRef.current=[];
    roomStart.current=Date.now();setPuzzleOpen(false);sync();setPhase("playing");
  };

  // Mobile D-pad
  const dD=useCallback(key=>e=>{e.preventDefault();gs.current.keys[key]=true;initAudio();},[initAudio]);
  const dU=useCallback(key=>e=>{e.preventDefault();gs.current.keys[key]=false;},[]);

  const {ri,dlg,showCards,showReveal,foundP,foundF,solved,wrongCard,wrongMsg,timer,roomTimes,cardChoices,wrongGuesses,puzzleCleared}=ui;
  const room=ROOMS[ri];

  // Status text
  const statusText = puzzleOpen
    ? "🎯 Solve the puzzle! Or go back to explore."
    : solved
    ? "✔ Room Solved! Head to the exit."
    : puzzleCleared
    ? "🧩 Puzzle cleared! Identify the principle at the clue."
    : foundF
    ? "🔧 Fix acquired! Return to the problem."
    : foundP
    ? "⚠️ Problem found. Explore for a fix."
    : "🔍 Explore. Look for something wrong.";

  return (
    <div className="hh">
      <div className="crt" style={{position:"fixed",width:"100%",height:"100%",pointerEvents:"none",zIndex:999}}/>

      {phase==="title"&&(
        <div className="title">
          <div className="title-icon">🕵️‍♂️</div>
          <div><h1 className="title-h title-cyan">HEURISTIC</h1><h1 className="title-h title-red">HOUSE</h1></div>
          <p className="title-sub">Ten rooms. Ten usability violations.<br/>Experience the problem. Find the fix. Name the principle.</p>
          <button className="btn" onClick={() => { initAudio(); setStoryStep(0); setPhase("story"); }}>START INVESTIGATION</button>
          <div className="title-hint">WASD/Arrows + SPACE/E &nbsp;|&nbsp; Mobile: Touch</div>
        </div>
      )}

      {phase==="story"&&(
        <div style={{ position:"relative", textAlign:"center", zIndex:10, display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:"2rem", overflow:"hidden" }}>

          {/* Animated background — drifting particles */}
          <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
            {[...Array(20)].map((_,i) => (
              <div key={i} style={{
                position:"absolute",
                left: `${(i*17+7)%100}%`, top: `${(i*23+13)%100}%`,
                width: i%3===0 ? 3 : 2, height: i%3===0 ? 3 : 2,
                background: i%4===0 ? "rgba(0,255,204,0.3)" : "rgba(255,0,85,0.2)",
                borderRadius:"50%",
                animation: `float ${3+i%4}s ease-in-out infinite`,
                animationDelay: `${i*0.3}s`,
              }}/>
            ))}
          </div>

          {/* Flickering torch glow effect */}
          <div style={{ position:"absolute", top:"15%", left:"10%", width:80, height:80,
            background:"radial-gradient(circle, rgba(255,150,50,0.15) 0%, transparent 70%)",
            animation:"pulseGlow 2s infinite", pointerEvents:"none" }}/>
          <div style={{ position:"absolute", top:"20%", right:"10%", width:60, height:60,
            background:"radial-gradient(circle, rgba(255,100,30,0.12) 0%, transparent 70%)",
            animation:"pulseGlow 3s infinite", animationDelay:"1s", pointerEvents:"none" }}/>

          <div style={{ position:"relative", maxWidth:520 }}>
            {/* House icon with eerie glow */}
            <div style={{ fontSize:"4rem", marginBottom:"1.5rem",
              filter:"drop-shadow(0 0 20px rgba(255,0,85,0.6))",
              animation:"float 4s ease-in-out infinite" }}>
              🏚️
            </div>

            <h2 style={{ color:"#ff0055", fontSize:"clamp(1.2rem, 3vw, 1.8rem)", letterSpacing:3,
              textShadow:"0 0 15px rgba(255,0,85,0.5)", fontFamily:"'Courier New',monospace", marginBottom:"1.5rem" }}>
              THE HOUSE OF DR. ERROR
            </h2>

            {/* Story text that reveals step by step */}
            <div style={{ textAlign:"left", lineHeight:1.8, fontSize:"clamp(0.85rem, 2vw, 1rem)",
              color:"#c0c0d0", fontFamily:"'Courier New',monospace" }}>
              {storyStep >= 0 && (
                <p style={{ animation:"fadeIn 1s ease", marginBottom:"1rem" }}>
                  <span style={{color:"#ff0055"}}>Case #7749.</span> A house on the edge of town. No one who enters comes out the same.
                </p>
              )}
              {storyStep >= 1 && (
                <p style={{ animation:"fadeIn 1s ease", marginBottom:"1rem" }}>
                  They call it <span style={{color:"#00ffcc"}}>Heuristic House</span> — built by the infamous <span style={{color:"#ff0055"}}>Dr. Error</span>,
                  a designer who despised good usability. Every room is a trap of broken interfaces.
                </p>
              )}
              {storyStep >= 2 && (
                <p style={{ animation:"fadeIn 1s ease", marginBottom:"1rem" }}>
                  Buttons that give no feedback. Labels written in jargon. Doors that work differently
                  despite looking the same. <span style={{color:"#ffcc00"}}>Ten violations. Ten rooms. No mercy.</span>
                </p>
              )}
              {storyStep >= 3 && (
                <p style={{ animation:"fadeIn 1s ease", marginBottom:"1rem" }}>
                  Previous investigators went in. Their skeletons remain.
                  <span style={{color:"#888"}}> You are the last detective on this case.</span>
                </p>
              )}
              {storyStep >= 4 && (
                <p style={{ animation:"fadeIn 1s ease", color:"#00ffcc", fontWeight:"bold", textAlign:"center", marginTop:"1.5rem" }}>
                  Find the violation. Find the fix. Name the principle. Escape.
                </p>
              )}
            </div>

            {/* Buttons */}
            <div style={{ marginTop:"2rem" }}>
              {storyStep < 4 ? (
                <button className="btn" onClick={() => setStoryStep(s => s + 1)}
                  style={{ padding:"10px 20px", fontSize:"0.9rem" }}>
                  {storyStep === 0 ? "CONTINUE" : storyStep === 3 ? "..." : "CONTINUE"}
                </button>
              ) : (
                <button className="btn" onClick={startGame}
                  style={{ padding:"14px 28px", fontSize:"1.1rem", animation:"pulseGlow 2s infinite" }}>
                  ENTER THE HOUSE
                </button>
              )}
            </div>

            {/* Page indicator dots */}
            <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:"1.5rem" }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{ width:8, height:8, borderRadius:"50%",
                  background: i <= storyStep ? "#00ffcc" : "#333",
                  transition:"background 0.3s" }}/>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase==="playing"&&(
        <div className="play-wrap">
          <div className="hud">
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              <span className="hud-room">ROOM {ri+1}/10</span>
              <span className="hud-name">{room.name}</span>
            </div>
            <div className="hud-timer">{fmt(timer)}</div>
          </div>
          <div className="canvas-wrap">
            <canvas ref={canvasRef} width={GW} height={GH} className="canvas"/>

            {/* ── Dialog overlay ── */}
            {dlg&&!showReveal&&!puzzleOpen&&(
              <div className="dlg">
                <div className="dlg-icon">🕵️‍♂️</div>
                <div style={{flex:1}}>
                  <p className="dlg-text"><Typewriter text={dlg}/></p>
                  <p className="dlg-hint">▶ SPACE</p>
                </div>
              </div>
            )}

            {/* ── PUZZLE OVERLAY ── */}
            {puzzleOpen && (
              <PuzzleOverlay
                roomIndex={ri}
                hasFix={foundF}
                onSolve={onPuzzleSolve}
                onClose={onPuzzleClose}
                sfx={sfx}
              />
            )}
          </div>

          <div className="status" role="status" aria-live="polite">{statusText}</div>

          {/* Secret room jump box */}
          {showJump && (
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 12px",
              background:"rgba(10,8,20,0.95)", border:"1px solid #ffcc00", borderRadius:6 }}>
              <span style={{ color:"#ffcc00", fontSize:"0.75rem", fontFamily:"monospace" }}>JUMP TO ROOM:</span>
              <input
                autoFocus
                value={jumpInput}
                onChange={e => setJumpInput(e.target.value.replace(/[^0-9]/g, ""))}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    const num = parseInt(jumpInput);
                    if (num >= 1 && num <= 10) { jumpToRoom(num === 10 ? 0 : num); }
                    setShowJump(false); setJumpInput("");
                  }
                  if (e.key === "Escape" || e.key === "`" || e.key === "~") {
                    setShowJump(false); setJumpInput("");
                  }
                }}
                placeholder="1-10"
                maxLength={2}
                style={{ width:40, padding:"4px 6px", background:"#111", border:"1px solid #555",
                  borderRadius:3, color:"#ffcc00", fontFamily:"monospace", fontSize:"0.9rem",
                  textAlign:"center", outline:"none" }}
              />
              <span style={{ color:"#666", fontSize:"0.6rem" }}>Enter to go · Esc to close</span>
            </div>
          )}

          {/* D-pad — only on touch devices, hidden when puzzle is open */}
          {showControls && !puzzleOpen && (
            <>
              <div className="dpad">
                <div/><div className="dpad-btn" onPointerDown={dD("ArrowUp")} onPointerUp={dU("ArrowUp")} onPointerLeave={dU("ArrowUp")}>▲</div><div/>
                <div className="dpad-btn" onPointerDown={dD("ArrowLeft")} onPointerUp={dU("ArrowLeft")} onPointerLeave={dU("ArrowLeft")}>◀</div>
                <div className="dpad-btn" onPointerDown={dD("ArrowDown")} onPointerUp={dU("ArrowDown")} onPointerLeave={dU("ArrowDown")}>▼</div>
                <div className="dpad-btn" onPointerDown={dD("ArrowRight")} onPointerUp={dU("ArrowRight")} onPointerLeave={dU("ArrowRight")}>▶</div>
              </div>
              <div className="dpad-btn interact-btn" onPointerDown={e=>{e.preventDefault();interactRef.current();}}>INTERACT</div>
            </>
          )}

          {wrongMsg&&(<div className="wrong-msg"><p>{wrongMsg}</p></div>)}
          {showCards&&!puzzleOpen&&(
            <div className="cards">
              {(cardChoices.length?cardChoices:[ri,...(room.distractors||[])]).map(hid=>{
                const h=HEURISTICS[hid];if(!h)return null;
                return(<div key={hid} className={`card ${wrongCard===hid?"wrong":""} glow`} onClick={()=>!wrongMsg&&playCard(hid)}>
                  <div className="card-icon">{h.icon}</div><div className="card-label">{h.short}</div>
                  <div className="card-desc">{h.desc}</div></div>);
              })}
            </div>
          )}
        </div>
      )}

      {showReveal&&phase==="playing"&&(
        <div className="reveal">
          <div className="reveal-box">
            <div className="reveal-icon">{HEURISTICS[ri].icon}</div>
            <h2 className="reveal-num">HEURISTIC #{HEURISTICS[ri].num}</h2>
            <h1 className="reveal-name">{HEURISTICS[ri].name}</h1>
            <p className="reveal-desc">{HEURISTICS[ri].desc}</p>
            <div className="reveal-quote"><p>"{room.summary}"</p></div>
            <button className="btn" style={{marginTop:"2rem"}} onClick={()=>{gs.current.showReveal=false;sync();}}>CONTINUE</button>
          </div>
        </div>
      )}

      {phase==="caseFile"&&(
        <div className="end">
          <div className="end-icon">📁</div>
          <h1 className="end-title">CASE CLOSED</h1>
          <p className="end-sub">You escaped and identified all 10 usability violations.</p>
          <div className="end-time">FINAL TIME: {fmt(timer)}</div>
          <div className="end-score">Solved first try: {10-(wrongGuesses.filter(w=>w>0).length)}/10</div>
          <div className="end-list">
            {ROOMS.map((rm,i)=>(
              <div key={i} className="end-row">
                <span className="end-row-icon">{HEURISTICS[i].icon}</span>
                <div style={{flex:1}}>
                  <div className="end-row-name">#{HEURISTICS[i].num} {HEURISTICS[i].name}</div>
                  <div className="end-row-detail">{rm.name}<span className="end-row-time">{roomTimes[i]||"?"}s</span>
                    {wrongGuesses[i]>0&&<span className="end-row-wrong">({wrongGuesses[i]} wrong)</span>}</div>
                </div>
                <span className="end-row-check">✔</span>
              </div>
            ))}
          </div>
          <button className="btn" onClick={()=>setPhase("title")}>REOPEN INVESTIGATION</button>
        </div>
      )}
    </div>
  );
}
