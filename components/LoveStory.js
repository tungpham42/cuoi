"use client";
import React from "react";

const LoveStory = ({ text }) => {
  if (!text) return null;

  return (
    <section className="my-5">
      <h2 className="text-center mb-4">Chuyện Tình Yêu</h2>
      <div className="text-center">
        <p
          style={{
            whiteSpace: "pre-line",
            maxWidth: "800px",
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
