
import React, { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";

const InputText = ({ addMessage }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    addMessage(message.trim());
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="composer">
      <input
        type="text"
        value={message}
        placeholder="Digite sua mensagem..."
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className="input"
      />
      <div className="composer-actions">
        <button className="send-btn" aria-label="Send message" onClick={handleSend}>
          <svg viewBox="0 0 24 24" className="icon" aria-hidden="true">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default InputText;
