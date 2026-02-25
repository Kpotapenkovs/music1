import { useEffect, useRef, useState } from "react";

export default function App() {
  const scrollRef = useRef(null);
  const playheadRef = useRef(null);
  const animationRef = useRef(null);

  const [bpm, setBpm] = useState(130);
  const [notes, setNotes] = useState([]);
  const [isRightDown, setIsRightDown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const GRID_ROWS = 88;
  const VISIBLE_ROWS = 30;
  const CELL_HEIGHT = 20;
  const CELL_WIDTH = 50;
  const TOTAL_BEATS = 500;
  const TOTAL_WIDTH = TOTAL_BEATS * CELL_WIDTH;
  const KEYBOARD_WIDTH = 80;
  const SEEK_HEIGHT = 20;

  const NOTE_NAMES = [
    "C","C#","D","D#","E",
    "F","F#","G","G#","A","A#","B"
  ];

  const getNote = (row) => {
    const midi = 108 - row;
    const note = NOTE_NAMES[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return note + octave;
  };
  const isBlack = (note) => note.includes("#");

  const pixelsPerFrame = () => (CELL_WIDTH * bpm / 60) / 60;

  // ===== PLAYHEAD ANIMATION =====
  const start = () => {
    const animate = () => {
      if (!playheadRef.current || isDragging) return; // neanimē, ja vilkšana
      const current = parseFloat(playheadRef.current.style.left || "0");
      const next = current + pixelsPerFrame();
      playheadRef.current.style.left = next + "px";

      // Trigger
      setNotes(prev => prev.map(n => {
        const noteLeft = n.beat * CELL_WIDTH;
        const noteRight = noteLeft + CELL_WIDTH;
        const triggered = next >= noteLeft && next <= noteRight;
        return { ...n, triggered };
      }));

      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
  };

  const pause = () => cancelAnimationFrame(animationRef.current);
  const stop = () => {
    cancelAnimationFrame(animationRef.current);
    if (playheadRef.current) playheadRef.current.style.left = "0px";
    setNotes(prev => prev.map(n => ({ ...n, triggered: false })));
  };

  // ===== ADD NOTE =====
  const handleGridClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const beat = Math.floor(x / CELL_WIDTH);
    const row = Math.floor(y / CELL_HEIGHT);
    if (row < 0 || row >= GRID_ROWS) return;
    const id = `${row}-${beat}`;
    setNotes(prev => prev.find(n => n.id === id) ? prev : [...prev, { id, row, beat, triggered: false }]);
  };

  // ===== DELETE =====
  const deleteAtPosition = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const beat = Math.floor(x / CELL_WIDTH);
    const row = Math.floor(y / CELL_HEIGHT);
    setNotes(prev => prev.filter(n => !(n.row === row && n.beat === beat)));
  };

  // ===== MOUSE EVENTS =====
  useEffect(() => {
    const down = (e) => { if (e.button === 2) setIsRightDown(true); };
    const up = () => { setIsRightDown(false); setIsDragging(false); };
    const move = (e) => {
      if (isRightDown) deleteAtPosition(e);
      if (isDragging && playheadRef.current && scrollRef.current) {
        let newLeft = e.clientX - dragOffset - KEYBOARD_WIDTH + scrollRef.current.scrollLeft;
        newLeft = Math.max(0, Math.min(newLeft, TOTAL_WIDTH));
        playheadRef.current.style.left = newLeft + "px";

        // Trigger
        setNotes(prev => prev.map(n => {
          const noteLeft = n.beat * CELL_WIDTH;
          const noteRight = noteLeft + CELL_WIDTH;
          const triggered = newLeft >= noteLeft && newLeft <= noteRight;
          return { ...n, triggered };
        }));
      }
    };
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    window.addEventListener("mousemove", move);
    return () => {
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("mousemove", move);
    };
  }, [isDragging, dragOffset, isRightDown]);

  // ===== SEEK WINDOW CLICK =====
  const handleSeekClick = (e) => {
    if (!playheadRef.current || !scrollRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newLeft = Math.max(0, Math.min(x + scrollRef.current.scrollLeft, TOTAL_WIDTH));
    playheadRef.current.style.left = newLeft + "px";

    // Trigger update
    setNotes(prev => prev.map(n => {
      const noteLeft = n.beat * CELL_WIDTH;
      const noteRight = noteLeft + CELL_WIDTH;
      const triggered = newLeft >= noteLeft && newLeft <= noteRight;
      return { ...n, triggered };
    }));
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#181818", color: "white" }}>
      {/* Controls */}
      <div style={{ padding: 10, position: "sticky", top: 0, background: "#181818", zIndex: 30 }}>
        <button onClick={start}>Start</button>
        <button onClick={pause} style={{ marginLeft: 10 }}>Pause</button>
        <button onClick={stop} style={{ marginLeft: 10 }}>Stop</button>
        <span style={{ marginLeft: 20 }}>BPM:</span>
        <input type="number" value={bpm} step="0.01" onChange={(e) => setBpm(Number(e.target.value))} style={{ width: 80 }}/>
      </div>

      {/* Seek window */}
      <div
        style={{
          height: SEEK_HEIGHT,
          width: "100%",
          background: "#333",
          position: "relative",
          marginBottom: 2,
          cursor: "pointer",
          marginLeft: KEYBOARD_WIDTH
        }}
        onClick={handleSeekClick}
      >
        {/* Draggable line */}
        <div
          ref={playheadRef}
          onMouseDown={(e) => {
            setIsDragging(true);
            setDragOffset(e.clientX - e.currentTarget.getBoundingClientRect().left);
          }}
          style={{
            position: "absolute",
            top: 0,
            left: parseFloat(playheadRef.current?.style.left || 0),
            width: 3,
            height: SEEK_HEIGHT,
            background: "lime",
            zIndex: 50,
            cursor: "grab"
          }}
        />
      </div>

      {/* Scrollable grid */}
      <div ref={scrollRef} style={{ height: VISIBLE_ROWS * CELL_HEIGHT, overflow: "auto", position: "relative" }}>
        <div style={{ display: "flex", position: "relative" }}>
          {/* Keyboard */}
          <div style={{
            width: KEYBOARD_WIDTH,
            position: "sticky",
            left: 0,
            top: 0,
            zIndex: 20,
            background: "#111",
            display: "flex",
            flexDirection: "column"
          }}>
            {Array.from({ length: GRID_ROWS }).map((_, row) => {
              const note = getNote(row);
              const black = isBlack(note);
              return (
                <div key={row} style={{
                  height: CELL_HEIGHT,
                  background: black ? "#222" : "#eee",
                  color: black ? "white" : "black",
                  fontSize: 11,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 6,
                  borderBottom: "1px solid #444",
                  boxSizing: "border-box"
                }}>{note}</div>
              );
            })}
          </div>

          {/* Grid */}
          <div
            style={{
              position: "relative",
              width: TOTAL_WIDTH,
              height: GRID_ROWS * CELL_HEIGHT,
              backgroundImage: `
                linear-gradient(#2a2a2a 1px, transparent 1px),
                linear-gradient(90deg, #2a2a2a 1px, transparent 1px)
              `,
              backgroundSize: `100% ${CELL_HEIGHT}px, ${CELL_WIDTH}px 100%`
            }}
            onClick={handleGridClick}
            onContextMenu={(e) => { e.preventDefault(); deleteAtPosition(e); }}
            onMouseMove={(e) => { if (isRightDown) deleteAtPosition(e); }}
          >
            {notes.map(n => (
              <div key={n.id} style={{
                position: "absolute",
                top: n.row * CELL_HEIGHT,
                left: n.beat * CELL_WIDTH,
                width: CELL_WIDTH,
                height: CELL_HEIGHT,
                background: n.triggered ? "#ffcc66" : "#99ccff",
                boxSizing: "border-box"
              }}/>
            ))}

            {/* Playhead in grid */}
            <div ref={playheadRef} style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 3,
              height: GRID_ROWS * CELL_HEIGHT,
              background: "lime",
              zIndex: 25
            }}/>
          </div>
        </div>
      </div>
    </div>
  );
}