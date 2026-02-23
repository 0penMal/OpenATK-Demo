import {useEffect} from "react";

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function Timer({
  timeLeft,
  isRunning,
  isFinished,
  showFinish,
  timeUpPopup,
  onFinish,
  onContinue,
}) {
  return (
    <>
      {/* Timer display */}
      <div style={{ marginBottom: 12 }}>
        <strong>Time:</strong> {formatTime(timeLeft)}
        {isFinished && <span> (finished)</span>}
        {timeLeft === 0 && !isFinished && (
          <span style={{ marginLeft: 8 }}>(time up)</span>
        )}
      </div>

      {/* Finish button */}
      {showFinish && !isFinished && (
        <button onClick={onFinish} style={{ margin: "12px 0" }}>
          Finish
        </button>
      )}

      {/* Time-up popup */}
      {timeUpPopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#111",
              padding: 16,
              borderRadius: 8,
              maxWidth: 420,
              width: "100%",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Time’s up</h3>
            <p style={{ marginTop: 0 }}>
              You can finish now, or continue attempting levels. The Finish
              button will remain available.
            </p>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={onContinue}>Continue</button>
              <button onClick={onFinish}>Finish now</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}