'use client';

interface AITextDisplayProps {
  text: string;
  isPlaying: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const AITextDisplay = ({ text, isPlaying }: AITextDisplayProps) => {
  return (
    <div className={`bg-gray-50 rounded-lg p-4 mb-4 transition-opacity duration-300 ${
      isPlaying ? 'opacity-100' : 'opacity-60'
    }`}>
      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
        {text}
      </p>
      {/* Word count info */}
      <div className="mt-2 text-xs text-gray-400">
        Words: {text.split(/\s+/).length}
      </div>
    </div>
  );
};

export default AITextDisplay;
