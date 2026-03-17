export default function Controls({
    start,
    pause,
    stop,
    bpm,
    setBpm
  }) {
    return (
      <div style={{
        padding: 15,
        background: "#181818",
        display: "flex",
        gap: 15
      }}>
        <button onClick={start}>Start</button>
        <button onClick={pause}>Pause</button>
        <button onClick={stop}>Stop</button>
  
        <span>BPM</span>
        <input
          type="number"
          value={bpm}
          onChange={(e) =>
            setBpm(Number(e.target.value))
          }
          style={{ width: 70 }}
        />
      </div>
    );
  }