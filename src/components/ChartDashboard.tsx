// src/components/ChartDashboard.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import ChartsEmbedSDK from "@mongodb-js/charts-embed-dom";
import ProcessAnimation from './ProcessAnimation';
import AITextDisplay from './AITextDisplay';
import { captureElement, isScreenCaptureSupported } from '../utils/screenshotUtil';

const ChartDashboard = () => {
  // Refs
  const chartDiv = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // State management
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isChartReady, setIsChartReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [aiText, setAiText] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  // Initialize chart
  useEffect(() => {
    if (chartDiv.current) {
      const sdk = new ChartsEmbedSDK({
        baseUrl: "https://charts.mongodb.com/charts-pavelnext-zzdvy",
      });

      const chart = sdk.createDashboard({
        dashboardId: "d9e73907-608b-4704-a13d-f1e57ee0dda5",
        height: "100vh",
        width: "100%",
        background: "transparent",
        theme: "light",
        showTitleAndDesc: true,
        autoRefresh: true,
        maxDataAge: 60,
        widthMode: "scale"
      });

      const renderChart = async () => {
        try {
          await chart.render(chartDiv.current!);
          setIsChartReady(true);
        } catch (err: any) {
          console.error("Error rendering chart:", err);
          setError(err.message || "Failed to load chart");
        }
      };

      renderChart();

      const handleResize = () => {
        chart.refresh();
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Check browser support on mount
  useEffect(() => {
    setIsSupported(isScreenCaptureSupported());
  }, []);

  // Audio state management
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Cleanup audio URL
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Show animation when processing
  useEffect(() => {
    setShowAnimation(isAnalyzing || isSynthesizing); // Remove isCapturing
  }, [isAnalyzing, isSynthesizing]);

  const captureScreenshot = useCallback(async () => {
    if (!isSupported) {
      setError('Screen capture is not supported in your browser');
      return;
    }

    try {
      setIsCapturing(true);
      setError(null);
      
      const imageData = await captureElement();
      setCapturedImage(imageData);
      
    } catch (err) {
      console.error('Error capturing screenshot:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to capture screenshot';
      setError(errorMessage);
    } finally {
      setIsCapturing(false);
    }
  }, [isSupported]);

  const analyzeChart = async () => {
    if (!capturedImage) return;
    
    try {
      setIsAnalyzing(true);
      setError(null);

      const response = await fetch('/api/analyze-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: capturedImage,
          prompt: "Analyze this MongoDB Charts dashboard and provide a comprehensive analysis (around 250 words) of what you see. Include detailed insights about trends, patterns, and relationships in the data visualization. Break your response into clear paragraphs."
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze chart');
      }
      
      const data = await response.json();
      if (data.message?.content?.[0]?.text) {
        const text = data.message.content[0].text;
        setAiText(text);
        await synthesizeSpeech(text);
      }
      
    } catch (err) {
      console.error('Error analyzing chart:', err);
      setError('Failed to analyze chart');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const synthesizeSpeech = async (text: string) => {
    try {
      setIsSynthesizing(true);
      setError(null);

      const response = await fetch('/api/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to synthesize speech');
      }

      const audioBlob = await response.blob();
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      if (audioRef.current) {
        audioRef.current.play();
      }
    } catch (err) {
      console.error('Error synthesizing speech:', err);
      setError('Failed to synthesize speech');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const resetAll = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setCapturedImage(null);
    setAudioUrl(null);
    setAiText(null);
    setIsPlaying(false);
  };

  const getButtonText = () => {
    if (isAnalyzing) return 'Analyzing with Bedrock...';
    if (isSynthesizing) return 'Synthesizing with Polly...';
    return 'Analyze with AI';
  };

  return (
    <div className="w-full h-screen relative">
      <div ref={chartDiv} className="w-full h-full bg-white rounded-lg shadow-lg" />
      
      {/* Single Action Button */}
      {isChartReady && !capturedImage && !showAnimation && (
        <button
          onClick={captureScreenshot}
          disabled={isCapturing || !isSupported}
          className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <span>{isCapturing ? 'Capturing...' : 'Analyse with Bedrock'}</span>
          {isCapturing && (
            <svg className="animate-spin h-4 w-4 ml-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
        </button>
      )}

      {/* Processing Animation */}
      {showAnimation && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <ProcessAnimation
        isAnalyzing={isAnalyzing}
        isSynthesizing={isSynthesizing}
      />
    </div>
  )}

      {/* Results Modal */}
      {capturedImage && !showAnimation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {audioUrl ? 'Analysis Results' : 'Captured Chart'}
              </h3>
              <button
                onClick={resetAll}
                className="text-gray-500 hover:text-gray-700"
              >
                Reset
              </button>
            </div>
            
            <div className="flex-1 overflow-auto mb-4">
              <img src={capturedImage} alt="Chart Screenshot" className="w-full h-auto" />
            </div>
            
            {audioUrl && (
              <div className="border-t pt-4">
                {aiText && (
                  <AITextDisplay 
                    text={aiText} 
                    isPlaying={isPlaying} 
                    audioRef={audioRef}
                  />
                )}
                <audio 
                  ref={audioRef} 
                  controls 
                  className="w-full" 
                  src={audioUrl}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            
            {!audioUrl && (
              <div className="flex justify-center border-t pt-4">
                <button
                  onClick={analyzeChart}
                  disabled={isAnalyzing || isSynthesizing}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {getButtonText()}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Messages */}
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-100 text-red-700 p-4 rounded-t-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default ChartDashboard;