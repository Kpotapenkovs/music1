import { useEffect } from "react";

export default function useMouse({
  isDragging,
  setIsDragging,
  setIsRightDown,
  scrollRef,
  setPlayheadX,
  KEYBOARD_WIDTH,
  TOTAL_WIDTH
}) {
  useEffect(() => {
    const down = (e) => {
      if (e.button === 2) {
        setIsRightDown(true);
      }
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
          e.clientX -
          rect.left -
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
  }, [
    isDragging,
    scrollRef,
    setPlayheadX,
    setIsDragging,
    setIsRightDown,
    KEYBOARD_WIDTH,
    TOTAL_WIDTH
  ]);
}