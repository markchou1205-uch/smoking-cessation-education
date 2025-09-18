// components/ProgressIndicator.tsx
import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps }) => (
  <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
      style={{ width: `${(currentStep / totalSteps) * 100}%` }}
    ></div>
    <p className="text-sm text-gray-600 mt-2">步驟 {currentStep} / {totalSteps}</p>
  </div>
);

export default ProgressIndicator; 
