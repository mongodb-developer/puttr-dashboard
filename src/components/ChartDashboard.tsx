'use client';

import { useEffect, useRef, useState } from 'react';
import ChartsEmbedSDK from "@mongodb-js/charts-embed-dom";
import ProcessAnimation from './ProcessAnimation';
import AITextDisplay from './AITextDisplay';

const ChartDashboard = () => {
  const chartDiv = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
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
          console.log("Chart rendered successfully");
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

  useEffect(() => {
    // Cleanup previous audio URL when component unmounts or when new audio is generated
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    // Show animation when any process is running
    setShowAnimation(isCapturing || isAnalyzing || isSynthesizing);
  }, [isCapturing, isAnalyzing, isSynthesizing]);

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

  const captureScreenshot = async () => {
    try {
      setIsCapturing(true);
      setError(null);

      const response = await fetch('/api/screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: window.location.href
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to capture screenshot');
      }

      const imageBlob = await response.blob();
      const imageData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(imageBlob);
      });

      setCapturedImage(imageData);
    } catch (err) {
      console.error('Error capturing screenshot:', err);
      setError('Failed to capture screenshot');
    } finally {
      setIsCapturing(false);
    }
  };

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
      const url = URL.createObjectURL(audioBlob);
      
      // Clean up old audio URL if it exists
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      setAudioUrl(url);
      
      // Play the audio automatically
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
      
      {/* Take Screenshot Button */}
      {isChartReady && !capturedImage && !showAnimation && (
        <button
          onClick={captureScreenshot}
          disabled={isCapturing}
          className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCapturing ? 'Capturing...' : 'Analyse with Bedrock'}
        </button>
      )}

      {/* Process Animation Modal */}
      {showAnimation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <ProcessAnimation
            isCapturing={isCapturing}
            isAnalyzing={isAnalyzing}
            isSynthesizing={isSynthesizing}
          />
        </div>
      )}

      {/* Screenshot Preview and Analysis Modal */}
      {capturedImage && !showAnimation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {audioUrl ? 'Audio Analysis' : 'Screenshot Preview'}
              </h3>
              <button
                onClick={resetAll}
                className="text-gray-500 hover:text-gray-700"
              >
                Reset
              </button>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 overflow-auto mb-4">
              <img src={capturedImage} alt="Chart Screenshot" className="w-full h-auto" />
            </div>
            
            {/* AI Text and Audio Player */}
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
            
            {/* Action Button */}
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

      {/* Status Messages */}
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-100 text-red-700 p-4 rounded-t-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default ChartDashboard;
