import { useState } from "react";

function ChatInput({ onSend }) {
  const [text, setText] = useState("");

  function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="chat-input-row">
      <input
        className="chat-input"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type something..."
      />
      <button className="btn btn-primary" onClick={handleSubmit}>
        Send
      </button>
    </div>
  );
}
export default ChatInput;
