"use client";
import { useState, useRef, useEffect } from "react";
import {
  Card,
  Button,
  ListGroup,
  ProgressBar,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faForward,
  faBackward,
  faRedo,
  faMusic,
} from "@fortawesome/free-solid-svg-icons";

const AudioPlayer = ({ playlist, loop = false, autoplay = false }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isLooping, setIsLooping] = useState(loop);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
      if (autoplay) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [isLooping, autoplay]);

  useEffect(() => {
    if (audioRef.current && playlist.length > 0) {
      audioRef.current.src = playlist[currentTrackIndex]?.url || "";
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrackIndex, playlist, isPlaying]);

  useEffect(() => {
    const updateProgress = () => {
      if (audioRef.current && audioRef.current.duration) {
        setProgress(
          (audioRef.current.currentTime / audioRef.current.duration) * 100
        );
        setCurrentTime(audioRef.current.currentTime);
        setDuration(audioRef.current.duration);
      }
    };

    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    setCurrentTrackIndex(
      (prev) => (prev - 1 + playlist.length) % playlist.length
    );
    setIsPlaying(true);
  };

  const handleLoopToggle = () => {
    setIsLooping((prev) => !prev);
  };

  const handleEnded = () => {
    if (!isLooping) {
      handleNext();
    }
  };

  const handleProgressClick = (e) => {
    if (audioRef.current && progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const seekPercentage = (clickX / width) * 100;
      const seekTime = (seekPercentage / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTime;
      setProgress(seekPercentage);
      setCurrentTime(seekTime);
    }
  };

  // Format time in MM:SS
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!playlist || playlist.length === 0) {
    return null;
  }

  const renderTooltip = (text) => (
    <Tooltip id={`tooltip-${text}`}>{text}</Tooltip>
  );

  return (
    <section className="wedding-section text-center p-4 my-5 mx-auto">
      <div className="decorative-corner-top"></div>
      <div className="decorative-corner-bottom"></div>
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h2 className="h2 mb-4">
            <FontAwesomeIcon icon={faMusic} className="me-2" />
            Nhạc nền
          </h2>
          <audio
            ref={audioRef}
            onEnded={handleEnded}
            className="audio-player-hidden"
          />
          <div
            ref={progressBarRef}
            onClick={handleProgressClick}
            style={{ cursor: "pointer" }}
          >
            <ProgressBar
              now={progress}
              variant="primary"
              className="audio-player-progress"
            />
          </div>
          <div className="audio-player-time mt-2">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          <div className="audio-player-controls">
            <OverlayTrigger placement="top" overlay={renderTooltip("Trước")}>
              <Button
                variant="outline-primary"
                onClick={handlePrevious}
                className="audio-player-btn-circle rounded-circle"
              >
                <FontAwesomeIcon icon={faBackward} />
              </Button>
            </OverlayTrigger>
            <OverlayTrigger
              placement="top"
              overlay={renderTooltip(isPlaying ? "Ngưng" : "Chơi")}
            >
              <Button
                variant="primary"
                onClick={handlePlayPause}
                className="audio-player-btn-circle rounded-circle"
              >
                <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
              </Button>
            </OverlayTrigger>
            <OverlayTrigger placement="top" overlay={renderTooltip("Sau")}>
              <Button
                variant="outline-primary"
                onClick={handleNext}
                className="audio-player-btn-circle rounded-circle"
              >
                <FontAwesomeIcon icon={faForward} />
              </Button>
            </OverlayTrigger>
            <OverlayTrigger
              placement="top"
              overlay={renderTooltip(
                isLooping ? "Không lặp lại" : "Lặp lại bài hiện tại"
              )}
            >
              <Button
                variant={isLooping ? "primary" : "outline-primary"}
                onClick={handleLoopToggle}
                className="audio-player-btn-circle rounded-circle"
              >
                <FontAwesomeIcon icon={faRedo} />
              </Button>
            </OverlayTrigger>
          </div>
          <ListGroup variant="flush">
            {playlist.map((track, index) => (
              <ListGroup.Item
                key={track.public_id}
                action
                active={index === currentTrackIndex}
                onClick={() => {
                  setCurrentTrackIndex(index);
                  setIsPlaying(true);
                }}
                className="audio-player-list-item"
              >
                <span>{track.name || `Bài ${index + 1}`}</span>
                {index === currentTrackIndex && (
                  <FontAwesomeIcon
                    icon={isPlaying ? faPlay : faPause}
                    className="audio-player-list-item-icon"
                  />
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
    </section>
  );
};

export default AudioPlayer;
