"use client";
import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Alert,
  Spinner,
} from "react-bootstrap";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <Container
        fluid
        className="d-flex align-items-center justify-content-center min-vh-100"
        style={{
          background: "linear-gradient(to bottom right, #FFF1F2, #FFE4E6)",
        }}
      >
        <Spinner animation="border" variant="danger" />
        <span
          className="ms-2"
          style={{ color: "#BE123C", fontFamily: "'Great Vibes', cursive" }}
        >
          Loading...
        </span>
      </Container>
    );
  }

  return (
    <Container
      fluid
      className="py-5"
      style={{
        background: "linear-gradient(to bottom right, #FFF1F2, #FFE4E6)",
        backgroundImage:
          "url('/paper-fibers.png')",
        minHeight: "100vh",
      }}
    >
      <Card
        className="shadow-lg border-0 mx-auto"
        style={{
          maxWidth: "900px",
          border: "1px solid #FECACA",
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

        <Card.Body className="p-4">
          <Row className="text-center mb-5">
            <Col>
              <h1
                style={{
                  fontFamily: "'Great Vibes', cursive",
                  color: "#BE123C",
                  fontSize: "2.5rem",
                }}
              >
                Chào mừng bạn đến với trang cưới của chúng tôi!
              </h1>
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#9F1239",
                  fontSize: "1.1rem",
                }}
              >
                Đây là nơi để bạn quản lý và chia sẻ thông tin về đám cưới của
                mình, bao gồm ngày cưới, địa điểm, câu chuyện tình yêu và những
                bức ảnh đáng nhớ.
              </p>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={4}>
              <Card
                className="border-0 shadow-sm"
                style={{ border: "1px solid #FECACA" }}
              >
                <Card.Body>
                  <Card.Title
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: "#BE123C",
                    }}
                  >
                    Chỉnh sửa thông tin
                  </Card.Title>
                  <Card.Text
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: "#9F1239",
                    }}
                  >
                    Cập nhật thông tin về đám cưới của bạn, bao gồm tên cô dâu
                    chú rể, ngày cưới, địa điểm và nhiều hơn nữa.
                  </Card.Text>
                  <Button
                    variant="primary"
                    onClick={() => router.push("/settings")}
                    style={{
                      backgroundColor: "#F43F5E",
                      borderColor: "#F43F5E",
                      fontFamily: "'Playfair Display', serif",
                      borderRadius: "20px",
                      padding: "8px 20px",
                    }}
                  >
                    Đi tới Cài đặt
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card
                className="border-0 shadow-sm"
                style={{ border: "1px solid #FECACA" }}
              >
                <Card.Body>
                  <Card.Title
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: "#BE123C",
                    }}
                  >
                    Thư viện ảnh
                  </Card.Title>
                  <Card.Text
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: "#9F1239",
                    }}
                  >
                    Thêm và quản lý các bức ảnh trong thư viện cưới của bạn,
                    chia sẻ khoảnh khắc đáng nhớ.
                  </Card.Text>
                  <Button
                    variant="secondary"
                    onClick={() => router.push("/gallery")}
                    style={{
                      backgroundColor: "#D97706",
                      borderColor: "#D97706",
                      fontFamily: "'Playfair Display', serif",
                      borderRadius: "20px",
                      padding: "8px 20px",
                    }}
                  >
                    Xem Thư viện
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card
                className="border-0 shadow-sm"
                style={{ border: "1px solid #FECACA" }}
              >
                <Card.Body>
                  <Card.Title
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: "#BE123C",
                    }}
                  >
                    Chúc mừng cô dâu chú rể
                  </Card.Title>
                  <Card.Text
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: "#9F1239",
                    }}
                  >
                    Khách mời có thể gửi lời chúc đến cô dâu chú rể trong sổ lưu
                    niệm.
                  </Card.Text>
                  <Button
                    variant="success"
                    onClick={() => router.push("/guestbook")}
                    style={{
                      backgroundColor: "#BE123C",
                      borderColor: "#BE123C",
                      fontFamily: "'Playfair Display', serif",
                      borderRadius: "20px",
                      padding: "8px 20px",
                    }}
                  >
                    Gửi Lời Chúc
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="text-center">
            <Col>
              <h3
                style={{
                  fontFamily: "'Great Vibes', cursive",
                  color: "#BE123C",
                }}
              >
                Thông báo
              </h3>
              <Alert
                variant="info"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  backgroundColor: "#FFF5F5",
                  borderColor: "#FECACA",
                  color: "#9F1239",
                }}
              >
                Hãy chia sẻ khoảnh khắc tuyệt vời của bạn với mọi người ngay hôm
                nay!
              </Alert>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}
