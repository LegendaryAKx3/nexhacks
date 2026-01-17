import { useState } from "react";
import "./MediaPlayer.css";

const MediaPlayer = ({ 
  type = "audio", 
  title, 
  description,
  onInterrupt 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const totalDuration = 600; // 10 minutes in seconds

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would control actual playback
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setProgress(percent * 100);
    setCurrentTime(percent * totalDuration);
  };

  const handleInterrupt = () => {
    setIsPlaying(false);
    if (onInterrupt) {
      onInterrupt(currentTime);
    }
  };

  return (
    <div className="media-player card">
      {type === "video" && (
        <div className="video-container">
          <div className="video-placeholder">
            <div className="video-placeholder__icon">🎬</div>
            <p>Video panel will render here</p>
            <span className="video-placeholder__note">Unity integration for character animations</span>
          </div>
        </div>
      )}

      {type === "audio" && (
        <div className="audio-visualization">
          <div className="waveform">
            {Array.from({ length: 50 }).map((_, i) => (
              <div 
                key={i} 
                className={`waveform-bar ${isPlaying ? 'animate' : ''}`}
                style={{ 
                  height: `${20 + Math.random() * 60}%`,
                  animationDelay: `${i * 0.05}s`
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="player-info">
        <h3 className="player-title">{title}</h3>
        <p className="player-description">{description}</p>
      </div>

      <div className="player-controls">
        <div className="progress-container" onClick={handleSeek}>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="time-display">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>

        <div className="control-buttons">
          <button className="control-btn" title="Rewind 15s">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 4v6h6M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>

          <button className="control-btn control-btn--play" onClick={togglePlay}>
            {isPlaying ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button className="control-btn" title="Forward 15s">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>

        <button className="interrupt-btn btn btn-secondary" onClick={handleInterrupt}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          Ask a Question
        </button>
      </div>
    </div>
  );
};

export default MediaPlayer;
