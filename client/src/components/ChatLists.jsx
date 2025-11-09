import React, { useEffect, useRef } from 'react'

const ChatLists = ({chats}) => {
    const endOfMessages = useRef()
    const user = localStorage.getItem('user')
    function SenderChat ({message, username, avatar}) {
        return (
        <div className="bubble-block right">
          <div className="bubble-box user w-85">
            <div className="bubble bubble-primary">
              I have a question about the return policy for a product I purchased.
            </div>
            <div className="timestamp t-left">Just Now</div>
          </div>
        </div>
        )
    }
    function ReceiverChat ({message, username, avatar}) {
        return (
        <div className="bubble-block right">
          <div className="bubble-box user w-85">
            <div className="bubble bubble-primary">
              I have a question about the return policy for a product I purchased.
            </div>
            <div className="timestamp t-left">Just Now</div>
          </div>
        </div>
        )
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
              if(chat.username === user) {
                  return <SenderChat 
                  key={index}
                  message = {chat.message}
                  username = {chat.username}
                  avatar = {chat.avatar}/>
              }
                else {
                  return <ReceiverChat 
                  key={index}
                  message = {chat.message}
                  username = {chat.username}
                  avatar = {chat.avatar}/>
                }
          })
      }
    </div>
  )
}

export default ChatLists