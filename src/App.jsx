import { useEffect, useRef, useState } from "react";

export default function App() {
  const animationRef = useRef(null);
  const lineRef = useRef(null);
  const scrollRef = useRef(null);

  const [lineX, setLineX] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [squares, setSquares] = useState([]);
  const [bpm, setBpm] = useState(130);

  const GRID_ROWS = 10;
  const CELL_HEIGHT = 20;
  const GRID_OFFSET_TOP = 200;

  const direction = useRef(1);

  // Horizontal distance between beats (can adjust for visual spacing)
  const pixelsPerBeat = 50;

  // Number of beats to render in grid
  const TOTAL_BEATS = 500;

  const TOTAL_WIDTH = TOTAL_BEATS * pixelsPerBeat;

  // Pixels per frame at current BPM
  const pixelsPerFrame = () => {
    const beatsPerSecond = bpm / 60;
    const speed = pixelsPerBeat * beatsPerSecond / 60;
    return speed;
  };

  const animate = () => {
    setLineX((prev) => {
      let newX = prev + pixelsPerFrame() * direction.current;

      if (newX >= TOTAL_WIDTH - 5) {
        cancelAnimationFrame(animationRef.current);
        setIsRunning(false);
        return TOTAL_WIDTH - 5;
      }

      // Auto-scroll
      if (scrollRef.current) {
        const scrollLeft = scrollRef.current.scrollLeft;
        const viewportWidth = scrollRef.current.clientWidth;
        const margin = viewportWidth * 0.3;
        if (newX - scrollLeft > viewportWidth - margin) {
          scrollRef.current.scrollLeft = newX - (viewportWidth - margin);
        } else if (newX - scrollLeft < margin) {
          scrollRef.current.scrollLeft = Math.max(0, newX - margin);
        }
      }

      return newX;
    });

    animationRef.current = requestAnimationFrame(animate);
  };

  const start = () => {
    if (!isRunning) {
      setIsRunning(true);
      animationRef.current = requestAnimationFrame(animate);
    }
  };
  const pause = () => {
    setIsRunning(false);
    cancelAnimationFrame(animationRef.current);
  };
  const stop = () => {
    setIsRunning(false);
    cancelAnimationFrame(animationRef.current);
    setLineX(0);
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  };

  const handleCellClick = (row, beat) => {
    const id = `${row}-${beat}`;
    setSquares((prev) => {
      const exists = prev.find((sq) => sq.id === id);
      if (exists) return prev;
      return [...prev, { id, row, beat, triggered: false }];
    });
  };

  // Collision
  useEffect(() => {
    const lineRect = lineRef.current.getBoundingClientRect();
    setSquares((prev) =>
      prev.map((sq) => {
        const el = document.getElementById(`square-${sq.id}`);
        if (!el) return sq;
        const rect = el.getBoundingClientRect();
        const isColliding = !(
          lineRect.right < rect.left ||
          lineRect.left > rect.right ||
          lineRect.bottom < rect.top ||
          lineRect.top > rect.bottom
        );
        return { ...sq, triggered: isColliding };
      })
    );
  }, [lineX]);

  // Virtualization
  const [visibleBeats, setVisibleBeats] = useState([0, 0]);
  useEffect(() => {
    const updateVisible = () => {
      if (!scrollRef.current) return;
      const scrollLeft = scrollRef.current.scrollLeft;
      const viewportWidth = scrollRef.current.clientWidth;
      const startBeat = Math.floor(scrollLeft / pixelsPerBeat) - 2;
      const endBeat = Math.ceil((scrollLeft + viewportWidth) / pixelsPerBeat) + 2;
      setVisibleBeats([Math.max(0, startBeat), Math.min(TOTAL_BEATS, endBeat)]);
    };
    updateVisible();
    scrollRef.current.addEventListener("scroll", updateVisible);
    window.addEventListener("resize", updateVisible);
    return () => {
      if (scrollRef.current) scrollRef.current.removeEventListener("scroll", updateVisible);
      window.removeEventListener("resize", updateVisible);
    };
  }, []);

  const [startBeat, endBeat] = visibleBeats;

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#111" }}>
      {/* Pogas + BPM */}
      <div style={{ padding: 20, color: "white" }}>
        <button onClick={start}>Start</button>
        <button onClick={pause} style={{ marginLeft: 10 }}>Pause</button>
        <button onClick={stop} style={{ marginLeft: 10 }}>Stop</button>
        <div style={{ marginTop: 10 }}>
          <label>BPM: </label>
          <input
            type="number"
            step="0.01"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            style={{ width: 100, marginLeft: 10 }}
          />
        </div>
      </div>

      {/* Scroll */}
      <div
        ref={scrollRef}
        style={{
          overflowX: "scroll",
          overflowY: "hidden",
          whiteSpace: "nowrap",
          borderTop: "1px solid #333",
          position: "relative",
        }}
      >
        <div
          style={{
            width: TOTAL_WIDTH,
            height: GRID_ROWS * CELL_HEIGHT + 100,
            position: "relative",
          }}
        >
          {/* Kvadrāti */}
          {squares.map((sq) => (
            <div
              key={sq.id}
              id={`square-${sq.id}`}
              onContextMenu={(e) => {
                e.preventDefault();
                setSquares((prev) => prev.filter((item) => item.id !== sq.id));
              }}
              style={{
                width: pixelsPerBeat,
                height: CELL_HEIGHT,
                position: "absolute",
                top: GRID_OFFSET_TOP + sq.row * CELL_HEIGHT,
                left: sq.beat * pixelsPerBeat,
                background: sq.triggered ? "orange" : "red",
                zIndex: 1,
              }}
            />
          ))}

          {/* Līnija virs kvadrātiem */}
          <div
            ref={lineRef}
            style={{
              width: 5,
              height: GRID_ROWS * CELL_HEIGHT,
              background: "lime",
              position: "absolute",
              top: GRID_OFFSET_TOP,
              left: lineX,
              zIndex: 10,
            }}
          />

          {/* Redzamie sektori ritmiski */}
          {[...Array(GRID_ROWS)].map((_, row) =>
            [...Array(endBeat - startBeat)].map((_, i) => {
              const beat = startBeat + i;
              return (
                <div
                  key={`${row}-${beat}`}
                  onClick={() => handleCellClick(row, beat)}
                  style={{
                    width: pixelsPerBeat,
                    height: CELL_HEIGHT,
                    border: "1px solid #222",
                    position: "absolute",
                    top: GRID_OFFSET_TOP + row * CELL_HEIGHT,
                    left: beat * pixelsPerBeat,
                    cursor: "pointer",
                  }}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}