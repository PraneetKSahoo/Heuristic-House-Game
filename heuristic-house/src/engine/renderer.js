import { T, COLS, ROWS, GW, GH, TID, DIRS, hexRgba } from "./constants";
import ATLAS from "./atlas";

// ═══════════════════════════════════════════════════════════════
// TILE DRAWING
// ═══════════════════════════════════════════════════════════════
export function drawTile(ctx, at, name, dx, dy) {
  const s = ATLAS[name]; if (!s || !at) return;
  ctx.drawImage(at, s.x, s.y, T, T, dx, dy, T, T);
}

// NEW: Map coordinates for the new downloaded sprite sheets
// Format:[column, row, widthInTiles, heightInTiles]
const NEW_SPRITES = {
  // --- From Dungeon_Tileset_at.png ---
  dungeon_torch_1:[4, 1, 1, 1],
  dungeon_torch_2:[5, 1, 1, 1],
  dungeon_chest_closed: [0, 4, 1, 1],
  dungeon_chest_open: [1, 4, 1, 1],
  dungeon_door_closed: [3, 5, 2, 2], // 32x32 wooden door
  dungeon_door_open: [5, 5, 2, 2],
  potion_blue: [2, 6, 1, 1],
  potion_red:[3, 6, 1, 1],
  
  // --- From home_pack.png ---
  home_printer: [2, 3, 1, 1], // Appliance used for pet shop
  home_cabinet: [4, 1, 1, 2],
};

// Helper to draw directly from the new sheets
function drawFromSheet(ctx, image, spriteName, dx, dy, scale = 1) {
  if (!image) return;
  const s = NEW_SPRITES[spriteName];
  if (!s) return;
  
  const [col, row, w, h] = s;
  const grid = 16; 
  ctx.drawImage(
    image, 
    col * grid, row * grid, w * grid, h * grid, 
    dx, dy, w * T * scale, h * T * scale        
  );
}

// ═══════════════════════════════════════════════════════════════
// PROP / VEGETATION / ANIMAL HELPERS
// ═══════════════════════════════════════════════════════════════

// Draw a region from any PNG directly
function drawRegion(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
  if (!img) return;
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw || sw, dh || sh);
}

// Animals are 56x56 single-frame sprites; draw centered and scaled to tile size
function drawAnimal(ctx, img, dx, dy, size = T) {
  if (!img) return;
  ctx.drawImage(img, 0, 0, 56, 56, dx, dy, size, size);
}

// Animated animal with subtle bob
function drawAnimalBob(ctx, img, dx, dy, tick, offset = 0, size = T) {
  if (!img) return;
  const bob = Math.sin(tick * 0.08 + offset) * 1.5;
  ctx.drawImage(img, 0, 0, 56, 56, dx, dy + bob, size, size);
}

// Bush from Bushes_With_Berries.png (56x56, 2x2 grid of 28x28 bushes)
function drawBush(ctx, img, dx, dy, variant = 0) {
  if (!img) return;
  const sx = (variant % 2) * 28, sy = Math.floor(variant / 2) * 28;
  ctx.drawImage(img, sx, sy, 28, 28, dx, dy, T, T);
}

// Rock from Rocks.png (56x56, assorted rocks)
function drawRock(ctx, img, dx, dy, variant = 0) {
  if (!img) return;
  // 4 rocks in roughly 2x2 layout
  const sx = (variant % 2) * 28, sy = Math.floor(variant / 2) * 28;
  ctx.drawImage(img, sx, sy, 28, 28, dx, dy, T, T);
}

// Flower from Red_Flowers.png (56x56)
function drawFlower(ctx, img, dx, dy, variant = 0) {
  if (!img) return;
  const sx = (variant % 2) * 28, sy = Math.floor(variant / 2) * 28;
  ctx.drawImage(img, sx, sy, 28, 28, dx, dy, T, T);
}

// Tree from Big_Trees.png (280x112, ~10 trees each ~28px wide)
function drawTree(ctx, img, dx, dy, variant = 0, h = 3) {
  if (!img) return;
  const sx = variant * 28;
  ctx.drawImage(img, sx, 0, 28, h * 28, dx, dy, T * 1.5, T * h);
}

// Small tree - just the canopy
function drawSmallTree(ctx, img, dx, dy, variant = 0) {
  if (!img) return;
  const sx = variant * 28;
  ctx.drawImage(img, sx, 0, 28, 56, dx, dy, T * 1.5, T * 2);
}

// Grass patch from Elevated_Grass_Tileset.png (84x84)
function drawGrass(ctx, img, dx, dy) {
  if (!img) return;
  ctx.drawImage(img, 4, 4, 16, 16, dx, dy, T, T);
}

// Pixel skeleton (hand-drawn)
function drawSkeleton(ctx, dx, dy, tick) {
  const c = "rgba(220,210,190,";
  // Skull
  ctx.fillStyle = c + "0.9)"; ctx.fillRect(dx+5, dy+1, 6, 5);
  ctx.fillStyle = "#111"; ctx.fillRect(dx+6, dy+3, 1, 1); ctx.fillRect(dx+9, dy+3, 1, 1); // eyes
  ctx.fillStyle = c + "0.7)"; ctx.fillRect(dx+7, dy+5, 2, 1); // jaw
  // Ribcage
  ctx.fillStyle = c + "0.8)";
  ctx.fillRect(dx+7, dy+6, 2, 1); // spine
  ctx.fillRect(dx+5, dy+7, 6, 1); // ribs
  ctx.fillRect(dx+7, dy+8, 2, 1);
  ctx.fillRect(dx+5, dy+9, 6, 1);
  ctx.fillRect(dx+7, dy+10, 2, 1);
  // Arms
  ctx.fillStyle = c + "0.6)";
  ctx.fillRect(dx+3, dy+7, 2, 1); ctx.fillRect(dx+11, dy+7, 2, 1);
  ctx.fillRect(dx+2, dy+8, 1, 2); ctx.fillRect(dx+13, dy+8, 1, 2);
  // Legs
  ctx.fillRect(dx+6, dy+11, 1, 3); ctx.fillRect(dx+9, dy+11, 1, 3);
  ctx.fillRect(dx+5, dy+14, 2, 1); ctx.fillRect(dx+9, dy+14, 2, 1);
}

// Skull on ground
function drawSkull(ctx, dx, dy) {
  ctx.fillStyle = "rgba(200,190,170,0.8)"; ctx.fillRect(dx+5, dy+8, 6, 5);
  ctx.fillStyle = "#111"; ctx.fillRect(dx+6, dy+10, 1, 1); ctx.fillRect(dx+9, dy+10, 1, 1);
  ctx.fillStyle = "rgba(180,170,150,0.6)"; ctx.fillRect(dx+7, dy+12, 2, 1);
}


// Mushroom from Brown_Mushrooms.png (56x28, 2x1 grid of 28x28)
function drawMushroom(ctx, img, dx, dy, variant = 0) {
  if (!img) return;
  const sx = (variant % 2) * 28;
  ctx.drawImage(img, sx, 0, 28, 28, dx, dy, T, T);
}

// Water tile from Water_Tileset.png (28x28)
function drawWater(ctx, img, dx, dy) {
  if (!img) return;
  ctx.drawImage(img, 0, 0, 28, 28, dx, dy, T, T);
}

// Bone on ground
function drawBone(ctx, dx, dy) {
  ctx.fillStyle = "rgba(220,210,190,0.7)";
  ctx.fillRect(dx+3, dy+8, 10, 2);
  ctx.fillRect(dx+2, dy+7, 3, 4);
  ctx.fillRect(dx+11, dy+7, 3, 4);
}

