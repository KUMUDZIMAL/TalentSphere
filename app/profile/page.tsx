"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "../../myComponents/header"
import Link from "next/link"

export default function ProfilePage() {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    useEffect(() => {
      const fetchUserId = async () => {
        try {
          const response = await fetch('/api/auth/user');
          const data = await response.json();
          setUserId(data.userId); 
          setUsername(data.username); // Set the userId state
        } catch (error) {
          console.error('Failed to fetch user ID:', error);
        }
      };
  
      fetchUserId();
    }, []);
      useEffect(() => {
          const fetchProfilePicture = async () => {
            const response = await fetch(`/api/auth/userprofile`);
            const data = await response.json();
            console.log(data.exists)
            setProfilePicture(data.profilePicture);
          };
      
          fetchProfilePicture();''
        }, [userId]);
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <Header/>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="pb-2">
            <img
              src="/placeholder.svg?height=60&width=240"
              alt="Cover image"
              className="w-full h-48 object-cover rounded-t-lg"
            />
          </CardHeader>
          <CardContent className="relative pt-16">
            <img
              src={profilePicture?profilePicture:'../noDpImage.jpg'}
              alt="User avatar"
              className="w-32 h-32 rounded-full absolute -top-16 left-6 border-4 border-white"
            />
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold">{username}</h1>
                <p className="text-lg text-gray-600">Actress | Singer | Dancer</p>
              </div>
              <Button>Edit Profile</Button>
            </div>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">About</h2>
                <p className="text-gray-600">
                  Versatile performer with 10+ years of experience in film, theater, and music. Passionate about
                  bringing characters to life and creating memorable performances.
                </p>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  <Badge>Method Acting</Badge>
                  <Badge>Improvisation</Badge>
                  <Badge>Vocal Performance</Badge>
                  <Badge>Contemporary Dance</Badge>
                  <Badge>Stage Combat</Badge>
                  <Badge>Accent Work</Badge>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Experience</h2>
                <ul className="space-y-4">
                  <li>
                    <h3 className="font-semibold">Lead Role in "City Lights"</h3>
                    <p className="text-gray-600">Independent Film | 2022</p>
                  </li>
                  <li>
                    <h3 className="font-semibold">Supporting Role in "Broadway Nights"</h3>
                    <p className="text-gray-600">Theater Production | 2021</p>
                  </li>
                  <li>
                    <h3 className="font-semibold">Voice Actor in "Animated Adventures"</h3>
                    <p className="text-gray-600">Animated Series | 2020-2021</p>
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Stats</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold">1,234</p>
                    <p className="text-gray-600">Profile Views</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">5,678</p>
                    <p className="text-gray-600">Performance Views</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Link href="/" passHref>
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

