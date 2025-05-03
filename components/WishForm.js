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
    <section className="my-5">
      <h2 className="text-center mb-4">Gửi lời chúc</h2>
      <Form
        onSubmit={handleSubmit}
        className="mx-auto"
        style={{ maxWidth: "600px" }}
      >
        {status === "success" && (
          <Alert variant="success">Cảm ơn bạn đã gửi lời chúc!</Alert>
        )}
        {status === "error" && (
          <Alert variant="danger">Vui lòng nhập đầy đủ thông tin.</Alert>
        )}
        <Form.Group className="mb-3">
          <Form.Label>Tên của bạn</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nhập tên"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Lời chúc</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Viết lời chúc của bạn"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </Form.Group>
        <div className="text-center">
          <Button variant="primary" type="submit">
            Gửi lời chúc
          </Button>
        </div>
      </Form>
    </section>
  );
};

export default WishForm;
