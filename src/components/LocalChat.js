import React, { useState, useEffect, useRef } from "react";
import "./LocalChat.css";

const LocalChat = () => {
  const [chats, setChats] = useState(() => {
    const savedChats = localStorage.getItem("chats");
    return savedChats ? JSON.parse(savedChats) : [];
  });

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

  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats]);

  useEffect(() => {
    if (!currentChatId && chats.length > 0) {
      setCurrentChatId(chats[0].id);
    }
  }, [chats, currentChatId]);

  const handleSend = async () => {
    if (input.trim() && currentChatId && !loading) {
      const timestamp = new Date().toISOString();

      // Update message properties to use 'role' and 'content'
      const userMessage = {
        id: Date.now(),
        content: input,
        role: "user",
        timestamp: timestamp,
      };

      const assistantMessage = {
        id: Date.now() + 1,
        content: "",
        role: "assistant",
        timestamp: new Date().toISOString(),
      };

      // Get the current chat
      const currentChat = chats.find((chat) => chat.id === currentChatId);

      // Build the new messages array with the new messages
      const newMessages = [
        ...currentChat.messages,
        userMessage,
        assistantMessage,
      ];

      // Update the chats state with the new messages
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId ? { ...chat, messages: newMessages } : chat
        )
      );

      setInput("");

      setLoading(true);
      setError(null);

      try {
        // Build the payload with the new messages array
        const response = await fetch("http://localhost:5001/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "mlx-community/Llama-3.1-Tulu-3-8B-8bit",
            messages: newMessages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            temperature: 0.7,
            max_tokens: 512,
            stream: true,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP error! status: ${response.status} - ${errorText}`
          );
        }

        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let doneReading = false;
        let partialMessage = "";

        while (!doneReading) {
          const { value, done } = await reader.read();
          doneReading = done;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });

            // Process the chunk
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const jsonStr = line.substring(6).trim();
                if (jsonStr === "[DONE]") {
                  doneReading = true;
                  break;
                }
                try {
                  const data = JSON.parse(jsonStr);
                  const text =
                    data.text || (data.choices && data.choices[0].text);
                  if (text) {
                    partialMessage += text;

                    // Update the assistant's message in the state
                    setChats((prevChats) =>
                      prevChats.map((chat) =>
                        chat.id === currentChatId
                          ? {
                              ...chat,
                              messages: chat.messages.map((msg) =>
                                msg.id === assistantMessage.id
                                  ? { ...msg, content: partialMessage }
                                  : msg
                              ),
                            }
                          : chat
                      )
                    );
                  }
                } catch (e) {
                  console.error("Failed to parse JSON:", e);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error connecting to the model:", error);
        setError(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Other handlers remain unchanged

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
      {/* Sidebar and chat list */}
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

      {/* Main chat area */}
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
                  message.role === "assistant" ? "bot-message" : "user-message"
                }`}
              >
                <div className="message-content">
                  <span>{message.content}</span>
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
          <div ref={messagesEndRef} />
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
