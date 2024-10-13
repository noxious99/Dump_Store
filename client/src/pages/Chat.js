import React, { useState } from "react";
import "../styles/chatStyle.css";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

export const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { text: newMessage, sender: "user" }]);
      setNewMessage("");
    }
  };

  return (
    <div className="chatContainer">
      {/* Chat Window */}
      <div className="chatWindow">
        <div className="messagesContainer">
          {messages.length === 0 ? (
            <p className="noMessages">No messages yet...</p>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`messageBubble ${
                  message.sender === "user" ? "sent" : "received"
                }`}
              >
                {message.text}
              </div>
            ))
          )}
        </div>

        {/* Message Input Box */}
        <div className="inputContainer">
          <input
            type="text"
            placeholder="Type your message..."
            className="messageInput"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button className="sendButton" onClick={handleSendMessage}>
            <SendRoundedIcon sx={{ color: "white", fontSize: 30 }} />
          </button>
        </div>
      </div>
    </div>
  );
};
