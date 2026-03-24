// SPRITE ATLAS MAP — v2 (179 sprites, 320x144px)
const ATLAS = {
  // ROW 0: FLOORS
  floor_dark:{x:0,y:0},floor_stone1:{x:16,y:0},floor_stone2:{x:32,y:0},floor_alt1:{x:48,y:0},
  floor_check1:{x:64,y:0},floor_check2:{x:80,y:0},floor_stone3:{x:96,y:0},floor_stone4:{x:112,y:0},
  floor_stone5:{x:128,y:0},floor_wood_at:{x:144,y:0},floor_ornate1:{x:160,y:0},floor_ornate2:{x:176,y:0},
  floor_ornate3:{x:192,y:0},floor_ornate4:{x:208,y:0},floor_ornate5:{x:224,y:0},floor_ornate6:{x:240,y:0},
  floor_wood_new:{x:256,y:0},floor_pp_dark:{x:272,y:0},floor_pp_tile:{x:288,y:0},floor_pp_brick:{x:304,y:0},
  // ROW 1: WALLS
  wall_stone_tl:{x:0,y:16},wall_stone_t:{x:16,y:16},wall_stone_tr:{x:32,y:16},wall_stone_l:{x:48,y:16},
  wall_stone_m:{x:64,y:16},wall_stone_r:{x:80,y:16},wall_stone_bl:{x:96,y:16},wall_stone_b:{x:112,y:16},
  wall_stone_br:{x:128,y:16},wall_dark_tl:{x:144,y:16},wall_dark_m:{x:160,y:16},wall_blue_tl:{x:176,y:16},
  wall_blue_t:{x:192,y:16},wall_blue_m:{x:208,y:16},wall_blue_full:{x:224,y:16},wall_blue_full2:{x:240,y:16},
  wall_blue_full3:{x:256,y:16},wall_blue_bot:{x:272,y:16},wall_blue_bot2:{x:288,y:16},wall_pp1:{x:304,y:16},
  // ROW 2: DECORATIONS
  window_bar1:{x:0,y:32},window_bar2:{x:16,y:32},window_bar3:{x:32,y:32},window_bar4:{x:48,y:32},
  torch_wall1:{x:64,y:32},torch_wall2:{x:80,y:32},torch_wall3:{x:96,y:32},torch_wall4:{x:112,y:32},
  pillar_top:{x:128,y:32},pillar_mid:{x:144,y:32},pillar_base:{x:160,y:32},
  stone_block1:{x:176,y:32},stone_block2:{x:192,y:32},gold_deco1:{x:208,y:32},gold_deco2:{x:224,y:32},
  arch_top:{x:240,y:32},arch_mid:{x:256,y:32},arch_base:{x:272,y:32},
  pp_torch_wall:{x:288,y:32},pp_shield1:{x:304,y:32},
  // ROW 3: FURNITURE
  crate1:{x:0,y:48},crate2:{x:16,y:48},barrel1:{x:32,y:48},barrel2:{x:48,y:48},
  chest_closed:{x:64,y:48},chest_open:{x:80,y:48},shelf_top:{x:96,y:48},shelf_mid:{x:112,y:48},
  shelf_base:{x:128,y:48},table_top:{x:144,y:48},cabinet1:{x:160,y:48},
  dung_chest:{x:176,y:48},dung_chest_open:{x:192,y:48},dung_barrel:{x:208,y:48},dung_crate:{x:224,y:48},
  dung_wall_top:{x:240,y:48},dung_wall_mid:{x:256,y:48},dung_floor1:{x:272,y:48},
  dung_door_t:{x:288,y:48},dung_door_b:{x:304,y:48},
  // ROW 4: HOME — Kitchen & Bedroom
  home_table_l:{x:0,y:64},home_table_r:{x:16,y:64},home_chair1:{x:32,y:64},home_chair2:{x:48,y:64},
  home_stove_t:{x:64,y:64},home_stove_b:{x:80,y:64},home_fridge_t:{x:96,y:64},home_fridge_b:{x:112,y:64},
  home_counter_t:{x:128,y:64},home_counter_b:{x:144,y:64},home_sink_t:{x:160,y:64},home_sink_b:{x:176,y:64},
  home_cabinet_t:{x:192,y:64},home_cabinet_b:{x:208,y:64},home_shelving_t:{x:224,y:64},home_shelving_b:{x:240,y:64},
  home_lamp:{x:256,y:64},home_bed_t:{x:272,y:64},home_bed_m:{x:288,y:64},home_bed_b:{x:304,y:64},
  // ROW 5: HOME — Items & Plants
  home_candle:{x:0,y:80},home_pot1:{x:16,y:80},home_pot2:{x:32,y:80},home_pot3:{x:48,y:80},
  home_plant_big:{x:64,y:80},home_flowers:{x:80,y:80},home_plant2:{x:96,y:80},home_vine:{x:112,y:80},
  home_floor1:{x:128,y:80},home_floor2:{x:144,y:80},home_floor3:{x:160,y:80},home_floor4:{x:176,y:80},
  home_floor5:{x:192,y:80},home_floor6:{x:208,y:80},home_floor7:{x:224,y:80},
  bookshelf_t:{x:240,y:80},bookshelf_m:{x:256,y:80},bookshelf_b:{x:272,y:80},
  bookshelf2_t:{x:288,y:80},bookshelf2_m:{x:304,y:80},
  // ROW 6: Benches/Rugs + Industrial start
  bench_l:{x:0,y:96},bench_m:{x:16,y:96},bench_r:{x:32,y:96},plank1:{x:48,y:96},plank2:{x:64,y:96},
  rug_l:{x:80,y:96},rug_m:{x:96,y:96},rug_r:{x:112,y:96},
  ind_wall1:{x:128,y:96},ind_wall2:{x:144,y:96},ind_pipe_h:{x:160,y:96},ind_pipe_v:{x:176,y:96},
  ind_pipe_t:{x:192,y:96},ind_pipe_corner:{x:208,y:96},ind_vent:{x:224,y:96},
  ind_panel1:{x:240,y:96},ind_panel2:{x:256,y:96},ind_switch1:{x:272,y:96},ind_switch2:{x:288,y:96},
  ind_door_t:{x:304,y:96},
  // ROW 7: Industrial continued + Doors/Fences
  ind_door_b:{x:0,y:112},ind_machine1:{x:16,y:112},ind_machine3:{x:32,y:112},ind_machine4:{x:48,y:112},
  ind_control1:{x:64,y:112},ind_control2:{x:80,y:112},ind_control3:{x:96,y:112},ind_control4:{x:112,y:112},
  ind_bigmachine_tl:{x:128,y:112},ind_bigmachine_tr:{x:144,y:112},
  ind_bigmachine_bl:{x:160,y:112},ind_bigmachine_br:{x:176,y:112},ind_gear1:{x:192,y:112},
  door_closed:{x:208,y:112},door_open:{x:224,y:112},door_b_closed:{x:240,y:112},door_b_open:{x:256,y:112},
  fence_h:{x:272,y:112},fence_v:{x:288,y:112},fence_tl:{x:304,y:112},
  // ROW 8: Fences continued + Pixel Poem items
  fence_tr:{x:0,y:128},fence_bl:{x:16,y:128},fence_br:{x:32,y:128},fence_cross:{x:48,y:128},
  fence_post:{x:64,y:128},gate_lattice2:{x:80,y:128},
  pp_chest1:{x:96,y:128},pp_chest2:{x:112,y:128},pp_chest_open:{x:128,y:128},pp_shelf:{x:144,y:128},
  pp_ladder:{x:160,y:128},pp_potion:{x:176,y:128},pp_coin:{x:192,y:128},
  pp_barrel:{x:208,y:128},pp_crate:{x:224,y:128},pp_table:{x:240,y:128},pp_chair:{x:256,y:128},
  pp_torch_wall2:{x:272,y:128},pp_shield2:{x:288,y:128},
};
export default ATLAS;
