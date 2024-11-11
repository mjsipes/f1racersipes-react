import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient";

const Chat = () => {
  const [messages, setMessages] = useState([]); // List of messages
  const [newMessage, setNewMessage] = useState(""); // Message input

  useEffect(() => {
    // Set up a Supabase channel for real-time chat messages
    const channel = supabase.channel("chat-room");

    // Listen for incoming messages
    channel
      .on("broadcast", { event: "new-message" }, (payload) => {
        setMessages((prevMessages) => [...prevMessages, payload]);
      })
      .subscribe();

    // Cleanup on component unmount
    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Function to send a new message
  const sendMessage = async () => {
    if (newMessage.trim() !== "") {
      // Broadcast the message to other clients in the "chat-room" channel
      await supabase.channel("chat-room").send({
        type: "broadcast",
        event: "new-message",
        payload: {
          content: newMessage,
          timestamp: new Date().toLocaleTimeString(),
        },
      });
      setNewMessage(""); // Clear the input field
    }
  };

  return (
    <div>
      <h2>Simple Chat</h2>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <span>{msg.payload.timestamp}: </span>
            {msg.payload.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
