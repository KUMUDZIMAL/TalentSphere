// app/dashboard/page.tsx
import React from "react";
import { ProjectBoard } from "../..//myComponents/ProjectBoard";
import {TimelineTracker} from "../../myComponents/TimelineTracker";

const DashboardPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Production Dashboard</h1>
      <div className="mb-8">
        <ProjectBoard />
      </div>
      <TimelineTracker />
    </div>
  );
};

export default DashboardPage;
