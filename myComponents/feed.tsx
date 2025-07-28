"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  MessageCircle,
  Share2,
  Bookmark,
  Heart,
} from "lucide-react";
import { FaHeart } from "react-icons/fa"; // Filled Heart
import { BsBookmarkFill } from "react-icons/bs"; // Filled Bookmark
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";

interface Author {
  _id: string;
  username: string;
  profilePicture?: string;
}

interface CommentItem {
  _id: string;
  text: string;
  createdAt: string;
  author: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
}

interface PostItem {
  _id: string;
  role: string;
  content: string;
  media?: string;
  titles: string[];        // renamed from "tags"
  author: Author;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
  createdAt: string;
  comments?: CommentItem[];
}

interface UserProfile {
  _id: string;
  username: string;
  profilePicture?: string;
}

// Each "following" user we'll list has at least these fields:
interface FollowingUser {
  _id: string;
  username: string;
  profilePicture?: string;
}

export function Feed() {
  const router = useRouter();

  // ───────── Feed-level state ─────────────
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [postError, setPostError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [postContent, setPostContent] = useState("");

  // ───────── "Share to following" modal state ─────────────
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [currentPostToShare, setCurrentPostToShare] = useState<string | null>(null);
  const [followingList, setFollowingList] = useState<FollowingUser[]>([]);
  const [shareLoading, setShareLoading] = useState<boolean>(false);
  const [shareError, setShareError] = useState<string | null>(null);

  // 1) Fetch the logged-in user on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/user");
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = (await res.json()) as UserProfile;
        setUserProfile(data);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    })();
  }, []);

  // 2) Fetch "following" posts once userProfile is known
  useEffect(() => {
    if (!userProfile) return;

    const fetchAllPosts = async () => {
      try {
        const res = await fetch(`/api/posts/following?userId=${userProfile._id}`);
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Failed to fetch posts: ${res.status} - ${errText}`);
        }
        const json = await res.json();
        let fetchedPosts: PostItem[] = json.posts;

        // For each post, check likedByMe / savedByMe
        const withStatus = await Promise.all(
          fetchedPosts.map(async (p: any) => {
            try {
              const statusRes = await fetch(
                `/api/posts/${p._id}/status?userId=${userProfile._id}`
              );
              const statusJson = await statusRes.json();
              return {
                ...p,
                likedByMe: statusJson.likedByMe,
                savedByMe: statusJson.savedByMe,
              } as PostItem;
            } catch (err) {
              console.error("Failed to fetch status for ", p._id, err);
              return {
                ...p,
                likedByMe: false,
                savedByMe: false,
              } as PostItem;
            }
          })
        );

        setPosts(withStatus);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };

    fetchAllPosts();
  }, [userProfile]);

  // 3) Create a new post (simplified stub)
  const handlePostSubmit = async () => {
    if (!userProfile) return;
    setPostError(null); // Clear previous error
    if (!postContent.trim()) {
      setPostError("Post content cannot be empty");
      return;
    }
    const formData = new FormData();
    formData.append("userId", userProfile._id);
    formData.append("content", postContent);
    formData.append("caption", "A new post");
    if (selectedFile) {
      formData.append("media", selectedFile);
    }

    try {
      const response = await fetch("/api/posts/uploads", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        setPostError(result.error || "Failed to create post");
        return;
      }

      const newPost: PostItem = {
        _id: result.post._id,
        role: "Content Creator",
        content: postContent,
        media: result.post.media[0] || "",
        titles: ["New Post"],
        author: {
          _id: userProfile._id,
          username: userProfile.username,
          profilePicture: userProfile.profilePicture,
        },
        likeCount: 0,
        commentCount: 0,
        likedByMe: false,
        savedByMe: false,
        createdAt: new Date().toISOString(),
      };
      setPosts([newPost, ...posts]);
      setSelectedFile(null);
      setPreview(null);
      setPostContent(""); // Clear input after post
      setPostError(null); // Clear error on success
    } catch (error: any) {
      setPostError(error.message || "Error submitting post");
    }
  };

  // 4) Toggle like/unlike
  const toggleLike = async (postId: string) => {
    if (!userProfile) return;
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userProfile._id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to toggle like");

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, likedByMe: json.likedByMe, likeCount: json.likeCount }
            : p
        )
      );
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  // 5) Toggle save/unsave
  const toggleSave = async (postId: string) => {
    if (!userProfile) return;
    try {
      const res = await fetch(`/api/posts/${postId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userProfile._id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to toggle save");

      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, savedByMe: json.savedByMe } : p))
      );
    } catch (err) {
      console.error("Error toggling save:", err);
    }
  };

  // 6) Add a comment
  const addComment = async (postId: string) => {
    if (!userProfile) return;
    setCommentError(null); // Clear previous error
    const text = prompt("Enter your comment:");
    if (!text) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userProfile._id, text }),
      });
      const json = await res.json();
      if (!res.ok) {
        setCommentError(json.error || "Failed to add comment");
        return;
      }

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, commentCount: json.commentCount } : p
        )
      );
      setCommentError(null); // Clear error on success
    } catch (err: any) {
      setCommentError(err.message || "Error adding comment");
    }
  };

  // 7) Open the "share to following" modal
  const openShareModal = async (postId: string) => {
    if (!userProfile) return;
    setShareError(null);
    setShareLoading(true);
    setCurrentPostToShare(postId);

    try {
      const res = await fetch(`/api/users/following?userId=${userProfile._id}`);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Failed to fetch following: ${res.status} - ${txt}`);
      }
      const json = await res.json();
      setFollowingList(json.following || []);
      setShareModalOpen(true);
    } catch (err) {
      console.error("Error fetching following list:", err);
      setShareError("Failed to load your following list.");
    } finally {
      setShareLoading(false);
    }
  };

  // 8) Share the post by sending a Message record, then navigate to chat
  const shareToUser = async (toUserId: string) => {
    if (!userProfile || !currentPostToShare) return;
    setShareError(null);
    setShareLoading(true);

    try {
      // Fetch the complete post data from the API using the correct path
      const postRes = await fetch(`/api/posts/[id]/${currentPostToShare}?populate=author`);
      if (!postRes.ok) {
        const errorData = await postRes.json();
        throw new Error(errorData.error || "Failed to fetch post data");
      }
      const postData = await postRes.json();

      // Send the complete post data to the chat
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromUserId: userProfile._id,
          toUserId,
          post: postData
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to share post in chat");
      }

      // After sending, navigate to their chat
      router.push(`/chat/${toUserId}`);
    } catch (err: any) {
      console.error("Error sharing post:", err);
      setShareError(err.message || "Error sharing post");
    } finally {
      setShareLoading(false);
      setShareModalOpen(false);
      setCurrentPostToShare(null);
    }
  };

  return (
    <div className="space-y-6 p-4 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 min-h-screen">
      {/* Alert for post errors */}
      {postError && (
        <Alert variant="destructive" className="mb-4">
          <span>{postError}</span>
        </Alert>
      )}
      {/* Alert for comment errors */}
      {commentError && (
        <Alert variant="destructive" className="mb-4">
          <span>{commentError}</span>
        </Alert>
      )}
      {/* ───── Create Post + Action Buttons ───────────────────────── */}
      <Card className="bg-white/80 border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <Textarea
            placeholder="Share your latest performance, project, or thoughts..."
            className="border-purple-200 focus:border-purple-300 focus:ring-purple-300 transition-all duration-300"
            value={postContent}
            onChange={e => setPostContent(e.target.value)}
          />
        </CardHeader>
        <CardContent>
          {preview && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={preview || "/placeholder.svg"}
                alt="Preview"
                className="w-1/2 rounded-lg mb-2 shadow-md"
              />
            </motion.div>
          )}

          <div className="flex flex-wrap gap-2">
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              id="fileUpload"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFile(file);
                  setPreview(URL.createObjectURL(file));
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="text-purple-700 border-purple-700 hover:bg-purple-50 transition-colors duration-300 active:bg-gradient-to-r from-purple-500 to-pink-500"
              onClick={() => document.getElementById("fileUpload")?.click()}
            >
              <Upload className="mr-2 h-4 w-4" /> Upload File
            </Button>
            <Button
              onClick={handlePostSubmit}
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-colors duration-300"
            >
              Post
            </Button>
            <Button
              onClick={() => router.push("/Portfolio")}
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-colors duration-300"
            >
              Make Portfolio
            </Button>
            <Button
              onClick={() => router.push("/Project")}
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-colors duration-300"
            >
              Manage Work
            </Button>
            <Button
              onClick={() => router.push("/Opportunity")}
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-colors duration-300"
            >
              Post Opportunity
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ───── Display Each Post ─────────────────────────────────────── */}
      {posts.length > 0 ? (
        posts.map((post) => {
          console.log(`Post ${post._id} likedByMe:`, post.likedByMe);
          return (
            <Card key={post._id} className="bg-white/90 border-green-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img
                      src={post.author.profilePicture || "/noDpImage.jpg"}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-purple-600">
                        {post.author.username}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-gray-800">{post.content}</p>
                {Array.isArray(post.media) && post.media.length > 0 && post.media[0] && post.media[0].trim() !== "" && (
                  <img
                    src={post.media[0]}
                    alt="Post media"
                    className="w-full rounded-lg mb-2"
                  />
                )}
                <div className="flex flex-wrap gap-2 mb-2">
                  {post.titles?.map((tag, idx) => (
                    <Badge key={idx} className="bg-green-100 text-green-800">
                      {tag}
                    </Badge>
                  ))}
                </div>
                {/* Comments Section */}
                {post.comments && post.comments.length > 0 && (
                  <div className="mt-2">
                    <div className="font-semibold text-purple-700 mb-1">Comments:</div>
                    {post.comments.map((comment) => (
                      <div key={comment._id} className="flex items-start gap-2 mb-2">
                        <img
                          src={comment.author.profilePicture || "/noDpImage.jpg"}
                          alt={comment.author.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <span className="font-medium text-purple-600">{comment.author.username}</span>
                          <span className="ml-2 text-gray-600 text-xs">{new Date(comment.createdAt).toLocaleString()}</span>
                          <div className="text-gray-800">{comment.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 text-gray-600 mt-2">
                  {/* Like / Unlike */}
                  {post.likedByMe ? (
                    <FaHeart
                      className="text-red-500 cursor-pointer"
                      size={20}
                      onClick={() => toggleLike(post._id)}
                    />
                  ) : (
                    <Heart
                      className="cursor-pointer"
                      size={20}
                      onClick={() => toggleLike(post._id)}
                    />
                  )}
                  <span>{post.likeCount}</span>

                  {/* Comment */}
                  <button
                    className="flex items-center space-x-1"
                    onClick={() => addComment(post._id)}
                  >
                    <MessageCircle className="cursor-pointer" size={20} />
                    <span>{post.commentCount}</span>
                  </button>

                  {/* Share: opens the "share to following" modal */}
                  <Share2
                    className="cursor-pointer"
                    size={20}
                    onClick={() => openShareModal(post._id)}
                  />

                  {/* Save / Unsave */}
                  {post.savedByMe ? (
                    <BsBookmarkFill
                      className="text-blue-600 cursor-pointer"
                      size={20}
                      onClick={() => toggleSave(post._id)}
                    />
                  ) : (
                    <Bookmark
                      className="cursor-pointer"
                      size={20}
                      onClick={() => toggleSave(post._id)}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <p className="text-center text-green-800">No posts to show</p>
      )}

      {/* ───── "Share to Following" Modal ─────────────────────────────── */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-11/12 max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Share Post</h2>

            {shareLoading ? (
              <p>Loading your following list…</p>
            ) : shareError ? (
              <p className="text-red-600">{shareError}</p>
            ) : (
              <>
                {followingList.length === 0 ? (
                  <p className="text-gray-600">You're not following anyone.</p>
                ) : (
                  <ul className="space-y-3 max-h-60 overflow-y-auto">
                    {followingList.map((user) => (
                      <li
                        key={user._id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                        onClick={() => shareToUser(user._id)}
                      >
                        <img
                          src={user.profilePicture || "/noDpImage.jpg"}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="font-medium">{user.username}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            shareToUser(user._id);
                          }}
                        >
                          Message
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShareModalOpen(false);
                  setCurrentPostToShare(null);
                  setShareError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
