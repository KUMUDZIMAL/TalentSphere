"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "../../myComponents/header";
import Link from "next/link";

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<any>(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="pb-2">
            <img src="../coverImage.jpeg" alt="Cover image" className="w-full h-48 object-cover" />
          </CardHeader>
          <CardContent className="relative pt-16">
            <img
              src={userProfile?.profilePicture ? userProfile.profilePicture : '../noDpImage.jpg'}
              alt="User avatar"
              className="w-32 h-32 rounded-full absolute -top-16 left-6 border-4 border-white"
            />
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold">{userProfile?.username || "User"}</h1>
                <p className="text-lg text-gray-600">
                  {userProfile?.professions?.length > 0
                    ? userProfile.professions.join(" | ")
                    : "No profession listed"}
                </p>
              </div>
              <Button>Edit Profile</Button>
            </div>

            {/* About Section */}
            <div>
              <h2 className="text-xl font-semibold mb-2">About</h2>
              <p className="text-gray-600">{userProfile?.about || "No bio available."}</p>
            </div>

            {/* Skills Section */}
            <div>
              <h2 className="text-xl font-semibold mb-2">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {userProfile?.skills?.length > 0 ? (
                  userProfile.skills.map((skill: string, index: number) => <Badge key={index}>{skill}</Badge>)
                ) : (
                  <p className="text-gray-600">No skills listed.</p>
                )}
              </div>
            </div>

            {/* Experience Section */}
            <div>
              <h2 className="text-xl font-semibold mb-2">Experience</h2>
              <ul className="space-y-4">
                {userProfile?.experiences?.length > 0 ? (
                  userProfile.experiences.map((exp: { _id: string; title: string; description: string }) => (
                    <li key={exp._id}>
                      <h3 className="font-semibold">{exp.title}</h3>
                      <p className="text-gray-600">{exp.description}</p>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-600">No experience listed.</p>
                )}
              </ul>
            </div>

            {/* Interests Section */}
            <div>
              <h2 className="text-xl font-semibold mb-2">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {userProfile?.interests?.length > 0 ? (
                  userProfile.interests.map((interest: string, index: number) => <Badge key={index}>{interest}</Badge>)
                ) : (
                  <p className="text-gray-600">No interests listed.</p>
                )}
              </div>
            </div>

            {/* Media Posts Section */}
         

            {/* Back to Dashboard */}
            <div className="mt-8">
              <Link href="/" passHref>
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
