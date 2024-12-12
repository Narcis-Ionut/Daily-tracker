import React from "react";

const ChatHeader = ({ currentChat, onToggleSidebar }) => {
  return (
    <>
      <div className="mobile-header">
        <button className="menu-button" onClick={onToggleSidebar}>
          ☰
        </button>
        <h2 className="local-chat-heading">
          {currentChat ? currentChat.name : "Assistant"}
        </h2>
      </div>
      {!currentChat && <h2 className="local-chat-heading">No chat selected</h2>}
    </>
  );
};

export default ChatHeader;
