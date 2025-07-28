// components/FeedbackAnalysis.tsx
"use client";
import React, { useState } from "react";

const FeedbackAnalysis: React.FC = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ score: number; comparative: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        console.error("Failed to analyze sentiment");
      }
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Feedback Analysis</h2>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter your comment..."
        className="w-full p-2 border rounded mb-2"
        rows={4}
      />
      <button
        onClick={handleAnalyze}
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>
      {result && (
        <div className="mt-4">
          <p>Sentiment Score: {result.score}</p>
          <p>Comparative Score: {result.comparative.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};

export default FeedbackAnalysis;
