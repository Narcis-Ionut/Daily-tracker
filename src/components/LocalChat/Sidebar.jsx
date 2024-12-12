import React from "react";

const Sidebar = ({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onRenameChat,
  onDeleteChat,
  isSidebarOpen,
}) => {
  return (
    <div className={`local-chat-sidebar ${isSidebarOpen ? "active" : ""}`}>
      <button className="local-chat-new-button" onClick={onNewChat}>
        + New Chat
      </button>
      <ul className="local-chat-list">
        {chats.map((chat) => (
          <li
            key={chat.id}
            className={`local-chat-list-item ${
              chat.id === currentChatId ? "active" : ""
            }`}
          >
            <div className="chat-name" onClick={() => onSelectChat(chat.id)}>
              {chat.name}
            </div>
            <div className="chat-actions">
              <button
                className="rename-button"
                onClick={() => {
                  const newName = prompt("Enter new chat name", chat.name);
                  if (newName && newName.trim() !== "") {
                    onRenameChat(chat.id, newName.trim());
                  }
                }}
              >
                Rename
              </button>
              <button
                className="delete-chat-button"
                onClick={() => {
                  if (
                    window.confirm("Are you sure you want to delete this chat?")
                  ) {
                    onDeleteChat(chat.id);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
