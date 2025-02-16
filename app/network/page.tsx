"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Adjust your UI import as needed
import { UserPlus } from "lucide-react"; // Import the icon
import io from "socket.io-client"; // (If used elsewhere in your code)

interface UserData {
  _id: string;
  username: string;
}

interface LoggedInUser {
  _id: string;
  username: string;
  // any other properties
  users?: UserData[]; // Assuming your API returns an array of users in "users"
}

export default function UserList() {
  const [userProfile, setUserProfile] = useState<LoggedInUser | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);
  const [userId, setUserId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await fetch("/api/auth/user");
        const data: LoggedInUser = await res.json();
        if (data) {
          setLoggedInUser(data);
          setUserId(data._id);
          setUsers(data.users || []); // Ensure users is an array
          setUserProfile(data);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    }
    fetchUserData();
  }, []);

  const handleFollow = async (targetUserId: string) => {
    if (!userProfile) {
      console.error("Logged in user not loaded yet");
      return;
    }
    try {
      const response = await fetch("/api/follow", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followerId: userProfile._id,
          followingId: targetUserId,
        }),
      });

      if (response.ok) {
        console.log(`Successfully followed user with id: ${targetUserId}`);
      } else {
        const errorData = await response.json();
        console.error("Failed to follow user:", errorData);
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleViewProfile = (targetUserId: string) => {
    router.push(`/profileOther/${targetUserId}`);
  };

  // Handle the video call initiation
  const handleVideoCall = (targetUserId: string) => {
    if (!userId) {
      console.error("User ID not available.");
      return;
    }
    // Generate a unique roomID for the video call (e.g., a combination of caller and target user IDs)

    router.push(`/room`);
  };

  return (
    <div className="min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Users You May Know</h2>
      {users.map((user) => (
        <div
          key={user._id}
          className="flex items-center justify-between p-3 mb-3 border rounded"
        >
          <div>
            <p className="font-medium">{user.username}</p>
          </div>
          <Button onClick={() => handleVideoCall(user._id)}>Video Call</Button>
          <Button
            className="bg-gradient-to-r from-[#10A881] to-[#1BCA9B] text-white font-semibold hover:from-[#1BCA9B] hover:to-[#53E0BC] transition-all duration-300"
            size="sm"
            onClick={() => handleFollow(user._id)}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Follow
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-[#53E0BC] text-[#10A881] hover:bg-[#E8FFF7] hover:text-[#1BCA9B] transition-all duration-300"
            onClick={() => handleViewProfile(user._id)}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Profile
          </Button>
          <Link href={`/chat/${user._id}`}>
            <Button
              variant="outline"
              size="sm"
              className="border-[#53E0BC] text-[#10A881] hover:bg-[#E8FFF7] hover:text-[#1BCA9B] transition-all duration-300"
            >
              Message
            </Button>
          </Link>
          <div className="flex gap-2">
  <Link href="/create-group">
    <Button variant="outline">
      Create Group
    </Button>
  </Link>
  {/* Existing buttons */}
</div>
        </div>
      ))}
    </div>
  );
}
