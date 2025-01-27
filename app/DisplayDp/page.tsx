"use client";
import { useState, useEffect } from 'react';
import Profile from "@/myComponents/DisplayDp";
import { Header } from "../../myComponents/header";

export default function Dashboard() {
  const [userId, setUserId] = useState<string | null>(null); // Allow userId to be null initially

  // Fetch userId when the component mounts
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch('/api/auth/user');
        const data = await response.json();
        setUserId(data._id); // Set the userId state
      } catch (error) {
        console.error('Failed to fetch user ID:', error);
      }
    };

    fetchUserId();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
<<<<<<< HEAD
      <Header />
      {userId ? ( // Render Profile only when userId is not null
        <Profile userId={userId} />
=======
     
      {userId ? ( // Render Profile only when userId is not null
      <>
       <Header userId={userId}/>
        <Profile userId={userId} />
        </>
>>>>>>> 33aff6e (done)
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
