import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaYoutube } from "react-icons/fa6";
import ChatLists from "./ChatLists";
import InputText from "./InputText";
import socketIOClient from "socket.io-client";
import "../style.css";
import botImage from "../assets/robot.png";

const ChatContainer = () => {
  if (!localStorage.getItem("sessionId")) {
    localStorage.setItem("sessionId", crypto.randomUUID());
  }
  
  useEffect(() => {
    const savedChats = JSON.parse(localStorage.getItem("chats"));
    if (savedChats && savedChats.length > 0) {
      setChats(savedChats);
    } else {
      const welcome = {
        role: "bot",
        message: "Olá! 👋 Eu sou o assistente da Verzel. Como posso te ajudar hoje?",
        timestamp: Date.now(),
      };
      setChats([welcome]);
      localStorage.setItem("chats", JSON.stringify([welcome]));
    }
  }, []);

  const [user, setUser] = useState(localStorage.getItem("user"));
  const [open, setOpen] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const sessionId = localStorage.getItem("sessionId");

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 150);
    return () => clearTimeout(t);
  }, []);

  const socketRef = useRef(null);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = socketIOClient("http://localhost:3001");
    }
    const s = socketRef.current;
    s.on("message", (msg) => {
      handelBotMassage(msg);
    });

    return () => {
      s.off("message");
    };
  }, []);

  const addMessage = (chat) => {
    
    const savedChats = JSON.parse(localStorage.getItem("chats")) || [];
    
    const updatedChats = [...savedChats, chat];

    setChats(updatedChats);

    localStorage.setItem("chats", JSON.stringify(updatedChats));

    setBotTyping(true);

    const chatHistory = JSON.parse(localStorage.getItem("chats")) || [];

    socketRef.current?.emit("newMessage", {
      sessionId: sessionId,
      message: chat,
      history: chatHistory,
    });
  };

  const handelBotMassage = (chat) => {
    setBotTyping(false);

    const savedChats = JSON.parse(localStorage.getItem("chats")) || [];

    const updatedChats = [...savedChats, chat];

    setChats(updatedChats);

    localStorage.setItem("chats", JSON.stringify(updatedChats));
    
  };

  const Logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("avatar");
    setUser("");
  };

  function Typing() {
      return (
        <div className="bubble-block left">
          <div className="row">
            <div className="avatar" aria-hidden="true">
              <img
                src={botImage}
                alt="Assistant"
                className="avatar-img"
              />
            </div>
            <div className="stack">
              <div className="sender">Assistente</div>
              <div className="bubble-box assistant">
                <div
                  className="bubble bubble-secondary bubble-typing"
                  aria-label="Assistant is typing"
                >
                  <span className="dots">
                    <i></i>
                    <i></i>
                    <i></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
  }

  return (
    <>
      <button
        className={`chat-launcher ${open ? "is-hidden" : "is-visible"}`}
        aria-label="Open chat"
        onClick={() => setOpen(true)}
      >
        <svg viewBox="0 0 24 24" className="icon" aria-hidden="true">
          <path
            d="M4 4h16a2 2 0 012 2v9a2 2 0 01-2 2H9l-5 5v-5H4a2 2 0 01-2-2V6a2 2 0 012-2z"
            fill="currentColor"
          />
        </svg>
      </button>

      <div className="chat-dock" aria-hidden={open ? "false" : "true"}>
        <div className={`chat-wrapper ${open ? "open" : "closed"}`}>
          <div className="card chat-fly" role="dialog" aria-label="Chat window">
            <div className="hero">
              <div className="brand" aria-hidden="true">
                <span>C</span>
              </div>

              <button
                className="close"
                aria-label="Close chat"
                onClick={() => setOpen(false)}
              >
                <svg viewBox="0 0 24 24" className="icon" aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <div className="hero-copy">
                <h1>ChatBot</h1>
                <p>

                </p>
              </div>
            </div>

            <div className="chat-area" role="log" aria-live="polite">
              <ChatLists chats={chats} />
              {botTyping && <Typing/>}
            </div>
            <InputText addMessage={addMessage} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatContainer;
