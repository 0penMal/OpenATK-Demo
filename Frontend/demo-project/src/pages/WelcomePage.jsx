import { useNavigate } from "react-router-dom";
import PageProgress from "../components/PageProgress";

export default function WelcomePage() {
  const navigate = useNavigate();

  function handleContinue() {
    navigate("/learning");
  }

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <PageProgress activeStep="welcome" />

        <section className="focus-hero">
          <p className="focus-kicker">Prompt Injection Awareness Demo</p>
          <h1 className="welcome-title">Quick Overview Before You Start</h1>
          <p className="focus-lead">
            This short demo is purposed to provide a soft practical introduction on prompt injection.
          </p>
          <div className="focus-meta">
            <div className="focus-meta-card">
              <span className="focus-meta-label">Purpose</span>
              <span className="focus-meta-value">Educational security awareness demo</span>
            </div>
            <div className="focus-meta-card">
              <span className="focus-meta-label">Flow</span>
              <span className="focus-meta-value">Welcome -&gt; Learn -&gt; Challenge -&gt; Feedback</span>
            </div>
            <div className="focus-meta-card">
              <span className="focus-meta-label">Duration</span>
              <span className="focus-meta-value">Around 10 minutes</span>
            </div>
          </div>
        </section>

        <section className="welcome-section">
          <h2>Data Collection and Privacy</h2>
          <div className="welcome-note-card">
            <ul className="welcome-list">
              <li>Your prompts, model responses, timestamps, and level progress are recorded.</li>
              <li>No personal information is required; data is linked only to an anonymous attempt ID.</li>
              <li>Data is used strictly for academic research and system analysis.</li>
            </ul>
            <p>By continuing, you consent to this data collection for research purposes.</p>
          </div>
        </section>

        <section className="welcome-section">
          <h2>Before You Start</h2>
          <ul className="welcome-list">
            <li>This is a controlled demo environment for educational use.</li>
            <li>Do not apply techniques from this demo to real systems.</li>
            <li>You can end your attempt at any time from the challenge page.</li>
            <li>Next: review the short learning material, then begin the challenge.</li>
          </ul>
        </section>

        <div className="welcome-actions page-actions">
          <button className="btn btn-primary welcome-cta" onClick={handleContinue}>
            Continue to Learning
          </button>
        </div>
      </div>
    </div>
  );
}
