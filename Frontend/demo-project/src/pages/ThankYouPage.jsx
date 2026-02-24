import {useMemo, useState} from "react";

export default function ThankYouPage(){
    //set google form link
    const FORM_LINK ="GOOGLE_FORM_LINK"

    const attemptId = useMemo(()=> sessionStorage.getItem("attempt_id") || "", []);
    const [copied, setSopied] = useState(false);

    async function copyToClipboard(){
        try{
            await navigator.clipboard.writeText(attemptId);
            setCopied(true);
            setTimeout(()=> setCopied(false), 1500);
        } catch (e) {
            console.error("clipboard ocpy failed:", e);
            alert("Copy failed. Please manually select and copy the ID.");
        }
    }

  return (
    <div className="app-container">
      <h2>Thank you!</h2>
      <p style={{ lineHeight: 1.5 }}>
        Thanks for trying the demo. Please follow the instructions below to complete the feedback form.
      </p>

      <div style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 8 }}>Step 1: Copy your ID</h3>
        <p style={{ lineHeight: 1.5 }}>
          This annonymous ID will be used to help correlate analysis between the feedback form and data collected from your attempt.
        </p>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              border: "1px solid #333",
              borderRadius: 8,
              background: "#111",
              minWidth: "min(520px, 92vw)",
              wordBreak: "break-all",
            }}
          >
            {attemptId || "(No ID found — please go back and finish again.)"}
          </div>

          <button onClick={copyToClipboard} disabled={!attemptId}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3 style={{ marginBottom: 8 }}>Step 2: Open the survey</h3>
        <p style={{ lineHeight: 1.5 }}>
          Paste the ID into the form when asked (this helps match your feedback to your session).
        </p>

        <a href={FORM_LINK} target="_blank" rel="noreferrer">
          <button>Open Google Form</button>
        </a>
      </div>
    </div>
  );
}