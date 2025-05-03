"use client";
import { useEffect } from "react";
import { auth, provider, db } from "@/firebase/config";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "react-bootstrap";

export default function Auth() {
  const handleLogin = async () => {
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
  };

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
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
      }
    });
  }, []);

  return (
    <div className="text-end p-2">
      {user ? (
        <>
          <span className="me-2">Xin chào, {user.displayName}</span>
          <Button variant="outline-danger" size="sm" onClick={logout}>
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
