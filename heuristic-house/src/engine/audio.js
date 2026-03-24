import { useRef, useCallback, useMemo } from "react";

export function useAudio() {
  const ac = useRef(null);

  const init = useCallback(() => {
    if (!ac.current) {
      try {
        const C = window.AudioContext || window.webkitAudioContext;
        if (C) ac.current = new C();
      } catch (e) {
        /* sandboxed */
      }
    }
  }, []);

  const play = useCallback((type, freq, sweep, dur, vol = 0.1) => {
    if (!ac.current || ac.current.state === "suspended") return;
    try {
      const t = ac.current.currentTime;
      const o = ac.current.createOscillator();
      const g = ac.current.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      if (sweep) o.frequency.exponentialRampToValueAtTime(sweep, t + dur);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.01, t + dur);
      o.connect(g);
      g.connect(ac.current.destination);
      o.start();
      o.stop(t + dur);
    } catch (e) {
      /* ignore */
    }
  }, []);

  const sfx = useMemo(
    () => ({
      step: () => play("triangle", 150, 50, 0.1, 0.05),
      pickup: () => play("square", 400, 800, 0.2, 0.1),
      error: () => play("sawtooth", 150, 100, 0.3, 0.15),
      solve: () => {
        play("sine", 400, 600, 0.2, 0.1);
        setTimeout(() => play("sine", 600, 1200, 0.4, 0.1), 150);
      },
    }),
    [play]
  );

  return { init, sfx };
}
