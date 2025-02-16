"use client";
import Link from "next/link";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Home, Search, Users, Video, Music, Theater } from "lucide-react";

export function Header({ userId }: { userId: string }) {
  const router = useRouter();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null); // Allow userId to be null initially

  useEffect(() => {
    const fetchProfilePicture = async () => {
      const response = await fetch(`/api/auth/userprofile`);
      const data = await response.json();
      setProfilePicture(data.profilePicture);
    };

    fetchProfilePicture();
  }, [userId]);

  // Fetch userId when the component mounts
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch('/api/auth/user');
        const data = await response.json();
        setUsername(data.username); // Set the userId state
      } catch (error) {
        console.error('Failed to fetch user ID:', error);
      }
    };

    fetchUserId();
  }, []);

  const handleLogout = async () => {
    try {
      // Perform logout logic, for example clearing session or calling API
      await fetch('/api/auth/logout', { method: 'POST' });

      // Redirect the user to the home or login page after logout
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-white">
              TalentSphere
            </Link>
            <div className="ml-4 relative">
              <Input
                type="search"
                placeholder="Search talents, gigs, or projects"
                className="pl-10 w-64 bg-white border-white/20 text-white placeholder-white/60 focus:bg-white focus:text-gray-900 transition-all duration-300"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
            </div>
          </div>
          <nav className="hidden md:flex space-x-4">
            {[
              { icon: Home, label: "Home" },
              { icon: Users, label: "Network", onclick: () => router.push('/network') },
              { icon: Video, label: "Videos" },
              { icon: Music, label: "Music" },
              { icon: Theater, label: "Events" },
              { icon: Bell, label: "Notifications" },
            ].map((item, index) => (
              <Button
                key={index}
                onClick={item.onclick}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/30 hover:text-white transition-colors duration-300"
              >
                <item.icon size={32} /> {/* Increased size to 32 */}
                <span className="sr-only">{item.label}</span>
              </Button>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/profile" className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/10 hover:bg-white/30 transition-colors duration-300"
              >
                <img src={profilePicture ? profilePicture : '../noDpImage.jpg'} alt="User avatar" className="w-8 h-8 rounded-full" />
              </Button>
              <span className="text-white font-medium">{username ? username : '<p>User</p>'}</span>
            </Link>
            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="icon"
              className="bg-white/10 hover:bg-white/30 transition-colors duration-300"
            >
              <span className="text-white">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
