import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import ChatHeader from "./ChatHeader";
import PromptSetter from "./PromptSetter";
import ModelSelector from "./ModelSelector";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import "./LocalChat.css";

const LocalChat = () => {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);

  // Load chats from backend on mount
  useEffect(() => {
    fetch("http://localhost:5001/load-chats")
      .then((response) => response.json())
      .then((data) => {
        setChats(data.chats);
        if (data.chats.length > 0) {
          setCurrentChatId(data.chats[0].id);
        }
      })
      .catch((err) => console.error("Failed to load chats:", err));
  }, []);

  // Save chats to backend whenever `chats` changes
  useEffect(() => {
    fetch("http://localhost:5001/save-chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chats }),
    }).catch((err) => console.error("Failed to save chats:", err));
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

  const currentChat = chats.find((chat) => chat.id === currentChatId);

  const handleModelChange = (newModel) => {
    if (currentChatId && !loading) {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId ? { ...chat, model: newModel } : chat
        )
      );
    }
  };

  const handleRenameChat = (id, newName) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === id ? { ...chat, name: newName } : chat
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

  const handleNewChat = () => {
    const defaultPrompt = "You are a helpful assistant.";
    const defaultModel = "mlx-community/Llama-3.1-Tulu-3-8B-8bit";
    const newChat = {
      id: Date.now(),
      name: `Chat ${chats.length + 1}`,
      messages: [],
      systemPrompt: defaultPrompt,
      model: defaultModel,
    };
    setChats((prevChats) => [newChat, ...prevChats]);
    setCurrentChatId(newChat.id);
    setIsSidebarOpen(false); // Close sidebar on mobile after creating new chat
  };

  const handleSelectChat = (id) => {
    setCurrentChatId(id);
    setIsSidebarOpen(false); // Close sidebar on mobile after selecting chat
  };

  const handleDeleteMessage = (messageId) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: chat.messages.filter((m) => m.id !== messageId),
            }
          : chat
      )
    );
  };

  const handleSetPrompt = (newPrompt) => {
    if (newPrompt && newPrompt.trim() !== "") {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, systemPrompt: newPrompt.trim() }
            : chat
        )
      );
    }
  };

  const handleSend = async () => {
    if (input.trim() && currentChatId && !loading) {
      const timestamp = new Date().toISOString();

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

      const currentChat = chats.find((chat) => chat.id === currentChatId);

      if (currentChat.name.startsWith("Chat ")) {
        const newName = input.substring(0, 20) || "New Chat";
        handleRenameChat(currentChatId, newName);
      }

      const newMessages = [
        ...currentChat.messages,
        userMessage,
        assistantMessage,
      ];

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId ? { ...chat, messages: newMessages } : chat
        )
      );

      setInput("");
      setLoading(true);
      setError(null);

      try {
        const messagesToSend = newMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        const response = await fetch("http://localhost:5001/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: currentChat.model,
            messages: messagesToSend,
            systemPrompt: currentChat.systemPrompt,
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

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let doneReading = false;
        let partialMessage = "";

        while (!doneReading) {
          const { value, done } = await reader.read();
          doneReading = done;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="local-chat-container">
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="local-chat-main">
        <ChatHeader
          currentChat={currentChat}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        {currentChat && (
          <>
            <PromptSetter
              currentPrompt={currentChat.systemPrompt}
              onSetPrompt={handleSetPrompt}
            />
            <ModelSelector
              currentModel={currentChat.model}
              onModelSelect={handleModelChange}
              isLoading={loading}
            />
          </>
        )}
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}
        <MessageList
          currentChat={currentChat}
          onDeleteMessage={handleDeleteMessage}
          messagesEndRef={messagesEndRef}
        />
        <MessageInput
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
          onKeyDown={handleKeyDown}
          loading={loading}
          disabled={!currentChatId}
        />
      </div>
    </div>
  );
};

export default LocalChat;
