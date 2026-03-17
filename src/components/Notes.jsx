export default function Notes({
    notes,
    CELL_HEIGHT,
    CELL_WIDTH
  }) {
    return notes.map(n => (
      <div key={n.id}
        style={{
          position: "absolute",
          top: n.row * CELL_HEIGHT,
          left: n.beat * CELL_WIDTH,
          width: CELL_WIDTH,
          height: CELL_HEIGHT,
          background:
            n.triggered
              ? "#ff9900"
              : "#3399ff",
          borderRadius: 4
        }}
      />
    ));
  }