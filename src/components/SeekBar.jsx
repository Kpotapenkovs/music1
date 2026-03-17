export default function SeekBar({
    playheadX,
    setPlayheadX,
    scrollRef,
    setIsDragging,
    KEYBOARD_WIDTH,
    SEEK_HEIGHT
  }) {
    return (
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
            e.clientX - rect.left +
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
    );
  }