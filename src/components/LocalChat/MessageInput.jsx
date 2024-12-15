import React from "react";

const MessageInput = ({
  input,
  onInputChange,
  onSend,
  onKeyDown,
  loading,
  disabled,
  onStop,
}) => {
  return (
    <div className="local-chat-input-container">
      <textarea
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="local-chat-input"
        placeholder="Type a message..."
        // Removed loading from disabled so we can press Stop while loading
        disabled={disabled}
        rows={3}
      />
      <button
        className="local-chat-send-button"
        // If loading, clicking this should call onStop instead of onSend
        onClick={loading ? onStop : onSend}
        disabled={disabled}
      >
        {loading ? "Stop" : "Send"}
      </button>
    </div>
  );
};

export default MessageInput;
