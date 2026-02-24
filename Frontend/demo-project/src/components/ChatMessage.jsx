function ChatMessage({role, text}) {
    const isUser = role === "user";

    return(
        <div className={`chat-message ${isUser ? "chat-message-user" : "chat-message-bot"}`}>
            <span className="chat-role">{role}</span>
            <p className="chat-text">{text}</p>
        </div>
    )

}
export default ChatMessage
