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
    <div className="text-center">
      <h3>Đếm ngược tới ngày cưới</h3>
      <p>
        {timeLeft.days || 0} ngày {timeLeft.hours || 0} giờ{" "}
        {timeLeft.minutes || 0} phút {timeLeft.seconds || 0} giây
      </p>
    </div>
  );
}
