import Grid from "./Grid";
import Notes from "./Notes";

export default function PianoRoll({
  notes,
  handleGridClick,
  deleteAtPosition,
  isRightDown,
  playheadX,
  CELL_HEIGHT,
  CELL_WIDTH,
  GRID_ROWS,
  TOTAL_BEATS,
  TOTAL_WIDTH
}) {
  return (
    <div
      onClick={handleGridClick}
      onContextMenu={(e) => {
        e.preventDefault();
        deleteAtPosition(e);
      }}
      onMouseMove={(e) => {
        if (isRightDown) deleteAtPosition(e);
      }}
      style={{
        position: "relative",
        width: TOTAL_WIDTH,
        height: GRID_ROWS * CELL_HEIGHT,
      }}
    >
      
      <Grid
        GRID_ROWS={GRID_ROWS}
        TOTAL_BEATS={TOTAL_BEATS}
        CELL_HEIGHT={CELL_HEIGHT}
        CELL_WIDTH={CELL_WIDTH}
      />

  
      <Notes
        notes={notes}
        CELL_HEIGHT={CELL_HEIGHT}
        CELL_WIDTH={CELL_WIDTH}
      />

      {/* Playhead */}
      <div
        style={{
          position: "absolute",
          left: playheadX,
          width: 2,
          height: "100%",
          background: "#00ffcc",
        }}
      />
    </div>
  );
}