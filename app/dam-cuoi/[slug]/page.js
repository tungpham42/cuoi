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
import QRCode from "@/components/QRCode";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableComponent = ({ id, children, disabled }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: disabled ? "default" : "grab",
    padding: "10px 0",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

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

        // Query Firestore for a wedding document with the matching slug
        const weddingsRef = collection(db, "weddings");
        const q = query(weddingsRef, where("slug", "==", slug));
        const weddingSnapshot = await getDocs(q);

        if (weddingSnapshot.empty) {
          throw new Error("Không tìm thấy thông tin đám cưới.");
        }

        const weddingDoc = weddingSnapshot.docs[0];
        const data = weddingDoc.data();
        const weddingId = weddingDoc.id;

        const formattedWedding = {
          id: weddingId,
          userId: data.userId || "",
          brideName: data.brideName || "",
          groomName: data.groomName || "",
          weddingDate:
            data.weddingDate?.toDate().toLocaleDateString("vi-VN") || "",
          location: data.location || "",
          loveStory: data.loveStory || "",
          theme: data.theme || "romantic",
          gallery: data.gallery || [],
          showCountdown: data.showCountdown !== false,
          showGallery: data.showGallery !== false,
          showLoveStory: data.showLoveStory !== false,
          showWishForm: data.showWishForm !== false,
          showWishList: data.showWishList !== false,
          showQRCode: data.showQRCode || false,
          bankInfo: data.bankInfo || {},
          componentOrder: data.componentOrder || [
            "WeddingHeader",
            "Countdown",
            "Gallery",
            "LoveStory",
            "QRCode",
            "WishForm",
            "WishList",
          ],
          primaryFont: data.primaryFont || "Dancing Script",
          secondaryFont: data.secondaryFont || "Lora",
        };

        // Fetch wishes
        const wishesRef = collection(db, "weddings", weddingId, "wishes");
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
    const wishesRef = collection(db, "weddings", weddingData.id, "wishes");
    await addDoc(wishesRef, {
      name,
      message,
      createdAt: new Date(),
      approved: false,
    });
  };

  const renderComponent = (componentId) => {
    switch (componentId) {
      case "WeddingHeader":
        return <WeddingHeader data={weddingData} />;
      case "Countdown":
        return (
          weddingData.showCountdown && (
            <Countdown weddingDate={weddingData.weddingDate} />
          )
        );
      case "Gallery":
        return (
          weddingData.showGallery && <Gallery images={weddingData.gallery} />
        );
      case "LoveStory":
        return (
          weddingData.showLoveStory && (
            <LoveStory text={weddingData.loveStory} />
          )
        );
      case "QRCode":
        return (
          weddingData.showQRCode && <QRCode bankInfo={weddingData.bankInfo} />
        );
      case "WishForm":
        return weddingData.showWishForm && <WishForm onSubmit={addWish} />;
      case "WishList":
        return weddingData.showWishList && <WishList wishes={wishes} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container
        fluid
        className="d-flex align-items-center justify-content-center min-vh-100"
      >
        <Spinner animation="border" variant="danger" />
        <span className="ms-2 h3">Đang tải...</span>
      </Container>
    );
  }

  if (error || !weddingData) {
    return (
      <Container
        fluid
        className="py-5"
        data-theme={weddingData?.theme || "romantic"}
      >
        <Card className="shadow-lg border-0 mx-auto">
          <Card.Body className="p-4">
            <Alert variant="danger">
              {error || "Không có dữ liệu để hiển thị."}
            </Alert>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="p-0" data-theme={weddingData.theme}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .wedding-page,
        .wedding-page p,
        .wedding-page span {
          font-family: "${weddingData.secondaryFont}", serif !important;
        }
        .wedding-page h1,
        .wedding-page h2,
        .wedding-page h3,
        .wedding-page h4,
        .wedding-page h5,
        .wedding-page h6,
        .wedding-page .h1,
        .wedding-page .h2,
        .wedding-page .h3,
        .wedding-page .h4,
        .wedding-page .h5,
        .wedding-page .h6 {
          font-family: "${weddingData.primaryFont}", cursive !important;
        }`,
        }}
      />
      <Card className="shadow-lg border-0 mx-auto wedding-page">
        <Card.Body>
          <DndContext collisionDetection={closestCenter}>
            <SortableContext
              items={weddingData.componentOrder}
              strategy={verticalListSortingStrategy}
            >
              {weddingData.componentOrder.map((id) => (
                <SortableComponent key={id} id={id} disabled>
                  {renderComponent(id)}
                </SortableComponent>
              ))}
            </SortableContext>
          </DndContext>
        </Card.Body>
      </Card>
    </Container>
  );
}
