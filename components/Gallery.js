"use client";
import React from "react";
import { Carousel, Image } from "react-bootstrap";

const Gallery = ({ images }) => {
  if (!images || images.length === 0) return null;

  return (
    <section
      className="my-5 py-5"
      style={{
        background: "linear-gradient(to bottom right, #FFF1F2, #FFE4E6)",
        backgroundImage: "url('/paper-fibers.png')",
        border: "1px solid #FECACA",
        borderRadius: "15px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
        maxWidth: "900px",
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
        Bộ ảnh cưới
      </h2>
      <Carousel>
        {images.map((img, index) => (
          <Carousel.Item key={index}>
            <Image
              className="d-block w-100"
              src={img.url}
              alt={`Ảnh cưới ${index + 1}`}
              style={{
                maxHeight: "600px",
                objectFit: "cover",
                borderRadius: "10px",
                border: "1px solid #FECACA",
              }}
            />
          </Carousel.Item>
        ))}
      </Carousel>
    </section>
  );
};

export default Gallery;
