import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import LevelPanel from "../components/LevelPanel";
import PswdPanel from "../components/PswdPanel";

const API = "http://127.0.0.1:8000";

function FinishModal({ open, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "min(520px, 92vw)",
          background: "#111",
          border: "1px solid #333",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <h3 style={{ marginTop: 0 }}>End session?</h3>
        <p style={{ marginBottom: 16, lineHeight: 1.4 }}>
          Are you sure you want to finish your attempt? You won’t be able to continue after ending.
        </p>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm}>Yes, Finish</button>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const navigate = useNavigate();

  const [attemptId, setAttemptId] = useState(() => sessionStorage.getItem("attempt_id") || null);

  const [level, setLevel] = useState(1);
  const [levelDesc, setLevelDesc] = useState("");
  const [messages, setMessages] = useState([{ role: "bot", text: "Hi! Ask me anything." }]);

  const [isFinished, setIsFinished] = useState(false);
  const [finishStats, setFinishStats] = useState(null);

  const [finishModalOpen, setFinishModalOpen] = useState(false);

  // Start attempt on page load (only if we don't already have one in sessionStorage)
  useEffect(() => {
    let cancelled = false;

    async function startAttempt() {
      try {
        const res = await fetch(`${API}/attempts/start`, { method: "POST" });
        const data = await res.json(); // { attempt_id }
        if (cancelled) return;

        setAttemptId(data.attempt_id);
        sessionStorage.setItem("attempt_id", data.attempt_id);
      } catch (e) {
        console.error("Failed to start attempt:", e);
      }
    }

    if (!attemptId) startAttempt();

    return () => {
      cancelled = true;
    };
  }, [attemptId]);

  // Load level description
  useEffect(() => {
    async function loadLevel() {
      try {
        const res = await fetch(`${API}/level/${level}`);
        const data = await res.json();
        setLevelDesc(data.desc);
      } catch (e) {
        console.error("Failed to load level:", e);
      }
    }
    loadLevel();
  }, [level]);

  async function handleSend(prompt) {
    if (isFinished) return;

    if (!attemptId) {
      setMessages((prev) => [...prev, { role: "bot", text: "Starting session… try again in a moment." }]);
      return;
    }

    setMessages((prev) => [...prev, { role: "user", text: prompt }]);

    const res = await fetch(`${API}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level: Number(level), prompt, attempt_id: attemptId }),
    });

    const data = await res.json(); // { output: "..." }
    setMessages((prev) => [...prev, { role: "bot", text: data.output }]);
  }

  async function handlePasswordTry(guess) {
    if (isFinished) return;

    const res = await fetch(`${API}/attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, guess }),
    });

    const data = await res.json(); // { correct, new_level, end }

    if (data.correct) {
      setMessages((prev) => [...prev, { role: "bot", text: "Correct! Level up." }]);
      setLevel(data.new_level);
    } else {
      setMessages((prev) => [...prev, { role: "bot", text: "Wrong password. Try again." }]);
    }

    if (data.end) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "You completed all levels! You can end the session anytime using Finish." },
      ]);
    }
  }

  async function finishAttempt(reason = "user_finish") {
    setIsFinished(true);

    // if attemptId missing, still redirect to thank-you (but UUID would be empty)
    if (!attemptId) {
      navigate("/thank-you");
      return;
    }

    try {
      const res = await fetch(`${API}/attempts/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attempt_id: attemptId,
          final_level: level,
          finished_reason: reason,
        }),
      });

      const data = await res.json();
      setFinishStats(data);
    } catch (e) {
      console.error("Failed to finish attempt:", e);
    } finally {
      // Redirect regardless (don’t trap participant on broken network)
      navigate("/thank-you");
    }
  }

  function onClickFinish() {
    if (isFinished) return;
    setFinishModalOpen(true);
  }

  return (
    <div className="app-container">
      <h2>Chat Demo</h2>

      <div style={{ marginBottom: 12 }}>
        <button onClick={onClickFinish} disabled={isFinished}>
          Finish / End Session
        </button>
      </div>

      <FinishModal
        open={finishModalOpen}
        onCancel={() => setFinishModalOpen(false)}
        onConfirm={() => {
          setFinishModalOpen(false);
          // you can choose reason based on whether they reached level 3, etc.
          finishAttempt(level >= 3 ? "completed_or_user_finish" : "user_finish");
        }}
      />

      <LevelPanel level={level} description={levelDesc} />

      {!isFinished && <PswdPanel onSubmit={handlePasswordTry} />}

      {messages.map((m, index) => (
        <ChatMessage key={index} role={m.role} text={m.text} />
      ))}

      {!isFinished && <ChatInput onSend={handleSend} />}

      {isFinished && finishStats && (
        <div style={{ marginTop: 16 }}>
          <strong>Session finished.</strong>
        </div>
      )}
    </div>
  );
}


// import { useEffect, useState } from "react";
// import ChatMessage from "../components/ChatMessage";
// import ChatInput from "../components/ChatInput";
// import LevelPanel from "../components/LevelPanel";
// import PswdPanel from "../components/PswdPanel";

// const API = "http://127.0.0.1:8000";

// export default function App() {
//   const [attemptId, setAttemptId] = useState(null);

//   const [level, setLevel] = useState(1);
//   const [levelDesc, setLevelDesc] = useState("");
//   const [messages, setMessages] = useState([{ role: "bot", text: "Hi! Ask me anything." }]);

//   const [isFinished, setIsFinished] = useState(false);
//   const [finishStats, setFinishStats] = useState(null);

//   // 1) start attempt on mount
//   useEffect(() => {
//     let cancelled = false;

//     async function startAttempt() {
//       try {
//         const res = await fetch(`${API}/attempts/start`, { method: "POST" });
//         const data = await res.json(); // { attempt_id }
//         if (!cancelled) setAttemptId(data.attempt_id);
//       } catch (e) {
//         console.error("Failed to start attempt:", e);
//       }
//     }

//     startAttempt();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   // load level description
//   useEffect(() => {
//     async function loadLevel() {
//       try {
//         const res = await fetch(`${API}/level/${level}`);
//         const data = await res.json();
//         setLevelDesc(data.desc);
//       } catch (e) {
//         console.error("Failed to load level:", e);
//       }
//     }
//     loadLevel();
//   }, [level]);

//   async function handleSend(prompt) {
//     if (isFinished) return;

//     if (!attemptId) {
//       setMessages((prev) => [...prev, { role: "bot", text: "Starting session… try again in a moment." }]);
//       return;
//     }

//     setMessages((prev) => [...prev, { role: "user", text: prompt }]);

//     const res = await fetch(`${API}/chat`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ level: Number(level), prompt, attempt_id: attemptId }),
//     });

//     const data = await res.json(); // { output: "..." }
//     setMessages((prev) => [...prev, { role: "bot", text: data.output }]);
//   }

//   // IMPORTANT: ensure you only have ONE handlePasswordTry in your file
//   async function handlePasswordTry(guess) {
//     if (isFinished) return;

//     const res = await fetch(`${API}/attempt`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ level, guess }),
//     });

//     const data = await res.json(); // { correct, new_level, end }

//     if (data.correct) {
//       setMessages((prev) => [...prev, { role: "bot", text: "Correct! Level up." }]);
//       setLevel(data.new_level);
//     } else {
//       setMessages((prev) => [...prev, { role: "bot", text: "Wrong password. Try again." }]);
//     }

//     if (data.end) {
//       setMessages((prev) => [
//         ...prev,
//         { role: "bot", text: "You completed all levels! You can end the session anytime using Finish." },
//       ]);
//       // Do NOT auto-finish unless you want that behavior.
//     }
//   }

//   async function finishAttempt(reason = "user_finish") {
//     // lock UI immediately
//     setIsFinished(true);

//     if (!attemptId) return;

//     try {
//       const res = await fetch(`${API}/attempts/finish`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           attempt_id: attemptId,
//           final_level: level,
//           finished_reason: reason, // e.g. "user_finish" | "completed"
//         }),
//       });

//       const data = await res.json();
//       setFinishStats(data);
//     } catch (e) {
//       console.error("Failed to finish attempt:", e);
//     }
//   }

//   return (
//     <div className="app-container">
//       <h2>Chat Demo</h2>

//       {/* Finish is ALWAYS available */}
//       <div style={{ marginBottom: 12 }}>
//         <button
//           onClick={() => finishAttempt(level >= 3 ? "completed_or_user_finish" : "user_finish")}
//           disabled={isFinished}
//         >
//           Finish / End Session
//         </button>
//       </div>

//       <LevelPanel level={level} description={levelDesc} />

//       {!isFinished && <PswdPanel onSubmit={handlePasswordTry} />}

//       {messages.map((m, index) => (
//         <ChatMessage key={index} role={m.role} text={m.text} />
//       ))}

//       {!isFinished && <ChatInput onSend={handleSend} />}

//       {isFinished && (
//         <div style={{ marginTop: 16 }}>
//           <strong>Session finished.</strong>
//           {finishStats && (
//             <div style={{ marginTop: 8 }}>
//               <div>Final level: {finishStats.final_level}</div>
//               <div>Prompt count: {finishStats.prompt_count}</div>
//               <div>Total time (s): {finishStats.duration_seconds}</div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }