"use client";

import React from "react";
import ChatApp from "@/myComponents/ChatApp";
import { useParams, useSearchParams } from "next/navigation";

const ChatPage: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();

  // 1) Extract receiverId from the dynamic route
  let receiverId = params.receiverId;
  if (Array.isArray(receiverId)) {
    receiverId = receiverId[0];
  }

  // 2) Extract sharedPostId from query string (if any)
  const sharedPostId = searchParams.get("postId") || undefined;

  if (!receiverId) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">TalentSphere Chat</h1>
      {/* Now pass sharedPostId as an optional prop */}
      <ChatApp receiverId={receiverId} sharedPostId={sharedPostId} />
    </div>
  );
};

export default ChatPage;
