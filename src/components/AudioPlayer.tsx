'use client';

import { useRef } from 'react';
import type { RefObject } from 'react';
import html2canvas from 'html2canvas';

interface AudioPlayerProps {
  chartRef: RefObject<HTMLDivElement>;
}

const AudioPlayer = ({ chartRef }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleGenerateImage = async () => {
    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current);
        const image = canvas.toDataURL('image/png');
        
        // Create a download link
        const link = document.createElement('a');
        link.href = image;
        link.download = 'chart-snapshot.png';
        link.click();
      } catch (error) {
        console.error('Error generating image:', error);
      }
    }
  };

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg p-4 flex flex-col gap-4">
      <h2 className="text-xl font-bold text-gray-800">Audio Player</h2>
      
      <audio
        ref={audioRef}
        controls
        className="w-full"
      >
        <source src="/path-to-your-audio.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <button
        onClick={handleGenerateImage}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
      >
        Generate Image
      </button>
    </div>
  );
};

export default AudioPlayer;
