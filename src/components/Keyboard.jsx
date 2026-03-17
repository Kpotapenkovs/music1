import { getNote, isBlack } from "../utils/music";

export default function Keyboard({
  GRID_ROWS,
  CELL_HEIGHT
}) {
  return (
    <div style={{
      width: 80,
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
          }}>
            {note}
          </div>
        );
      })}
    </div>
  );
}