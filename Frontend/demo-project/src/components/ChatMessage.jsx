function ChatMessage({role, text}) {

    return(
        <div>
            <b>{role}:</b> {text}
        </div>
    )

}
export default ChatMessage