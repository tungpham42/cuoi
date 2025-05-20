"use client";
import { Container } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

const Introduction = ({ form }) => {
  if (!form.showIntroduction || !form.introduction?.trim()) {
    return null;
  }

  return (
    <section className="wedding-section my-5 p-4 mx-auto">
      <div className="decorative-corner-top"></div>
      <div className="decorative-corner-bottom"></div>
      <h2 className="h2 text-center mb-4">
        <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
        Giới thiệu về Cô dâu Chú rể
      </h2>
      <div className="text-center">
        <p className="mx-auto px-5 py-3" style={{ whiteSpace: "pre-line" }}>
          {form.introduction}
        </p>
      </div>
    </section>
  );
};

export default Introduction;
