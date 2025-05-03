"use client";
import React from "react";
import { Card } from "react-bootstrap";

const WishList = ({ wishes }) => {
  if (!wishes || wishes.length === 0) return null;

  return (
    <section className="my-5">
      <h2 className="text-center mb-4">Lời chúc đã gửi</h2>
      <div className="d-flex flex-column align-items-center gap-3">
        {wishes.map((wish, index) => (
          <Card key={index} style={{ width: "100%", maxWidth: "600px" }}>
            <Card.Body>
              <Card.Title>{wish.name}</Card.Title>
              <Card.Text>{wish.message}</Card.Text>
            </Card.Body>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default WishList;
