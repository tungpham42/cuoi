"use client";
import { useEffect, useState } from "react";
import { db } from "@/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import {
  Container,
  Card,
  Button,
  Spinner,
  Alert,
  Modal,
} from "react-bootstrap";
import Link from "next/link";
import { formatDateTime } from "@/utils/dateTime";

const fallbackWedding = {
  brideName: "Cô Dâu",
  groomName: "Chú Rể",
  weddingDate: "Chưa xác định",
  weddingTime: "Chưa xác định",
  location: "Chưa xác định",
};

const fallbackGuest = {
  name: "Khách Mời",
  rsvpStatus: "Chưa phản hồi",
};

const formatRsvpStatus = (status) => {
  switch (status) {
    case "confirmed":
      return "Xác nhận";
    case "declined":
      return "Từ chối";
    case "pending":
    default:
      return "Chưa phản hồi";
  }
};

function useWeddingAndGuest(slug, guestId) {
  const [data, setData] = useState({
    wedding: null,
    guest: null,
    loading: true,
    error: "",
  });

  const updateRsvp = async (weddingId, guestId, status) => {
    if (!weddingId || !guestId) return;
    try {
      const guestRef = doc(db, `weddings/${weddingId}/guests/${guestId}`);
      await updateDoc(guestRef, {
        rsvpStatus: status,
        updatedAt: new Date(),
      });
      setData((prev) => ({
        ...prev,
        guest: { ...prev.guest, rsvpStatus: status },
      }));
    } catch (error) {
      console.error("Error updating RSVP:", error.code, error.message);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        if (!slug || !guestId) {
          return setData({
            wedding: null,
            guest: null,
            loading: false,
            error: "Liên kết không hợp lệ.",
          });
        }

        const weddingsRef = collection(db, "weddings");
        const weddingQuery = query(weddingsRef, where("slug", "==", slug));
        const weddingSnapshot = await getDocs(weddingQuery);

        if (weddingSnapshot.empty) {
          return setData({
            wedding: null,
            guest: null,
            loading: false,
            error: "Không tìm thấy thông tin hôn lễ.",
          });
        }

        const weddingDoc = weddingSnapshot.docs[0];
        const weddingDataRaw = { id: weddingDoc.id, ...weddingDoc.data() };

        const weddingDateTime = weddingDataRaw.weddingDate
          ? weddingDataRaw.weddingDate.toDate()
          : null;

        const weddingData = {
          ...weddingDataRaw,
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
        };

        const guestDocRef = doc(
          db,
          `weddings/${weddingData.id}/guests/${guestId}`
        );
        const guestDoc = await getDoc(guestDocRef);

        if (!guestDoc.exists()) {
          return setData({
            wedding: null,
            guest: null,
            loading: false,
            error: "Không tìm thấy thông tin khách mời.",
          });
        }

        const guestData = guestDoc.data();

        setData({
          wedding: weddingData,
          guest: guestData,
          loading: false,
          error: "",
        });
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        setData({
          wedding: null,
          guest: null,
          loading: false,
          error: "Lỗi khi tải thông tin. Vui lòng thử lại.",
        });
      }
    }

    fetchData();
  }, [slug, guestId]);

  return { ...data, updateRsvp };
}

