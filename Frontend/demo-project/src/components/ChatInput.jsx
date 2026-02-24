import { useState } from "react";

function ChatInput( {onSend} ){
    const[text, setText] = useState("");

    return(
        <div className="chat-input-row">
            <input
                className="chat-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type something..."
            />
            <button className="btn btn-primary" onClick={() => onSend(text)}>Send</button>
        </div>
    );
}
export default ChatInput
