// /app/opportunities/new/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IUserProfile {
  _id: string;
  username: string;
  // other fields your /api/auth/user returns...
}

export default function NewOpportunityPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [requirements, setRequirements] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 1) Fetch the logged‑in user so we know userProfile._id
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/user");
        if (!res.ok) {
          console.error("Failed to fetch user:", await res.text());
          return;
        }
        const data = await res.json();
        setUserProfile(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 2) Must be logged in
    if (!userProfile) {
      setError("You must be logged in to post an opportunity.");
      return;
    }

    // 3) Validate required fields
    if (!title.trim() || !description.trim() || !location.trim() || !date) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userProfile._id,
          title: title.trim(),
          description: description.trim(),
          location: location.trim(),
          date,
          requirements: requirements.trim(),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Failed to create opportunity.");
        setLoading(false);
        return;
      }

      // 4) On success, redirect to /opportunities (you can list all)
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Post New Opportunity</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ex: Lead role for short film"
                className="mt-1 w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Describe the role, shooting dates, pay, etc."
                className="mt-1 w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                placeholder="City, City-State, or Studio address"
                className="mt-1 w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="mt-1 w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Requirements (optional)
              </label>
              <Textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Ex: Must have prior dance experience, age 18+, etc."
                className="mt-1 w-full"
              />
            </div>

            {error && <p className="text-red-600">{error}</p>}

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Posting..." : "Post Opportunity"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
