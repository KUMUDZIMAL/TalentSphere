"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Opportunity {
  _id: string;
  title: string;
  date: string; // ISO string (e.g. "2023-06-15T00:00:00.000Z")
}

interface UserProfile {
  _id: string;
  username: string;
  profilePicture?: string;
  professions?: string[];
}

export function Sidebar() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 1) Fetch the logged‑in user’s profile once on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/user");
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = (await res.json()) as UserProfile;
        setUserProfile(data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };
    fetchUser();
  }, []);

  // 2) Fetch all opportunities from /api/opportunities
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const res = await fetch("/api/fetchOpportunities");
        if (!res.ok) throw new Error("Failed to fetch opportunities");
        const json = await res.json();
        // We expect { opportunities: Opportunity[] }
        setOpportunities(json.opportunities || []);
      } catch (err) {
        console.error("Error fetching opportunities:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOpportunities();
  }, []);

  // 3) Navigate to detailed audition page
  const handleViewDetails = (id: string) => {
    router.push(`/auditions/${id}`);
  };

  return (
    <aside className="w-full lg:w-1/2 space-y-6 p-4 bg-gradient-to-b from-purple-100 via-pink-100 to-blue-100">
      {/* —— User Profile Card —— */}
      <Card className="bg-white/90 border-green-200 text-gray-800">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <img
              src={userProfile?.profilePicture ?? "/noDpImage.jpg"}
              alt="User avatar"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h2 className="font-semibold text-lg">
                {userProfile?.username || "User"}
              </h2>
              <p className="text-sm text-green-700">
                {userProfile?.professions && userProfile.professions.length > 0
                  ? userProfile.professions.join(" | ")
                  : "No profession listed"}
              </p>
            </div>
          </div>

          <Link href="/profile" passHref>
            <Button className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-colors duration-300">
              View Full Profile
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* —— Upcoming Opportunities List —— */}
      <Card className="bg-white/90 border-green-200 text-gray-800">
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Auditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : opportunities.length === 0 ? (
            <p className="text-center text-green-800">No opportunities to show</p>
          ) : (
            opportunities.map((opp) => (
              <div
                key={opp._id}
                className="flex items-center justify-between px-2 py-1 hover:bg-gray-50 rounded transition"
              >
                <div>
                  <h3 className="font-semibold">{opp.title}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(opp.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-purple-700 border-purple-700 hover:bg-purple-50 transition-colors duration-300"
                  onClick={() => handleViewDetails(opp._id)}
                >
                  Details
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
