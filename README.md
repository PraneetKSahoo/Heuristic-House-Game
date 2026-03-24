# 🕵️‍♂️ Heuristic House

> **Ten rooms. Ten usability violations. Feel them before you fix them.**

An RPG-style educational game that teaches [Nielsen's 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) through experiential gameplay. Instead of reading about bad UX — you *live* it.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Canvas](https://img.shields.io/badge/HTML5-Canvas-E34F26?logo=html5&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎮 The Concept

You are a UX detective investigating **The House of Dr. Error** — a mysterious mansion where every room contains a deliberately broken interface. Explore pixel-art rooms, encounter the violation firsthand, find the fix hidden in the environment, solve the interactive puzzle, and identify which usability principle was broken.

**The twist:** Each room's puzzle is *intentionally unsolvable* until you find the fix item. You experience the frustration of bad UX before you can overcome it — making the lesson stick.

<img width="594" height="572" alt="Screenshot 2026-03-23 203226" src="https://github.com/user-attachments/assets/0064c180-5233-41e9-8784-c0115f34263d" />

---

## 🏠 The 10 Rooms

| Room | Name | Heuristic | What You Experience |
|------|------|-----------|-------------------|
| 1 | The Elevator Shaft | Visibility of System Status | Press a button, get zero feedback. Is the elevator coming? |
| 2 | The Pet Shop | Match System & Real World | Feed animals with jargon labels like "Aqueous Protein Suspension" |
| 3 | The Train Room | User Control & Freedom | Crash a train with no undo, no reset, no way back |
| 4 | The Mirror Hallway | Consistency & Standards | Five identical doors that each open completely differently |
| 5 | The Library | Error Prevention | Walk across invisible trap tiles with no warning |
| 6 | The Music Room | Recognition Over Recall | Replay an 8-note melody from a single listen |
| 7 | The Clock Tower | Flexibility & Efficiency | Crank a handle 50 times when a motor exists |
| 8 | The Evidence Wall | Aesthetic & Minimalist Design | Find a 4-digit code buried under 35 irrelevant items |
| 9 | The Furnace Room | Help Users Recover from Errors | Decode `ERR_0x4F2A: THERMAL_OFFSET_INVALID` |
| 10 | The Final Machine | Help & Documentation | 8 unlabeled switches. No manual. Just sparks. |

<img width="786" height="613" alt="Screenshot 2026-03-23 203446" src="https://github.com/user-attachments/assets/c203aace-4e60-46f6-a82a-6a15d3480014" />
<img width="781" height="667" alt="Screenshot 2026-03-23 203322" src="https://github.com/user-attachments/assets/13dfd377-57f9-4d91-81df-b6d094a48637" />


---

## 🎯 Gameplay Loop

```
EXPLORE → ENCOUNTER → FAIL → SEARCH → FIX → SOLVE → IDENTIFY → ESCAPE
```

1. **Explore** — Walk around the pixel-art room. Interact with objects for flavor text and atmosphere.
2. **Encounter** — Find the glowing problem tile. Experience the broken design firsthand through an interactive puzzle overlay.
3. **Fail** — The puzzle is intentionally unsolvable without the fix. Feel the frustration.
4. **Search** — Go back to the room. Find the fix item hidden in the environment.
5. **Fix** — Return to the puzzle. Apply the fix. Solve it.
6. **Identify** — Pick which of Nielsen's 10 heuristics was violated.
7. **Escape** — Heuristic reveal card. Walk to the exit. Next room.

<img width="781" height="614" alt="Screenshot 2026-03-23 203425" src="https://github.com/user-attachments/assets/b69380f3-cf74-45dd-b21f-7997bab739a2" />
<img width="774" height="611" alt="Screenshot 2026-03-23 203401" src="https://github.com/user-attachments/assets/a482967e-929d-450c-8237-c79a711ea8f7" />

---

## ✨ Features

- **Pixel-art RPG exploration** — Canvas-rendered rooms with animated sprites, torches, particle effects, and CRT scanline overlay
- **10 unique interactive puzzles** — Each room plays differently (Simon Says, grid navigation, train switches, jargon matching, crank simulator, code search, error decoding, switch configuration)
- **Experiential learning** — You don't read about violations, you feel them
- **Rich environment** — Animals, vegetation, lava pools, ghosts, skeletons, animated torches, steam pipes
- **Dynamic lighting** — Vignette system with torch/lava light sources punching through darkness
- **Atmospheric storytelling** — The House of Dr. Error narrative with spooky intro
- **Card-based identification** — Test your understanding after each puzzle
- **Heuristic reveal cards** — Beautiful summary of each principle
- **Timer & scoring** — Track completion time and first-try identifications
- **Keyboard & touch** — Full support for desktop (WASD/Arrows + Space/E) and mobile (D-pad + Interact)
- **Developer tools** — Press `~` to jump to any room for testing

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/PraneetKSahoo/Heuristic-House-Game.git
cd heuristic-house

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser and ENJOY!!

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🗂️ Project Structure

```
heuristic-house/
├── public/                  # Static assets served at root
│   ├── game_atlas.png       # Main 179-sprite tilemap
│   ├── home_pack.png        # Home/furniture sprites
│   ├── Dungeon_Tileset_at.png
│   ├── new_Dungeon_Tileset.png
│   ├── torch.gif            # Animated torch
│   ├── lava.jpg             # Lava texture
│   ├── Big_Trees.png        # Vegetation sprites
│   ├── Bushes_With_Berries.png
│   ├── Red_Flowers.png
│   ├── Rocks.png
│   ├── Brown_Mushrooms.png
│   ├── Elevated_Grass_Tileset.png
│   ├── dog.png, chicken.png, rabbit.png, ...  # Animal sprites
│   └── gear_*.png           # Animated gear frames
├── src/
│   ├── App.jsx              # Main game component, game loop, state management
│   ├── PuzzleRooms.jsx      # 10 interactive puzzle overlay components
│   ├── main.jsx             # React entry point
│   ├── styles.css           # Global styles, animations, layout
│   ├── engine/
│   │   ├── constants.js     # Grid size, tile IDs, helpers
│   │   ├── renderer.js      # Canvas rendering, room decorations, lighting
│   │   └── audio.js         # Web Audio API sound effects
│   ├── data/
│   │   ├── rooms.js         # Room definitions, layouts, dialogs
│   │   └── heuristics.js    # Nielsen's 10 heuristics data
│   └── components/
│       └── Typewriter.jsx   # Typewriter text effect
├── index.html
├── package.json
└── vite.config.js
```

---

## 🎨 Adding Sprites to Rooms

The renderer uses a layered system for placing sprites. In `renderer.js`, each room has a decoration function in `ROOM_DECOR`:

```js
// Draw a tile from the main atlas
drawTile(ctx, at, "torch_wall1", 2*T, 4*T);  // at column 2, row 4

// Draw an animal with bob animation
drawAnimalBob(ctx, props?.dog, 3*T, 5*T, tick, 0);

// Draw vegetation
drawBush(ctx, props?.bushes, 5*T, 9*T, 0);    // variant 0
drawFlower(ctx, props?.flowers, 3*T, 10*T, 1); // variant 1
drawTree(ctx, props?.trees, T, 0, 1, 4);       // variant 1, height 4

// Draw a lava pool with animated bubbles
drawLavaPool(ctx, props?.lava, 6*T, 7*T, 4*T, 3*T, tick);

// Draw an animated torch from torch.gif
drawWallTorch(ctx, props?.torchGif, 2*T, T, tick, 0);
```

### Draw Order

```
PASS 1a: Floor tiles
PASS 1b: ROOM_DECOR (props, vegetation, animals — background)
PASS 1c: Interactive tiles (PROB, FIX, EXIT, ENV objects — always on top)
PASS 1d: Overlays (cage bars, foreground gears — topmost)
PASS 2:  Walls
PASS 3:  Player
PASS 4:  Darkness vignette
PASS 5:  Light sources (torches, lava, furnace — punch through darkness)
```

---

## 🎹 Controls

| Input | Action |
|-------|--------|
| `WASD` / `Arrow Keys` | Move |
| `Space` / `E` / `Enter` | Interact / Dismiss dialog |
| `~` (tilde) | Developer room jump |

Mobile users get an on-screen D-pad and Interact button (auto-detected).

---

## 📚 Nielsen's 10 Usability Heuristics

This game teaches these principles through direct experience:

1. **Visibility of System Status** — Keep users informed with timely feedback
2. **Match Between System & Real World** — Use familiar language, not jargon
3. **User Control & Freedom** — Provide undo, redo, emergency exits
4. **Consistency & Standards** — Same appearance = same behavior
5. **Error Prevention** — Design to prevent problems before they happen
6. **Recognition Over Recall** — Show information, don't force memorization
7. **Flexibility & Efficiency of Use** — Provide shortcuts for experts
8. **Aesthetic & Minimalist Design** — Remove irrelevant information
9. **Help Users Recover from Errors** — Clear error messages with solutions
10. **Help & Documentation** — Searchable, task-focused documentation

---

## 🛠️ Tech Stack

- **React 18** — UI components and state management
- **HTML5 Canvas** — Pixel-art rendering at 60fps
- **Vite** — Build tool and dev server
- **Web Audio API** — Procedural sound effects
- **Vanilla CSS** — Animations and responsive layout

No game engine. No external UI library. Pure React + Canvas.

---

## 🎓 Who Is This For?

- **UX/UI design students** learning Nielsen's heuristics
- **CS students** studying human-computer interaction
- **Bootcamp students** who need to understand usability principles
- **Instructors** looking for an interactive teaching tool
- **Anyone** who wants to understand why some interfaces feel broken

---

## 📄 License

MIT — free to use, modify, and distribute.

---

## 🙏 Credits

- **Pixel art tilesets** — [Pixel_Poem](https://pixel-poem.itch.io/) (Dungeon Tileset)
- **Vegetation & animal sprites** — Community pixel art assets
- **Usability heuristics** — [Jakob Nielsen, Nielsen Norman Group](https://www.nngroup.com/articles/ten-usability-heuristics/)

---

<p align="center">
  <em>Built with frustration, fixed with knowledge.</em><br>
  <strong>🕵️‍♂️ Heuristic House</strong>
</p>
