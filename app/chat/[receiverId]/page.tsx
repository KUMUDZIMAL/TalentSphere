"use client";
import React from "react";
import ChatApp from "@/myComponents/ChatApp";
import { useParams } from "next/navigation";

const ChatPage: React.FC = () => {
  const params = useParams();
  // Ensure receiverId is a string
  let receiverId = params.receiverId;
  if (Array.isArray(receiverId)) {
    receiverId = receiverId[0];
  }

  if (!receiverId) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">TalentSphere Chat</h1>
      <ChatApp receiverId={receiverId} />
    </div>
  );
};

export default ChatPage;
