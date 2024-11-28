import React, { useState, useEffect } from "react";
import "./LocalChat.css";

const LocalChat = () => {
  // Initialize chats from local storage
  const [chats, setChats] = useState(() => {
    const savedChats = localStorage.getItem("chats");
    return savedChats ? JSON.parse(savedChats) : [];
  });

  // Initialize currentChatId
  const [currentChatId, setCurrentChatId] = useState(() => {
    const savedChats = localStorage.getItem("chats");
    if (savedChats) {
      const chatsArray = JSON.parse(savedChats);
      if (chatsArray.length > 0) {
        return chatsArray[0].id;
      }
    }
    return null;
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Save chats to local storage whenever they change
  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  // Update currentChatId if it's null and there are chats available
  useEffect(() => {
    if (!currentChatId && chats.length > 0) {
      setCurrentChatId(chats[0].id);
    }
  }, [chats, currentChatId]);

  const handleSend = async () => {
    if (input.trim() && currentChatId) {
      const timestamp = new Date().toISOString();

      const userMessage = {
        id: Date.now(),
        text: input,
        sender: "user",
        timestamp: timestamp,
      };

      // Update the current chat with the new user message
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, userMessage] }
            : chat
        )
      );
      setInput("");

      // Call the backend API
      setLoading(true);
      setError(null);
      try {
        // Ensure olama serve is running
        await fetch("http://localhost:5001/api/start-olama");

        const url = "http://localhost:5001/api/chat";
        console.log("Fetch URL:", url);

        // Get the current chat messages
        const currentChat = chats.find((chat) => chat.id === currentChatId);

        // Prepare messages for the API request
        const apiMessages = currentChat.messages.map((msg) => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text,
        }));

        // Include the latest user message
        apiMessages.push({
          role: "user",
          content: input,
        });

        const body = JSON.stringify({
          model: "llama3.2-vision:11b-instruct-q8_0", // Replace with your model name
          messages: apiMessages,
          stream: false,
          options: {
            num_predict: 4024,
            temperature: 0.7,
          },
        });
        console.log("Fetch Body:", body);

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        });

        console.log("Fetch Response:", response);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Response Data:", data);

        const botMessage = {
          id: Date.now() + 1,
          text: data.message?.content || "No response from the model.",
          sender: "bot",
          timestamp: new Date().toISOString(),
        };

        // Update the current chat with the bot's response
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === currentChatId
              ? { ...chat, messages: [...chat.messages, botMessage] }
              : chat
          )
        );
      } catch (error) {
        console.error("Error connecting to the model:", error);
        setError(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteMessage = (id) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: chat.messages.filter((message) => message.id !== id),
            }
          : chat
      )
    );
  };

  const handleDeleteChat = (id) => {
    const updatedChats = chats.filter((chat) => chat.id !== id);
    setChats(updatedChats);

    // Update currentChatId
    if (currentChatId === id) {
      if (updatedChats.length > 0) {
        setCurrentChatId(updatedChats[0].id);
      } else {
        setCurrentChatId(null);
      }
    }
  };

  const handleRenameChat = (id, newName) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === id ? { ...chat, name: newName } : chat
      )
    );
  };

  const handleNewChat = () => {
    const newChat = {
      id: Date.now(),
      name: `Chat ${chats.length + 1}`,
      messages: [],
    };
    setChats((prevChats) => [newChat, ...prevChats]);
    setCurrentChatId(newChat.id);
  };

  const handleSelectChat = (id) => {
    setCurrentChatId(id);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentChat = chats.find((chat) => chat.id === currentChatId);

  return (
    <div className="local-chat-container">
      <div className="local-chat-sidebar">
        <button className="local-chat-new-button" onClick={handleNewChat}>
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
              <div
                className="chat-name"
                onClick={() => handleSelectChat(chat.id)}
              >
                {chat.name}
              </div>
              <div className="chat-actions">
                <button
                  className="rename-button"
                  onClick={() => {
                    const newName = prompt("Enter new chat name", chat.name);
                    if (newName && newName.trim() !== "") {
                      handleRenameChat(chat.id, newName.trim());
                    }
                  }}
                >
                  Rename
                </button>
                <button
                  className="delete-chat-button"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this chat?"
                      )
                    ) {
                      handleDeleteChat(chat.id);
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
      <div className="local-chat-main">
        <h2 className="local-chat-heading">
          {currentChat ? currentChat.name : "Assistant"}
        </h2>
        <div className="local-chat-messages">
          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => setError(null)}>Dismiss</button>
            </div>
          )}
          {currentChat && currentChat.messages.length === 0 ? (
            <p className="local-chat-empty">No messages yet.</p>
          ) : (
            currentChat &&
            currentChat.messages.map((message) => (
              <div
                key={message.id}
                className={`local-chat-message ${
                  message.sender === "bot" ? "bot-message" : "user-message"
                }`}
              >
                <div className="message-content">
                  <span>{message.text}</span>
                  <span className="message-timestamp">
                    {new Date(message.timestamp).toLocaleString()}
                  </span>
                </div>
                <button
                  className="local-chat-delete-button"
                  onClick={() => handleDeleteMessage(message.id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
        <div className="local-chat-input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="local-chat-input"
            placeholder="Type a message..."
            disabled={loading || !currentChatId}
            rows={3}
          />
          <button
            className="local-chat-send-button"
            onClick={handleSend}
            disabled={loading || !currentChatId}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocalChat;
