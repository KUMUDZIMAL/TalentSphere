// pages/portfolio.tsx
import React from 'react';
import { PortfolioEditor } from '../../myComponents/PortfolioEdiitor';

const PortfolioPage = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-3xl font-bold mb-4">My Portfolio Editor</h1>
    <PortfolioEditor />
  </div>
);

export default PortfolioPage;
