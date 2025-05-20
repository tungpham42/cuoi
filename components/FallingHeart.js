"use client";
import React, { useEffect, useState } from "react";
import "./FallingHeart.css";

const FallingHeart = () => {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newHeart = {
        id: Date.now(),
        left: Math.random() * 100, // percentage from 0% to 100%
        animationDuration: 3 + Math.random() * 2, // 3s to 5s
      };
      setHearts((prev) => [...prev, newHeart]);

      // Clean up hearts after they fall
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
      }, newHeart.animationDuration * 1000);
    }, 500); // Add a new heart every 0.5s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="falling-hearts-container">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="heart"
          style={{
            left: `${heart.left}%`,
            animationDuration: `${heart.animationDuration}s`,
          }}
        >
          ❤️
        </div>
      ))}
    </div>
  );
};

export default FallingHeart;
