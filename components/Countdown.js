"use client";
import { useEffect, useState } from "react";

export default function Countdown({ weddingDate }) {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const parseVietnameseDate = (dateStr) => {
      const [day, month, year] = dateStr.split("/");
      return new Date(`${year}-${month}-${day}`);
    };

    const countdown = setInterval(() => {
      const targetDate =
        typeof weddingDate === "string"
          ? parseVietnameseDate(weddingDate)
          : new Date(weddingDate);
      const difference = targetDate - new Date();

      if (isNaN(difference)) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(countdown);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });

      if (difference <= 0) clearInterval(countdown);
    }, 1000);

    return () => clearInterval(countdown);
  }, [weddingDate]);

  return (
    <div
      className="text-center py-4"
      style={{
        background: "linear-gradient(to bottom right, #FFF1F2, #FFE4E6)",
        backgroundImage: "url('/paper-fibers.png')",
        border: "1px solid #FECACA",
        borderRadius: "15px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
        maxWidth: "600px",
        margin: "0 auto",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative floral corners */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "60px",
          height: "60px",
          background: "#FECACA",
          borderBottomRightRadius: "100%",
          opacity: 0.3,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "60px",
          height: "60px",
          background: "#FECACA",
          borderTopLeftRadius: "100%",
          opacity: 0.3,
        }}
      />
      <h3
        style={{
          fontFamily: "'Great Vibes', cursive",
          color: "#BE123C",
          fontSize: "2rem",
          marginBottom: "1rem",
        }}
      >
        Đếm ngược tới ngày cưới
      </h3>
      <p
        style={{
          fontFamily: "'Playfair Display', serif",
          color: "#9F1239",
          fontSize: "1.2rem",
        }}
      >
        {timeLeft.days || 0} ngày {timeLeft.hours || 0} giờ{" "}
        {timeLeft.minutes || 0} phút {timeLeft.seconds || 0} giây
      </p>
    </div>
  );
}
