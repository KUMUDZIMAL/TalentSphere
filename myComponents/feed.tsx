"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload } from "lucide-react";
import { motion } from "framer-motion";

interface Author {
  username: string;
  profilePicture?: string;
}

interface Post {
  role: string;
  content: string;
  media?: string;
  tags: string[];
  author?: Author;
}

export function Feed() {

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  // Fetch user profile
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/user");
        const data = await response.json();
        setUserProfile(data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUserData();
  }, []);

  // Fetch posts from followed users
  useEffect(() => {
    if (!userProfile) return;

    const fetchFollowedPosts = async () => {
      try {
        const response = await fetch(`/api/posts/following?userId=${userProfile._id}`);
        const data = await response.json();

        // Fetch profile pictures from UserProfile model for each post's author
        const updatedPosts = await Promise.all(
          data.posts.map(async (post: any) => {
            try {
              const userProfileResponse = await fetch(`/api/profileOther/${post.author}`);
              const userProfileData = await userProfileResponse.json();
              return {
                ...post,
                tags: post.tags || [],
                author: {
                  username:userProfileData.user.username || "Anonymous",
                  profilePicture: userProfileData.userProfile.profilePicture || "../noDpImage.jpg",
                },
              };
            } catch (error) {
              console.error(`Failed to fetch profile for user ${post.user}:`, error);
              return { ...post, tags: post.tags || [], author: { username: "Anonymous", profilePicture: "../noDpImage.jpg" } };
            }
          })
        );

        setPosts(updatedPosts);
      } catch (error) {
        console.error("Failed to fetch followed posts:", error);
      }
    };

    fetchFollowedPosts();
  }, [userProfile]);

  const handlePostSubmit = async () => {
    if (!userProfile) return;

    const formData = new FormData();
    formData.append("userId", userProfile._id);
    formData.append("content", "okk");
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
        console.error("Failed to create post:", result.error);
        return;
      }

      const newPost: Post = {
       
        role: "Content Creator",
        content: "okk",
        media: result.post?.media?.[0] ?? "",
        tags: ["New Post"],
        author: {
          username: userProfile.username || "Anonymous",
          profilePicture: userProfile.profilePicture || "../noDpImage.jpg",
        },
      };

      setPosts([newPost, ...posts]);
     
      setSelectedFile(null);
      setPreview(null);
    } catch (error) {
      console.error("Error submitting post:", error);
    }
  };

  return (
    <div className="space-y-6 p-4 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 min-h-screen">
      {/* Create Post Card */}
      <Card className="bg-white/80 border-purple-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <Textarea
            placeholder="Share your latest performance, project, or thoughts..."
            className="border-purple-200 focus:border-purple-300 focus:ring-purple-300 transition-all duration-300"
          />
        </CardHeader>
        <CardContent>
          {preview && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <img src={preview || "/placeholder.svg"} alt="Preview" className="w-1/2 rounded-lg mb-2 shadow-md" />
            </motion.div>
          )}
          <div className="flex flex-wrap gap-2">
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              id="fileUpload"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setSelectedFile(file)
                  setPreview(URL.createObjectURL(file))
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
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600  hover:to-pink-600 transition-colors duration-300"
            >
              Post
            </Button>
          </div>
        </CardContent>
      </Card>
   

      {/* Display Posts */}
      {posts.length > 0 ? (
        posts.map((post, index) => (
          <Card key={index} className="bg-white/90 border-green-200">
            <CardHeader>
              <div className="flex items-center">
                <img
                  src={post.author?.profilePicture || "../noDpImage.jpg"}
                  alt="User avatar"
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                  <h3 className="font-semibold text-purple-600">{post.author?.username || "Anonymous"}</h3>
                  <p className="text-sm text-pink-500">{post.role || "Content Creator"}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-800">{post.content}</p>
              {post.media && <img src={post.media} alt="Post media" className="w-1/2 rounded-lg mb-4" />}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-center text-green-800">No posts to show</p>
      )}
    </div>
  );
}
