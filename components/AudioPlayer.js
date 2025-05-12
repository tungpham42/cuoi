"use client";
import { useState, useRef, useEffect } from "react";
import { Card, Button, ListGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faForward,
  faBackward,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";

const AudioPlayer = ({ playlist, loop = false, autoplay = false }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = loop;
      if (autoplay) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [loop, autoplay]);

  useEffect(() => {
    if (audioRef.current && playlist.length > 0) {
      audioRef.current.src = playlist[currentTrackIndex]?.url || "";
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrackIndex, playlist, isPlaying]);

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

  const handleEnded = () => {
    if (!loop) {
      handleNext();
    }
  };

  if (!playlist || playlist.length === 0) {
    return null;
  }

  return (
    <section className="wedding-section text-center p-4 my-5 mx-auto">
      <div className="decorative-corner-top"></div>
      <div className="decorative-corner-bottom"></div>
      <h3 className="h3 mb-3">Nhạc nền</h3>
      <audio ref={audioRef} onEnded={handleEnded} style={{ display: "none" }} />
      <div className="d-flex justify-content-center gap-2 mb-3">
        <Button variant="outline-primary" onClick={handlePrevious}>
          <FontAwesomeIcon icon={faBackward} />
        </Button>
        <Button variant="primary" onClick={handlePlayPause}>
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
        </Button>
        <Button variant="outline-primary" onClick={handleNext}>
          <FontAwesomeIcon icon={faForward} />
        </Button>
      </div>
      <ListGroup>
        {playlist.map((track, index) => (
          <ListGroup.Item
            key={track.public_id}
            active={index === currentTrackIndex}
            onClick={() => {
              setCurrentTrackIndex(index);
              setIsPlaying(true);
            }}
            style={{ cursor: "pointer" }}
          >
            {track.name || `Track ${index + 1}`}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </section>
  );
};

export default AudioPlayer;
