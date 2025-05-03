"use client";
import { useEffect, useState } from "react";
import { auth, provider, db } from "@/firebase/config";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { Button, Container, Card, Image, Spinner } from "react-bootstrap";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [user, setUser] = useState(null); // State to track user
  const [loading, setLoading] = useState(true); // State to handle loading
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

      router.push("/settings");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Clear user state on logout
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
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
        setUser(user); // Set user in state
      } else {
        setUser(null); // Clear user state if not authenticated
      }
      setLoading(false); // Mark loading as complete
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []);

  // Handle prerendering or initial load
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
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{
        background: "linear-gradient(to bottom right, #FFF1F2, #FFE4E6)",
      }}
    >
      <Card
        className="shadow-lg border-0"
        style={{
          maxWidth: "400px",
          width: "100%",
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

        <Card.Body className="p-4 text-center">
          <Card.Title
            className="mb-4"
            style={{
              fontFamily: "'Great Vibes', cursive",
              color: "#BE123C",
              fontSize: "2rem",
            }}
          >
            Our Special Day
          </Card.Title>

          {user ? (
            <div className="d-flex flex-column align-items-center">
              <div className="d-flex align-items-center mb-3">
                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#9F1239",
                    fontSize: "1.1rem",
                  }}
                >
                  Xin chào, {user.displayName}
                </span>
              </div>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleLogout}
                style={{
                  backgroundColor: "#BE123C",
                  borderColor: "#BE123C",
                  color: "white",
                  fontFamily: "'Playfair Display', serif",
                  borderRadius: "20px",
                  padding: "8px 20px",
                }}
                className="mt-2"
              >
                Đăng xuất
              </Button>
            </div>
          ) : (
            <div className="d-flex flex-column align-items-center">
              <Card.Text
                className="mb-3"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#BE123C",
                  fontStyle: "italic",
                }}
              >
                Join us in celebrating love and togetherness
              </Card.Text>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleLogin}
                style={{
                  backgroundColor: "#F43F5E",
                  borderColor: "#F43F5E",
                  color: "white",
                  fontFamily: "'Playfair Display', serif",
                  borderRadius: "20px",
                  padding: "8px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  ></path>
                </svg>
                Đăng nhập với Google
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
