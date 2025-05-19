"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faEnvelope,
  faCamera,
  faListCheck,
} from "@fortawesome/free-solid-svg-icons";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoading(false);
      if (user) {
        router.push("/quan-tri");
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div className="dashboard-container">
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-text fs-1">
            Chuẩn bị cho ngày đặc biệt của bạn...
          </div>
        </div>
      ) : (
        <Container className="wedding-section my-5 p-5 position-relative text-center">
          <div className="decorative-corner-top" />
          <div className="decorative-corner-bottom" />

          {/* Hero Section */}
          <Row className="mb-5">
            <Col>
              <h1 className="display-2 fw-bold mb-4 animate__animated animate__fadeInDown">
                💍 Đám Cưới Trong Mơ Của Bạn
              </h1>
              <h3 className="mb-4 animate__animated animate__fadeInUp animate__delay-1s">
                Tạo ra thiệp mời tuyệt đẹp, lưu giữ những khoảnh khắc ngọt ngào
                và quản lý sự kiện một cách chuyên nghiệp.
              </h3>
              <Link href="/dang-nhap" passHref>
                <Button className="btn-primary fs-4 px-5 py-2 animate__animated animate__pulse animate__infinite">
                  <FontAwesomeIcon icon={faHeart} className="me-2" />
                  Bắt Đầu Tạo Ngay
                </Button>
              </Link>
            </Col>
          </Row>

          {/* Features Section */}
          <Row className="g-4">
            <Col md={4}>
              <Card className="card h-100 text-center p-3 shadow-sm hover-shadow animate__animated animate__zoomIn">
                <Card.Body>
                  <Card.Title as="h3" className="h3 mb-3">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="me-2 text-accent"
                    />
                    Thiệp Mời Độc Đáo
                  </Card.Title>
                  <Card.Text>
                    Thiết kế các thiệp mời cá nhân hóa với phông chữ, màu sắc và
                    chủ đề riêng.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="card h-100 text-center p-3 shadow-sm hover-shadow animate__animated animate__zoomIn animate__delay-1s">
                <Card.Body>
                  <Card.Title as="h3" className="h3 mb-3">
                    <FontAwesomeIcon
                      icon={faCamera}
                      className="me-2 text-accent"
                    />
                    Lưu Giữ Kỷ Niệm
                  </Card.Title>
                  <Card.Text>
                    Tải lên và chia sẻ bộ sưu tập ảnh đẹp nhất của bạn với bạn
                    bè và gia đình.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="card h-100 text-center p-3 shadow-sm hover-shadow animate__animated animate__zoomIn animate__delay-2s">
                <Card.Body>
                  <Card.Title as="h3" className="h3 mb-3">
                    <FontAwesomeIcon
                      icon={faListCheck}
                      className="me-2 text-accent"
                    />
                    Quản Lý Thông Minh
                  </Card.Title>
                  <Card.Text>
                    Theo dõi lời mời, chuyển khoản và lời chúc từ bảng điều
                    khiển dễ sử dụng.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      )}
    </div>
  );
}
