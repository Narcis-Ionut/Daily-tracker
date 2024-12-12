import React from "react";
import CodeBlock from "./CodeBlock";

const MessageList = ({ currentChat, onDeleteMessage, messagesEndRef }) => {
  if (!currentChat || currentChat.messages.length === 0) {
    return <p className="local-chat-empty">No messages yet.</p>;
  }

  const renderMessageContent = (message) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(message.content)) !== null) {
      const [fullMatch, lang, code] = match;
      const index = match.index;

      if (lastIndex < index) {
        parts.push(
          <span key={lastIndex} className="text-content">
            {message.content.slice(lastIndex, index)}
          </span>
        );
      }

      const formattedCode = code
        .trim()
        .split("\n")
        .map((line) => line.trimEnd())
        .join("\n");

      const language = lang || "text";
      parts.push(
        <CodeBlock key={index} language={language} code={formattedCode} />
      );

      lastIndex = index + fullMatch.length;
    }

    if (lastIndex < message.content.length) {
      parts.push(
        <span key={lastIndex} className="text-content">
          {message.content.slice(lastIndex)}
        </span>
      );
    }

    return <div className="message-content-wrapper">{parts}</div>;
  };

  return (
    <div className="local-chat-messages">
      {currentChat.messages.map((message) => (
        <div
          key={message.id}
          className={`local-chat-message ${
            message.role === "assistant" ? "bot-message" : "user-message"
          }`}
        >
          <div className="message-content">{renderMessageContent(message)}</div>
          <span className="message-timestamp">
            {new Date(message.timestamp).toLocaleString()}
          </span>
          <button
            className="local-chat-delete-button"
            onClick={() => onDeleteMessage(message.id)}
          >
            Delete
          </button>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
