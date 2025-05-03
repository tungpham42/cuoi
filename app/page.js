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
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="text-center mb-5">
        <Col>
          <h1>Chào mừng bạn đến với trang cưới của chúng tôi!</h1>
          <p>
            Đây là nơi để bạn quản lý và chia sẻ thông tin về đám cưới của mình,
            bao gồm ngày cưới, địa điểm, câu chuyện tình yêu và những bức ảnh
            đáng nhớ.
          </p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Chỉnh sửa thông tin</Card.Title>
              <Card.Text>
                Cập nhật thông tin về đám cưới của bạn, bao gồm tên cô dâu chú
                rể, ngày cưới, địa điểm và nhiều hơn nữa.
              </Card.Text>
              <Button
                variant="primary"
                onClick={() => router.push("/settings")}
              >
                Đi tới Cài đặt
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Thư viện ảnh</Card.Title>
              <Card.Text>
                Thêm và quản lý các bức ảnh trong thư viện cưới của bạn, chia sẻ
                khoảnh khắc đáng nhớ.
              </Card.Text>
              <Button
                variant="secondary"
                onClick={() => router.push("/gallery")}
              >
                Xem Thư viện
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Chúc mừng cô dâu chú rể</Card.Title>
              <Card.Text>
                Khách mời có thể gửi lời chúc đến cô dâu chú rể trong sổ lưu
                niệm.
              </Card.Text>
              <Button
                variant="success"
                onClick={() => router.push("/guestbook")}
              >
                Gửi Lời Chúc
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="text-center">
        <Col>
          <h3>Thông báo</h3>
          <Alert variant="info">
            Hãy chia sẻ khoảnh khắc tuyệt vời của bạn với mọi người ngay hôm
            nay!
          </Alert>
        </Col>
      </Row>
    </Container>
  );
}
