"use client";
import React, { useEffect, useState, KeyboardEvent } from "react";

interface Message {
  _id: string;
  sender: string;
  content: string;
  createdAt: string;
}

interface ChatAppProps {
  groupId?: string;
  receiverId?: string;
}

const ChatApp: React.FC<ChatAppProps> = ({ groupId, receiverId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch messages on mount and when groupId or receiverId changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        let url = "";
        if (groupId) {
          url = `/api/messages?groupId=${groupId}`;
        } else if (receiverId) {
          url = `/api/messages?receiverId=${receiverId}`;
        } else {
          setError("No receiverId or groupId provided");
          return;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
          setError(null);
        } else if (data.error) {
          setError(data.error);
          setMessages([]);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        setError("Failed to fetch messages");
      }
    };

    fetchMessages(); // Initial fetch on mount

    const intervalId = setInterval(fetchMessages, 5000); // Fetch every 5 seconds

    return () => clearInterval(intervalId); // Clean up interval on unmount
  }, [groupId, receiverId]);

  // Function to send a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return; // Prevent sending empty messages

    try {
      const payload: any = {
        content: newMessage,
      };
      if (groupId) {
        payload.groupId = groupId;
      } else if (receiverId) {
        payload.receiverId = receiverId;
      } else {
        setError("No receiverId or groupId provided");
        return;
      }

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data.newMessage]);
        setNewMessage("");
        setError(null);
      } else {
        setError(data.error || "Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Error sending message");
    }
  };

  // Allow sending the message by pressing Enter
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="chat-app p-4">
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {/* Messages List */}
      <div className="message-list border rounded p-2 mb-4 h-64 overflow-y-auto">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg._id} className="message mb-2 p-2 rounded bg-gray-100">
              <p>{msg.content}</p>
              <small>{new Date(msg.createdAt).toLocaleTimeString()}</small>
            </div>
          ))
        ) : (
          <p>No messages yet.</p>
        )}
      </div>

      {/* Message Input */}
      <div className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          className="p-2 border rounded flex-1"
        />
        <button
          onClick={handleSendMessage}
          className="ml-2 p-2 bg-blue-500 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatApp;
