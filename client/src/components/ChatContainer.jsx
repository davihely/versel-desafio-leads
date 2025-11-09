import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaYoutube } from "react-icons/fa6";
import ChatLists from "./ChatLists";
import InputText from "./InputText";
import UserLogin from "./UserLogin";
import socketIOClient from "socket.io-client";
import "../style.css";

const ChatContainer = () => {
  const [user, setUser] = useState(localStorage.getItem("user"));

  const [open, setOpen] = useState(false);

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

    s.on("chat", (list) => setChats(list));
    s.on("message", (msg) => setChats((prev) => [...prev, msg]));

    return () => {
      s.off("chat");
      s.off("message");
    };
  }, []);

  const addMessage = (chat) => {
    const newChat = {
      username: localStorage.getItem("user"),
      message: chat,
      avatar: localStorage.getItem("avatar"),
    };
    socketRef.current?.emit("newMessage", newChat);
  };

  const Logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("avatar");
    setUser("");
  };

  function Typing({ role = "assistant" }) {
    if (role === "assistant") {
      return (
        <div className="bubble-block left">
          <div className="row">
            <div className="avatar" aria-hidden="true">
              <div className="avatar-img" />
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
      <div className="bubble-block right">
        <div className="bubble-box user">
          <div
            className="bubble bubble-primary bubble-typing"
            aria-label="You are typing"
          >
            <span className="dots">
              <i></i>
              <i></i>
              <i></i>
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <UserLogin setUser={setUser} />;

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
              <Typing role="assistant" />
            </div>

            <InputText addMessage={addMessage} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatContainer;
