"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OtherUserProfile() {
  const { userId } = useParams();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) return;

    async function fetchProfile() {
      try {
        // Adjust the API endpoint as needed.
        const response = await fetch(`/api/profileOther/${userId}`);
        if (!response.ok) {
          throw new Error("Profile not found");
        }
        const data = await response.json();
        // Store the entire object that includes both userProfile and user.
        setProfileData(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [userId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Check that profileData and profileData.user exist.
  if (!profileData || !profileData.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Profile not found.</p>
        <Button onClick={() => router.back()} className="ml-4">
          Back
        </Button>
      </div>
    );
  }

  // Destructure the returned data
  const { user, userProfile } = profileData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <Card className="max-w-3xl mx-auto mt-8">
        <CardHeader className="pb-2">
          <img
            src={userProfile.coverImage || "../coverImage.jpeg"}
            alt="Cover image"
            className="w-full h-48 object-cover"
          />
        </CardHeader>
        <CardContent className="relative pt-16">
          <img
            src={userProfile.profilePicture || "../noDpImage.jpg"}
            alt="User avatar"
            className="w-32 h-32 rounded-full absolute -top-16 left-6 border-4 border-white"
          />
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold">{user.username || "User"}</h1>
              <p className="text-lg text-gray-600">
                {userProfile.professions && userProfile.professions.length > 0
                  ? userProfile.professions.join(" | ")
                  : "No profession listed"}
              </p>
            </div>
            <Button onClick={() => router.back()}>Back</Button>
          </div>

          {/* About Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p className="text-gray-600">{userProfile.about || "No bio available."}</p>
          </div>

          {/* Skills Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {userProfile.skills && userProfile.skills.length > 0 ? (
                userProfile.skills.map((skill: string, idx: number) => (
                  <Badge key={idx}>{skill}</Badge>
                ))
              ) : (
                <p className="text-gray-600">No skills listed.</p>
              )}
            </div>
          </div>

          {/* Experience Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Experience</h2>
            <ul className="space-y-4">
              {userProfile.experiences && userProfile.experiences.length > 0 ? (
                userProfile.experiences.map((exp: any) => (
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
              {userProfile.interests && userProfile.interests.length > 0 ? (
                userProfile.interests.map((interest: string, idx: number) => (
                  <Badge key={idx}>{interest}</Badge>
                ))
              ) : (
                <p className="text-gray-600">No interests listed.</p>
              )}
            </div>
          </div>
          <div className="mt-8">
              <Link href="/dashboard" passHref>
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
