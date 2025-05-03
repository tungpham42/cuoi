"use client";
import React from "react";
import { Carousel, Image } from "react-bootstrap";

const Gallery = ({ images }) => {
  if (!images || images.length === 0) return null;

  return (
    <section className="my-5">
      <h2 className="text-center mb-4">Bộ ảnh cưới</h2>
      <Carousel>
        {images.map(
          (img, index) => (
            console.log(img),
            (
              <Carousel.Item key={index}>
                <Image
                  className="d-block w-100"
                  src={img.url}
                  alt={`Ảnh cưới ${index + 1}`}
                  style={{ maxHeight: "600px", objectFit: "cover" }}
                />
              </Carousel.Item>
            )
          )
        )}
      </Carousel>
    </section>
  );
};

export default Gallery;
