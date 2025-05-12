"use client";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";

const BackToTop = () => {
  const [showButton, setShowButton] = useState(false);
  useEffect(() => {
    const handleScrollResize = () => {
      setShowButton(window.scrollY > 148);
    };

    window.addEventListener("scroll", handleScrollResize);
    window.addEventListener("resize", handleScrollResize);
    handleScrollResize(); // Initial call

    return () => {
      window.removeEventListener("scroll", handleScrollResize);
      window.removeEventListener("resize", handleScrollResize);
    };
  }, []);

  // Smooth scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {showButton && (
        <Button
          variant="primary"
          onClick={scrollToTop}
          className="position-fixed bottom-3 end-3 rounded-circle shadow-lg d-flex align-items-center justify-content-center"
          style={{
            bottom: "25px",
            right: "25px",
            width: "50px",
            height: "50px",
            fontSize: "20px",
          }}
        >
          <FontAwesomeIcon icon={faChevronUp} />
        </Button>
      )}
    </>
  );
};
export default BackToTop;
