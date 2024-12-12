import React from "react";

const PromptSetter = ({ currentPrompt, onSetPrompt }) => {
  const handlePromptSet = () => {
    const newPrompt = prompt(
      "Enter assistant's role or behavior:",
      currentPrompt
    );
    if (newPrompt && newPrompt.trim() !== "") {
      onSetPrompt(newPrompt.trim());
    }
  };

  return (
    <div className="assistant-prompt-container">
      <button className="set-prompt-button" onClick={handlePromptSet}>
        Set Assistant Role
      </button>
    </div>
  );
};

export default PromptSetter;
