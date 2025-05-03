"use client";
import React from "react";
import { Card } from "react-bootstrap";

const WishList = ({ wishes }) => {
  if (!wishes || wishes.length === 0) return null;

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
        Lời chúc đã gửi
      </h2>
      <div className="d-flex flex-column align-items-center gap-3 px-3">
        {wishes.map((wish, index) => (
          <Card
            key={index}
            style={{
              width: "100%",
              maxWidth: "600px",
              border: "1px solid #FECACA",
              borderRadius: "10px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Card.Body>
              <Card.Title
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#9F1239",
                  fontSize: "1.2rem",
                }}
              >
                {wish.name}
              </Card.Title>
              <Card.Text
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#9F1239",
                  fontSize: "1rem",
                }}
              >
                {wish.message}
              </Card.Text>
            </Card.Body>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default WishList;
