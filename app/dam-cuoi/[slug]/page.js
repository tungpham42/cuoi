"use client";
import { useEffect, useState } from "react";
import {
  Container,
  Spinner,
  Alert,
  Card,
  Button,
  Modal,
} from "react-bootstrap";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db, auth } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Components
import WeddingHeader from "@/components/WeddingHeader";
import Gallery from "@/components/Gallery";
import LoveStory from "@/components/LoveStory";
import WishForm from "@/components/WishForm";
import WishList from "@/components/WishList";
import Countdown from "@/components/Countdown";
import QRCode from "@/components/QRCode";
import Introduction from "@/components/Introduction";
import FallingHeart from "@/components/FallingHeart";

// Dynamic imports
const LocationMap = dynamic(() => import("@/components/LocationMap"), {
  ssr: false,
});
const AudioPlayer = dynamic(() => import("@/components/AudioPlayer"), {
  ssr: false,
});

// Sortable component for drag-and-drop
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

// Authentication hook
const useAuth = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
      },
      (error) => {
        console.error("Auth error:", error);
        router.push("/");
      }
    );

    return () => unsubscribe();
  }, [router]);

  return user;
};

// Wedding data hook
const useWeddingData = (slug) => {
  const [weddingData, setWeddingData] = useState(null);
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) {
      setError("Liên kết không hợp lệ.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch wedding data
        const weddingsRef = collection(db, "weddings");
        const q = query(weddingsRef, where("slug", "==", slug));
        const weddingSnapshot = await getDocs(q);

        if (weddingSnapshot.empty) {
          throw new Error(
            "Không tìm thấy thông tin đám cưới với liên kết này."
          );
        }

        const weddingDoc = weddingSnapshot.docs[0];
        const data = weddingDoc.data();
        const weddingId = weddingDoc.id;

        // Format wedding date and time
        const weddingDateTime = data.weddingDate
          ? data.weddingDate.toDate()
          : null;
        const formattedWedding = {
          id: weddingId,
          userId: data.userId || "",
          brideName: data.brideName || "",
          groomName: data.groomName || "",
          weddingDate: weddingDateTime
            ? weddingDateTime.toISOString().split("T")[0]
            : "",
          weddingTime: weddingDateTime
            ? weddingDateTime.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : "",
          location: data.location || "",
          loveStory: data.loveStory || "",
          theme: data.theme || "romantic",
          gallery: data.gallery || [],
          playlist: data.playlist || [],
          showCountdown: data.showCountdown !== false,
          showGallery: data.showGallery !== false,
          showLoveStory: data.showLoveStory !== false,
          showWishForm: data.showWishForm !== false,
          showWishList: data.showWishList !== false,
          showQRCode: data.showQRCode !== false,
          showIntroduction: data.showIntroduction !== false,
          showLocationMap: data.showLocationMap !== false,
          showAudioPlayer: data.showAudioPlayer !== false,
          bankInfo: data.bankInfo || {
            bankName: "",
            accountNumber: "",
            accountHolder: "",
            description: "",
          },
          introduction: data.introduction || "",
          mapInfo: data.mapInfo || { embedCode: "", address: "" },
          componentOrder: data.componentOrder || [
            "WeddingHeader",
            "Countdown",
            "Gallery",
            "LoveStory",
            "LocationMap",
            "QRCode",
            "WishForm",
            "WishList",
            "AudioPlayer",
          ], // Removed Introduction from sortable components
          primaryFont: data.primaryFont || "Dancing Script",
          secondaryFont: data.secondaryFont || "Lora",
          wishes: [],
        };

        // Fetch approved wishes
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
        console.error("Error fetching wedding data:", err);
        setError(
          err.message || "Lỗi khi tải thông tin đám cưới. Vui lòng thử lại."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  return { weddingData, wishes, loading, error };
};

// Component rendering logic
const renderComponent = (componentId, weddingData, addWish) => {
  if (!weddingData) return null;
  const components = {
    WeddingHeader: () => <WeddingHeader data={weddingData} />,
    Countdown: () =>
      weddingData.showCountdown &&
      weddingData.weddingDate &&
      weddingData.weddingTime && (
        <Countdown
          weddingDate={weddingData.weddingDate}
          weddingTime={weddingData.weddingTime}
        />
      ),
    Gallery: () =>
      weddingData.showGallery && <Gallery images={weddingData.gallery} />,
    LoveStory: () =>
      weddingData.showLoveStory && <LoveStory text={weddingData.loveStory} />,
    LocationMap: () =>
      weddingData.showLocationMap && <LocationMap form={weddingData} />,
    QRCode: () =>
      weddingData.showQRCode && <QRCode bankInfo={weddingData.bankInfo} />,
    WishForm: () => weddingData.showWishForm && <WishForm onSubmit={addWish} />,
    WishList: () =>
      weddingData.showWishList && <WishList wishes={weddingData.wishes} />,
    AudioPlayer: () =>
      weddingData.showAudioPlayer && (
        <AudioPlayer playlist={weddingData.playlist} />
      ),
  };

  return components[componentId]?.() || null;
};

export default function WeddingPage({ params }) {
  const { slug } = params;
  const user = useAuth();
  const { weddingData, wishes, loading, error } = useWeddingData(slug);
  const [showModal, setShowModal] = useState(false);

  // Open modal on page load if introduction is available
  useEffect(() => {
    if (weddingData?.showIntroduction && weddingData?.introduction) {
      setShowModal(true);
    }
  }, [weddingData]);

  // Update wishes in weddingData for rendering
  useEffect(() => {
    if (weddingData) {
      weddingData.wishes = wishes;
    }
  }, [wishes, weddingData]);

  // Handle wish submission
  const addWish = async (name, message) => {
    if (!weddingData?.id) {
      console.error("No wedding ID available for adding wish.");
      return;
    }
    try {
      const wishesRef = collection(db, "weddings", weddingData.id, "wishes");
      await addDoc(wishesRef, {
        name,
        message,
        createdAt: new Date(),
        approved: false,
      });
    } catch (err) {
      console.error("Error adding wish:", err);
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
        <Card
          className="shadow-lg border-0 mx-auto"
          style={{ maxWidth: "600px" }}
        >
          <Card.Body className="p-4">
            <Alert variant="danger">
              {error ||
                "Không có dữ liệu để hiển thị. Vui lòng kiểm tra liên kết."}
            </Alert>
            <Link href="/" passHref>
              <Button variant="primary" className="w-100">
                Quay lại trang chủ
              </Button>
            </Link>
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
            }
          `,
        }}
      />
      <Card className="shadow-lg border-0 mx-auto wedding-page">
        <Card.Body style={{ zIndex: 1 }}>
          {user && (
            <div className="d-flex justify-content-left mb-4">
              <Link href="/quan-tri" passHref>
                <Button variant="outline-primary">
                  Quay lại trang quản trị
                </Button>
              </Link>
            </div>
          )}
          <DndContext collisionDetection={closestCenter}>
            <SortableContext
              items={weddingData.componentOrder}
              strategy={verticalListSortingStrategy}
            >
              {weddingData.componentOrder.map((id) => (
                <SortableComponent key={id} id={id} disabled>
                  {renderComponent(id, weddingData, addWish)}
                </SortableComponent>
              ))}
            </SortableContext>
          </DndContext>
        </Card.Body>
      </Card>
      {weddingData.showIntroduction && (
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          centered
          data-theme={weddingData.theme}
        >
          <Modal.Header closeButton>
            <Modal.Title>Chào mừng đến với đám cưới của chúng tôi</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Introduction form={weddingData} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => setShowModal(false)}>
              Đóng
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      <FallingHeart />
    </Container>
  );
}
