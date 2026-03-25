import { useEffect, useRef } from "react";

const KEY_MAP = {
  z: 0, s: 1, x: 2, d: 3, c: 4, v: 5, g: 6, b: 7, h: 8, n: 9, j: 10, m: 11,
  ",": 12, l: 13, ".": 14, ";": 15, "/": 16,

  q: 12, "2": 13, w: 14, "3": 15, e: 16, r: 17, "5": 18,
  t: 19, "6": 20, y: 21, "7": 22, u: 23, i: 24,
  "9": 25, o: 26, "0": 27, p: 28, "[": 29, "=": 30, "]": 31,
};

export default function useKeyboardPlay({ onNoteOn, onNoteOff }) {
  const audioCtxRef = useRef(null);
  const activeNotes = useRef({});
  const pressed = useRef(new Set());

  useEffect(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    const ctx = audioCtxRef.current;

    const getFrequency = (note) => {
      return 440 * Math.pow(2, (note - 9) / 12);
    };

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (e.repeat) return;
      if (pressed.current.has(key)) return;

      const note = KEY_MAP[key];
      if (note === undefined) return;

      pressed.current.add(key);

      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(getFrequency(note), ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.01);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();

      activeNotes.current[key] = { osc, gain };

      onNoteOn && onNoteOn(note);
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      const note = KEY_MAP[key];
      if (note === undefined) return;

      pressed.current.delete(key);

      const active = activeNotes.current[key];
      if (!active) return;

      const { osc, gain } = active;
      const now = ctx.currentTime;

      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.08);

      osc.stop(now + 0.08);

      delete activeNotes.current[key];

      onNoteOff && onNoteOff(note);
    };

    const handleBlur = () => {
      Object.values(activeNotes.current).forEach(({ osc, gain }) => {
        try {
          gain.gain.setValueAtTime(0, ctx.currentTime);
          osc.stop();
        } catch {}
      });

      activeNotes.current = {};
      pressed.current.clear();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [onNoteOn, onNoteOff]);
}