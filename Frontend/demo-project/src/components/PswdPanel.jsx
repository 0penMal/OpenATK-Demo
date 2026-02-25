import { useState } from "react";

export default function PaswdPanel({ onSubmit }) {
  const [password, setPassword] = useState("");

  function handleSubmit() {
    const trimmed = password.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setPassword("");
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="panel">
      <div className="section-title">Password Attempt</div>

      <div className="row password-row">
        <input
          className="password-input"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter password..."
        />
        <button className="btn btn-primary" onClick={handleSubmit}>
          Try
        </button>
      </div>
    </div>
  );
}
