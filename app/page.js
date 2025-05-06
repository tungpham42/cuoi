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
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="dashboard-container">
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-text fs-1">
            Chuẩn bị cho sự kiện đặc biệt của bạn...
          </div>
        </div>
      ) : (
        <Container className="event-section my-5 p-5 position-relative">
          <div className="decorative-corner-top" />
          <div className="decorative-corner-bottom" />
          <Row className="justify-content-center text-center mb-5">
            <Col md={8}>
              <h1 className="display-3 mb-4">Tạo Sự Kiện Đặc Biệt Của Bạn</h1>
              <h3 className="mb-4">
                Lên kế hoạch cho sự kiện của bạn với sự tinh tế và dễ dàng. Tùy
                chỉnh thiệp mời, chia sẻ khoảnh khắc, và quản lý mọi chi tiết để
                tạo nên một trải nghiệm khó quên.
              </h3>
              <Link href="/login">
                <Button className="btn-primary fs-5 px-4">
                  <FontAwesomeIcon icon={faHeart} className="me-2" />
                  Bắt Đầu Lên Kế Hoạch Ngay
                </Button>
              </Link>
            </Col>
          </Row>
          <Row className="g-4">
            <Col md={4}>
              <Card className="card h-100 text-center">
                <Card.Body>
                  <Card.Title as="h3" className="h3 mb-3">
                    <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                    Thiệp Mời Tùy Chỉnh
                  </Card.Title>
                  <Card.Text>
                    Thiết kế thiệp mời độc đáo với các chủ đề và phông chữ cá
                    nhân hóa để tạo ấn tượng cho sự kiện của bạn.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="card h-100 text-center">
                <Card.Body>
                  <Card.Title as="h3" className="h3 mb-3">
                    <FontAwesomeIcon icon={faCamera} className="me-2" />
                    Lưu Giữ Kỷ Niệm
                  </Card.Title>
                  <Card.Text>
                    Tải lên và chia sẻ bộ sưu tập ảnh để lưu giữ những khoảnh
                    khắc đáng nhớ của sự kiện.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="card h-100 text-center">
                <Card.Body>
                  <Card.Title as="h3" className="h3 mb-3">
                    <FontAwesomeIcon icon={faListCheck} className="me-2" />
                    Quản Lý Toàn Diện
                  </Card.Title>
                  <Card.Text>
                    Sắp xếp các thành phần, quản lý lời chúc, và tích hợp thông
                    tin chuyển khoản với bảng điều khiển thông minh.
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
