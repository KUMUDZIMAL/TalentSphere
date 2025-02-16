"use client";
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { set } from 'mongoose';


export function Sidebar() {
  const [userProfile, setUserProfile] = useState<any>(null);

  // Fetch user ID and username
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/user');
        const data = await response.json();
       
        setUserProfile(data);
      } catch (error) {
        console.error('Failed to fetch user ID:', error);
      }
    };
    fetchUserData();
  }, []);


   
 // Allow userId to be null initially
  
      // Fetch userId when the component mounts
     
  return (
    <aside className="w-0.75 lg:w-80 space-y-6 p-4 bg-gradient-to-b  from-purple-100 via-pink-100 to-blue-100">
      <Card className="bg-white/90 border-green-200 text-gray-800">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <img src={userProfile?.profilePicture?userProfile.profilePicture:'../noDpImage.jpg'}alt="User avatar" className="w-16 h-16 rounded-full" />
            <div>
              <h2 className="font-semibold text-lg">{userProfile?.username?userProfile.username:'User'}</h2>
              <p className="text-sm text-green-700">     {userProfile?.professions?.length > 0 
                    ? userProfile.professions.join(" | ") 
                    : "No profession listed"}</p>
            </div>
          </div>
          <Link href="/profile" passHref>
            <Button className=" bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-colors duration-300w-full mt-4" variant="outline">
              View Full Profile
            </Button>
          </Link>
        </CardContent>
      </Card>
      <Card className="bg-white/90 border-green-200 text-gray-800">
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Auditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { title: "Lead Role in 'Starlight'", date: "June 15, 2023" },
            { title: "Voice Over for Animated Series", date: "June 20, 2023" },
            { title: "Dance Ensemble for Music Video", date: "June 25, 2023" },
          ].map((audition, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{audition.title}</h3>
                <p className="text-sm text-green-700">{audition.date}</p>
              </div>
              <Button variant="outline" size="sm" className=" text-purple-700 border-purple-700  hover:bg-purple-50 transition-colors duration-300 active:bg-gradient-to-r from-purple-500 to-pink-500">
                Details
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </aside>
  )
}

