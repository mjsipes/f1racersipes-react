import React, { useState, useEffect, useRef } from 'react';
import supabase from "../supabaseClient";

const Chat = ({ gameId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!gameId) return;
    const channel = supabase.channel(`game-${gameId}`);
    console.log("channel", channel);
    channel
      .on("broadcast", { event: "new-message" }, (payload) => {
        setMessages((prevMessages) => [...prevMessages, payload]);
      })
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [gameId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (newMessage.trim() !== "" && gameId) {
      await supabase.channel(`game-${gameId}`).send({
        type: "broadcast",
        event: "new-message",
        payload: {
          content: newMessage,
          timestamp: new Date().toLocaleTimeString(),
        },
      });
      setNewMessage("");
    }
  };

  return (
    <div className="chat-card">
      <div className="chat-header">
        <div className="chat-title">CHAT</div>
      </div>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <span>{msg.payload.timestamp}: </span>
            {msg.payload.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-area">
        <input
          type="text"
          className="chat-input"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
              e.preventDefault();
            }
          }}
          placeholder="Type your message..."
        />
        <button className="chat-send-button" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;