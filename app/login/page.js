"use client";
import { useEffect, useState } from "react";
import { auth, provider, db } from "@/firebase/config";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { Button, Container, Card, Spinner } from "react-bootstrap";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [user, setUser] = useState(null); // Trạng thái theo dõi người dùng
  const [loading, setLoading] = useState(true); // Trạng thái xử lý tải
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
      setUser(null); // Xóa trạng thái người dùng khi đăng xuất
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
        setUser(user); // Cập nhật trạng thái người dùng
      } else {
        setUser(null); // Xóa trạng thái nếu không xác thực
      }
      setLoading(false); // Hoàn tất tải
    });

    return () => unsubscribe(); // Dọn dẹp subscription
  }, []);

  // Xử lý tải ban đầu
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
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="me-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  ></path>
                </svg>
                Đăng Nhập Với Google
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
