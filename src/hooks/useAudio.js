import { useRef } from "react";
import * as Tone from "tone";

export default function useAudio() {
  const synthRef = useRef(null);

  const init = async () => {
    await Tone.start();

    synthRef.current = new Tone.PolySynth(
      Tone.Synth
    ).toDestination();
  };

  const playNote = (note) => {
    if (!synthRef.current) return;

    synthRef.current.triggerAttackRelease(
      note,
      "8n"
    );
  };

  return { init, playNote };
}