import React, { useState, useEffect } from 'react';
import supabase from "../supabaseClient";

const ChatCard = ({ gameId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

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
      <br></br>
      <input
        type="text"
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
      <button className="button" onClick={sendMessage}>
        Send
      </button>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <span>{msg.payload.timestamp}: </span>
            {msg.payload.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatCard;