import { getNote, isBlack } from "../utils/music";

export default function Grid({
  GRID_ROWS,
  TOTAL_BEATS,
  CELL_HEIGHT,
  CELL_WIDTH
}) {
  return (
    <>
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
                black ? "#1b1b1b" : "#222",
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
            left: beat * CELL_WIDTH,
            width: beat % 4 === 0 ? 2 : 1,
            height: "100%",
            background:
              beat % 4 === 0 ? "#555" : "#333"
          }}
        />
      ))}
    </>
  );
}