// File: /myComponents/ChatApp.tsx
"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  KeyboardEvent,
} from "react";

interface SharedPost {
  _id: string;
  content: string;
  media?: string;
  titles?: string[];
  author: {
    username: string;
    profilePicture?: string;
  };
}

interface Message {
  _id: string;
  sender: string;
  content?: string;
  post?: SharedPost;
  createdAt: string;
}

interface ChatAppProps {
  receiverId?: string;
  groupId?: string;
  sharedPostId?: string;
}

const ChatApp: React.FC<ChatAppProps> = ({
  receiverId,
  groupId,
  sharedPostId,
}) => {
  // ─── State ──────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const [sharedPost, setSharedPost] = useState<SharedPost | null>(null);
  const [loadingPost, setLoadingPost] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  // ─── Refs ────────────────────────────────────────────────────────────────
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ─── 1) FETCH & POPULATE SHARED POST ─────────────────────────────────────
  useEffect(() => {
    // If no sharedPostId was provided, skip the fetch entirely.
    if (!sharedPostId) {
      setPostError(null);
      setSharedPost(null);
      return;
    }

    let isCanceled = false;
    const controller = new AbortController();

    const fetchSharedPost = async () => {
      setLoadingPost(true);
      setPostError(null);

      try {
        console.log("Fetching shared post with ID:", sharedPostId);

        const res = await fetch(
          `/api/posts/${sharedPostId}?populate=author`,
          { signal: controller.signal }
        );

        console.log("→ /api/posts response status:", res.status);

        if (!res.ok) {
          let text = `<no body>`;
          try {
            const errJson = await res.json();
            text = errJson.error || JSON.stringify(errJson);
          } catch (e) {
            text = await res.text();
          }
          throw new Error(
            `Failed to fetch post (status ${res.status}): ${text}`
          );
        }

        const postJson = (await res.json()) as SharedPost;
        console.log("→ /api/posts response JSON:", postJson);

        // Basic validation of the shape
        if (!postJson._id || !postJson.content) {
          throw new Error(
            `Returned post object is missing required fields: ${JSON.stringify(
              postJson
            )}`
          );
        }

        if (!isCanceled) {
          setSharedPost(postJson);
          setPostError(null);
        }
      } catch (err: any) {
        if (!isCanceled) {
          console.error("Error fetching shared post:", err);
          setPostError(err.message);
          setSharedPost(null);
        }
      } finally {
        if (!isCanceled) {
          setLoadingPost(false);
        }
      }
    };

    fetchSharedPost();

    return () => {
      isCanceled = true;
      controller.abort();
    };
  }, [sharedPostId]);

  // ─── 2) POLL FOR NEW MESSAGES (ON MOUNT & EVERY 5s) ───────────────────────
  useEffect(() => {
    let isCanceled = false;
    const controller = new AbortController();

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        if (!receiverId && !groupId) {
          setError("No receiverId or groupId provided");
          setMessages([]);
          return;
        }

        const params = new URLSearchParams();
        if (groupId) params.set("groupId", groupId);
        if (receiverId) params.set("receiverId", receiverId);

        const url = `/api/messages?${params}`;
        console.log("Fetching messages from:", url);

        const res = await fetch(url, {
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Status ${res.status}`);
        }

        const data = (await res.json()) as { messages: Message[] };
        if (!isCanceled) {
          setMessages(data.messages);
          setError(null);
        }
      } catch (err: any) {
        if (!isCanceled) {
          console.error("Failed to fetch messages:", err);
          setError(err.message || "Failed to fetch messages");
          setMessages([]);
        }
      } finally {
        if (!isCanceled) {
          setLoadingMessages(false);
          setTimeout(scrollToBottom, 50);
        }
      }
    };

    // Initial fetch
    fetchMessages();

    // Poll every 5 seconds
    intervalRef.current = setInterval(fetchMessages, 5000);

    return () => {
      isCanceled = true;
      controller.abort();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [receiverId, groupId]);

  // ─── 3) SEND A NEW TEXT MESSAGE ────────────────────────────────────────────
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim()) return;

    try {
      const payload: Record<string, string> = {
        content: newMessage.trim(),
      };
      if (groupId) payload.groupId = groupId;
      else if (receiverId) payload.receiverId = receiverId;
      else {
        setError("No receiverId or groupId provided");
        return;
      }

      console.log("Sending message payload:", payload);

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Status ${res.status}`);
      }

      setMessages((prev) => [...prev, data.newMessage]);
      setNewMessage("");
      setError(null);
      setTimeout(scrollToBottom, 50);
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.message || "Error sending message");
    }
  }, [newMessage, groupId, receiverId]);

  // ─── 4) SEND ON ENTER KEY ─────────────────────────────────────────────────
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSendMessage();
  };

  return (
    <div className="chat-app flex h-full flex-col p-4">
      {/* ─── Global Errors ───────────────────────────────────────────────────── */}
      {error && (
        <p className="mb-2 text-red-500">
          <strong>Chat Error:</strong> {error}
        </p>
      )}

      {/* ─── Shared Post Section ─────────────────────────────────────────────── */}
      {sharedPostId && (
        <>
          {loadingPost ? (
            <p className="mb-4 text-gray-600">Loading shared post…</p>
          ) : postError ? (
            <p className="mb-4 text-red-600">
              <strong>Post Error:</strong> {postError}
            </p>
          ) : sharedPost ? (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50">
              <div className="flex items-center space-x-2 p-3">
                <img
                  src={sharedPost.author?.profilePicture || "/noDpImage.jpg"}
                  alt={sharedPost.author?.username || "Unknown User"}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="font-semibold">
                  {sharedPost.author?.username || "Unknown User"}
                </span>
              </div>
              <div className="px-4 pb-4">
                <p className="text-gray-800">{sharedPost.content}</p>
                {sharedPost.media && (
                  <img
                    src={sharedPost.media}
                    alt="Shared media"
                    className="mt-2 w-full rounded-lg"
                  />
                )}
                {sharedPost.titles && sharedPost.titles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sharedPost.titles.map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded bg-blue-100 px-2 py-1 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="mb-4 text-gray-500">
              (No shared post to display.)
            </p>
          )}
        </>
      )}

      {/* ─── Messages List Section ────────────────────────────────────────────── */}
      <div className="message-list mb-4 flex-1 overflow-y-auto rounded border p-2">
        {loadingMessages ? (
          <p className="text-center text-gray-600">Loading messages…</p>
        ) : messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg._id}
              className="mb-2 rounded bg-gray-100 p-2 text-sm"
            >
              {msg.post ? (
                <div className="rounded-lg border border-green-200 bg-green-50">
                  <div className="flex items-center space-x-2 p-2">
                    <img
                      src={
                        msg.post.author?.profilePicture || "/noDpImage.jpg"
                      }
                      alt={msg.post.author?.username || "Unknown User"}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                    <span className="font-semibold">
                      {msg.post.author?.username || "Unknown User"}
                    </span>
                  </div>
                  <div className="px-3 pb-3">
                    <p className="text-gray-800">{msg.post.content}</p>
                    {msg.post.media && (
                      <img
                        src={msg.post.media}
                        alt="Shared media"
                        className="mt-2 w-full rounded-lg"
                      />
                    )}
                    {msg.post.titles && msg.post.titles.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.post.titles.map((tag, i) => (
                          <span
                            key={i}
                            className="rounded bg-green-100 px-2 py-1 text-green-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
              <small className="text-xs text-gray-500">
                {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </small>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No messages yet.</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ─── Message Input Section ───────────────────────────────────────────── */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 rounded border px-3 py-2 focus:outline-none"
        />
        <button
          onClick={handleSendMessage}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatApp;
