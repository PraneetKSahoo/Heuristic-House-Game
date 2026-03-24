// Grid & rendering constants
export const T = 16;
export const COLS = 20;
export const ROWS = 14;
export const GW = COLS * T;
export const GH = ROWS * T;
export const MOVE_CD = 8;

// Tile type IDs
export const TID = {
  FLOOR: 0,
  WALL: 1,
  FURN: 2,
  PROB: 3,
  FIX: 4,
  EXIT: 5,
  ENTER: 6,
  // 10+ = room-specific interactive objects
};

// Cardinal directions for adjacency checks
export const DIRS = [
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
];

// Interaction key set
export const ACT_KEYS = [" ", "Spacebar", "e", "E", "Enter"];
export const isAct = (keys) => ACT_KEYS.some((k) => keys[k]);
export const clrAct = (keys) => ACT_KEYS.forEach((k) => (keys[k] = false));

// Format seconds as M:SS
export const fmt = (s) =>
  Math.floor(s / 60) + ":" + (s % 60).toString().padStart(2, "0");

// Find the entrance tile in a layout
export function findEntrance(layout) {
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++)
      if (layout[y][x] === TID.ENTER) return { x, y };
  return { x: 1, y: 7 };
}

// Hex color to rgba string
export function hexRgba(hex, alpha) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return `rgba(0,0,0,${alpha})`;
  return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${alpha})`;
}

// Fisher-Yates shuffle
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
