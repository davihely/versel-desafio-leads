import React, { useEffect, useRef } from 'react'
import { formatMessageTime } from "../utils/time";
import botImage from "../assets/robot.png";

const ChatLists = ({chats}) => {
    const endOfMessages = useRef()
    const user = localStorage.getItem('user')
    function SenderChat({ message, username, avatar, timestamp }) {
      return (
        <div className="bubble-block right">
          <div className="bubble-box user w-85">
            <div className="bubble bubble-primary">{message}</div>
            <div className="timestamp t-left">
              {formatMessageTime(timestamp)}
            </div>
          </div>
        </div>
      );
    }

    function ReceiverChat({ message, username, avatar, timestamp }) {
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
              <div className="sender">{username || "Assistente"}</div>
              <div className="bubble-box assistant">
                <div className="bubble bubble-secondary">{message}</div>
                <div className="timestamp t-right">
                  {formatMessageTime(timestamp)}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    useEffect(() => {
        scrollToBottom()
    }, [chats])

    const scrollToBottom = () => {
        endOfMessages.current?.scrollIntoView({behavior: "smooth"})
    }
  return (
    <div>
      {
          chats.map((chat, index) => {
              if(chat.role === 'user') {
                  return <SenderChat 
                  key={index}
                  message = {chat.message}
                  username = {chat.username}
                  avatar = {chat.avatar}
                  timestamp = { chat.timestamp }/>
              }
                else {
                  return <ReceiverChat 
                  key={index}
                  message = {chat.message}
                  username = {chat.username}
                  timestamp = { chat.timestamp }/>
                }
          })
      }
      <div ref={endOfMessages}></div>
    </div>
  )
}

export default ChatLists