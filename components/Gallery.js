"use client";
import React from "react";
import { Carousel, Image } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImages } from "@fortawesome/free-solid-svg-icons";

const Gallery = ({ images }) => {
  if (!images || images.length === 0) return null;

  return (
    <section className="wedding-section my-5 py-5 mx-auto">
      <div className="decorative-corner-top"></div>
      <div className="decorative-corner-bottom"></div>
      <h2 className="h2 text-center mb-4">
        <FontAwesomeIcon icon={faImages} className="me-2" />
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
                objectFit: "contain",
                borderRadius: "10px",
              }}
            />
          </Carousel.Item>
        ))}
      </Carousel>
    </section>
  );
};

export default Gallery;
