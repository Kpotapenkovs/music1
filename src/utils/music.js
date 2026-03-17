export const NOTE_NAMES = [
    "C","C#","D","D#","E",
    "F","F#","G","G#","A","A#","B"
  ];
  
  export const getNote = (row) => {
    const midi = 108 - row;
    const note = NOTE_NAMES[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return note + octave;
  };
  
  export const isBlack = (note) =>
    note.includes("#");