const generateICSContent = ({
  title,
  description,
  location,
  startDate,
  endDate,
}) => {
  const pad = (num) => String(num).padStart(2, "0");
  const formatDate = (date) => {
    return (
      date.getUTCFullYear().toString() +
      pad(date.getUTCMonth() + 1) +
      pad(date.getUTCDate()) +
      "T" +
      pad(date.getUTCHours()) +
      pad(date.getUTCMinutes()) +
      "00Z"
    );
  };

  const dtStart = formatDate(startDate);
  const dtEnd = formatDate(endDate);

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Wedding Invitation//EN
BEGIN:VEVENT
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
DTSTART:${dtStart}
DTEND:${dtEnd}
END:VEVENT
END:VCALENDAR`;
};

export default function GuestPage({ params }) {
  const { slug, id } = params;
  const { wedding, guest, loading, error, updateRsvp } = useWeddingAndGuest(
    slug,
    id
  );
  const [showModal, setShowModal] = useState(false);

  const handleRsvpConfirm = async () => {
    await updateRsvp(wedding?.id, id, "confirmed");
    setShowModal(false);
  };

  const handleRsvpDecline = async () => {
    await updateRsvp(wedding?.id, id, "declined");
    setShowModal(false);
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  if (loading) {
    return (
      <Container fluid className="loading-container wedding-page">
        <div className="d-flex align-items-center justify-content-center">
          <Spinner animation="border" variant="danger" />
          <span className="loading-text ms-2">Đang tải thông tin...</span>
        </div>
      </Container>
    );
  }

  if (error || !wedding || !guest) {
    return (
      <Container
        fluid
        className="loading-container wedding-page"
        data-theme={wedding.theme}
        style={{
          backgroundImage: wedding?.backgroundImage
            ? `url(/backgrounds/${wedding.backgroundImage}) !important`
            : undefined,
        }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
            p,
            span,
            button,
            a,
            .modal-content,
            .modal-body {
              font-family: "${wedding.secondaryFont}", serif !important;
            }
            h1,
            h2,
            h3,
            h4,
            h5,
            h6,
            .h1,
            .h2,
            .h3,
            .h4,
            .h5,
            .h6,
            .modal-title {
              font-family: "${wedding.primaryFont}", cursive !important;
            }
          `,
          }}
        />
        <Card
          className="wedding-section"
          style={{
            maxWidth: "600px",
          }}
        >
          <Card.Body className="p-5 text-center">
            <Alert variant="danger" className="mb-4">
              {error || "Không tìm thấy thông tin hôn lễ hoặc khách mời."}
            </Alert>
            <Button variant="primary" href="/" className="btn-redirect w-100">
              Quay lại trang chủ
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const {
    brideName = fallbackWedding.brideName,
    groomName = fallbackWedding.groomName,
    weddingDate: rawWeddingDate,
    weddingTime: rawWeddingTime,
    location = fallbackWedding.location,
  } = wedding;

  const {
    name: guestName = fallbackGuest.name,
    rsvpStatus = fallbackGuest.rsvpStatus,
  } = guest;
  const rsvp = formatRsvpStatus(rsvpStatus);

  // Use formatDateTime to combine date and time
  const formattedDateTime = formatDateTime(rawWeddingDate, rawWeddingTime);

  const [hour, minute] = rawWeddingTime.split(":").map(Number);
  const startDate = new Date(`${rawWeddingDate}T${rawWeddingTime}`);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  const downloadICS = () => {
    const title = `Hôn lễ của ${brideName} & ${groomName}`;
    const description = `Tham dự hôn lễ của ${brideName} và ${groomName}`;
    const icsContent = generateICSContent({
      title,
      description,
      location,
      startDate,
      endDate,
    });

    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wedding-invite.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateGoogleCalendarUrl = () => {
    const title = `Hôn lễ của ${brideName} & ${groomName}`;
    const details = `Tham dự hôn lễ của ${brideName} và ${groomName}`;
    const formatDate = (date) =>
      date.toISOString().replace(/[-:]|\.\d{3}/g, "");
    const url = new URL("https://calendar.google.com/calendar/render");
    url.searchParams.set("action", "TEMPLATE");
    url.searchParams.set("text", title);
    url.searchParams.set("details", details);
    url.searchParams.set("location", location);
    url.searchParams.set(
      "dates",
      `${formatDate(startDate)}/${formatDate(endDate)}`
    );
    return url.toString();
  };

  return (
    <Container
      fluid
      className="wedding-page d-flex justify-content-center"
      style={{
        backgroundImage: wedding.backgroundImage
          ? `url(/backgrounds/${wedding.backgroundImage})`
          : undefined,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        minHeight: "100dvh",
      }}
      data-theme={wedding.theme}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            p,
            span,
            button,
            a,
            .modal-content,
            .modal-body {
              font-family: "${wedding.secondaryFont}", serif !important;
            }
            h1,
            h2,
            h3,
            h4,
            h5,
            h6,
            .h1,
            .h2,
            .h3,
            .h4,
            .h5,
            .h6,
            .modal-title {
              font-family: "${wedding.primaryFont}", cursive !important;
            }
          `,
        }}
      />
      <Card
        className="wedding-section hover-shadow animate__animated animate__fadeInDown m-auto"
        style={{
          maxWidth: "600px",
        }}
      >
        <Card.Body className="p-5 text-center">
          <Card.Title as="h1" className="card-title h1 mb-4 fw-bolder">
            Thiệp Mời Hôn Lễ
          </Card.Title>
          <Card.Text as="h2" className="h2 mb-4">
            Kính mời: <span className="text-accent fw-bolder">{guestName}</span>
          </Card.Text>
          <Card.Text className="mb-2">Tham dự hôn lễ của</Card.Text>
          <Card.Text as="h3" className="mb-4">
            <strong>
              {brideName} & {groomName}
            </strong>
          </Card.Text>
          <div className="mb-4">
            <Card.Text>
              <strong>Ngày và giờ: </strong>
              {formattedDateTime}
            </Card.Text>
            <Card.Text>
              <strong>Địa điểm: </strong>
              {location}
            </Card.Text>
            <Card.Text>
              <strong>Trạng thái phúc đáp: </strong>
              {rsvp}
            </Card.Text>
            <Card.Text className="mt-4 small text-muted">
              Xem toàn bộ thông tin tại{" "}
              <Link
                href={`/dam-cuoi/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-underline text-accent"
              >
                trang đám cưới
              </Link>
            </Card.Text>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="animate__animated animate__pulse animate__infinite"
            onClick={handleShowModal}
          >
            {rsvpStatus === "confirmed"
              ? "🎉 Đã Xác Nhận"
              : rsvpStatus === "declined"
              ? "❌ Đã Từ Chối"
              : "✅ Xác Nhận Tham Dự"}
          </Button>
        </Card.Body>
      </Card>
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác Nhận Tham Dự</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Bạn có muốn xác nhận tham dự hoặc từ chối tham dự hôn lễ của{" "}
            {brideName} & {groomName} vào {formattedDateTime} tại {location}?
          </p>
          <div className="d-grid gap-2">
            <Button variant="outline-success" onClick={downloadICS}>
              📅 Tải về lịch (.ics)
            </Button>
            <Button
              variant="outline-info"
              href={generateGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
            >
              ➕ Thêm vào Google Calendar
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Hủy
          </Button>
          <Button variant="outline-primary" onClick={handleRsvpDecline}>
            Từ Chối
          </Button>
          <Button variant="primary" onClick={handleRsvpConfirm}>
            Xác Nhận
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
