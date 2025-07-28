"use client";
import React, { useEffect, useState } from "react";

interface UserProfile {
  _id: string;
  username: string;
  skills: string[];
  interests: string[];
}

interface Recommendation {
  profile: UserProfile;  // note the nested profile
  similarity: number;
  // If you also return username separately, you could include that too.
}

interface RecommendationsProps {
  targetUserId: string;
}

const Recommendations: React.FC<RecommendationsProps> = ({ targetUserId }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch(`/api/recommendations/${targetUserId}`);
        if (res.ok) {
          const data = await res.json();
          setRecommendations(data.recommendations);
        } else {
          console.error("Failed to fetch recommendations");
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    };

    fetchRecommendations();
  }, [targetUserId]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Recommended Collaborators</h2>
      {recommendations.map((rec) => (
        <div key={rec.profile._id} className="border p-3 rounded mb-2">
          <p className="font-semibold">{rec.username}</p>

        </div>
      ))}
    </div>
  );
};

export default Recommendations;
