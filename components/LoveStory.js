"use client";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

const LoveStory = ({ text }) => {
  if (!text) return null;

  return (
    <section className="wedding-section my-5 p-4 mx-auto">
      <div className="decorative-corner-top"></div>
      <div className="decorative-corner-bottom"></div>
      <h2 className="h2 text-center mb-4">
        <FontAwesomeIcon icon={faHeart} className="me-2" />
        Chuyện Tình Yêu
      </h2>
      <div className="text-center">
        <p className="mx-auto px-5 py-3" style={{ whiteSpace: "pre-line" }}>
          {text}
        </p>
      </div>
    </section>
  );
};

export default LoveStory;
