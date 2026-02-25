import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import LevelPanel from "../components/LevelPanel";
import PageProgress from "../components/PageProgress";
import PswdPanel from "../components/PswdPanel";

const API = "http://127.0.0.1:8000";
const CHALLENGE_ACCESS_KEY = "challenge_access";

function FinishModal({ open, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="finish-modal-backdrop">
      <div className="finish-modal">
        <h3 className="finish-modal-title">End session?</h3>
        <p className="finish-modal-text">
          Are you sure you want to finish your attempt? You won't be able to continue after ending.
        </p>

        <div className="finish-modal-actions">
          <button className="btn btn-subtle" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Yes, finish
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [attemptId, setAttemptId] = useState(() => sessionStorage.getItem("attempt_id") || null);

  const [level, setLevel] = useState(1);
  const [levelDesc, setLevelDesc] = useState("");
  const [messages, setMessages] = useState([{ role: "bot", text: "Hi! Ask me anything." }]);

  const [isFinished, setIsFinished] = useState(false);
  const [finishStats, setFinishStats] = useState(null);

  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const readyAttemptId = attemptId || sessionStorage.getItem("attempt_id");

  useEffect(() => {
    if (location.state?.fromLearning) {
      sessionStorage.setItem(CHALLENGE_ACCESS_KEY, "granted");
    }
  }, [location.state]);

  // Start attempt on page load (only if we don't already have one in sessionStorage)
  useEffect(() => {
    let cancelled = false;
    const hasChallengeAccess = sessionStorage.getItem(CHALLENGE_ACCESS_KEY) === "granted";

    async function startAttempt() {
      try {
        const res = await fetch(`${API}/attempts/start`, { method: "POST" });
        const data = await res.json(); // { attempt_id }
        const newAttemptId = data.attempt_id;
        sessionStorage.setItem("attempt_id", newAttemptId);
        if (cancelled) return;

        setAttemptId(newAttemptId);
      } catch (e) {
        console.error("Failed to start attempt:", e);
      }
    }

    if (!hasChallengeAccess && !attemptId) {
      navigate("/", { replace: true });
      return;
    }

    if (!attemptId) {
      startAttempt();
    }

    return () => {
      cancelled = true;
    };
  }, [attemptId, navigate]);

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
    const activeAttemptId = readyAttemptId;

    if (!activeAttemptId) {
      setMessages((prev) => [...prev, { role: "bot", text: "Starting session… try again in a moment." }]);
      return;
    }

    setMessages((prev) => [...prev, { role: "user", text: prompt }]);

    const res = await fetch(`${API}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level: Number(level), prompt, attempt_id: activeAttemptId }),
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
    const activeAttemptId = readyAttemptId;

    // if attemptId missing, still redirect to thank-you (but UUID would be empty)
    if (!activeAttemptId) {
      setIsFinished(false);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Session is still starting. Please wait a moment, then press Finish again." },
      ]);
      return;
    }

    try {
      const res = await fetch(`${API}/attempts/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attempt_id: activeAttemptId,
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
    <div className="workspace-layout">
      <aside className="guide-panel">
        <div className="guide-card">
          <h2 className="guide-title">Participant Guide</h2>

          <section className="guide-section">
            <h3>Instructions</h3>
            <p>Welcome to the Prompt Injection Challenge.</p>
            <ul>
              <li>Your goal is to interact with the chatbot and attempt to discover the hidden password.</li>
              <li>You may send prompts to the chatbot to test its guardrails.</li>
              <li>
                If you believe you have found the password, enter it in the Password Attempt field and click Try.
              </li>
              <li>There are 3 levels, by entering the correct password you will automatically level up.</li>
              <li>You may click Finish / End Session at any time to end your attempt.</li>
              <li>There is no penalty for incorrect attempts. Explore freely.</li>
            </ul>
          </section>

          <section className="guide-section">
            <h3>Important Notes</h3>
            <ul>
              <li>
                This is a research/demo system designed to study prompt injection and AI security behaviors.
              </li>
              <li>The chatbot may refuse certain requests as part of its guardrail design.</li>
              <li>You are encouraged to experiment with different prompt strategies.</li>
            </ul>
          </section>

          <div className="guide-actions">
            <button className="btn btn-danger" onClick={onClickFinish} disabled={isFinished || !readyAttemptId}>
              Finish / End Session
            </button>
          </div>
        </div>
      </aside>

      <div className="app-container">
        <PageProgress activeStep="challenge" />
        <div className="page-header">
          <h2 className="page-title">Chat Demo</h2>
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

        <div className="chat-window">
          {messages.map((m, index) => (
            <ChatMessage key={index} role={m.role} text={m.text} />
          ))}
        </div>

        {!isFinished && <ChatInput onSend={handleSend} />}

        {isFinished && finishStats && (
          <div className="session-finished">
            <strong>Session finished.</strong>
          </div>
        )}
      </div>
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
