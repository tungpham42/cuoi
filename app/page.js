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
            Chuẩn bị cho ngày đặc biệt của bạn...
          </div>
        </div>
      ) : (
        <Container className="wedding-section my-5 p-5 position-relative">
          <div className="decorative-corner-top" />
          <div className="decorative-corner-bottom" />
          <Row className="justify-content-center text-center mb-5">
            <Col md={8}>
              <h1 className="display-3 mb-4">
                Chào Mừng Đến Với Đám Cưới Trong Mơ
              </h1>
              <h3 className="mb-4">
                Tạo dựng một trang cưới độc đáo với thiệp mời cá nhân hóa, quản
                lý khoảnh khắc đáng nhớ, và tổ chức mọi chi tiết một cách tinh
                tế và dễ dàng.
              </h3>
              <Link href="/dang-nhap">
                <Button className="btn-primary fs-5 px-4">
                  <FontAwesomeIcon icon={faHeart} className="me-2" />
                  Bắt Đầu Tạo Trang Cưới Ngay
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
                    Thiệp Mời Độc Đáo
                  </Card.Title>
                  <Card.Text>
                    Thiết kế thiệp mời riêng biệt với các chủ đề, phông chữ và
                    màu sắc tùy chỉnh để tạo dấu ấn cho ngày trọng đại.
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
                    Tải lên và quản lý bộ sưu tập ảnh để lưu giữ và chia sẻ
                    những khoảnh khắc đẹp nhất của bạn.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="card h-100 text-center">
                <Card.Body>
                  <Card.Title as="h3" className="h3 mb-3">
                    <FontAwesomeIcon icon={faListCheck} className="me-2" />
                    Quản Lý Thông Minh
                  </Card.Title>
                  <Card.Text>
                    Tổ chức thông tin chuyển khoản, lời chúc và các thành phần
                    sự kiện với bảng điều khiển tiện lợi và dễ sử dụng.
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
