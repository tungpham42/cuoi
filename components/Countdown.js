"use client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export default function Countdown({ weddingDate, weddingTime }) {
  const [timeLeft, setTimeLeft] = useState({});
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    if (!weddingDate || !weddingTime) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setIsTimeUp(true);
      return;
    }

    // Create target date from weddingDate (YYYY-MM-DD) and weddingTime (HH:mm)
    const targetDate = new Date(`${weddingDate}T${weddingTime}`);

    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference <= 0 || isNaN(difference)) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsTimeUp(true);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown(); // Initial call
    const countdown = setInterval(updateCountdown, 1000);

    return () => clearInterval(countdown);
  }, [weddingDate, weddingTime]);

  return (
    <section className="wedding-section text-center p-4 my-5 mx-auto">
      <div className="decorative-corner-top"></div>
      <div className="decorative-corner-bottom"></div>
      <h2 className="h2 mb-3">Đếm ngược tới ngày cưới</h2>
      {isTimeUp ? (
        <p>
          <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
          Chúc mừng! Ngày cưới đã đến!
        </p>
      ) : (
        <p>
          <FontAwesomeIcon icon={faClock} className="me-2" />
          {timeLeft.days} ngày {timeLeft.hours} giờ {timeLeft.minutes} phút{" "}
          {timeLeft.seconds} giây
        </p>
      )}
    </section>
  );
}
