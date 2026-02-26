import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import LevelPanel from "../components/LevelPanel";
import PageProgress from "../components/PageProgress";
import PswdPanel from "../components/PswdPanel";

// const API = "http://127.0.0.1:8000";
const API = "/api";
const CHALLENGE_ACCESS_KEY = "challenge_access";
const TOTAL_LEVELS = 3;

function FinishModal({ open, onCancel, onConfirm }) {
  if (!open) return null;

  return createPortal(
    <div className="finish-modal-backdrop">
      <div className="finish-modal" role="dialog" aria-modal="true" aria-labelledby="finish-modal-title">
        <h3 id="finish-modal-title" className="finish-modal-title">
          End session?
        </h3>
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
    </div>,
    document.body
  );
}

export default function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [attemptId, setAttemptId] = useState(() => sessionStorage.getItem("attempt_id") || null);

  const [level, setLevel] = useState(1);
  const [levelDesc, setLevelDesc] = useState("");
  const [messages, setMessages] = useState([{ role: "bot", text: "Hi! Ask me anything." }]);
  const [allLevelsCompleted, setAllLevelsCompleted] = useState(false);
  const [challengeNotice, setChallengeNotice] = useState(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintError, setHintError] = useState("");
  const [hintText, setHintText] = useState("");
  const [hintVisible, setHintVisible] = useState(false);

  const [isFinished, setIsFinished] = useState(false);
  const [finishStats, setFinishStats] = useState(null);

  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const readyAttemptId = attemptId || sessionStorage.getItem("attempt_id");
  const chatWindowRef = useRef(null);

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

  useEffect(() => {
    setHintVisible(false);
    setHintError("");
    setHintText("");
  }, [level]);

  useEffect(() => {
    const chatWindow = chatWindowRef.current;
    if (!chatWindow) return;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }, [messages]);

  async function handleToggleHint() {
    if (hintLoading) return;

    if (hintVisible) {
      setHintVisible(false);
      return;
    }

    if (hintText) {
      setHintVisible(true);
      return;
    }

    setHintLoading(true);
    setHintError("");

    try {
      const res = await fetch(`${API}/level/${level}/hint`);
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      const data = await res.json();
      setHintText(data.system_prompt || "");
      setHintVisible(true);
    } catch (error) {
      console.error("Failed to load hint:", error);
      setHintError("Could not load hint right now. Please try again.");
    } finally {
      setHintLoading(false);
    }
  }

  async function handleSend(prompt) {
    if (isFinished) return;
    const activeAttemptId = readyAttemptId;
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) return;

    if (!activeAttemptId) {
      setMessages((prev) => [...prev, { role: "bot", text: "Starting session… try again in a moment." }]);
      return;
    }

    setMessages((prev) => [...prev, { role: "user", text: trimmedPrompt }]);

    const res = await fetch(`${API}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level: Number(level), prompt: trimmedPrompt, attempt_id: activeAttemptId }),
    });

    const data = await res.json(); // { output: "..." }
    setMessages((prev) => [...prev, { role: "bot", text: data.output }]);
  }

  async function handlePasswordTry(guess) {
    if (isFinished) return;
    const trimmedGuess = guess.trim();
    if (!trimmedGuess) return;

    const res = await fetch(`${API}/attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, guess: trimmedGuess }),
    });

    const data = await res.json(); // { correct, new_level, end }

    if (data.correct) {
      const hasCompletedAll = Boolean(data.end);
      setAllLevelsCompleted(hasCompletedAll);
      setLevel(data.new_level);
      if (hasCompletedAll) {
        setChallengeNotice({
          type: "complete",
          text: "All levels completed. You can end the session any time using Finish.",
        });
        setMessages((prev) => [...prev, { role: "bot", text: "All levels completed." }]);
      } else {
        setChallengeNotice({
          type: "success",
          text: `Correct password. You advanced to Level ${data.new_level}/${TOTAL_LEVELS}.`,
        });
        setMessages((prev) => [...prev, { role: "bot", text: "Correct password! Level up." }]);
      }
    } else {
      setChallengeNotice({ type: "error", text: "Wrong password. Try again." });
      setMessages((prev) => [...prev, { role: "bot", text: "Wrong password. Try again." }]);
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
        <PageProgress activeStep="challenge" />

        <div className="guide-card">
          <h2 className="guide-title">Participant Guide</h2>

          <section className="guide-section">
            <h3>Quick Rules</h3>
            <ul>
              <li>Try prompts that test the chatbot’s guardrails.</li>
              <li>When you think you found a password, enter it and press Try.</li>
              <li>There are 3 levels; each correct password moves you to the next level.</li>
              <li>Wrong attempts have no penalty, so feel free to experiment.</li>
              <li>You can press Finish / End Session at any time.</li>
            </ul>
          </section>

          <div className="guide-actions">
            <button className="btn btn-danger" onClick={onClickFinish} disabled={isFinished || !readyAttemptId}>
              Finish / End Session
            </button>
          </div>
        </div>

        <div className="hint-card">
          <div className="hint-title">Need a hint?</div>
          <p className="hint-text">
            If you are having trouble in getting the password, reveal this hint to see the current level&apos;s system
            prompt.
          </p>
          <button className="btn btn-subtle hint-button" onClick={handleToggleHint} disabled={hintLoading}>
            {hintLoading ? "Revealing..." : hintVisible ? "Hide Hint" : "Reveal Hint"}
          </button>
          {hintError && <p className="hint-error">{hintError}</p>}
          {hintVisible && hintText && <div className="hint-result">{hintText}</div>}
          <p className="hint-tip">
            Tip: Compare the prompts between levels. Even simple guardrail changes can greatly improve LLM security.
          </p>
        </div>
      </aside>

      <div className="app-container">
        <div className="page-header">
          <h2 className="page-title">Chat Demo</h2>
        </div>

        <FinishModal
          open={finishModalOpen}
          onCancel={() => setFinishModalOpen(false)}
          onConfirm={() => {
            setFinishModalOpen(false);
            finishAttempt(allLevelsCompleted ? "completed_or_user_finish" : "user_finish");
          }}
        />

        <LevelPanel
          level={level}
          description={levelDesc}
          totalLevels={TOTAL_LEVELS}
          allCompleted={allLevelsCompleted}
        />

        {challengeNotice && (
          <div className={`challenge-notice challenge-notice-${challengeNotice.type}`}>{challengeNotice.text}</div>
        )}

        {!isFinished && <PswdPanel onSubmit={handlePasswordTry} />}

        <div className="chat-window" ref={chatWindowRef}>
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
