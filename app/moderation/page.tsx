// app/moderation/page.tsx
import React from "react";
import ModerationTool from "../../myComponents/moderationTool";

const ModerationPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Content Moderation Tool</h1>
      <ModerationTool />
    </div>
  );
};

export default ModerationPage;
