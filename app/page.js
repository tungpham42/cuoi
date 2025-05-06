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
                Lên kế hoạch cho ngày hoàn hảo với sự thanh lịch và dễ dàng. Từ
                thiệp mời đến kỷ niệm, chúng tôi ở đây để khiến đám cưới của bạn
                trở nên khó quên.
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
                    Thiệp Mời Thanh Lịch
                  </Card.Title>
                  <Card.Text>
                    Tạo thiệp mời cá nhân hóa tuyệt đẹp, đặt giai điệu cho ngày
                    đặc biệt của bạn.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="card h-100 text-center">
                <Card.Body>
                  <Card.Title as="h3" className="h3 mb-3">
                    <FontAwesomeIcon icon={faCamera} className="me-2" />
                    Khoảnh Khắc Đáng Nhớ
                  </Card.Title>
                  <Card.Text>
                    Ghi lại mọi khoảnh khắc với bộ sưu tập ảnh và công cụ chia
                    sẻ của chúng tôi.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="card h-100 text-center">
                <Card.Body>
                  <Card.Title as="h3" className="h3 mb-3">
                    <FontAwesomeIcon icon={faListCheck} className="me-2" />
                    Lên Kế Hoạch Mượt Mà
                  </Card.Title>
                  <Card.Text>
                    Sắp xếp mọi chi tiết với bảng điều khiển trực quan và danh
                    sách mong muốn.
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
