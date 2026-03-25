import { useEffect, useRef, useState } from "react";
import Controls from "./components/Controls";
import SeekBar from "./components/SeekBar";
import Keyboard from "./components/Keyboard";
import PianoRoll from "./components/PianoRoll";
import usePlayback from "./hooks/usePlayback";
import useMouse from "./hooks/useMouse";
import useKeyboardPlay from "./hooks/useKeyboardPlay";

export default function App() {
  const scrollRef = useRef(null);
  const audioCtxRef = useRef(null);

  const [bpm, setBpm] = useState(130);
  const [notes, setNotes] = useState([]);
  const [playheadX, setPlayheadX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isRightDown, setIsRightDown] = useState(false);

  const GRID_ROWS = 88;
  const CELL_HEIGHT = 22;
  const CELL_WIDTH = 60;
  const TOTAL_BEATS = 300;
  const TOTAL_WIDTH = TOTAL_BEATS * CELL_WIDTH;
  const KEYBOARD_WIDTH = 80;
  const SEEK_HEIGHT = 24;

  /* ================= AUDIO ================= */
  useEffect(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  const playNote = (note) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (ctx.state === "suspended") ctx.resume();

    const pitch = GRID_ROWS - note.row - 1;
    const freq = 440 * Math.pow(2, (pitch - 49) / 12);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  };

  /* ================= LOOP ================= */
  const getLoopEnd = () => {
    if (notes.length === 0) return CELL_WIDTH * 4;
    const lastBeat = Math.max(...notes.map(n => n.beat));
    const bars = Math.ceil((lastBeat + 1) / 4);
    return bars * 4 * CELL_WIDTH;
  };

  /* ================= PLAYBACK ================= */
  const { start, pause, stop } = usePlayback({
    bpm,
    CELL_WIDTH,
    getLoopEnd,
    setPlayheadX
  });

  /* ================= MOUSE ================= */
  useMouse({
    isDragging,
    setIsDragging,
    setIsRightDown,
    scrollRef,
    setPlayheadX,
    KEYBOARD_WIDTH,
    TOTAL_WIDTH
  });

  /* ================= KEYBOARD ================= */
  useKeyboardPlay({
    onNoteOn: () => {}, // ❗ tikai skaņa, nevis grid
    onNoteOff: () => {}
  });

  /* ================= TRIGGER ================= */
  useEffect(() => {
    setNotes(prev =>
      prev.map(n => {
        const left = n.beat * CELL_WIDTH;
        const right = left + CELL_WIDTH;

        const triggered = playheadX >= left && playheadX <= right;

        if (triggered && !n.triggered) {
          playNote(n); // 🔊 playback skaņa
        }

        return { ...n, triggered };
      })
    );
  }, [playheadX]);

  /* ================= ADD NOTE ================= */
  const handleGridClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const beat = Math.floor(x / CELL_WIDTH);
    const row = Math.floor(y / CELL_HEIGHT);

    const id = `${row}-${beat}`;

    setNotes(prev =>
      prev.find(n => n.id === id)
        ? prev
        : [...prev, { id, row, beat, triggered: false }]
    );
  };

  /* ================= DELETE ================= */
  const deleteAtPosition = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const beat = Math.floor(x / CELL_WIDTH);
    const row = Math.floor(y / CELL_HEIGHT);

    setNotes(prev =>
      prev.filter(n => !(n.row === row && n.beat === beat))
    );
  };

  /* ================= UI ================= */
  return (
    <div style={{
      height: "100vh",
      background: "#121212",
      color: "white",
      display: "flex",
      flexDirection: "column",
      fontFamily: "sans-serif"
    }}>
      
      <Controls
        start={start}
        pause={pause}
        stop={stop}
        bpm={bpm}
        setBpm={setBpm}
      />

      <SeekBar
        playheadX={playheadX}
        setPlayheadX={setPlayheadX}
        scrollRef={scrollRef}
        setIsDragging={setIsDragging}
        KEYBOARD_WIDTH={KEYBOARD_WIDTH}
        SEEK_HEIGHT={SEEK_HEIGHT}
      />

      <div
        ref={scrollRef}
        style={{
          overflow: "auto",
          display: "flex"
        }}
      >
        <Keyboard
          GRID_ROWS={GRID_ROWS}
          CELL_HEIGHT={CELL_HEIGHT}
        />

        <PianoRoll
          notes={notes}
          handleGridClick={handleGridClick}
          deleteAtPosition={deleteAtPosition}
          isRightDown={isRightDown}
          playheadX={playheadX}
          CELL_HEIGHT={CELL_HEIGHT}
          CELL_WIDTH={CELL_WIDTH}
          GRID_ROWS={GRID_ROWS}
          TOTAL_BEATS={TOTAL_BEATS}
          TOTAL_WIDTH={TOTAL_WIDTH}
        />
      </div>
    </div>
  );
}