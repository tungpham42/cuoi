"use client";
import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";

const WishForm = ({ onSubmit }) => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !message) {
      setStatus("error");
      return;
    }

    try {
      await onSubmit(name, message);
      setStatus("success");
      setName("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      className="my-5 py-5"
      style={{
        background: "linear-gradient(to bottom right, #FFF1F2, #FFE4E6)",
        backgroundImage: "url('/paper-fibers.png')",
        border: "1px solid #FECACA",
        borderRadius: "15px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
        maxWidth: "600px",
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
        Gửi lời chúc
      </h2>
      <Form className="mx-auto px-3">
        {status === "success" && (
          <Alert
            variant="success"
            style={{
              fontFamily: "'Playfair Display', serif",
              borderColor: "#FECACA",
            }}
          >
            Cảm ơn bạn đã gửi lời chúc!
          </Alert>
        )}
        {status === "error" && (
          <Alert
            variant="danger"
            style={{
              fontFamily: "'Playfair Display', serif",
              borderColor: "#FECACA",
            }}
          >
            Vui lòng nhập đầy đủ thông tin.
          </Alert>
        )}
        <Form.Group className="mb-3">
          <Form.Label
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#9F1239",
            }}
          >
            Tên của bạn
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="Nhập tên"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              borderColor: "#FECACA",
              fontFamily: "'Playfair Display', serif",
            }}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#9F1239",
            }}
          >
            Lời chúc
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Viết lời chúc của bạn"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{
              borderColor: "#FECACA",
              fontFamily: "'Playfair Display', serif",
            }}
          />
        </Form.Group>
        <div className="text-center">
          <Button
            variant="primary"
            type="submit"
            onClick={handleSubmit}
            style={{
              backgroundColor: "#F43F5E",
              borderColor: "#F43F5E",
              fontFamily: "'Playfair Display', serif",
              borderRadius: "20px",
              padding: "8px 20px",
            }}
          >
            Gửi lời chúc
          </Button>
        </div>
      </Form>
    </section>
  );
};

export default WishForm;
