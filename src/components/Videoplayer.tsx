import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import { Lock } from 'lucide-react';

interface VideoPlayerProps {
  url: string | null;
  isLocked?: boolean;
  lockMessage?: string;
  onEnded?: () => void;
  className?: string;
  height?: string;
  width?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  isLocked = false,
  lockMessage = 'This video is locked',
  onEnded,
  className = '',
  height = '500px',
  width = '100%'
}) => {
  const [duration, setDuration] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  // Construct the full video URL if it's a relative path
  const getFullUrl = (videoUrl: string) => {
    if (videoUrl.startsWith('http')) {
      return videoUrl;
    }
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${videoUrl}`;
  };

  const handleProgress = ({ playedSeconds }: { playedSeconds: number }) => {
    setProgress(playedSeconds);
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleEnded = () => {
    // Only trigger completion if the video was watched almost entirely (>= 95%)
    if (progress / duration >= 0.95) {
      onEnded?.();
    }
  };

  if (isLocked || !url) {
    return (
      <div 
        className={`bg-gray-800 rounded-lg flex items-center justify-center flex-col ${className}`} 
        style={{ height }}
      >
        <Lock className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-400 text-lg">{lockMessage}</p>
      </div>
    );
  }

  return (
    <div className={`bg-black rounded-lg overflow-hidden ${className}`}>
      <ReactPlayer
        url={getFullUrl(url)}
        width={width}
        height={height}
        controls
        playing
        onEnded={handleEnded}
        onProgress={handleProgress}
        onDuration={handleDuration}
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload', // Disable download button
              onContextMenu: (e: React.MouseEvent) => e.preventDefault() // Disable right-click
            }
          }
        }}
      />
    </div>
  );
};

export default VideoPlayer;