// Wall torch using torch.gif (140x168, browser auto-animates)
function drawWallTorch(ctx, img, dx, dy, tick, variant = 0, glowRadius = 30) {
  // Use torchGif if available (passed as img), fallback gracefully
  if (!img) return;
  // Draw the full GIF scaled to ~1x2 tiles
  ctx.drawImage(img, 0, 0, 140, 168, dx, dy - T*0.5, T, T * 1.5);
  // Animated warm glow underneath
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const flicker = 0.3 + Math.sin(tick * 0.15 + variant * 1.3) * 0.15;
  const g = ctx.createRadialGradient(dx + 8, dy, 2, dx + 8, dy, glowRadius);
  g.addColorStop(0, `rgba(255, 150, 50, ${flicker})`);
  g.addColorStop(0.5, `rgba(255, 100, 20, ${flicker * 0.3})`);
  g.addColorStop(1, "rgba(255, 80, 0, 0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(dx + 8, dy, glowRadius, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// Cage bars from new_Dungeon_Tileset.png (168x224, bars at bottom-right ~x=152, y=96)
function drawCageBars(ctx, img, dx, dy, height = 2) {
  if (!img) return;
  // The cage/jail bars are at approximately x=152, y=96, 16x128 in the tileset
  for (let h = 0; h < height; h++) {
    ctx.drawImage(img, 152, 96 + h * 16, 16, 16, dx, dy + h * T, T, T);
  }
}

// Simple cage frame drawn with canvas
function drawCageFrame(ctx, x1, y1, x2, y2) {
  ctx.strokeStyle = "#666"; ctx.lineWidth = 2;
  ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  // Vertical bars
  const w = x2 - x1;
  const barCount = Math.floor(w / 8);
  ctx.strokeStyle = "#888"; ctx.lineWidth = 1;
  for (let i = 1; i < barCount; i++) {
    const bx = x1 + i * (w / barCount);
    ctx.beginPath(); ctx.moveTo(bx, y1); ctx.lineTo(bx, y2); ctx.stroke();
  }
  // Horizontal cross bars
  ctx.strokeStyle = "#777"; ctx.lineWidth = 1.5;
  const mid = y1 + (y2 - y1) / 2;
  ctx.beginPath(); ctx.moveTo(x1, mid); ctx.lineTo(x2, mid); ctx.stroke();
}

// Cobweb (reusable outside env objects)
function drawCobweb(ctx, dx, dy) {
  ctx.strokeStyle = "rgba(200,200,200,0.3)"; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx+16, dy+16);
  ctx.moveTo(dx+16, dy); ctx.lineTo(dx, dy+16);
  ctx.moveTo(dx+8, dy); ctx.lineTo(dx+8, dy+16); ctx.stroke();
}

// Lava pool from lava.jpg (scaled down, with animated bubbles)
function drawLavaPool(ctx, img, dx, dy, w, h, tick) {
  if (img) {
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.drawImage(img, 0, 0, 400, 280, dx, dy, w, h);
    ctx.globalAlpha = 1;
    ctx.restore();
  } else {
    ctx.fillStyle = "rgba(255, 60, 0, 0.4)";
    ctx.beginPath(); ctx.ellipse(dx + w/2, dy + h/2, w/2, h/2, 0, 0, Math.PI*2); ctx.fill();
  }
  // Glow
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const g = ctx.createRadialGradient(dx+w/2, dy+h/2, 5, dx+w/2, dy+h/2, w*0.8);
  g.addColorStop(0, "rgba(255, 80, 0, 0.25)");
  g.addColorStop(1, "rgba(255, 40, 0, 0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(dx+w/2, dy+h/2, w*0.7, h*0.7, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();
  // Bubbles
  for (let i = 0; i < 4; i++) {
    if ((tick + i * 7) % 20 < 10) {
      ctx.fillStyle = "#ffaa00";
      ctx.fillRect(dx + 4 + Math.sin(tick*0.1+i*3) * (w*0.3) + w*0.3, dy + Math.cos(tick*0.08+i*2) * (h*0.3) + h*0.3, 2, 2);
    }
  }
}

// Per-room floor tile choices
const ROOM_FLOORS = {
  0: ["floor_stone1", "floor_dark"], 
  1: ["floor_wood_new", "floor_wood_at"],    
  2:["floor_stone3", "floor_stone4"],       
  3:["floor_ornate1", "floor_ornate4"],     
  4: ["floor_ornate2", "floor_ornate5"],     
  5: ["floor_pp_dark", "floor_pp_tile"],     
  6:["floor_stone5", "floor_stone1"],       
  7:["floor_pp_brick", "floor_pp_dark"],    
  8: ["floor_stone2", "floor_dark"],         
  9: ["floor_check1", "floor_check2"],       
};

// Per-room wall tile
const ROOM_WALLS = {
  0: "wall_stone_m", 1: "wall_stone_m", 2: "wall_dark_m",
  3: "wall_blue_full", 4: "wall_pp1", 5: "wall_dark_m",
  6: "wall_stone_m", 7: "wall_dark_tl", 8: "wall_stone_m",
  9: "wall_blue_full2",
};

// Per-room furniture sprite
const ROOM_FURN = {
  0: "crate1", 1: "barrel1", 2: "crate2", 3: "pp_crate", 4: "pp_barrel",
  5: "pp_chair", 6: "crate1", 7: "crate2", 8: "barrel2", 9: "dung_crate",
};

// ═══════════════════════════════════════════════════════════════
// ENVIRONMENT OBJECT SPRITES
// ═══════════════════════════════════════════════════════════════
const ENV_SPRITES = {
  cobweb(ctx,px,py){ctx.strokeStyle="rgba(200,200,200,0.4)";ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+16,py+16);ctx.moveTo(px+16,py);ctx.lineTo(px,py+16);ctx.moveTo(px+8,py);ctx.lineTo(px+8,py+16);ctx.stroke();},
  clipboard(ctx,px,py){ctx.fillStyle="#ddd";ctx.fillRect(px+5,py+2,6,11);ctx.fillStyle="#888";for(let l=0;l<4;l++)ctx.fillRect(px+6,py+4+l*2.5,4,1);ctx.fillStyle="#aaa";ctx.fillRect(px+6,py+1,4,2);},
  toolbox(ctx,px,py){ctx.fillStyle="#8B4513";ctx.fillRect(px+3,py+5,10,7);ctx.fillStyle="#654321";ctx.fillRect(px+3,py+5,10,2);ctx.fillStyle="#a0a0a0";ctx.fillRect(px+7,py+3,2,3);},
  bowl(ctx,px,py){ctx.fillStyle="#aaa";ctx.beginPath();ctx.arc(px+8,py+9,5,0,Math.PI*2);ctx.fill();ctx.fillStyle="#777";ctx.beginPath();ctx.arc(px+8,py+9,3,0,Math.PI*2);ctx.fill();ctx.fillStyle="#996633";ctx.fillRect(px+6,py+7,4,2);},
  lock(ctx,px,py){ctx.fillStyle="#FFD700";ctx.fillRect(px+5,py+7,6,5);ctx.strokeStyle="#FFD700";ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(px+8,py+7,3,Math.PI,0);ctx.stroke();ctx.fillStyle="#333";ctx.fillRect(px+7,py+9,2,2);},
  poster(ctx,px,py){ctx.fillStyle="#e8dcc8";ctx.fillRect(px+3,py+2,10,12);ctx.fillStyle="#555";for(let l=0;l<3;l++)ctx.fillRect(px+5,py+5+l*3,6,1);ctx.fillStyle="#cc9933";ctx.fillRect(px+5,py+3,6,1);},
  signal(ctx,px,py,tick){ctx.fillStyle="#333";ctx.fillRect(px+6,py+2,4,10);const b=Math.sin(tick*0.15)>0;ctx.fillStyle=b?"#ff0000":"#550000";ctx.beginPath();ctx.arc(px+8,py+4,3,0,Math.PI*2);ctx.fill();},
  minitrain(ctx,px,py,tick){const w=Math.sin(tick*0.2)*0.5;ctx.fillStyle="#8B0000";ctx.fillRect(px+3,py+6+w,10,5);ctx.fillStyle="#333";ctx.fillRect(px+4,py+11,2,2);ctx.fillRect(px+10,py+11,2,2);ctx.fillStyle="#555";ctx.fillRect(px+4,py+4+w,4,3);},
  mirror(ctx,px,py,tick){ctx.fillStyle="#554433";ctx.fillRect(px+2,py+1,12,14);const sh=Math.sin(tick*0.08)*10+80;ctx.fillStyle=`rgba(${100+sh},${120+sh},${140+sh},0.9)`;ctx.fillRect(px+3,py+2,10,12);ctx.fillStyle="rgba(255,255,255,0.15)";ctx.fillRect(px+4,py+3,3,6);},
  doormat(ctx,px,py){ctx.fillStyle="#8B6914";ctx.fillRect(px+1,py+10,14,4);ctx.fillStyle="#A0801C";ctx.fillRect(px+2,py+11,12,2);},
  globe(ctx,px,py,tick){const sp=tick*0.02;ctx.fillStyle="#2266aa";ctx.beginPath();ctx.arc(px+8,py+7,5,0,Math.PI*2);ctx.fill();ctx.fillStyle="#44aa44";ctx.fillRect(px+4+Math.sin(sp)*2,py+5,3,2);ctx.fillRect(px+8+Math.cos(sp)*2,py+7,2,3);ctx.fillStyle="#8B7355";ctx.fillRect(px+7,py+12,2,2);ctx.fillRect(px+5,py+13,6,1);},
  book(ctx,px,py){ctx.fillStyle="#8B2222";ctx.fillRect(px+4,py+3,8,10);ctx.fillStyle="#eee";ctx.fillRect(px+5,py+4,6,1);ctx.fillRect(px+5,py+6,5,1);ctx.fillRect(px+5,py+8,6,1);ctx.fillStyle="#666";ctx.fillRect(px+4,py+3,1,10);},
  candle(ctx,px,py,tick){ctx.fillStyle="#C0C0C0";ctx.fillRect(px+6,py+6,4,7);ctx.fillRect(px+5,py+12,6,2);ctx.fillStyle="#333";ctx.fillRect(px+7,py+4,2,3);const f1=Math.sin(tick*0.4)*1.5,f2=Math.cos(tick*0.6);ctx.fillStyle="#FF6600";ctx.beginPath();ctx.ellipse(px+8+f2,py+3+f1,2,3,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#FFCC00";ctx.beginPath();ctx.ellipse(px+8+f2,py+3.5+f1,1,2,0,0,Math.PI*2);ctx.fill();},
  stand(ctx,px,py){ctx.fillStyle="#8B7355";ctx.fillRect(px+7,py+4,2,9);ctx.fillRect(px+5,py+12,6,2);ctx.fillStyle="#a08060";ctx.fillRect(px+3,py+2,10,3);ctx.fillStyle="#666";ctx.fillRect(px+5,py+2,6,1);},
  pipe(ctx,px,py,tick){ctx.fillStyle="#888";ctx.fillRect(px+1,py+5,14,5);ctx.fillStyle="#999";ctx.fillRect(px+1,py+5,14,1);const pf=(tick*0.1)%3;if(pf<1){ctx.fillStyle="rgba(200,200,200,0.3)";ctx.beginPath();ctx.arc(px+8,py+2,2+pf,0,Math.PI*2);ctx.fill();}ctx.fillStyle="#666";ctx.fillRect(px+1,py+4,2,7);ctx.fillRect(px+13,py+4,2,7);},
  wrench(ctx,px,py){ctx.fillStyle="#aaa";ctx.fillRect(px+7,py+3,2,10);ctx.fillStyle="#999";ctx.fillRect(px+5,py+2,6,3);ctx.fillStyle="#888";ctx.fillRect(px+5,py+11,6,3);},
  mug(ctx,px,py){ctx.fillStyle="#ddd";ctx.fillRect(px+4,py+5,7,8);ctx.fillStyle="#ccc";ctx.fillRect(px+11,py+7,2,4);ctx.fillStyle="#664422";ctx.fillRect(px+5,py+6,5,3);ctx.fillStyle="rgba(200,200,200,0.3)";ctx.fillRect(px+6,py+3,1,2);ctx.fillRect(px+9,py+2,1,3);},
  magnifier(ctx,px,py){ctx.strokeStyle="#ccc";ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(px+7,py+6,4,0,Math.PI*2);ctx.stroke();ctx.fillStyle="rgba(150,200,255,0.2)";ctx.beginPath();ctx.arc(px+7,py+6,3.5,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#999";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px+10,py+9);ctx.lineTo(px+14,py+13);ctx.stroke();},
  thermo(ctx,px,py){ctx.fillStyle="#ddd";ctx.fillRect(px+7,py+1,2,10);ctx.fillStyle="#f33";ctx.fillRect(px+7,py+7,2,4);ctx.beginPath();ctx.arc(px+8,py+12,2.5,0,Math.PI*2);ctx.fillStyle="#f33";ctx.fill();ctx.fillStyle="#aaa";for(let i=0;i<4;i++)ctx.fillRect(px+9,py+2+i*2,2,1);},
  frostpipe(ctx,px,py,tick){ctx.fillStyle="#6688aa";ctx.fillRect(px+1,py+5,14,5);ctx.fillStyle="#88bbdd";ctx.fillRect(px+1,py+5,14,1);ctx.fillStyle="#aaddff";const s=Math.sin(tick*0.2);ctx.fillRect(px+3,py+3+s,2,2);ctx.fillRect(px+9,py+2-s,2,2);ctx.fillRect(px+12,py+4+s*0.5,1,1);},
  label(ctx,px,py){ctx.fillStyle="#998877";ctx.fillRect(px+3,py+4,10,8);ctx.fillStyle="rgba(100,80,60,0.5)";for(let l=0;l<3;l++)ctx.fillRect(px+4,py+6+l*2,8,1);},
  crate(ctx,px,py){ctx.fillStyle="#8B6914";ctx.fillRect(px+2,py+4,12,10);ctx.fillStyle="#A0801C";ctx.fillRect(px+2,py+4,12,2);ctx.fillStyle="#6B5110";ctx.fillRect(px+7,py+4,2,10);ctx.fillRect(px+2,py+8,12,1);},
};

export function drawEnvObj(ctx, px, py, obj, tick, theme) {
  ctx.fillStyle = hexRgba(theme.lit, 0.5);
  ctx.fillRect(px+1, py+1, T-2, T-2);
  const fn = ENV_SPRITES[obj?.sprite];
  if (fn) fn(ctx, px, py, tick);
  else { ctx.fillStyle = hexRgba(theme.accent, 0.4); ctx.fillRect(px+3, py+3, T-6, T-6); ctx.fillStyle = "#fff"; ctx.fillRect(px+6, py+6, 4, 4); }
}

// ═══════════════════════════════════════════════════════════════
// ROOM-SPECIFIC DECORATIONS (using atlas sprites)
// ═══════════════════════════════════════════════════════════════
const ROOM_DECOR = {
  // ═══ ROOM 0: ELEVATOR SHAFT — Dark, industrial, abandoned ═══
  0(ctx, at, tick, th, gears, state, atlasRefData, props) {
    if (!at) return;
    const dungeon = atlasRefData?.dungeon;
    const solved = state?.solved;
    const cleared = state?.puzzleCleared;

    // Elevator doors
    const elX = 8*T+2, elY = 0, elW = 4*T-4, elH = 2*T;
    if (solved || cleared) {
      // Doors slid open — dark shaft visible
      ctx.fillStyle = "#050308"; ctx.fillRect(elX, elY, elW, elH);
      // Left door (slid left)
      ctx.fillStyle = "#666"; ctx.fillRect(elX-2, elY+2, 6, elH-4);
      ctx.fillStyle = "#777"; ctx.fillRect(elX-1, elY+3, 4, elH-6);
      // Right door (slid right)
      ctx.fillStyle = "#666"; ctx.fillRect(elX+elW-4, elY+2, 6, elH-4);
      ctx.fillStyle = "#777"; ctx.fillRect(elX+elW-3, elY+3, 4, elH-6);
      // Elevator cabin inside
      ctx.fillStyle = "#1a1520"; ctx.fillRect(elX+6, elY+2, elW-12, elH-4);
      ctx.fillStyle = "#222"; ctx.fillRect(elX+8, elY+elH-4, elW-16, 2); // floor
    } else {
      // Doors closed — two grey panels
      const halfW = elW / 2;
      // Left door
      ctx.fillStyle = "#707070"; ctx.fillRect(elX, elY+1, halfW-1, elH-2);
      ctx.fillStyle = "#808080"; ctx.fillRect(elX+2, elY+3, halfW-5, elH-6);
      // Panel lines
      ctx.fillStyle = "#606060";
      ctx.fillRect(elX+3, elY+4, halfW-7, 1);
      ctx.fillRect(elX+3, elY+elH-5, halfW-7, 1);
      // Right door
      ctx.fillStyle = "#707070"; ctx.fillRect(elX+halfW+1, elY+1, halfW-1, elH-2);
      ctx.fillStyle = "#808080"; ctx.fillRect(elX+halfW+3, elY+3, halfW-5, elH-6);
      ctx.fillStyle = "#606060";
      ctx.fillRect(elX+halfW+4, elY+4, halfW-7, 1);
      ctx.fillRect(elX+halfW+4, elY+elH-5, halfW-7, 1);
      // Yellow knobs (centered on each door)
      ctx.fillStyle = "#daa520"; 
      ctx.beginPath(); ctx.arc(elX+halfW-4, elY+elH/2, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(elX+halfW+4, elY+elH/2, 2.5, 0, Math.PI*2); ctx.fill();
      // Knob shine
      ctx.fillStyle = "#f0d060";
      ctx.beginPath(); ctx.arc(elX+halfW-4.5, elY+elH/2-1, 1, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(elX+halfW+3.5, elY+elH/2-1, 1, 0, Math.PI*2); ctx.fill();
      // Door frame
      ctx.strokeStyle = "#555"; ctx.lineWidth = 1.5;
      ctx.strokeRect(elX-1, elY, elW+2, elH);
      // Center seam
      ctx.strokeStyle = "#444"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(elX+halfW, elY+1); ctx.lineTo(elX+halfW, elY+elH-1); ctx.stroke();
    }

    // Heavy pipe network across ceiling
    for (let x = 2; x <= 7; x++) drawTile(ctx, at, "ind_pipe_h", x*T, 0);
    for (let x = 12; x <= 17; x++) drawTile(ctx, at, "ind_pipe_h", x*T, 0);
    drawTile(ctx, at, "ind_vent", 3*T, 0); drawTile(ctx, at, "ind_vent", 6*T, 0);
    drawTile(ctx, at, "ind_vent", 13*T, 0); drawTile(ctx, at, "ind_vent", 16*T, 0);

    // Dungeon torches with warm glow
    drawWallTorch(ctx, props?.torchGif, 2*T, T, tick, 1);
    drawWallTorch(ctx, props?.torchGif, 17*T, T, tick, 2);
    drawWallTorch(ctx, props?.torchGif, T, 6*T, tick, 3, 25);
    drawWallTorch(ctx, props?.torchGif, 18*T, 6*T, tick, 4, 25);

    // Clutter — barrels, crates, rocks
    drawTile(ctx, at, "crate2", 16*T, 10*T); drawTile(ctx, at, "crate1", 15*T, 10*T);
    drawTile(ctx, at, "barrel1", 4*T, 10*T); drawTile(ctx, at, "barrel2", 3*T, 10*T);
    for (let x = 13; x <= 17; x += 2) drawRock(ctx, props?.rocks, x*T, 11*T, x % 4);
    drawRock(ctx, props?.rocks, 5*T, 11*T, 2);

    // Cobwebs in corners
    drawCobweb(ctx, T, T); drawCobweb(ctx, 18*T, T);
    drawCobweb(ctx, T, 2*T); drawCobweb(ctx, 18*T, 2*T);

    // Skeleton — been waiting for the elevator a very long time
    drawSkeleton(ctx, T, 11*T, tick);
    drawBone(ctx, 2*T, 12*T);

    // Lava seeping through cracks
    drawLavaPool(ctx, props?.lava, 12*T, 8*T, 3*T, 2*T, tick);

    // Mushrooms growing in damp corners
    drawMushroom(ctx, props?.mushrooms, 4*T, 11*T, 0);
    drawMushroom(ctx, props?.mushrooms, 15*T, 11*T, 1);

    // Indicator panel + status light
    drawTile(ctx, at, "ind_panel1", 7*T, T);
    drawTile(ctx, at, "ind_panel2", 12*T, T);
    if (solved || cleared) {
      ctx.fillStyle = "#33ff66";
      ctx.beginPath(); ctx.arc(7*T+8, T+5, 3, 0, Math.PI*2); ctx.fill();
      ctx.shadowColor = "#33ff66"; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(7*T+8, T+5, 3, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(80,250,123,0.15)"; ctx.fillRect(8*T+4, T*0.5, 3.5*T-8, T);
      ctx.fillStyle = "#33ff66"; ctx.font = "5px monospace"; ctx.fillText("\u25bc OPEN \u25bc", 9*T-2, T-1);
    } else {
      const blink = Math.sin(tick*0.1) > 0;
      ctx.fillStyle = blink ? "#ff3333" : "#551111";
      ctx.beginPath(); ctx.arc(7*T+8, T+5, 3, 0, Math.PI*2); ctx.fill();
    }
  },

  // ═══ ROOM 1: PET SHOP — Fenced animal pens, lively ═══
  1(ctx, at, tick, th, gears, state, atlasRefData, props) {
    if (!at) return;

    // ── Pen dividers using fence bars ──
    for (let y = 3; y <= 9; y++) {
      drawTile(ctx, at, "window_bar1", 6*T, y*T);
      drawTile(ctx, at, "window_bar1", 12*T, y*T);
    }
    // Bottom pen fence
    for (let x = 1; x <= 18; x++) drawTile(ctx, at, "fence_h", x*T, 9*T);
    // Shelves between cages at top
    [4, 6, 8, 10, 12].forEach(sx => drawTile(ctx, at, "pp_shelf", sx*T, T));

    // ── LEFT PEN: Dogs — grass floor, bowl, bones ──
    for (let x = 1; x < 6; x++) for (let y = 3; y <= 8; y++)
      if ((x+y) % 2 === 0) drawGrass(ctx, props?.grass, x*T, y*T);
    drawAnimalBob(ctx, props?.dog, 2*T, 4*T, tick, 0);
    drawAnimalBob(ctx, props?.dog, 4*T, 7*T, tick, 3);
    drawAnimalBob(ctx, props?.dog, 3*T, 6*T, tick, 5);
    ENV_SPRITES.bowl(ctx, 4*T, 4*T);
    drawBone(ctx, 2*T, 5*T); drawBone(ctx, 4*T, 8*T);
    drawBush(ctx, props?.bushes, T, 7*T, 0);

    // ── MIDDLE PEN: Chickens & Duck — scattered seeds ──
    for (let x = 7; x < 12; x++) for (let y = 3; y <= 8; y++)
      if ((x+y) % 3 === 0) drawGrass(ctx, props?.grass, x*T, y*T);
    drawAnimalBob(ctx, props?.chicken, 8*T, 4*T, tick, 1);
    drawAnimalBob(ctx, props?.chicken, 10*T, 6*T, tick, 4);
    drawAnimalBob(ctx, props?.chicken, 7*T, 7*T, tick, 2);
    drawAnimalBob(ctx, props?.duck, 9*T, 5*T, tick, 6);
    ENV_SPRITES.bowl(ctx, 10*T, 7*T);
    ctx.fillStyle = "#cc9944";
    for (let i = 0; i < 12; i++) ctx.fillRect(7*T+4+(i*7)%70, 5*T+(i*11)%60, 1, 1);

    // ── RIGHT PEN: Rabbits & Cow — grass, bushes, flowers ──
    for (let x = 13; x <= 18; x++) for (let y = 3; y <= 8; y++)
      if ((x+y) % 2 !== 0) drawGrass(ctx, props?.grass, x*T, y*T);
    drawAnimalBob(ctx, props?.rabbit, 14*T, 4*T, tick, 2);
    drawAnimalBob(ctx, props?.rabbit, 16*T, 7*T, tick, 4);
    drawAnimalBob(ctx, props?.rabbit, 15*T, 5*T, tick, 7);
    drawAnimalBob(ctx, props?.cow, 17*T, 4*T, tick, 9);
    drawBush(ctx, props?.bushes, 15*T, 7*T, 0);
    drawBush(ctx, props?.bushes, 17*T, 5*T, 1);
    drawFlower(ctx, props?.flowers, 14*T, 7*T, 0);

    // ── Mouse hiding near the shop counter ──
    drawAnimalBob(ctx, props?.mouse, 2*T, 10*T, tick, 11);

    // ── Bottom area — shop floor ──
    drawTile(ctx, at, "rug_l", 7*T, 11*T); drawTile(ctx, at, "rug_m", 8*T, 11*T); drawTile(ctx, at, "rug_r", 9*T, 11*T);
    drawTile(ctx, at, "home_plant_big", T, 10*T); drawTile(ctx, at, "home_plant2", 18*T, 10*T);
    drawTile(ctx, at, "home_chair1", 15*T, 10*T); drawTile(ctx, at, "home_chair2", 16*T, 10*T);
    drawFlower(ctx, props?.flowers, T, 11*T, 2); drawFlower(ctx, props?.flowers, 18*T, 11*T, 1);
    // Wall torches
    drawWallTorch(ctx, props?.torchGif, T, T, tick, 0);
    drawWallTorch(ctx, props?.torchGif, 18*T, T, tick, 2);
  },

  // ═══ ROOM 2: TRAIN ROOM — Forest scenery, outdoor feel ═══
  2(ctx, at, tick, th, gears, state, atlasRefData, props) {
    if (!at) return;
    const dungeon = atlasRefData?.dungeon;

    // ── Forest canopy top ──
    for (let x = 0; x < COLS; x++) {
      drawGrass(ctx, props?.grass, x*T, T);
      if (x % 3 === 0) drawSmallTree(ctx, props?.trees, x*T, -T*0.5, x % 5);
    }

    // ── Grass & nature bottom ──
    for (let x = 0; x < COLS; x++) {
      drawGrass(ctx, props?.grass, x*T, 9*T);
      drawGrass(ctx, props?.grass, x*T, 10*T);
      if (x % 3 === 0) drawBush(ctx, props?.bushes, x*T, 9*T, x % 2);
      if (x % 4 === 1) drawRock(ctx, props?.rocks, x*T, 10*T, x % 4);
      if (x % 5 === 0) drawFlower(ctx, props?.flowers, x*T, 10*T, x % 4);
    }

    // ── Cows watching the train ──
    drawAnimalBob(ctx, props?.cow, 4*T, 9*T, tick, 0);
    drawAnimalBob(ctx, props?.cow, 14*T, 9*T, tick, 4);
    drawAnimalBob(ctx, props?.rabbit, 8*T, 10*T, tick, 2);

    // ── Track fencing ──
    for (let x = 3; x <= 13; x++) { drawTile(ctx, at, "fence_h", x*T, 2*T); drawTile(ctx, at, "fence_h", x*T, 8*T); }
    drawTile(ctx, at, "fence_tl", 3*T, 2*T); drawTile(ctx, at, "fence_tr", 13*T, 2*T);
    drawTile(ctx, at, "fence_bl", 3*T, 8*T); drawTile(ctx, at, "fence_br", 13*T, 8*T);

    // ── Animated Train with smoke ──
    const per = 2*(10*T + 5*T); const p = (tick*1.5) % per; let tx, ty;
    if (p < 10*T) { tx = 3*T+p; ty = 2*T-2; }
    else if (p < 15*T) { tx = 13*T; ty = 2*T+(p-10*T)-2; }
    else if (p < 25*T) { tx = 13*T-(p-15*T); ty = 8*T-2; }
    else { tx = 3*T; ty = 8*T-(p-25*T)-2; }
    ctx.fillStyle = "#cc2222"; ctx.fillRect(tx, ty, 12, 8);
    ctx.fillStyle = "#881111"; ctx.fillRect(tx+1, ty+1, 6, 6);
    ctx.fillStyle = "#ffcc00"; ctx.fillRect(tx+8, ty+2, 2, 4);
    // Smoke puffs
    if (tick % 10 < 5) { ctx.fillStyle = "rgba(200,200,200,0.4)"; ctx.beginPath(); ctx.arc(tx+6, ty-4, 3, 0, Math.PI*2); ctx.fill(); }

    // Controls
    drawTile(ctx, at, "ind_panel1", 15*T, 5*T); drawTile(ctx, at, "ind_switch1", 15*T, 6*T);
    drawTile(ctx, at, "ind_control1", 16*T, 5*T); drawTile(ctx, at, "ind_control2", 16*T, 6*T);

    // Dungeon torches near controls
    drawWallTorch(ctx, props?.torchGif, 2*T, 4*T, tick, 0);
    drawWallTorch(ctx, props?.torchGif, 17*T, 4*T, tick, 1);
  },

  // ═══ ROOM 3: MIRROR HALLWAY — Grand, symmetrical, royal ═══
  3(ctx, at, tick, th, gears, state, atlasRefData, props) {
    if (!at) return;
    const dungeon = atlasRefData?.dungeon;

    // ── Doors across the top ──
    const doorPositions = [2, 4, 8, 11, 14];
    const doorTypes = ["door_closed","door_b_closed","door_closed","door_b_closed","door_closed"];
    doorPositions.forEach((dx, i) => {
      drawTile(ctx, at, doorTypes[i], dx*T, T);
      ctx.fillStyle = "#FFD700"; const hx = dx*T, hy = T;
      if (i===0) { ctx.beginPath(); ctx.arc(hx+12,hy+8,2,0,Math.PI*2); ctx.fill(); }
      if (i===1) ctx.fillRect(hx+10,hy+5,2,6);
      if (i===2) ctx.fillRect(hx+4,hy+7,8,2);
      if (i===3) { ctx.fillRect(hx+5,hy+8,6,1); ctx.fillRect(hx+10,hy+6,2,4); }
      if (i===4) ctx.fillRect(hx+3,hy+4,1,8);
    });

    // ── Symmetrical pillars with torches ──
    [3, 6, 13, 16].forEach(x => {
      drawTile(ctx, at, "pillar_top", x*T, 3*T);
      drawTile(ctx, at, "pillar_mid", x*T, 4*T);
      drawTile(ctx, at, "pillar_base", x*T, 5*T);
      drawWallTorch(ctx, props?.torchGif, x*T, 2*T, tick, 2, 28);
    });

    // ── Grand red carpet — skip env object and fix positions ──
    const skipPositions = [[9,6],[9,9]]; // mirror, toolbox
    for (let y = 2; y <= 12; y++) {
      for (let col = 8; col <= 11; col++) {
        if (skipPositions.some(([sx,sy]) => sx === col && sy === y)) continue;
        const tileName = col === 8 ? "rug_l" : col === 11 ? "rug_r" : "rug_m";
        drawTile(ctx, at, tileName, col*T, y*T);
      }
    }

    // ── Mirrors on both side walls ──
    for (let y = 3; y <= 11; y += 2) {
      ctx.fillStyle = "#445566"; ctx.fillRect(T+2, y*T+1, T-4, T-2);
      ctx.fillStyle = "#88aacc"; ctx.fillRect(T+3, y*T+2, T-6, T-4);
      ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.fillRect(T+4, y*T+3, 3, 5);
      ctx.fillStyle = "#445566"; ctx.fillRect(18*T+2, y*T+1, T-4, T-2);
      ctx.fillStyle = "#88aacc"; ctx.fillRect(18*T+3, y*T+2, T-6, T-4);
      ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.fillRect(18*T+4, y*T+3, 3, 5);
    }

    // ── Flower pedestals along carpet edges ──
    for (let y = 4; y <= 10; y += 2) {
      drawFlower(ctx, props?.flowers, 7*T, y*T, 0);
      drawFlower(ctx, props?.flowers, 12*T, y*T, 2);
    }

    // ── Gold decorations ──
    drawTile(ctx, at, "gold_deco1", 16*T, T); drawTile(ctx, at, "gold_deco2", 17*T, T);
    drawTile(ctx, at, "gold_deco1", T, 12*T); drawTile(ctx, at, "gold_deco2", 18*T, 12*T);

    // ── Guard dogs ──
    drawAnimalBob(ctx, props?.dog, 2*T, 9*T, tick, 0, T*1.2);
    drawAnimalBob(ctx, props?.dog, 17*T, 9*T, tick, 4, T*1.2);
  },

  // ═══ ROOM 4: LIBRARY — Overgrown, forgotten, nature reclaiming ═══
  4(ctx, at, tick, th, gears, state, atlasRefData, props) {
    if (!at) return;
    const dungeon = atlasRefData?.dungeon;

    // ── Dense bookshelves top and bottom ──
    for (let x = 0; x < 20; x += 2) {
      if (x !== 8 && x !== 10) {
        drawTile(ctx, at, "bookshelf_t", x*T, 0);
        drawTile(ctx, at, "bookshelf_m", x*T, T);
        drawTile(ctx, at, "bookshelf_b", x*T, 2*T);
      }
      if (x !== 16 && x !== 18 && x !== 2) {
        drawTile(ctx, at, x%4===0?"bookshelf_t":"bookshelf2_t", x*T, 9*T);
        drawTile(ctx, at, x%4===0?"bookshelf_m":"bookshelf2_m", x*T, 10*T);
        drawTile(ctx, at, "bookshelf_b", x*T, 11*T);
      }
    }

    // ── Scattered books on floor ──
    [[2,3],[4,3],[6,3],[13,3],[15,3],[17,3],[5,11],[8,11],[12,11]].forEach(([x,y]) => ENV_SPRITES.book(ctx, x*T, y*T));

    // ── Cobwebs in corners ──
    drawCobweb(ctx, 0, 0); drawCobweb(ctx, 19*T, 0);
    drawCobweb(ctx, 0, 11*T); drawCobweb(ctx, 19*T, 11*T);

    // ── Reading desks with candles ──
    drawTile(ctx, at, "home_table_l", 4*T, 10*T); drawTile(ctx, at, "home_table_r", 5*T, 10*T);
    ENV_SPRITES.candle(ctx, 4*T, 10*T, tick); ENV_SPRITES.magnifier(ctx, 5*T, 10*T);

    // ── Overgrowth — grass, mushrooms, flowers, bushes ──
    drawBush(ctx, props?.bushes, 5*T, 9*T, 0);
    drawBush(ctx, props?.bushes, 14*T, 9*T, 2);
    drawGrass(ctx, props?.grass, 6*T, 9*T);
    drawGrass(ctx, props?.grass, 13*T, 9*T);
    drawGrass(ctx, props?.grass, 9*T, 11*T);
    drawFlower(ctx, props?.flowers, 7*T, 9*T, 0);
    drawFlower(ctx, props?.flowers, 12*T, 9*T, 2);
    drawMushroom(ctx, props?.mushrooms, 3*T, 11*T, 0);
    drawMushroom(ctx, props?.mushrooms, 16*T, 11*T, 1);

    // ── Small tree growing through the floor ──
    drawSmallTree(ctx, props?.trees, 8*T, 9*T, 9);

    // ── Mice in the library ──
    drawAnimalBob(ctx, props?.mouse, 3*T, 9*T, tick, 0);
    drawAnimalBob(ctx, props?.mouse, 16*T, 9*T, tick, 3);

    // ── Skull on floor — previous trap victim ──
    drawSkull(ctx, 15*T, 12*T);

    // ── Dungeon torches ──
    drawWallTorch(ctx, props?.torchGif, T, 6*T, tick, 3, 30);
    drawWallTorch(ctx, props?.torchGif, 18*T, 6*T, tick, 4, 30);
  },

  // ═══ ROOM 5: MUSIC ROOM — Concert hall with animal audience ═══
  5(ctx, at, tick, th, gears, state, atlasRefData, props) {
    if (!at) return;
    const dungeon = atlasRefData?.dungeon;

    // ── Grand piano / organ construction ──
    ctx.fillStyle = "#111"; ctx.fillRect(11*T, 2*T, 5*T, 3*T);
    ctx.fillStyle = "#eee"; for (let i = 0; i < 15; i++) ctx.fillRect(11*T+2+i*5, 5*T-6, 4, 6);
    ctx.fillStyle = "#222"; for (let i = 0; i < 14; i++) if (i!==2&&i!==6&&i!==9&&i!==13) ctx.fillRect(11*T+4+i*5, 5*T-8, 3, 5);
    ENV_SPRITES.stand(ctx, 10*T, 4*T);

    // ── Floating music notes ──
    ctx.fillStyle = hexRgba(th.accent, 0.6+Math.sin(tick*0.1)*0.2);
    ctx.font = "12px sans-serif";
    const ny = 1.5*T + Math.sin(tick*0.08)*4;
    ctx.fillText("\u266a", 12*T+10+Math.sin(tick*0.05)*5, ny);
    ctx.fillText("\u266b", 14*T+Math.cos(tick*0.07)*5, ny+4);
    ctx.fillText("\u266a", 16*T+Math.sin(tick*0.09)*3, ny+8);

    // ── Audience seating rows ──
    for (let y = 6; y <= 10; y += 2)
      for (let x = 2; x <= 16; x += 2) drawTile(ctx, at, "bench_m", x*T, y*T);

    // ── Animal audience! ──
    drawAnimalBob(ctx, props?.dog, 2*T, 5*T, tick, 0);
    drawAnimalBob(ctx, props?.rabbit, 6*T, 5*T, tick, 2);
    drawAnimalBob(ctx, props?.cow, 10*T, 7*T, tick, 4);
    drawAnimalBob(ctx, props?.chicken, 14*T, 7*T, tick, 6);
    drawAnimalBob(ctx, props?.duck, 4*T, 9*T, tick, 8);
    drawAnimalBob(ctx, props?.mouse, 8*T, 9*T, tick, 10);
    drawAnimalBob(ctx, props?.dog, 16*T, 9*T, tick, 12);

    // ── Elegant flowers at entrance ──
    drawFlower(ctx, props?.flowers, T, T, 2); drawFlower(ctx, props?.flowers, 18*T, T, 3);
    drawFlower(ctx, props?.flowers, T, 2*T, 0); drawFlower(ctx, props?.flowers, 18*T, 2*T, 1);

    // ── Ghosts orbiting the piano ──
    if (state?.foundP) {
      const pianoCx = 13.5*T, pianoCy = 3.5*T;
      const ghosts = [
        { speed: 0.012, radius: 4*T, phase: 0, fadeSpeed: 0.008 },
        { speed: -0.009, radius: 5.5*T, phase: Math.PI, fadeSpeed: 0.006 },
      ];
      ghosts.forEach((g, gi) => {
        const angle = tick * g.speed + g.phase;
        const gx = pianoCx + Math.cos(angle) * g.radius;
        const gy = pianoCy + Math.sin(angle) * g.radius * 0.6; // oval orbit
        // Fade in and out slowly
        const fadePhase = (tick * g.fadeSpeed + gi * 3) % (Math.PI * 2);
        const alpha = Math.max(0, Math.sin(fadePhase)) * 0.65;
        if (alpha > 0.05) {
          ctx.save(); ctx.globalAlpha = alpha;
          // Ghost body — wispy and translucent
          ctx.fillStyle = "#aaccff";
          ctx.beginPath(); ctx.ellipse(gx, gy, 7, 10, 0, 0, Math.PI*2); ctx.fill();
          // Inner glow
          ctx.fillStyle = "rgba(200,220,255,0.4)";
          ctx.beginPath(); ctx.ellipse(gx, gy, 4, 6, 0, 0, Math.PI*2); ctx.fill();
          // Eyes
          ctx.fillStyle = "#112244";
          ctx.fillRect(gx-3, gy-3, 2, 2); ctx.fillRect(gx+1, gy-3, 2, 2);
          // Mouth
          ctx.fillRect(gx-1, gy+1, 2, 1);
          // Wispy tail
          ctx.fillStyle = "rgba(170,200,255,0.25)";
          const tailWave = Math.sin(tick * 0.1 + gi) * 3;
          ctx.beginPath(); ctx.ellipse(gx + tailWave, gy + 12, 5, 4, 0, 0, Math.PI); ctx.fill();
          ctx.beginPath(); ctx.ellipse(gx - tailWave*0.5, gy + 16, 3, 2, 0, 0, Math.PI); ctx.fill();
          // Eerie glow around ghost
          const gg = ctx.createRadialGradient(gx, gy, 3, gx, gy, 20);
          gg.addColorStop(0, "rgba(150,180,255,0.2)");
          gg.addColorStop(1, "rgba(150,180,255,0)");
          ctx.fillStyle = gg;
          ctx.beginPath(); ctx.arc(gx, gy, 20, 0, Math.PI*2); ctx.fill();
          ctx.restore();
        }
      });
    }

    // ── Dungeon torches ──
    drawWallTorch(ctx, props?.torchGif, 2*T, 2*T, tick, 0);
    drawWallTorch(ctx, props?.torchGif, 17*T, 2*T, tick, 1);
    drawWallTorch(ctx, props?.torchGif, T, 8*T, tick, 2, 25);
    drawWallTorch(ctx, props?.torchGif, 18*T, 8*T, tick, 3, 25);
  },

  // ═══ ROOM 6: CLOCK TOWER — Gears, pendulum, industrial decay ═══
  6(ctx, at, tick, th, gears, state, atlasRefData, props) {
    if (!at) return;
    const dungeon = atlasRefData?.dungeon;

    // ── Background ghost gears ──
    if (gears?.bronze && gears?.silver) {
      const b = gears.bronze[0], s = gears.silver[0];
      ctx.save(); ctx.globalAlpha = 0.12;
      ctx.translate(6*T, 7*T); ctx.rotate(tick*0.008); ctx.drawImage(b, -80, -80, 160, 160); ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.12;
      ctx.translate(14*T, 5*T); ctx.rotate(-tick*0.012); ctx.drawImage(s, -60, -60, 120, 120); ctx.restore();
    }

    // ── Swinging pendulum ──
    ctx.save();
    ctx.translate(10*T, 0); ctx.rotate(Math.sin(tick*0.03)*0.35);
    ctx.fillStyle = "#444"; ctx.fillRect(-1, 0, 3, 7*T);
    ctx.fillStyle = "#B8860B"; ctx.beginPath(); ctx.arc(0, 7*T, 14, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#DAA520"; ctx.beginPath(); ctx.arc(0, 7*T, 8, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    // Pipes across top
    for (let x = 2; x <= 17; x++) drawTile(ctx, at, "ind_pipe_h", x*T, 0);
    drawTile(ctx, at, "ind_vent", 5*T, 0); drawTile(ctx, at, "ind_vent", 14*T, 0);

    // ── Full steam pipeline along right wall ──
    for (let y = 1; y <= 11; y++) drawTile(ctx, at, "ind_pipe_v", 17*T, y*T);
    // Connectors and vents
    drawTile(ctx, at, "ind_pipe_corner", 17*T, T);
    drawTile(ctx, at, "ind_vent", 17*T, 4*T);
    drawTile(ctx, at, "ind_vent", 17*T, 8*T);
    // Horizontal branches off the main pipe
    drawTile(ctx, at, "ind_pipe_h", 15*T, 4*T); drawTile(ctx, at, "ind_pipe_h", 16*T, 4*T);
    drawTile(ctx, at, "ind_pipe_t", 15*T, 4*T);
    drawTile(ctx, at, "ind_pipe_h", 15*T, 8*T); drawTile(ctx, at, "ind_pipe_h", 16*T, 8*T);
    drawTile(ctx, at, "ind_pipe_t", 15*T, 8*T);
    // Steam hissing from vents
    for (let vi = 0; vi < 3; vi++) {
      const vy = [4, 8, 11][vi];
      const steamPhase = (tick * 0.1 + vi * 2) % 4;
      if (steamPhase < 2) {
        ctx.save(); ctx.globalAlpha = 0.3 - steamPhase * 0.1;
        ctx.fillStyle = "rgba(200,210,220,0.5)";
        ctx.beginPath();
        ctx.arc(16.5*T + Math.sin(tick*0.08+vi)*3, vy*T - steamPhase*6, 3 + steamPhase*2, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(16*T + Math.cos(tick*0.1+vi)*2, vy*T - steamPhase*10 - 4, 2 + steamPhase, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      }
    }

    // (Foreground gears drawn in PASS 1d overlay)
    drawTile(ctx, at, "ind_switch1", 8*T, 5*T); drawTile(ctx, at, "ind_panel1", 9*T, 5*T);

    // ── Lava pit ──
    drawLavaPool(ctx, props?.lava, T, 8*T, 3*T, 2*T, tick);

    // ── Scattered tools & debris ──
    ENV_SPRITES.wrench(ctx, 3*T, 9*T); ENV_SPRITES.toolbox(ctx, 16*T, 8*T);
    ENV_SPRITES.wrench(ctx, 15*T, 10*T);
    for (let x = 1; x <= 3; x++) drawRock(ctx, props?.rocks, x*T, 10*T, x % 4);
    drawRock(ctx, props?.rocks, 18*T, 11*T, 1);

    // ── Skeletons — crushed by gears ──
    drawSkeleton(ctx, 17*T, 10*T, tick);
    drawSkeleton(ctx, 2*T, 4*T, tick);
    drawBone(ctx, 3*T, 5*T);

    // ── Pigeons (chickens) inside the tower ──
    drawAnimalBob(ctx, props?.chicken, 3*T, 3*T, tick, 0);
    drawAnimalBob(ctx, props?.chicken, 16*T, 2*T, tick, 2);

    // ── Dungeon torches ──
    drawWallTorch(ctx, props?.torchGif, T, T, tick, 4);
    drawWallTorch(ctx, props?.torchGif, 18*T, T, tick, 0);
  },

  // ═══ ROOM 7: EVIDENCE WALL — Detective's chaotic office ═══
  7(ctx, at, tick, th, gears, state, atlasRefData, props) {
    if (!at) return;
    const dungeon = atlasRefData?.dungeon;

    // ── Giant string conspiracy board with posters ──
    ctx.strokeStyle = "#cc3333"; ctx.lineWidth = 1;
    const pts = []; for (let x = 2; x < 18; x += 2) pts.push([x, (x%4===0)?1:2]);
    for (let i = 0; i < pts.length-1; i++) {
      ctx.beginPath(); ctx.moveTo(pts[i][0]*T+8, pts[i][1]*T+8);
      ctx.lineTo(pts[i+1][0]*T+8, pts[i+1][1]*T+8); ctx.stroke();
      if (i%2===0 && i+2<pts.length) {
        ctx.beginPath(); ctx.moveTo(pts[i][0]*T+8,pts[i][1]*T+8);
        ctx.lineTo(pts[i+2][0]*T+8,pts[i+2][1]*T+12); ctx.stroke();
      }
    }
    pts.forEach(([x,y]) => {
      ctx.fillStyle = "#ff4444"; ctx.beginPath(); ctx.arc(x*T+8, y*T+4, 3, 0, Math.PI*2); ctx.fill();
      ENV_SPRITES.poster(ctx, x*T, y*T);
    });

    // ── Cluttered desks with items ──
    drawTile(ctx, at, "home_table_l", 4*T, 6*T); drawTile(ctx, at, "home_table_r", 5*T, 6*T);
    ENV_SPRITES.clipboard(ctx, 4*T, 6*T); ENV_SPRITES.mug(ctx, 5*T, 6*T); ENV_SPRITES.book(ctx, 4*T, 5*T);

    drawTile(ctx, at, "home_table_l", 13*T, 8*T); drawTile(ctx, at, "home_table_r", 14*T, 8*T);
    ENV_SPRITES.label(ctx, 13*T, 8*T); ENV_SPRITES.magnifier(ctx, 14*T, 8*T);
    ENV_SPRITES.candle(ctx, 13*T, 7*T, tick);

    // ── Rows of file cabinets ──
    for (let x = 2; x <= 8; x += 2) drawTile(ctx, at, "cabinet1", x*T, 10*T);
    for (let x = 12; x <= 18; x += 2) drawTile(ctx, at, "cabinet1", x*T, 3*T);

    // ── Crates & barrels ──
    drawTile(ctx, at, "crate1", T, 10*T); drawTile(ctx, at, "crate2", T, 11*T);
    drawTile(ctx, at, "barrel1", 18*T, 10*T); drawTile(ctx, at, "pp_barrel", 18*T, 11*T);
    drawTile(ctx, at, "plank1", 14*T, 10*T); drawTile(ctx, at, "plank2", 15*T, 10*T);

    // ── The "Police Dog" and "Detective Cow" ──
    drawAnimalBob(ctx, props?.dog, 2*T, 8*T, tick, 0);
    drawAnimalBob(ctx, props?.cow, 16*T, 9*T, tick, 4);

    // ── Dungeon torches ──
    drawWallTorch(ctx, props?.torchGif, T, T, tick, 1);
    drawWallTorch(ctx, props?.torchGif, 18*T, T, tick, 2);
    drawWallTorch(ctx, props?.torchGif, T, 6*T, tick, 3, 25);
  },

  // ═══ ROOM 8: FURNACE — Lava pits, scorched, hellish ═══
  8(ctx, at, tick, th, gears, state, atlasRefData, props) {
    if (!at) return;
    const dungeon = atlasRefData?.dungeon;
    const solved = state?.solved;

    // ── Furnace machine ──
    drawTile(ctx, at, "ind_bigmachine_tl", 6*T, T); drawTile(ctx, at, "ind_bigmachine_tr", 7*T, T);
    drawTile(ctx, at, "ind_machine1", 8*T, T); drawTile(ctx, at, "ind_machine3", 9*T, T);
    drawTile(ctx, at, "ind_bigmachine_bl", 6*T, 2*T); drawTile(ctx, at, "ind_bigmachine_br", 7*T, 2*T);
    drawTile(ctx, at, "ind_machine4", 8*T, 2*T); drawTile(ctx, at, "ind_machine4", 9*T, 2*T);
    drawTile(ctx, at, "ind_panel1", 10*T, T); drawTile(ctx, at, "ind_panel2", 10*T, 2*T);
    for (let x = 1; x <= 18; x++) drawTile(ctx, at, "ind_pipe_h", x*T, 0);
    drawTile(ctx, at, "ind_vent", 4*T, 0); drawTile(ctx, at, "ind_vent", 15*T, 0);

    // ── Lava pits ──
    ctx.fillStyle = "rgba(255, 60, 0, 0.35)";
    ctx.beginPath(); ctx.ellipse(3*T, 8*T, 2*T, 1.5*T, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(16*T, 6*T, 1.5*T, 2*T, 0, 0, Math.PI*2); ctx.fill();

    // ── Lava bubbles ──
    for (let i = 0; i < 8; i++) {
      if ((tick+i*5)%20 < 10) {
        ctx.fillStyle = "#ffaa00";
        ctx.fillRect(2*T+Math.random()*2*T, 7.5*T+Math.random()*T, 3, 3);
        ctx.fillRect(15.5*T+Math.random()*T, 5*T+Math.random()*2*T, 3, 3);
      }
    }

    // ── Scorched rocks ──
    for (let x = 1; x <= 5; x++) drawRock(ctx, props?.rocks, x*T, 10*T, x%4);
    for (let x = 14; x <= 18; x++) drawRock(ctx, props?.rocks, x*T, 9*T, (x+1)%4);

    // ── Skeletons & bones — casualties of the cold ──
    drawSkeleton(ctx, 4*T, 10*T, tick);
    drawSkeleton(ctx, 15*T, 8*T, tick);
    drawSkull(ctx, 2*T, 6*T); drawBone(ctx, 16*T, 4*T);
    drawBone(ctx, 3*T, 11*T);

    if (solved) {
      // ── Fire INSIDE furnace ──
      const fireCx = 7.5*T, fireCy = 1.8*T;
      const fireBob = Math.sin(tick*0.4)*1.5;
      ctx.fillStyle = "#ff5500"; ctx.beginPath(); ctx.ellipse(fireCx, fireCy-fireBob, 8, 5, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#ffcc00"; ctx.beginPath(); ctx.ellipse(fireCx, fireCy+1-fireBob*0.5, 5, 3, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#fff8e0"; ctx.beginPath(); ctx.ellipse(fireCx, fireCy+2-fireBob*0.3, 2, 1.5, 0, 0, Math.PI*2); ctx.fill();

      ctx.save(); ctx.globalCompositeOperation = "lighter";
      const glow = ctx.createRadialGradient(fireCx, fireCy, 3, fireCx, fireCy, 50);
      glow.addColorStop(0, "rgba(255, 100, 20, 0.6)"); glow.addColorStop(1, "rgba(255, 40, 0, 0)");
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(fireCx, fireCy, 50, 0, Math.PI*2); ctx.fill();
      ctx.restore();

      ctx.fillStyle = "#50fa7b"; ctx.font = "5px monospace";
      ctx.fillText("OK", 10*T+3, T+8); ctx.fillText("RUN", 10*T+2, 2*T+8);

      // Torches light up
      drawWallTorch(ctx, props?.torchGif, 2*T, T, tick, 4);
      drawWallTorch(ctx, props?.torchGif, 5*T, T, tick, 0);
      drawWallTorch(ctx, props?.torchGif, 12*T, T, tick, 1);
      drawWallTorch(ctx, props?.torchGif, 17*T, T, tick, 2);
    } else {
      ctx.fillStyle = "#ff3333"; ctx.font = "5px monospace";
      ctx.fillText("ERR", 10*T+2, T+8); ctx.fillText("0x4F", 10*T+1, 2*T+8);

      // ── Heavy frost/ice effects ──
      // Frost particles (more dense)
      ctx.fillStyle = "rgba(180,220,255,0.5)";
      for (let i = 0; i < 40; i++) {
        const fx = (Math.sin(tick*0.03+i*2)*0.5+0.5)*GW;
        const fy = (Math.cos(tick*0.02+i*1.5)*0.5+0.5)*GH;
        ctx.fillRect(fx, fy, 1.5, 1.5);
      }
      // Falling snow/ice crystals
      for (let i = 0; i < 15; i++) {
        const sx = (i * 47 + tick * 0.3) % GW;
        const sy = (i * 31 + tick * 0.8) % GH;
        ctx.fillStyle = `rgba(200,230,255,${0.3 + Math.sin(tick*0.05+i)*0.15})`;
        ctx.fillRect(sx, sy, 2, 2);
      }
      // Ice patches on floor
      ctx.fillStyle = "rgba(150,200,240,0.12)";
      [[3,6,4,2],[10,8,3,2],[14,10,4,2],[2,11,3,1]].forEach(([x,y,w,h]) => {
        ctx.fillRect(x*T, y*T, w*T, h*T);
      });
      // Frost creeping on walls (top/bottom borders)
      ctx.fillStyle = "rgba(180,220,255,0.15)";
      for (let x = 1; x < 19; x++) {
        const h = 3 + Math.sin(x * 1.5) * 2;
        ctx.fillRect(x*T, T, T, h);
        ctx.fillRect(x*T, 12*T - h, T, h);
      }
      // Frost on pipes
      ctx.fillStyle = "rgba(200,230,255,0.2)";
      for (let x = 1; x <= 18; x += 2) {
        ctx.fillRect(x*T+2, 1, T-4, 3);
      }
      // Icy breath effect near player
      const px = state?.pos?.x || 0, py = state?.pos?.y || 0;
      if (tick % 30 < 15) {
        const facing = state?.facing;
        let bx = px*T+8, by = py*T;
        if (facing === "up") by -= 6;
        else if (facing === "down") by += 16;
        else if (facing === "left") bx -= 8;
        else bx += 16;
        ctx.fillStyle = `rgba(200,230,255,${0.15 + Math.sin(tick*0.2)*0.1})`;
        ctx.beginPath(); ctx.arc(bx, by, 3 + (tick%15)*0.3, 0, Math.PI*2); ctx.fill();
      }
      // Blue cold overlay on entire room
      ctx.fillStyle = "rgba(100,150,220,0.06)";
      ctx.fillRect(0, 0, GW, GH);
    }

    // ── Heat-loving mice ──
    drawAnimalBob(ctx, props?.mouse, 2*T, 11*T, tick, 0);
    drawAnimalBob(ctx, props?.mouse, 17*T, 10*T, tick, 2);
  },

  // ═══ ROOM 9: FINAL MACHINE — Nature fully reclaims ═══
  9(ctx, at, tick, th, gears, state, atlasRefData, props) {
    if (!at) return;
    const dungeon = atlasRefData?.dungeon;

    // ── Machine wall ──
    for (let x = 4; x <= 15; x++) {
      const row1 = ["ind_machine1","ind_panel1","ind_machine3","ind_panel2","ind_machine1","ind_machine4","ind_panel1","ind_machine3","ind_machine1","ind_panel2","ind_machine4","ind_machine1"];
      const row2 = ["ind_machine4","ind_control1","ind_machine1","ind_control2","ind_machine3","ind_control3","ind_machine4","ind_control4","ind_machine1","ind_control1","ind_machine3","ind_control2"];
      const row3 = ["ind_switch1","ind_panel2","ind_switch2","ind_panel1","ind_switch1","ind_panel2","ind_switch2","ind_panel1","ind_switch1","ind_panel2","ind_switch2","ind_panel1"];
      drawTile(ctx, at, row1[x-4], x*T, T); drawTile(ctx, at, row2[x-4], x*T, 2*T); drawTile(ctx, at, row3[x-4], x*T, 3*T);
    }

    // ── FULL OVERGROWTH — grass, flowers, mushrooms everywhere ──
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      if (x < 4 || x > 15 || y > 4) {
        if ((x+y)%2===0) drawGrass(ctx, props?.grass, x*T, y*T);
        if ((x+y)%5===0) drawFlower(ctx, props?.flowers, x*T, y*T, x%4);
        if ((x+y)%7===0) drawMushroom(ctx, props?.mushrooms, x*T, y*T, y%2);
      }
    }

    // ── Giant trees flanking ──
    drawTree(ctx, props?.trees, T, -T, 1, 4);
    drawTree(ctx, props?.trees, 16*T, -T, 2, 4);
    drawSmallTree(ctx, props?.trees, 2*T, 3*T, 3);
    drawSmallTree(ctx, props?.trees, 17*T, 3*T, 4);

    // ── Lava fissure — the house's dark secret ──
    drawLavaPool(ctx, props?.lava, 6*T, 7*T, 8*T, 3*T, tick);

    // ── The Animal Council ──
    drawAnimalBob(ctx, props?.dog, 4*T, 8*T, tick, 1);
    drawAnimalBob(ctx, props?.cow, 14*T, 8*T, tick, 2);
    drawAnimalBob(ctx, props?.rabbit, 5*T, 6*T, tick, 4);
    drawAnimalBob(ctx, props?.chicken, 13*T, 6*T, tick, 5);
    drawAnimalBob(ctx, props?.duck, 9*T, 11*T, tick, 6);
    drawAnimalBob(ctx, props?.mouse, 10*T, 5*T, tick, 7);

    // ── Magical spore particles ──
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    for (let i = 0; i < 15; i++) {
      const px = 2*T + (Math.sin(tick*0.02+i)*8*T + 8*T);
      const py = 5*T + (Math.cos(tick*0.03+i)*4*T);
      ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI*2); ctx.fill();
    }

    // ── Machine status lights ──
    for (let x = 5; x <= 14; x += 2) {
      const on = Math.sin(tick*0.2+x) > 0;
      ctx.fillStyle = on ? "#ff3333" : "#331111"; ctx.beginPath(); ctx.arc(x*T+4, T-2, 2, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = on ? "#113311" : "#33ff33"; ctx.beginPath(); ctx.arc(x*T+12, T-2, 2, 0, Math.PI*2); ctx.fill();
    }
    if (!state?.solved && tick%60 < 5) {
      ctx.fillStyle = "#ffcc00";
      for (let s = 0; s < 4; s++) ctx.fillRect(4*T+Math.random()*12*T, T+Math.random()*3*T, 2, 2);
    }

    // ── Skeleton slumped against machine ──
    drawSkeleton(ctx, 3*T, 4*T, tick);
    drawBone(ctx, 2*T, 5*T);

    // ── Dungeon torches wrapped in vines ──
    drawWallTorch(ctx, props?.torchGif, 2*T, T, tick, 3);
    drawWallTorch(ctx, props?.torchGif, 17*T, T, tick, 4);
  },
};



// ═══════════════════════════════════════════════════════════════
// CONTEXTUAL SPRITES & VISUAL STORYTELLING
// ═══════════════════════════════════════════════════════════════

function drawHint(ctx, px, py, tick, color) {
  const bob = Math.sin(tick * 0.15) * 2;
  ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 5;
  ctx.beginPath(); ctx.moveTo(px + 8, py - 4 + bob); ctx.lineTo(px + 5, py - 8 + bob); ctx.lineTo(px + 11, py - 8 + bob); ctx.fill();
  ctx.shadowBlur = 0;
}

function drawContextualProblem(ctx, atlasData, room, px, py, state, tick, th) {
  const at = atlasData?.main || atlasData; 
  const dungeon = atlasData?.dungeon;
  const solved = state.solved;
  const triggered = state.foundP; // DEFINED THIS SO IT NO LONGER CRASHES

  switch(room) {
    case 0:
      if (dungeon) {
        const open = solved || state.puzzleCleared;
        drawFromSheet(ctx, dungeon, open ? "dungeon_door_open" : "dungeon_door_closed", px, py - T);
        if (open) {
          // Green glow around open elevator
          ctx.fillStyle = "rgba(80,250,123,0.15)"; ctx.fillRect(px-2, py-T, T+4, T*2+4);
        }
      }
      break;
    
    case 1:
      drawTile(ctx, at, "home_pot1", px, py);
      if (solved) { 
        ctx.fillStyle="#fff"; ctx.fillRect(px+4,py+8,8,4); ctx.fillStyle="#000"; ctx.fillRect(px+5,py+9,6,1);
      } else { 
        ctx.fillStyle="#8B4513"; ctx.beginPath(); ctx.arc(px+2, py+12, 3, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle="#556B2F"; ctx.beginPath(); ctx.arc(px+12, py+10, 2, 0, Math.PI*2); ctx.fill();
      }
      break;
    
    case 2:
      ctx.save(); ctx.translate(px+8, py+8);
      if (!solved) {
        ctx.rotate(Math.PI/6);
        if (triggered && tick % 20 < 10) {
           ctx.fillStyle = "#ffcc00"; ctx.fillRect((Math.random()-0.5)*10, (Math.random()-0.5)*10, 2, 2);
        }
      }
      ctx.fillStyle = "#cc2222"; ctx.fillRect(-6, -4, 12, 8); ctx.fillStyle = "#ffcc00"; ctx.fillRect(4, -2, 2, 4);
      ctx.restore();
      break;

    case 3: {
      const doors =["door_closed", "door_b_closed", "dung_door_t", "door_open", "fence_door"];
      drawTile(ctx, at, solved ? "door_closed" : doors[(px/T)%5] || "door_closed", px, py);
      break;
    }

    case 4:
      if (state.puzzleCleared || solved) {
        // Cleared: tiles are safe, just show subtle floor marking
        ctx.fillStyle = "rgba(80,250,123,0.08)"; ctx.fillRect(px, py, T, T);
      } else if (!state.foundF) {
        const playerOnTrap = Math.abs(state.pos.x*T - px) < T/2 && Math.abs(state.pos.y*T - py) < T/2;
        if (playerOnTrap || triggered) {
          ctx.strokeStyle = "#000"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px+6, py+8); ctx.lineTo(px+12, py+16); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(px+6, py+8); ctx.lineTo(px+16, py+4); ctx.stroke();
          ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(px+4, py+6, 5, 5);
        }
      }
      break;

    case 5:
      drawTile(ctx, at, "pp_shelf", px, py);
      if (solved) { 
        ctx.fillStyle="#fff"; ctx.fillRect(px+3, py+2, 10, 8); ctx.fillStyle="#111"; ctx.fillRect(px+5, py+4, 6, 1);
        ctx.fillStyle="#ff79c6"; ctx.font="10px sans-serif"; ctx.fillText("♪", px+2, py-4+Math.sin(tick*0.1)*3); 
      }
      break;

    case 6:
      drawTile(ctx, at, solved ? "ind_machine3" : "ind_switch2", px, py);
      if (solved && tick % 10 < 5) { ctx.fillStyle="#50fa7b"; ctx.fillRect(px+12, py+12, 2, 2); }
      break;

    case 7:
      if (solved) drawTile(ctx, at, "cabinet1", px, py);
      else {
        ctx.fillStyle="#eee"; ctx.fillRect(px+2,py+4,6,6); ctx.fillStyle="#ccc"; ctx.fillRect(px+8,py+8,6,6);
        ctx.fillStyle="#aaa"; ctx.fillRect(px+1,py+10,5,4); ctx.fillRect(px+10,py+2,4,5);
      }
      break;

    case 8:
      if (px === 9*T && py === 2*T) {
        ctx.fillStyle = solved ? "#50fa7b" : "#ff5555"; ctx.font="5px monospace"; ctx.fillText(solved?"OK":"ERR", px+2, py+8);
      }
      break;

    case 9:
      drawTile(ctx, at, "ind_control1", px, py);
      if (solved) { 
        if (py === 3*T) { ctx.fillStyle="#f1fa8c"; ctx.fillRect(px,py+14,T,2); } 
      } else if (triggered && tick % 15 < 5 && Math.random() > 0.5) {
        ctx.fillStyle = "#ffcc00"; ctx.fillRect(px+4+(Math.random()*8), py+4+(Math.random()*8), 2, 2);
      }
      break;

    default:
      ctx.fillStyle = solved ? hexRgba(th.accent, 0.2) : hexRgba(th.prob, 0.2); ctx.fillRect(px,py,T,T);
  }
  
  if (!solved && !(room === 4 && state.puzzleCleared) && room !== 8) drawHint(ctx, px, py, tick, th.prob);
}

function drawContextualFix(ctx, atlasData, room, px, py, tick, th, state) {
  const dungeon = atlasData?.dungeon;
  const home = atlasData?.home;
  const at = atlasData?.main || atlasData;
  
  switch(room) {
    case 0: drawTile(ctx, at, "ind_panel2", px, py); break;
    case 1: 
      if (home) drawFromSheet(ctx, home, "home_printer", px, py); else drawTile(ctx, at, "home_stove_t", px, py);
      break;
    case 2: drawTile(ctx, at, "ind_switch1", px, py); break;
    case 3: ENV_SPRITES.toolbox(ctx, px, py); break;
    case 4:
      if (dungeon) {
        drawFromSheet(ctx, dungeon, "potion_blue", px, py);
        const bob = Math.sin(tick * 0.1) * 2; ctx.fillStyle = "rgba(189, 147, 249, 0.6)";
        ctx.beginPath(); ctx.arc(px+8, py+8+bob, 6, 0, Math.PI*2); ctx.fill();
      }
      break;
    case 5:
      if (dungeon) drawFromSheet(ctx, dungeon, "dungeon_chest_closed", px, py);
      break;
    case 6: drawTile(ctx, at, "ind_machine3", px, py); break;
    case 7: drawTile(ctx, at, "cabinet1", px, py); break;
    case 8: ENV_SPRITES.book(ctx, px, py); break;
    case 9: ENV_SPRITES.book(ctx, px, py); break;
    default: ctx.fillStyle = th.fix; ctx.fillRect(px+4, py+4, 8, 8);
  }
  
  // Only show chevron after player has found the problem
  if (state?.foundP) drawHint(ctx, px, py, tick, th.fix);
}

// ═══════════════════════════════════════════════════════════════
// MAIN DRAW FUNCTION
// ═══════════════════════════════════════════════════════════════
export function drawGame(ctx, atlasRefData, state, room, roomIndex, tick, gearImages, props) {
  const atlas = atlasRefData?.main || atlasRefData; 
  const th = room.theme, ly = room.layout;
  const floors = ROOM_FLOORS[roomIndex] ||["floor_stone1","floor_dark"];
  const wallTile = ROOM_WALLS[roomIndex] || "wall_stone_m";
  const furnTile = ROOM_FURN[roomIndex] || "crate1";

  ctx.fillStyle = th.floor; ctx.fillRect(0,0,GW,GH);
  ctx.save();
  if (state.shake > 0.1) {
    ctx.translate((Math.random()-0.5)*state.shake, (Math.random()-0.5)*state.shake);
    state.shake *= 0.85;
  }

  // PASS 1a: Floors only
  for (let y=0; y<ROWS; y++) for (let x=0; x<COLS; x++) {
    const t = ly[y][x], px = x*T, py = y*T;
    
    if (t !== TID.WALL) {
      if (atlas) drawTile(ctx, atlas, (x+y)%2===0 ? floors[0] : floors[1], px, py);
      else if ((x+y)%2===0) { ctx.fillStyle=th.alt; ctx.fillRect(px,py,T,T); }
    }
    
    if (roomIndex === 4) {
      if (state.puzzleCleared) {
        if (t === TID.PROB) {
          ctx.fillStyle = "rgba(80, 250, 123, 0.15)"; ctx.fillRect(px, py, T, T);
        }
      } else if (state.foundF) {
        if (t !== TID.PROB && t !== TID.WALL && t !== TID.FURN && t >= 0) {
          ctx.fillStyle = "rgba(80, 250, 123, 0.2)"; ctx.fillRect(px, py, T, T);
        } else if (t === TID.PROB) {
          ctx.fillStyle = "rgba(255, 0, 85, 0.25)"; ctx.fillRect(px, py, T, T);
          ctx.strokeStyle = "#ff005588"; ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(px+3, py+3); ctx.lineTo(px+T-3, py+T-3); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(px+T-3, py+3); ctx.lineTo(px+3, py+T-3); ctx.stroke();
        }
      }
    }

    if (t===TID.ENTER) { ctx.fillStyle=hexRgba(th.lit,0.3); ctx.fillRect(px,py,T,T); }
    if (t===TID.FURN) { 
      if(atlas) drawTile(ctx,atlas,furnTile,px,py); else { ctx.fillStyle="#222"; ctx.fillRect(px+2,py+2,T-4,T-4); } 
    }
  }

  // PASS 1b: Room decorations (props, vegetation, animals — drawn BEFORE interactive tiles)
  const decorFn = ROOM_DECOR[roomIndex];
  if (decorFn) decorFn(ctx, atlas, tick, th, gearImages, state, atlasRefData, props);

  // PASS 1c: Interactive tiles ON TOP of decorations
  for (let y=0; y<ROWS; y++) for (let x=0; x<COLS; x++) {
    const t = ly[y][x], px = x*T, py = y*T;
    if (t===TID.PROB) drawContextualProblem(ctx, atlasRefData, roomIndex, px, py, state, tick, th);
    if (t===TID.FIX && !state.foundF) drawContextualFix(ctx, atlasRefData, roomIndex, px, py, tick, th, state);
    if (t===TID.EXIT) { 
      ctx.fillStyle=state.solved?"#22ff88":"#444"; ctx.fillRect(px+2,py,T-4,T); 
      ctx.fillStyle="#111"; ctx.fillRect(px+4,py+2,T-8,T-4); 
    }
    if (t>=10) { const obj = room.envObjects?.find(o=>o.id===t); drawEnvObj(ctx,px,py,obj,tick,th); }
  }

  // PASS 1d: Overlays that must be ON TOP of everything (cage bars, foreground gears)
  if (roomIndex === 1) {
    // Pet shop cage bars over the problem tiles
    const cagePositions = [3, 5, 7, 9, 11, 13];
    cagePositions.forEach(cx => {
      ctx.fillStyle = "#2a2018"; ctx.fillRect(cx*T, T, T, T);
      ctx.strokeStyle = "#999"; ctx.lineWidth = 1.5;
      for (let b = 0; b < 4; b++) {
        const bx = cx*T + 2 + b * 4;
        ctx.beginPath(); ctx.moveTo(bx, T); ctx.lineTo(bx, 2*T); ctx.stroke();
      }
      ctx.strokeStyle = "#bbb"; ctx.lineWidth = 2;
      ctx.strokeRect(cx*T, T, T, T);
      ctx.strokeStyle = "#999"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx*T, T + T/2); ctx.lineTo(cx*T + T, T + T/2); ctx.stroke();
    });
    ctx.fillStyle = "#aa8844"; ctx.font = "4px monospace";
    ctx.fillText("FOOD", 3*T+1, T+5); ctx.fillText("FOOD", 7*T+1, T+5); ctx.fillText("FOOD", 11*T+1, T+5); ctx.fillText("FOOD", 13*T+1, T+5);
  }
  if (roomIndex === 6 && gearImages?.bronze && gearImages?.silver) {
    // Foreground animated gears on top of everything
    const frames = gearImages.bronze, sframes = gearImages.silver;
    const fi = Math.floor(tick/6) % frames.length, sfi = Math.floor(tick/6 + 1) % sframes.length;
    ctx.save(); ctx.translate(8.5*T, 3.5*T); ctx.rotate(tick * 0.015); ctx.drawImage(frames[fi], -24, -24, 48, 48); ctx.restore();
    ctx.save(); ctx.translate(12*T, 2.5*T); ctx.rotate(-tick * 0.025); ctx.drawImage(sframes[sfi], -18, -18, 36, 36); ctx.restore();
  }

  // PASS 2: Walls
  for (let y=0; y<ROWS; y++) for (let x=0; x<COLS; x++) {
    if (ly[y][x]!==TID.WALL) continue;
    const px=x*T, py=y*T;
    if (atlas) {
      drawTile(ctx, atlas, wallTile, px, py);
      if (y>0 && ly[y-1][x]!==TID.WALL) drawTile(ctx, atlas, "wall_stone_t", px, py);
    } else { ctx.fillStyle=th.wall; ctx.fillRect(px,py-4,T,T+4); ctx.fillStyle=th.lit; ctx.fillRect(px,py-4,T,4); }
    ctx.fillStyle="rgba(255,255,255,0.04)"; ctx.fillRect(px,py,T,1); ctx.fillRect(px,py,1,T);
  }

  // PASS 3: Player
  const ppx=state.vPos.x*T, ppy=state.vPos.y*T;
  const mv=Math.abs(state.pos.x-state.vPos.x)+Math.abs(state.pos.y-state.vPos.y);
  const bob=Math.sin(tick*0.3)*mv*4;
  ctx.fillStyle="rgba(0,0,0,0.4)"; ctx.beginPath(); ctx.ellipse(ppx+8,ppy+14,6,3,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle="#2c2f33"; ctx.fillRect(ppx+4,ppy+6+bob,8,8);
  ctx.fillStyle="#1a1c1e"; ctx.fillRect(ppx+6,ppy+6+bob,4,8);
  ctx.fillStyle="#ffccaa"; ctx.fillRect(ppx+5,ppy+2+bob,6,5);
  ctx.fillStyle="#444"; ctx.fillRect(ppx+3,ppy+2+bob,10,2);
  ctx.fillStyle="#333"; ctx.fillRect(ppx+4,ppy-2+bob,8,4);
  ctx.fillStyle="#990033"; ctx.fillRect(ppx+4,ppy+1+bob,8,1);
  ctx.fillStyle="#000";
  if(state.facing==="down"){ctx.fillRect(ppx+6,ppy+4+bob,1,1);ctx.fillRect(ppx+9,ppy+4+bob,1,1);}
  else if(state.facing==="left")ctx.fillRect(ppx+5,ppy+4+bob,1,1);
  else if(state.facing==="right")ctx.fillRect(ppx+10,ppy+4+bob,1,1);

  for(let i=state.particles.length-1;i>=0;i--){const p=state.particles[i];p.x+=p.vx;p.y+=p.vy;p.life--;ctx.fillStyle=p.color;ctx.globalAlpha=Math.max(0,p.life/30);ctx.fillRect(p.x,p.y,2,2);ctx.globalAlpha=1;if(p.life<=0)state.particles.splice(i,1);}
  ctx.restore();

  ctx.globalCompositeOperation="source-over";
  const rad=80+Math.sin(tick*0.05)*3;
  const grad=ctx.createRadialGradient(ppx+8,ppy+8,15,ppx+8,ppy+8,rad);
  grad.addColorStop(0,"rgba(6,4,12,0)");grad.addColorStop(0.6,"rgba(6,4,12,0.55)");grad.addColorStop(1,"rgba(6,4,12,0.92)");
  ctx.fillStyle=grad; ctx.fillRect(0,0,GW,GH);

  // Torch light sources — warm glow that punches through darkness
  ctx.globalCompositeOperation="lighter";
  const TORCH_POS = {
    0: [[2,1],[17,1],[1,6],[18,6]],
    1: [[1,1],[18,1]],
    2: [[2,4],[17,4]],
    3: [[3,2],[6,2],[13,2],[16,2]],
    4: [[1,6],[18,6]],
    5: [[2,2],[17,2],[1,8],[18,8]],
    6: [[1,1],[18,1]],
    7: [[1,1],[18,1],[1,6]],
    8: state.solved ? [[2,1],[5,1],[12,1],[17,1]] : [],
    9: [[2,1],[17,1]],
  };
  const torchPositions = TORCH_POS[roomIndex] || [];
  torchPositions.forEach(([tx,ty]) => {
    const flicker = 0.12 + Math.sin(tick * 0.12 + tx * 2 + ty) * 0.04;
    const tg = ctx.createRadialGradient(tx*T+8, ty*T+4, 3, tx*T+8, ty*T+4, 45);
    tg.addColorStop(0, `rgba(255, 160, 60, ${flicker})`);
    tg.addColorStop(0.4, `rgba(255, 100, 30, ${flicker * 0.5})`);
    tg.addColorStop(1, "rgba(255, 80, 0, 0)");
    ctx.fillStyle = tg;
    ctx.beginPath(); ctx.arc(tx*T+8, ty*T+4, 45, 0, Math.PI*2); ctx.fill();
  });

  // Lava glow sources
  const LAVA_GLOW = {
    0: [[13.5, 9, 2.5]],
    6: [[2.5, 9, 2]],
    8: [[3, 8, 2.5], [16, 6, 2]],
    9: [[10, 8.5, 5]],
  };
  (LAVA_GLOW[roomIndex] || []).forEach(([lx, ly, lr]) => {
    const flicker = 0.08 + Math.sin(tick * 0.08 + lx) * 0.03;
    const lg = ctx.createRadialGradient(lx*T, ly*T, 5, lx*T, ly*T, lr*T);
    lg.addColorStop(0, `rgba(255, 80, 0, ${flicker})`);
    lg.addColorStop(1, "rgba(255, 40, 0, 0)");
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.arc(lx*T, ly*T, lr*T, 0, Math.PI*2); ctx.fill();
  });

  // Furnace fire glow (room 8 solved)
  if (roomIndex === 8 && state.solved) {
    const fg = ctx.createRadialGradient(7.5*T, 1.8*T, 5, 7.5*T, 1.8*T, 60);
    fg.addColorStop(0, "rgba(255, 120, 30, 0.18)");
    fg.addColorStop(1, "rgba(255, 60, 0, 0)");
    ctx.fillStyle = fg;
    ctx.beginPath(); ctx.arc(7.5*T, 1.8*T, 60, 0, Math.PI*2); ctx.fill();
  }

  // Elevator green glow (room 0 solved)
  if (roomIndex === 0 && (state.solved || state.puzzleCleared)) {
    const eg = ctx.createRadialGradient(10*T, T, 5, 10*T, T, 40);
    eg.addColorStop(0, "rgba(50, 255, 100, 0.12)");
    eg.addColorStop(1, "rgba(50, 255, 100, 0)");
    ctx.fillStyle = eg;
    ctx.beginPath(); ctx.arc(10*T, T, 40, 0, Math.PI*2); ctx.fill();
  }

  ctx.globalCompositeOperation="lighter";
  for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){
    const t=ly[y][x];
    if((t===TID.EXIT&&state.solved)||t>=10){
      const c=t===TID.EXIT?"100,255,150":"150,150,255";
      const r=t>=10?15:25, tx=x*T+8, ty=y*T+8;
      const tg=ctx.createRadialGradient(tx,ty,1,tx,ty,r);
      tg.addColorStop(0,`rgba(${c},${t>=10?0.3:0.6})`);tg.addColorStop(1,`rgba(${c},0)`);
      ctx.fillStyle=tg; ctx.beginPath(); ctx.arc(tx,ty,r,0,Math.PI*2); ctx.fill();
    }
  }
  ctx.globalCompositeOperation="source-over";

  if(!state.dlg&&!state.showCards){
    for(const d of DIRS){
      const cx=state.pos.x+d.x, cy=state.pos.y+d.y;
      if(cx>=0&&cy>=0&&cx<COLS&&cy<ROWS){
        const ct=ly[cy][cx];
        if((ct>=2&&ct<=5)||ct>=10){
          const pu=Math.sin(tick*0.2)*2+6;
          ctx.fillStyle="#fff"; ctx.font="bold 7px sans-serif";
          ctx.fillText("[E]",cx*T-2,cy*T-pu);break;
        }
      }
    }
  }
}