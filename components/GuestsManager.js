"use client";
import { useState, useEffect, useCallback } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import Link from "next/link";
import { db } from "@/firebase/config";
import {
  Button,
  Form,
  Modal,
  Row,
  Col,
  Spinner,
  Alert,
  Card,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faEdit,
  faTrash,
  faCheck,
  faTimes,
  faUsers,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

const GuestsManager = ({ slug, weddingId, userId }) => {
  const [guests, setGuests] = useState([]);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [guestForm, setGuestForm] = useState({
    name: "",
    contact: "",
    rsvpStatus: "pending",
    plusOne: false,
    plusOneName: "",
    dietaryRestrictions: "",
    tableNumber: "",
    notes: "",
  });

  // Load guests from Firestore
  const loadGuests = useCallback(async () => {
    if (!weddingId || !userId) {
      setError("Thiếu thông tin đám cưới hoặc người dùng.");
      return;
    }
    setIsLoading(true);
    try {
      const guestsRef = collection(db, "weddings", weddingId, "guests");
      const q = query(guestsRef, where("userId", "==", userId));
      const guestsSnap = await getDocs(q);
      const guestsList = guestsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGuests(guestsList);
      setError("");
    } catch (err) {
      setError("Lỗi khi tải danh sách khách mời. Vui lòng thử lại.");
      console.error("Lỗi tải khách mời:", err);
    } finally {
      setIsLoading(false);
    }
  }, [weddingId, userId]);

  useEffect(() => {
    loadGuests();
  }, [loadGuests]);

  // Handle form input changes
  const handleGuestChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGuestForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!guestForm.name.trim()) {
      setError("Tên khách mời là bắt buộc.");
      return false;
    }
    if (guestForm.plusOne && !guestForm.plusOneName.trim()) {
      setError("Tên người đi kèm là bắt buộc nếu có người đi kèm.");
      return false;
    }
    if (guestForm.tableNumber && isNaN(guestForm.tableNumber)) {
      setError("Số bàn tiệc phải là số hợp lệ.");
      return false;
    }
    return true;
  };

  // Handle adding or editing a guest
  const handleGuestSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const guestsRef = collection(db, "weddings", weddingId, "guests");
      const guestData = {
        name: guestForm.name,
        contact: guestForm.contact,
        rsvpStatus: guestForm.rsvpStatus,
        plusOne: guestForm.plusOne,
        plusOneName: guestForm.plusOne ? guestForm.plusOneName : "",
        dietaryRestrictions: guestForm.dietaryRestrictions,
        tableNumber: guestForm.tableNumber,
        notes: guestForm.notes,
        userId,
        updatedAt: new Date(),
      };

      if (editingGuestId) {
        const guestRef = doc(
          db,
          "weddings",
          weddingId,
          "guests",
          editingGuestId
        );
        await updateDoc(guestRef, guestData);
        setGuests((prev) =>
          prev.map((guest) =>
            guest.id === editingGuestId ? { ...guest, ...guestData } : guest
          )
        );
        setSuccess("Cập nhật khách mời thành công!");
      } else {
        guestData.createdAt = new Date();
        const newGuestRef = await addDoc(guestsRef, guestData);
        setGuests((prev) => [...prev, { id: newGuestRef.id, ...guestData }]);
        setSuccess("Thêm khách mời thành công!");
      }

      resetForm();
    } catch (err) {
      setError("Lỗi khi lưu thông tin khách mời. Vui lòng thử lại.");
      console.error("Lỗi lưu khách mời:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form and modal
  const resetForm = () => {
    setShowGuestModal(false);
    setGuestForm({
      name: "",
      contact: "",
      rsvpStatus: "pending",
      plusOne: false,
      plusOneName: "",
      dietaryRestrictions: "",
      tableNumber: "",
      notes: "",
    });
    setEditingGuestId(null);
    setError("");
    setTimeout(() => setSuccess(""), 3000);
  };

  // Handle editing a guest
  const handleEditGuest = (guest) => {
    setGuestForm({
      name: guest.name || "",
      contact: guest.contact || "",
      rsvpStatus: guest.rsvpStatus || "pending",
      plusOne: guest.plusOne || false,
      plusOneName: guest.plusOneName || "",
      dietaryRestrictions: guest.dietaryRestrictions || "",
      tableNumber: guest.tableNumber || "",
      notes: guest.notes || "",
    });
    setEditingGuestId(guest.id);
    setShowGuestModal(true);
    setError("");
  };

  // Handle deleting a guest
  const handleDeleteGuest = async (guestId) => {
    if (!weddingId) {
      setError("Vui lòng chọn một đám cưới trước khi xóa khách mời.");
      return;
    }
    setIsLoading(true);
    try {
      const guestRef = doc(db, "weddings", weddingId, "guests", guestId);
      await deleteDoc(guestRef);
      setGuests((prev) => prev.filter((guest) => guest.id !== guestId));
      setSuccess("Xóa khách mời thành công!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Lỗi khi xóa khách mời. Vui lòng thử lại.");
      console.error("Lỗi xóa khách mời:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle RSVP status change
  const handleRsvpChange = async (guestId, newStatus) => {
    if (!weddingId) {
      setError("Vui lòng chọn một đám cưới trước khi cập nhật RSVP.");
      return;
    }
    setIsLoading(true);
    try {
      const guestRef = doc(db, "weddings", weddingId, "guests", guestId);
      await updateDoc(guestRef, {
        rsvpStatus: newStatus,
        updatedAt: new Date(),
      });
      setGuests((prev) =>
        prev.map((guest) =>
          guest.id === guestId
            ? { ...guest, rsvpStatus: newStatus, updatedAt: new Date() }
            : guest
        )
      );
      setSuccess("Cập nhật trạng thái RSVP thành công!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Lỗi khi cập nhật trạng thái RSVP. Vui lòng thử lại.");
      console.error("Lỗi cập nhật RSVP:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        .guests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .guest-card {
          position: relative;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .guest-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px var(--shadow-color);
        }
        .guest-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          margin-top: 1rem;
        }
        .guest-details {
          font-size: 0.9rem;
          line-height: 1.4;
        }
        .loading-overlay {
          opacity: 0.7;
          pointer-events: none;
        }
        .rsvp-status {
          font-size: 0.85rem;
          font-weight: bold;
          text-transform: uppercase;
        }
      `}</style>
      <h3 className="section-heading mb-4">
        <FontAwesomeIcon icon={faUsers} className="me-2" />
        Quản lý khách mời
      </h3>

      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess("")} dismissible>
          {success}
        </Alert>
      )}

      <Button
        variant="primary"
        onClick={() => {
          setGuestForm({
            name: "",
            contact: "",
            rsvpStatus: "pending",
            plusOne: false,
            plusOneName: "",
            dietaryRestrictions: "",
            tableNumber: "",
            notes: "",
          });
          setEditingGuestId(null);
          setShowGuestModal(true);
        }}
        className="mb-4 btn-redirect hover-shadow"
        disabled={isLoading}
      >
        <FontAwesomeIcon icon={faUserPlus} className="me-2" />
        Thêm khách mời mới
      </Button>

      <div className={isLoading ? "loading-overlay" : ""}>
        {isLoading ? (
          <div className="text-center">
            <Spinner animation="border" size="sm" /> Đang tải danh sách khách
            mời...
          </div>
        ) : guests.length > 0 ? (
          <div className="guests-grid">
            {guests.map((guest) => (
              <Card key={guest.id} className="guest-card">
                <Card.Body>
                  <Card.Title className="text-accent">{guest.name}</Card.Title>
                  <div className="guest-details">
                    {guest.contact && (
                      <div>
                        <small>Liên hệ: {guest.contact}</small>
                      </div>
                    )}
                    {guest.plusOne && guest.plusOneName && (
                      <div>
                        <small>Người đi kèm: {guest.plusOneName}</small>
                      </div>
                    )}
                    {guest.dietaryRestrictions && (
                      <div>
                        <small>Chế độ ăn: {guest.dietaryRestrictions}</small>
                      </div>
                    )}
                    {guest.tableNumber && (
                      <div>
                        <small>Bàn số: {guest.tableNumber}</small>
                      </div>
                    )}
                    <div className="rsvp-status">
                      <small>
                        Trạng thái RSVP:{" "}
                        {guest.rsvpStatus === "confirmed"
                          ? "Xác nhận"
                          : guest.rsvpStatus === "declined"
                          ? "Từ chối"
                          : "Chưa phản hồi"}
                      </small>
                    </div>
                  </div>
                  <div className="guest-actions">
                    <Button
                      variant={
                        guest.rsvpStatus === "confirmed"
                          ? "success"
                          : "outline-success"
                      }
                      size="sm"
                      onClick={() => handleRsvpChange(guest.id, "confirmed")}
                      disabled={isLoading}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </Button>
                    <Button
                      variant={
                        guest.rsvpStatus === "declined"
                          ? "danger"
                          : "outline-danger"
                      }
                      size="sm"
                      onClick={() => handleRsvpChange(guest.id, "declined")}
                      disabled={isLoading}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleEditGuest(guest)}
                      disabled={isLoading}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteGuest(guest.id)}
                      disabled={isLoading}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                    <Link
                      href={`/dam-cuoi/${slug}/thiep-moi/${guest.id}`}
                      passHref
                    >
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="hover-shadow"
                        disabled={isLoading}
                      >
                        <FontAwesomeIcon icon={faEnvelope} />
                      </Button>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <Card.Body>Chưa có khách mời nào được thêm.</Card.Body>
          </Card>
        )}
      </div>

      <Modal show={showGuestModal} onHide={resetForm} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingGuestId ? "Chỉnh sửa khách mời" : "Thêm khách mời"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" onClose={() => setError("")} dismissible>
              {error}
            </Alert>
          )}
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Tên khách mời <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={guestForm.name}
                    onChange={handleGuestChange}
                    placeholder="Nhập tên khách mời"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Liên hệ (SĐT/Email)</Form.Label>
                  <Form.Control
                    type="text"
                    name="contact"
                    value={guestForm.contact}
                    onChange={handleGuestChange}
                    placeholder="Nhập số điện thoại hoặc email"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Trạng thái RSVP</Form.Label>
                  <Form.Select
                    name="rsvpStatus"
                    value={guestForm.rsvpStatus}
                    onChange={handleGuestChange}
                  >
                    <option value="pending">Chưa phản hồi</option>
                    <option value="confirmed">Xác nhận</option>
                    <option value="declined">Từ chối</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số bàn tiệc</Form.Label>
                  <Form.Control
                    type="number"
                    name="tableNumber"
                    value={guestForm.tableNumber}
                    onChange={handleGuestChange}
                    placeholder="Nhập số bàn tiệc"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="plusOne"
                    id="plusOne"
                    label="Có người đi kèm"
                    checked={guestForm.plusOne}
                    onChange={handleGuestChange}
                  />
                </Form.Group>
              </Col>
              {guestForm.plusOne && (
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Tên người đi kèm <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="plusOneName"
                      value={guestForm.plusOneName}
                      onChange={handleGuestChange}
                      placeholder="Nhập tên người đi kèm"
                      required
                    />
                  </Form.Group>
                </Col>
              )}
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Chế độ ăn kiêng</Form.Label>
              <Form.Control
                type="text"
                name="dietaryRestrictions"
                value={guestForm.dietaryRestrictions}
                onChange={handleGuestChange}
                placeholder="Ví dụ: Chay, Không gluten"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ghi chú</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={guestForm.notes}
                onChange={handleGuestChange}
                placeholder="Ghi chú thêm về khách mời"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={resetForm} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleGuestSubmit}
            disabled={isLoading}
            className="hover-shadow"
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {editingGuestId ? "Đang lưu..." : "Đang thêm..."}
              </>
            ) : editingGuestId ? (
              "Lưu"
            ) : (
              "Thêm"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default GuestsManager;
