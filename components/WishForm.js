"use client";
import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGift, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

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
    <section className="wedding-section my-5 py-5 mx-auto">
      <div className="decorative-corner-top"></div>
      <div className="decorative-corner-bottom"></div>
      <h2 className="h2 text-center mb-4">
        <FontAwesomeIcon icon={faGift} className="me-2" />
        Gửi lời chúc
      </h2>
      <Form className="mx-auto px-3">
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
          <Button variant="primary" type="submit" onClick={handleSubmit}>
            <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
            Gửi lời chúc
          </Button>
        </div>
      </Form>
    </section>
  );
};

export default WishForm;
