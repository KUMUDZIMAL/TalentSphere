"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

const RoomPage: React.FC = () => {
  // useParams from next/navigation returns an object with your route parameters.
  const { RoomId } = useParams();
  const [userId, setUserId] = useState("");
  const [username, setUserName] = useState("");
  const meetingRef = useRef<HTMLDivElement>(null);

  console.log("RoomId from params:", RoomId);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/auth/user");
        const data = await response.json();
        console.log("User data fetched:", data);
        setUserId(data._id);
        setUserName(data.username);
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };

    fetchUserProfile();
  }, []);

  // Initialize the meeting only on the client side once all dependencies are ready.
  useEffect(() => {
    console.log("Checking initialization dependencies:", {
      RoomId,
      userId,
      username,
      container: meetingRef.current,
    });
    if (RoomId && userId && username && meetingRef.current) {
      const initMeeting = async (element: HTMLDivElement) => {
        console.log(
          "Initializing meeting with RoomId:",
          RoomId,
          "userId:",
          userId,
          "username:",
          username
        );
        const { ZegoUIKitPrebuilt } = await import("@zegocloud/zego-uikit-prebuilt");
        console.log("ZegoUIKitPrebuilt loaded:", ZegoUIKitPrebuilt);
        const AppId = 74206127;
        const ServerSecret = "20a0c3c047ae13bf7a606cd5fef59b3e";
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          AppId,
          ServerSecret,
          RoomId,
          userId,
          username
        );
        const zc = ZegoUIKitPrebuilt.create(kitToken);
        zc.joinRoom({
          container: element,
          sharedLinks: [
            {
              name: "Copy Link",
              url: `https://localhost:3000/video-call/${RoomId}`, // note: 'url' in lowercase
              scenario: {
                mode: ZegoUIKitPrebuilt.OneONoneCall,
              },
            },
          ],
        });
        console.log("Meeting initialized");
      };

      initMeeting(meetingRef.current);
    }
  }, [RoomId, userId, username]);

  return (
    <div>
      {/* Adding a border to verify that the container is visible */}
      <div ref={meetingRef} style={{ width: "100%", border: "2px solid red" }} />
    </div>
  );
};

export default RoomPage;
