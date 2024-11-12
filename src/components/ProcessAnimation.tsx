import React from 'react';

interface ProcessAnimationProps {
  isCapturing: boolean;
  isAnalyzing: boolean;
  isSynthesizing: boolean;
}

const ProcessAnimation: React.FC<ProcessAnimationProps> = ({ isCapturing, isAnalyzing, isSynthesizing }) => {
  const steps = [
    {
      title: 'Screenshot',
      description: 'Taking a screenshot of the MongoDB Charts dashboard using Puppeteer',
      isActive: isCapturing,
      isDone: !isCapturing && (isAnalyzing || isSynthesizing),
      icon: '📸'
    },
    {
      title: 'Bedrock Analysis',
      description: 'Using Claude 3.5 Computer Use to analyze the chart data and generate insights',
      isActive: isAnalyzing,
      isDone: !isAnalyzing && isSynthesizing,
      icon: '🧠'
    },
    {
      title: 'Polly Synthesis',
      description: 'Converting the analysis into natural speech using Amazon Polly 🦜',
      isActive: isSynthesizing,
      isDone: false,
      icon: '🔊'
    }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg">
      <h3 className="text-xl font-semibold mb-6 text-center">AI Processing Pipeline</h3>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div 
            key={step.title}
            className={`relative flex items-start p-4 rounded-lg transition-all duration-300 ${
              step.isActive ? 'bg-blue-50 scale-105' : 
              step.isDone ? 'bg-green-50' : 'bg-gray-50'
            }`}
          >
            {/* Connection Line */}
            {index < steps.length - 1 && (
              <div className="absolute left-8 top-16 w-0.5 h-8 bg-gray-300" />
            )}
            
            {/* Icon */}
            <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full text-2xl
              ${step.isActive ? 'animate-bounce bg-blue-100' : 
                step.isDone ? 'bg-green-100' : 'bg-gray-100'}`}
            >
              {step.icon}
            </div>
            
            {/* Content */}
            <div className="ml-4 flex-1">
              <h4 className={`font-semibold ${
                step.isActive ? 'text-blue-600' : 
                step.isDone ? 'text-green-600' : 'text-gray-600'
              }`}>
                {step.title}
              </h4>
              <p className="text-sm text-gray-500 mt-1">{step.description}</p>
              
              {/* Status */}
              <div className="mt-2 text-sm">
                {step.isActive && (
                  <span className="text-blue-600">Processing...</span>
                )}
                {step.isDone && (
                  <span className="text-green-600">✓ Complete</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessAnimation;
