"use client";
import React from "react";

const WeddingHeader = ({ data }) => {
  const { brideName, groomName, weddingDate, location } = data;

  return (
    <header className="text-center mb-5">
      <h1 className="display-4">
        {brideName} 💖 {groomName}
      </h1>
      <p className="lead">
        Chúng tôi hân hạnh mời bạn đến dự lễ cưới của chúng tôi.
      </p>
      <p>
        <strong>Thời gian:</strong> {weddingDate}
      </p>
      <p>
        <strong>Địa điểm:</strong> {location}
      </p>
    </header>
  );
};

export default WeddingHeader;
