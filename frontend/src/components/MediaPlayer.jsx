import { useEffect, useRef, useState } from "react";
import "./MediaPlayer.css";

const MediaPlayer = ({
  type = "audio",
  title,
  description,
  audioSrc,
  onTimeUpdate,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const audioRef = useRef(null);
  const rafRef = useRef(null);

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return "0:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = async () => {
    if (!audioRef.current || !audioSrc) {
      setIsPlaying((prev) => !prev);
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      try {
        await audioRef.current.play();
      } catch (err) {
        return;
      }
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (audioRef.current && totalDuration > 0) {
      audioRef.current.currentTime = percent * totalDuration;
    }
  };

  const handleSkip = (delta) => {
    if (!audioRef.current || totalDuration <= 0) return;
    const nextTime = Math.min(
      Math.max(audioRef.current.currentTime + delta, 0),
      totalDuration
    );
    audioRef.current.currentTime = nextTime;
  };

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const handleTimeUpdate = () => {
      const time = audio.currentTime || 0;
      const duration = audio.duration || 0;
      setCurrentTime(time);
      setTotalDuration(duration);
      setProgress(duration ? (time / duration) * 100 : 0);
      if (onTimeUpdate) {
        onTimeUpdate(time, duration);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const startRaf = () => {
      if (rafRef.current) return;
      const tick = () => {
        handleTimeUpdate();
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    const stopRaf = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleTimeUpdate);
    audio.addEventListener("play", () => {
      handlePlay();
      startRaf();
    });
    audio.addEventListener("pause", () => {
      handlePause();
      stopRaf();
    });
    audio.addEventListener("ended", () => {
      handlePause();
      stopRaf();
    });

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleTimeUpdate);
      stopRaf();
    };
  }, [audioSrc, onTimeUpdate]);

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
          <audio ref={audioRef} src={audioSrc || ""} preload="metadata" />
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
          <button
            className="control-btn"
            title="Rewind 15s"
            onClick={() => handleSkip(-15)}
            disabled={!audioSrc}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 4v6h6M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>

          <button
            className="control-btn control-btn--play"
            onClick={togglePlay}
            disabled={!audioSrc}
          >
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

          <button
            className="control-btn"
            title="Forward 15s"
            onClick={() => handleSkip(15)}
            disabled={!audioSrc}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaPlayer;
