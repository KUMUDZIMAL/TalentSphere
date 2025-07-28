"use client";
import React, { useState } from "react";

const ModerationTool: React.FC = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleModeration = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Error during moderation:", error);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Content Moderation</h2>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter content to moderate..."
        className="w-full p-2 border rounded mb-2"
        rows={4}
      />
      <button
        onClick={handleModeration}
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>
      {result && (
        <div className="mt-4">
          <p>
            <strong>Toxicity Score:</strong>{" "}
            {result.attributeScores?.TOXICITY?.summaryScore?.value.toFixed(2)}
          </p>
          <p>
            <strong>Severe Toxicity:</strong>{" "}
            {result.attributeScores?.SEVERE_TOXICITY?.summaryScore?.value.toFixed(2)}
          </p>
          <p>
            <strong>Insult:</strong>{" "}
            {result.attributeScores?.INSULT?.summaryScore?.value.toFixed(2)}
          </p>
          <p>
            <strong>Profanity:</strong>{" "}
            {result.attributeScores?.PROFANITY?.summaryScore?.value.toFixed(2)}
          </p>
          <p>
            <strong>Threat:</strong>{" "}
            {result.attributeScores?.THREAT?.summaryScore?.value.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

export default ModerationTool;
