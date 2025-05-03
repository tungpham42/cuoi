"use client";
import React from "react";

const WeddingHeader = ({ data }) => {
  const { brideName, groomName, weddingDate, location } = data;

  return (
    <header
      className="text-center py-5"
      style={{
        background: "linear-gradient(to bottom right, #FFF1F2, #FFE4E6)",
        backgroundImage: "url('/paper-fibers.png')",
        border: "1px solid #FECACA",
        borderRadius: "15px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
        maxWidth: "800px",
        margin: "0 auto 2rem",
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
      <h1
        style={{
          fontFamily: "'Great Vibes', cursive",
          color: "#BE123C",
          fontSize: "3rem",
          marginBottom: "1rem",
        }}
      >
        {brideName} 💖 {groomName}
      </h1>
      <p
        style={{
          fontFamily: "'Playfair Display', serif",
          color: "#9F1239",
          fontSize: "1.2rem",
          marginBottom: "1rem",
        }}
      >
        Chúng tôi hân hạnh mời bạn đến dự lễ cưới của chúng tôi.
      </p>
      <p
        style={{
          fontFamily: "'Playfair Display', serif",
          color: "#9F1239",
          fontSize: "1rem",
        }}
      >
        <strong>Thời gian:</strong> {weddingDate}
      </p>
      <p
        style={{
          fontFamily: "'Playfair Display', serif",
          color: "#9F1239",
          fontSize: "1rem",
        }}
      >
        <strong>Địa điểm:</strong> {location}
      </p>
    </header>
  );
};

export default WeddingHeader;
