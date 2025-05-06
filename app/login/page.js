"use client";
import { useEffect, useState } from "react";
import { auth, provider, db } from "@/firebase/config";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { Button, Container, Card, Spinner } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faUserCircle } from "@fortawesome/free-solid-svg-icons";
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
      <Container
        fluid
        className="loading-container d-flex align-items-center justify-content-center min-vh-100"
        data-theme="modern"
      >
        <Spinner animation="border" style={{ color: "var(--accent)" }} />
        <span className="loading-text ms-2">Đang tải...</span>
      </Container>
    );
  }

  return (
    <Container
      fluid
      className="wedding-section d-flex align-items-center justify-content-center min-vh-100"
      data-theme="romantic"
    >
      <Card className="dashboard-card">
        <Card.Body className="p-4 text-center">
          <Card.Title className="login-card-title">
            Chuẩn Bị Cho Ngày Cưới Của Bạn
          </Card.Title>

          {user ? (
            <div className="d-flex flex-column align-items-center">
              <div className="d-flex align-items-center mb-3">
                <FontAwesomeIcon icon={faUserCircle} className="me-2" />
                <span className="login-user-greeting">
                  Xin chào, {user.displayName}
                </span>
              </div>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleLogout}
                className="btn-logout login-button"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                Đăng Xuất
              </Button>
            </div>
          ) : (
            <div className="d-flex flex-column align-items-center">
              <Card.Text className="login-card-text">
                Bắt đầu lên kế hoạch cho ngày cưới đáng nhớ của bạn
              </Card.Text>
              <Button
                variant="primary"
                size="sm"
                onClick={handleLogin}
                className="btn-primary login-button"
              >
                <FontAwesomeIcon icon={faGoogle} className="me-2" />
                Đăng Nhập Với Google
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
