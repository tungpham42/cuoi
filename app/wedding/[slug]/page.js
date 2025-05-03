"use client";
import { useEffect, useState } from "react";
import { Container, Spinner, Alert, Card } from "react-bootstrap";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import WeddingHeader from "@/components/WeddingHeader";
import Gallery from "@/components/Gallery";
import LoveStory from "@/components/LoveStory";
import WishForm from "@/components/WishForm";
import WishList from "@/components/WishList";
import Countdown from "@/components/Countdown";

export default function WeddingPage({ params }) {
  const { slug } = params;

  const [weddingData, setWeddingData] = useState(null);
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "users"), where("slug", "==", slug));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          throw new Error("Không tìm thấy thông tin đám cưới.");
        }

        const userDoc = snapshot.docs[0];
        const userId = userDoc.id;
        const data = userDoc.data();

        const formattedWedding = {
          id: userId,
          brideName: data.brideName || "",
          groomName: data.groomName || "",
          weddingDate:
            data.weddingDate?.toDate().toLocaleDateString("vi-VN") || "",
          location: data.location || "",
          loveStory: data.loveStory || "",
          theme: data.theme || "romantic",
          gallery: data.gallery || [],
        };

        const wishesRef = collection(db, "users", userId, "wishes");
        const wishesQuery = query(wishesRef, where("approved", "==", true));
        const wishesSnap = await getDocs(wishesQuery);
        const wishesList = wishesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setWeddingData(formattedWedding);
        setWishes(wishesList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const addWish = async (name, message) => {
    if (!weddingData?.id) return;
    const wishesRef = collection(db, "users", weddingData.id, "wishes");
    await addDoc(wishesRef, {
      name,
      message,
      createdAt: new Date(),
      approved: false,
    });
  };

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

  if (error || !weddingData) {
    return (
      <Container
        fluid
        className="py-5"
        style={{
          background: "linear-gradient(to bottom right, #FFF1F2, #FFE4E6)",
          backgroundImage: "url('/paper-fibers.png')",
          minHeight: "100vh",
        }}
      >
        <Card
          className="shadow-lg border-0 mx-auto"
          style={{
            maxWidth: "900px",
            border: "1px solid #FECACA",
            position: "relative",
            overflow: "hidden",
          }}
        >
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
          <Card.Body className="p-4">
            <Alert
              variant="danger"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {error || "Không có dữ liệu để hiển thị."}
            </Alert>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container
      fluid
      className="py-5"
      style={{
        background: "linear-gradient(to bottom right, #FFF1F2, #FFE4E6)",
        backgroundImage: "url('/paper-fibers.png')",
        minHeight: "100vh",
      }}
    >
      <Card
        className="shadow-lg border-0 mx-auto"
        style={{
          maxWidth: "900px",
          border: "1px solid #FECACA",
          position: "relative",
          overflow: "hidden",
        }}
      >
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
        <Card.Body className="p-4">
          <WeddingHeader data={weddingData} />
          <Countdown weddingDate={weddingData.weddingDate} />
          <Gallery images={weddingData.gallery} />
          <LoveStory text={weddingData.loveStory} />
          <WishForm onSubmit={addWish} />
          <WishList wishes={wishes} />
        </Card.Body>
      </Card>
    </Container>
  );
}
