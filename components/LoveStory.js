"use client";
import React from "react";

const LoveStory = ({ text }) => {
  if (!text) return null;

  return (
    <section
      className="my-5 py-5"
      style={{
        background: "linear-gradient(to bottom right, #FFF1F2, #FFE4E6)",
        backgroundImage: "url('/paper-fibers.png')",
        border: "1px solid #FECACA",
        borderRadius: "15px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
        maxWidth: "800px",
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
      <h2
        style={{
          fontFamily: "'Great Vibes', cursive",
          color: "#BE123C",
          fontSize: "2.5rem",
          textAlign: "center",
          marginBottom: "1.5rem",
        }}
      >
        Chuyện Tình Yêu
      </h2>
      <div className="text-center">
        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "#9F1239",
            fontSize: "1.1rem",
            whiteSpace: "pre-line",
            maxWidth: "700px",
            margin: "0 auto",
          }}
        >
          {text}
        </p>
      </div>
    </section>
  );
};

export default LoveStory;
