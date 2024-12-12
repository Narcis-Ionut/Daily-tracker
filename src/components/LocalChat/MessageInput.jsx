import React from "react";

const MessageInput = ({
  input,
  onInputChange,
  onSend,
  onKeyDown,
  loading,
  disabled,
}) => {
  return (
    <div className="local-chat-input-container">
      <textarea
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="local-chat-input"
        placeholder="Type a message..."
        disabled={loading || disabled}
        rows={3}
      />
      <button
        className="local-chat-send-button"
        onClick={onSend}
        disabled={loading || disabled}
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  );
};

export default MessageInput;
