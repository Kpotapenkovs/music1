import { useRef } from "react";

export default function usePlayback({
  bpm,
  CELL_WIDTH,
  getLoopEnd,
  setPlayheadX
}) {
  const animationRef = useRef(null);

  const pixelsPerFrame = () =>
    (CELL_WIDTH * bpm / 30) / 30;

  const start = () => {
    const animate = () => {
      setPlayheadX(prev => {
        const loopEnd = getLoopEnd();
        const next = prev + pixelsPerFrame();
        return next >= loopEnd ? 0 : next;
      });

      animationRef.current =
        requestAnimationFrame(animate);
    };

    animationRef.current =
      requestAnimationFrame(animate);
  };

  const pause = () =>
    cancelAnimationFrame(animationRef.current);

  const stop = () => {
    cancelAnimationFrame(animationRef.current);
    setPlayheadX(0);
  };

  return { start, pause, stop };
}