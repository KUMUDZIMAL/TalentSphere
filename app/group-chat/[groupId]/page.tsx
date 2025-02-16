// app/group-chat/[groupId]/page.tsx
"use client";
import { useParams } from 'next/navigation';
import ChatApp from '@/myComponents/ChatApp';

const GroupChatPage = () => {
  const params = useParams();
  const groupId = Array.isArray(params.groupId) ? params.groupId[0] : params.groupId;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Group Chat</h1>
      <ChatApp groupId={groupId} />
    </div>
  );
};

export default GroupChatPage;