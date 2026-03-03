import { useEffect, useRef, useState } from "react";

export default function App() {
  const scrollRef = useRef(null);
  const animationRef = useRef(null);

  const [bpm, setBpm] = useState(130);
  const [notes, setNotes] = useState([]);
  const [isRightDown, setIsRightDown] = useState(false);
  const [playheadX, setPlayheadX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [visibleRows, setVisibleRows] = useState(30);

  const GRID_ROWS = 88;
  const CELL_HEIGHT = 22;
  const CELL_WIDTH = 60;
  const TOTAL_BEATS = 300;
  const TOTAL_WIDTH = TOTAL_BEATS * CELL_WIDTH;
  const KEYBOARD_WIDTH = 80;
  const SEEK_HEIGHT = 24;

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

  const pixelsPerFrame = () => (CELL_WIDTH * bpm / 30) / 30;

  const getLoopEnd = () => {
    if (notes.length === 0) return CELL_WIDTH * 4;

    const lastBeat = Math.max(...notes.map(n => n.beat));
    const bars = Math.ceil((lastBeat + 1) / 4);
    return bars * 4 * CELL_WIDTH;
  };

  /* ================= AUTO RESIZE ================= */

  useEffect(() => {
    const updateVisibleRows = () => {
      const controlsHeight = 70;
      const availableHeight =
        window.innerHeight - controlsHeight - SEEK_HEIGHT;

      const rows = Math.floor(availableHeight / CELL_HEIGHT);
      setVisibleRows(Math.max(10, rows));
    };

    updateVisibleRows();
    window.addEventListener("resize", updateVisibleRows);

    return () =>
      window.removeEventListener("resize", updateVisibleRows);
  }, []);

  /* ================= PLAY ================= */

  const start = () => {
    const animate = () => {
      setPlayheadX(prev => {
        const loopEnd = getLoopEnd();
        const next = prev + pixelsPerFrame();
        return next >= loopEnd ? 0 : next;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const pause = () =>
    cancelAnimationFrame(animationRef.current);

  const stop = () => {
    cancelAnimationFrame(animationRef.current);
    setPlayheadX(0);
    setNotes(prev =>
      prev.map(n => ({ ...n, triggered: false }))
    );
  };

  /* ================= TRIGGER ================= */

  useEffect(() => {
    setNotes(prev =>
      prev.map(n => {
        const left = n.beat * CELL_WIDTH;
        const right = left + CELL_WIDTH;
        const triggered =
          playheadX >= left && playheadX <= right;
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

  /* ================= MOUSE EVENTS ================= */

  useEffect(() => {
    const down = (e) => {
      if (e.button === 2) setIsRightDown(true);
    };

    const up = () => {
      setIsRightDown(false);
      setIsDragging(false);
    };

    const move = (e) => {
      if (isDragging && scrollRef.current) {
        const rect =
          scrollRef.current.getBoundingClientRect();

        const x =
          e.clientX - rect.left -
          KEYBOARD_WIDTH +
          scrollRef.current.scrollLeft;

        setPlayheadX(
          Math.max(0, Math.min(x, TOTAL_WIDTH))
        );
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
  }, [isDragging]);

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

      {/* Controls */}
      <div style={{
        padding: 15,
        background: "#181818",
        display: "flex",
        gap: 15
      }}>
        <button onClick={start}>Start</button>
        <button onClick={pause}>Pause</button>
        <button onClick={stop}>Stop</button>

        <span>BPM</span>
        <input
          type="number"
          value={bpm}
          onChange={(e) =>
            setBpm(Number(e.target.value))
          }
          style={{ width: 70 }}
        />
      </div>

      {/* Seek */}
      <div
        style={{
          height: SEEK_HEIGHT,
          marginLeft: KEYBOARD_WIDTH,
          background: "#1e1e1e",
          position: "relative"
        }}
        onMouseDown={(e) => {
          const rect =
            e.currentTarget.getBoundingClientRect();
          const x =
            e.clientX -
            rect.left +
            scrollRef.current.scrollLeft;
          setPlayheadX(x);
          setIsDragging(true);
        }}
      >
        <div
          style={{
            position: "absolute",
            left: playheadX,
            width: 3,
            height: SEEK_HEIGHT,
            background: "#00ffcc"
          }}
        />
      </div>

      {/* Grid */}
      <div
        ref={scrollRef}
        style={{
          height: visibleRows * CELL_HEIGHT,
          overflow: "auto",
          display: "flex"
        }}
      >

        {/* Keyboard */}
        <div style={{
          width: KEYBOARD_WIDTH,
          position: "sticky",
          left: 0,
          background: "#101010",
          zIndex: 5
        }}>
          {Array.from({ length: GRID_ROWS }).map((_, row) => {
            const note = getNote(row);
            const black = isBlack(note);

            return (
              <div key={row} style={{
                height: CELL_HEIGHT,
                background:
                  black ? "#1a1a1a" : "#f0f0f0",
                color:
                  black ? "white" : "black",
                paddingLeft: 5,
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                borderBottom:
                  "1px solid #333"
              }}>
                {note}
              </div>
            );
          })}
        </div>

        {/* Piano Roll */}
        <div
          onClick={handleGridClick}
          onContextMenu={(e) => {
            e.preventDefault();
            deleteAtPosition(e);
          }}
          onMouseMove={(e) => {
            if (isRightDown)
              deleteAtPosition(e);
          }}
          style={{
            position: "relative",
            width: TOTAL_WIDTH,
            height: GRID_ROWS * CELL_HEIGHT
          }}
        >

          {/* Horizontal */}
          {Array.from({ length: GRID_ROWS }).map((_, row) => {
            const black =
              isBlack(getNote(row));
            return (
              <div key={row}
                style={{
                  position: "absolute",
                  top: row * CELL_HEIGHT,
                  width: "100%",
                  height: CELL_HEIGHT,
                  background:
                    black
                      ? "#1b1b1b"
                      : "#222",
                  borderBottom:
                    "1px solid #2a2a2a"
                }}
              />
            );
          })}

          {/* Vertical */}
          {Array.from({ length: TOTAL_BEATS }).map((_, beat) => (
            <div key={beat}
              style={{
                position: "absolute",
                left:
                  beat * CELL_WIDTH,
                width:
                  beat % 4 === 0
                    ? 2
                    : 1,
                height: "100%",
                background:
                  beat % 4 === 0
                    ? "#555"
                    : "#333"
              }}
            />
          ))}

          {/* Notes */}
          {notes.map(n => (
            <div key={n.id}
              style={{
                position: "absolute",
                top:
                  n.row *
                  CELL_HEIGHT,
                left:
                  n.beat *
                  CELL_WIDTH,
                width:
                  CELL_WIDTH,
                height:
                  CELL_HEIGHT,
                background:
                  n.triggered
                    ? "#ff9900"
                    : "#3399ff",
                borderRadius: 4
              }}
            />
          ))}

          {/* Playhead */}
          <div
            style={{
              position: "absolute",
              left: playheadX,
              width: 2,
              height: "100%",
              background: "#00ffcc"
            }}
          />
        </div>
      </div>
    </div>
  );
}