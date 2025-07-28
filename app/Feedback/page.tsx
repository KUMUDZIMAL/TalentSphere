// app/feedback/page.tsx
import React from "react";
import FeedbackAnalysis from "../../myComponents/FeedbackAnalysis";

const FeedbackPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Feedback Analysis</h1>
      <FeedbackAnalysis />
    </div>
  );
};

export default FeedbackPage;
