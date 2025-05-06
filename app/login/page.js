"use client";
import { useEffect, useState } from "react";
import { auth, provider, db } from "@/firebase/config";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { Button, Container, Card, Spinner, Row, Col } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faUserCircle,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

export default function LoginPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          photoURL: user.photoURL,
          role: "couple",
          createdAt: serverTimestamp(),
        });
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Đăng nhập thất bại:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Đăng xuất thất bại:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: serverTimestamp(),
          });
        }
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Container fluid className="loading-container text-center">
        <Spinner animation="border" className="login-icon" variant="danger" />
        <span className="loading-text fs-4">Đang tải...</span>
      </Container>
    );
  }

  return (
    <div className="login-background" data-theme="romantic">
      <div className="login-overlay"></div>
      <div className="login-container">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="login-card">
              <Card.Body className="p-5 text-center">
                {user ? (
                  <div className="d-flex flex-column align-items-center">
                    <FontAwesomeIcon
                      icon={faUserCircle}
                      size="3x"
                      className="login-icon mb-3"
                    />
                    <h4 className="login-user-greeting mb-4">
                      Chào mừng, {user.displayName}
                    </h4>
                    <Button
                      variant="outline-danger"
                      size="lg"
                      onClick={handleLogout}
                      className="login-btn-logout login-button"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                      Đăng Xuất
                    </Button>
                  </div>
                ) : (
                  <div className="d-flex flex-column align-items-center">
                    <FontAwesomeIcon
                      icon={faHeart}
                      size="3x"
                      className="login-icon mb-3"
                    />
                    <h3 className="login-heading mb-3">
                      Bắt Đầu Lên Kế Hoạch Đám Cưới
                    </h3>
                    <p className="login-text mb-4">
                      Đăng nhập để tạo thiệp mời cá nhân hóa, quản lý ảnh, lời
                      chúc, và thông tin khác cho ngày cưới trong mơ của bạn.
                    </p>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleLogin}
                      className="login-btn-primary login-button"
                    >
                      <FontAwesomeIcon icon={faGoogle} className="me-2" />
                      Đăng Nhập Với Google
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
