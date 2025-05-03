"use client";
import { useEffect, useState } from "react";
import { auth, provider, db } from "@/firebase/config";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "react-bootstrap";
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
    return <div>Loading...</div>; // Show loading state during prerendering
  }

  return (
    <div className="text-end p-2">
      {user ? (
        <>
          <span className="me-2">Xin chào, {user.displayName}</span>
          <Button variant="outline-danger" size="sm" onClick={handleLogout}>
            Đăng xuất
          </Button>
        </>
      ) : (
        <Button variant="outline-primary" size="sm" onClick={handleLogin}>
          Đăng nhập với Google
        </Button>
      )}
    </div>
  );
}
