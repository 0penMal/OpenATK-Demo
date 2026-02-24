import { useNavigate } from "react-router-dom";

export default function WelcomePage() {
  const navigate = useNavigate();

  function handleContinue() {
    navigate("/learning");
  }

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <h1 className="welcome-title">Welcome to Prompt Injection Demo</h1>

        <section className="welcome-section">
          <h2>About This System</h2>
          <p>
            Welcome to the Prompt Injection Demo. This system is an educational and research-based platform designed
            to raise awareness about security risks in AI systems, particularly Large Language Models.
          </p>
          <p>
            You will explore how AI systems can be influenced by user input and why this presents emerging
            cybersecurity concerns. This demo is designed for academic research and educational purposes.
          </p>
        </section>

        <section className="welcome-section">
          <h2>System Structure</h2>
          <article className="welcome-part">
            <h3>Learn</h3>
            <p>You will first review short educational material introducing:</p>
            <ul className="welcome-list">
              <li>What prompt injection is</li>
              <li>Why it matters in modern AI-integrated systems</li>
              <li>Simple examples of how attacks may occur</li>
            </ul>
            <p>This section prepares you before interacting with the system.</p>
          </article>

          <article className="welcome-part">
            <h3>Challenge</h3>
            <p>You will then interact with a chatbot protected by basic guardrails. Your goal:</p>
            <ul className="welcome-list">
              <li>Attempt to discover a hidden password</li>
              <li>Experiment with different prompt strategies</li>
              <li>Observe how the AI responds to adversarial inputs</li>
            </ul>
            <p>This simulates how attackers may attempt to manipulate AI systems.</p>
          </article>

          <article className="welcome-part">
            <h3>Feedback</h3>
            <p>After completing or ending your attempt:</p>
            <ul className="welcome-list">
              <li>You will be requested to complete a separate feedback form.</li>
              <li>Your responses will help identify user expectations.</li>
              <li>Your responses will help identify usability improvements.</li>
              <li>Your responses will help identify educational clarity.</li>
              <li>Your responses will help identify desired features for future development.</li>
            </ul>
          </article>
        </section>

        <section className="welcome-section">
          <h2>Research Purpose</h2>
          <ul className="welcome-list">
            <li>Exploring how users interact with AI systems in security-related scenarios</li>
            <li>Understanding user perceptions of prompt injection risks</li>
            <li>Gathering requirements for designing an AI security awareness platform</li>
          </ul>
          <p>The findings contribute to research in AI security and secure system design.</p>
        </section>

        <section className="welcome-section">
          <h2>Data Collection and Privacy</h2>
          <p>Please read carefully:</p>
          <ul className="welcome-list">
            <li>Your prompts, system responses, timestamps, and progression data will be recorded.</li>
            <li>No personal information is required to participate.</li>
            <li>Data is anonymized using a system-generated attempt ID.</li>
            <li>Collected data is used strictly for academic research and analysis.</li>
            <li>You may stop participating at any time by clicking Finish / End Session.</li>
          </ul>
          <p>By proceeding, you consent to the collection and use of your interaction data for research purposes.</p>
        </section>

        <section className="welcome-section">
          <h2>Important Notes</h2>
          <ul className="welcome-list">
            <li>This is a controlled demo environment.</li>
            <li>The chatbot behavior is intentionally limited.</li>
            <li>The objective is educational and not to encourage misuse of AI systems.</li>
            <li>Please do not attempt to use techniques learned here against real-world systems.</li>
          </ul>
        </section>

        <section className="welcome-section">
          <h2>Before You Begin</h2>
          <p>You will next proceed to the Learning Section. We encourage you to:</p>
          <ul className="welcome-list">
            <li>Read the material carefully</li>
            <li>Reflect on how AI systems interpret instructions</li>
            <li>Consider how user input can influence AI behavior</li>
          </ul>
        </section>

        <div className="welcome-actions">
          <button className="btn btn-primary welcome-cta" onClick={handleContinue}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
