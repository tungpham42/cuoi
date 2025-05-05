"use client";
import React from "react";
import { Card } from "react-bootstrap";

const WishList = ({ wishes }) => {
  if (!wishes || wishes.length === 0) return null;

  return (
    <section className="wedding-section my-5 py-5 mx-auto">
      <div className="decorative-corner-top"></div>
      <div className="decorative-corner-bottom"></div>
      <h2 className="h2 text-center mb-4">Lời chúc đã gửi</h2>
      <div className="d-flex flex-column align-items-center gap-3 px-3">
        {wishes.map((wish, index) => (
          <Card key={index} className="w-100">
            <Card.Body>
              <Card.Title className="h5">{wish.name}</Card.Title>
              <Card.Text>{wish.message}</Card.Text>
            </Card.Body>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default WishList;
