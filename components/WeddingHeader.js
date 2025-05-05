"use client";
import React from "react";

const WeddingHeader = ({ data }) => {
  const { brideName, groomName, weddingDate, location } = data;

  return (
    <header className="wedding-section text-center py-5 mx-auto my-5">
      <h1 className="h1 mb-3">
        {brideName} 💖 {groomName}
      </h1>
      <p className="mb-3">
        Chúng tôi hân hạnh mời bạn đến dự lễ cưới của chúng tôi.
      </p>
      <p className="mb-2">
        <strong>Thời gian:</strong> {weddingDate}
      </p>
      <p>
        <strong>Địa điểm:</strong> {location}
      </p>
    </header>
  );
};

export default WeddingHeader;
