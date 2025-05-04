"use client";
import { useEffect, useState } from "react";
import {
  Container,
  Form,
  Button,
  Spinner,
  Row,
  Col,
  Alert,
  ListGroup,
  Image,
  FormSelect,
  Card,
} from "react-bootstrap";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { slugify } from "@/utils/slug";
import { uploadToCloudinary } from "@/utils/cloudinary";
import WeddingPreviewCard from "@/components/WeddingPreviewCard";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const dynamic = "force-dynamic";

const SortableItem = ({ id, label }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
    padding: "10px",
    border: "1px solid #FECACA",
    borderRadius: "8px",
    marginBottom: "8px",
    backgroundColor: "#FFF5F5",
    fontFamily: "'Playfair Display', serif",
    color: "#9F1239",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {label}
    </div>
  );
};

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          setUser(user);
        } else {
          router.push("/");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Auth state error:", error);
        setLoading(false);
        router.push("/");
      }
    );

    return () => unsubscribe();
  }, [router]);

  return { user, loading };
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    brideName: "",
    groomName: "",
    weddingDate: "",
    location: "",
    loveStory: "",
    theme: "romantic",
    slug: "",
    gallery: [],
    showCountdown: true,
    showGallery: true,
    showLoveStory: true,
    showWishForm: true,
    showWishList: true,
    showQRCode: false,
    bankInfo: {
      bankName: "",
      accountNumber: "",
      accountHolder: "",
      amount: "",
      description: "",
    },
    componentOrder: [
      "WeddingHeader",
      "Countdown",
      "Gallery",
      "LoveStory",
      "QRCode",
      "WishForm",
      "WishList",
    ],
  });
  const [wishes, setWishes] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const themes = [
    { value: "romantic", label: "Romantic" },
    { value: "rustic", label: "Rustic" },
    { value: "modern", label: "Modern" },
    { value: "elegant", label: "Elegant" },
    { value: "vintage", label: "Vintage" },
    { value: "bohemian", label: "Bohemian" },
    { value: "classic", label: "Classic" },
    { value: "floral", label: "Floral" },
  ];

  const componentLabels = {
    WeddingHeader: "Tiêu đề đám cưới",
    Countdown: "Đếm ngược",
    Gallery: "Thư viện ảnh",
    LoveStory: "Chuyện tình yêu",
    QRCode: "Mã QR chuyển khoản",
    WishForm: "Form lời chúc",
    WishList: "Danh sách lời chúc",
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setForm((prev) => {
        const oldIndex = prev.componentOrder.indexOf(active.id);
        const newIndex = prev.componentOrder.indexOf(over.id);
        const newOrder = arrayMove(prev.componentOrder, oldIndex, newIndex);
        return { ...prev, componentOrder: newOrder };
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      setError("Lỗi khi đăng xuất. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    if (user) {
      const loadUserData = async () => {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setForm({
              brideName: data.brideName || "",
              groomName: data.groomName || "",
              weddingDate:
                data.weddingDate?.toDate().toISOString().substring(0, 10) || "",
              location: data.location || "",
              loveStory: data.loveStory || "",
              theme: data.theme || "romantic",
              slug: data.slug || "",
              gallery: data.gallery || [],
              showCountdown: data.showCountdown !== false,
              showGallery: data.showGallery !== false,
              showLoveStory: data.showLoveStory !== false,
              showWishForm: data.showWishForm !== false,
              showWishList: data.showWishList !== false,
              showQRCode: data.showQRCode || false,
              bankInfo: {
                bankName: data.bankInfo?.bankName || "",
                accountNumber: data.bankInfo?.accountNumber || "",
                accountHolder: data.bankInfo?.accountHolder || "",
                amount: data.bankInfo?.amount || "",
                description: data.bankInfo?.description || "",
              },
              componentOrder: data.componentOrder || [
                "WeddingHeader",
                "Countdown",
                "Gallery",
                "LoveStory",
                "QRCode",
                "WishForm",
                "WishList",
              ],
            });
          }

          const wishesRef = collection(db, "users", user.uid, "wishes");
          const wishesSnap = await getDocs(wishesRef);
          const wishesList = wishesSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setWishes(wishesList);
        } catch (err) {
          setError("Lỗi khi tải dữ liệu người dùng. Vui lòng thử lại.");
        }
      };
      loadUserData();
    }
  }, [user]);

  useEffect(() => {
    if (form.brideName && form.groomName) {
      let combinedName = `${form.brideName} ${form.groomName}`;
      if (form.weddingDate) {
        combinedName += ` ${form.weddingDate}`;
      }
      setForm((prev) => ({ ...prev, slug: slugify(combinedName) }));
    } else {
      setForm((prev) => ({ ...prev, slug: "" }));
    }
  }, [form.brideName, form.groomName, form.weddingDate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("bankInfo.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        bankInfo: { ...prev.bankInfo, [field]: value },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const maxSize = 25 * 1024 * 1024;
    const invalidFiles = files.filter((file) => file.size > maxSize);
    if (invalidFiles.length > 0) {
      setError("Một số tệp vượt quá giới hạn kích thước 25MB.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const uploadPromises = files.map(async (file) => {
        const result = await uploadToCloudinary(file);
        if (result && result.secure_url) {
          return {
            public_id: result.public_id,
            url: result.secure_url,
          };
        }
        return null;
      });

      const uploadedImages = (await Promise.all(uploadPromises)).filter(
        (result) => result !== null
      );

      if (uploadedImages.length === 0) {
        throw new Error("Không có hình ảnh nào được tải lên thành công.");
      }

      setForm((prev) => {
        const updatedGallery = [...prev.gallery, ...uploadedImages];
        if (user) {
          const userRef = doc(db, "users", user.uid);
          updateDoc(userRef, { gallery: updatedGallery }).catch((err) => {
            console.error("Firestore save error:", err);
            setError("Lỗi khi lưu hình ảnh vào Firestore. Vui lòng thử lại.");
          });
        }
        return { ...prev, gallery: updatedGallery };
      });

      if (uploadedImages.length < files.length) {
        setError(
          `${uploadedImages.length} trong số ${files.length} hình ảnh được tải lên thành công. Một số hình ảnh tải lên thất bại.`
        );
      } else {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      setError(err.message || "Lỗi khi tải hình ảnh. Vui lòng thử lại.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (public_id) => {
    setForm((prev) => {
      const updatedGallery = prev.gallery.filter(
        (img) => img.public_id !== public_id
      );
      if (user) {
        const userRef = doc(db, "users", user.uid);
        updateDoc(userRef, { gallery: updatedGallery }).catch((err) => {
          console.error("Firestore save error:", err);
          setError(
            "Lỗi khi cập nhật thư viện ảnh trong Firestore. Vui lòng thử lại."
          );
        });
      }
      return { ...prev, gallery: updatedGallery };
    });
  };

  const handleSave = async () => {
    if (!user) {
      setError("Không thể lưu thông tin vì chưa đăng nhập.");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        ...form,
        weddingDate: form.weddingDate ? new Date(form.weddingDate) : null,
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError("Lỗi khi lưu thông tin. Vui lòng thử lại.");
    }
  };

  const handleApproveWish = async (wishId) => {
    try {
      const wishRef = doc(db, "users", user.uid, "wishes", wishId);
      await setDoc(wishRef, { approved: true }, { merge: true });
      setWishes(
        wishes.map((wish) =>
          wish.id === wishId ? { ...wish, approved: true } : wish
        )
      );
    } catch (err) {
      setError("Lỗi khi duyệt lời chúc. Vui lòng thử lại.");
    }
  };

  const handleRejectWish = async (wishId) => {
    try {
      const wishRef = doc(db, "users", user.uid, "wishes", wishId);
      await setDoc(wishRef, { approved: false }, { merge: true });
      setWishes(
        wishes.map((wish) =>
          wish.id === wishId ? { ...wish, approved: false } : wish
        )
      );
    } catch (err) {
      setError("Lỗi khi từ chối lời chúc. Vui lòng thử lại.");
    }
  };

  const handleDeleteWish = async (wishId) => {
    try {
      const wishRef = doc(db, "users", user.uid, "wishes", wishId);
      await deleteDoc(wishRef);
      setWishes(wishes.filter((wish) => wish.id !== wishId));
    } catch (err) {
      setError("Lỗi khi xóa lời chúc. Vui lòng thử lại.");
    }
  };

  const handleRedirect = () => {
    if (form.slug) {
      router.push(`/dam-cuoi/${form.slug}`);
    } else {
      setError("Vui lòng nhập tên cô dâu, chú rể và ngày cưới để tạo slug.");
    }
  };

  const handlePreview = () => {
    if (form.slug) {
      router.push(`/dam-cuoi/preview/${form.slug}`);
    } else {
      setError("Vui lòng nhập tên cô dâu, chú rể và ngày cưới để tạo slug.");
    }
  };

  const approvedWishes = wishes.filter((wish) => wish.approved);

  if (loading || !user) {
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
    <>
      <Container
        fluid
        className="py-5"
        style={{
          background: "linear-gradient(to bottom right, #FFF1F2, #FFE4E6)",
          backgroundImage: "url('/paper-fibers.png')",
          minHeight: "100vh",
        }}
      >
        <div className="d-flex justify-content-end mb-4">
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
          >
            Đăng xuất
          </Button>
        </div>

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
            <Card.Title
              className="mb-4 text-center"
              style={{
                fontFamily: "'Great Vibes', cursive",
                color: "#BE123C",
                fontSize: "2rem",
              }}
            >
              Quản trị đám cưới
            </Card.Title>

            {showSuccess && (
              <Alert
                variant="success"
                onClose={() => setShowSuccess(false)}
                dismissible
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                🎉 Thông tin đã được lưu thành công!
              </Alert>
            )}

            {error && (
              <Alert
                variant="danger"
                onClose={() => setError("")}
                dismissible
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {error}
              </Alert>
            )}

            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "#9F1239",
                      }}
                    >
                      Cô dâu
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="brideName"
                      value={form.brideName}
                      onChange={handleChange}
                      style={{ borderColor: "#FECACA" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "#9F1239",
                      }}
                    >
                      Chú rể
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="groomName"
                      value={form.groomName}
                      onChange={handleChange}
                      style={{ borderColor: "#FECACA" }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#9F1239",
                  }}
                >
                  Slug
                </Form.Label>
                <Form.Control
                  type="text"
                  name="slug"
                  value={form.slug}
                  readOnly
                  disabled
                  style={{ borderColor: "#FECACA", backgroundColor: "#FFF5F5" }}
                />
                <Form.Text
                  className="text-muted"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Tự động tạo từ tên cô dâu, chú rể và ngày cưới
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#9F1239",
                  }}
                >
                  Ngày cưới
                </Form.Label>
                <Form.Control
                  type="date"
                  name="weddingDate"
                  value={form.weddingDate}
                  onChange={handleChange}
                  style={{ borderColor: "#FECACA" }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#9F1239",
                  }}
                >
                  Địa điểm
                </Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  style={{ borderColor: "#FECACA" }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#9F1239",
                  }}
                >
                  Chủ đề
                </Form.Label>
                <FormSelect
                  name="theme"
                  value={form.theme}
                  onChange={handleChange}
                  style={{ borderColor: "#FECACA" }}
                >
                  {themes.map((theme) => (
                    <option key={theme.value} value={theme.value}>
                      {theme.label}
                    </option>
                  ))}
                </FormSelect>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#9F1239",
                  }}
                >
                  Chuyện tình yêu
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="loveStory"
                  value={form.loveStory}
                  onChange={handleChange}
                  style={{ borderColor: "#FECACA" }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#9F1239",
                  }}
                >
                  Thư viện ảnh
                </Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading}
                  style={{ borderColor: "#FECACA" }}
                />
                {uploading && (
                  <Spinner
                    animation="border"
                    size="sm"
                    className="mt-2"
                    variant="danger"
                  />
                )}
                {form.gallery.length > 0 && (
                  <Row className="mt-3 g-2">
                    {form.gallery.map((img) => (
                      <Col
                        xs={6}
                        sm={4}
                        md={3}
                        lg={2}
                        xl={2}
                        key={img.public_id}
                      >
                        <div className="position-relative">
                          <Image
                            src={img.url}
                            alt="Gallery item"
                            style={{
                              width: "100%",
                              height: "150px",
                              objectFit: "cover",
                              border: "1px solid #FECACA",
                              borderRadius: "8px",
                            }}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveImage(img.public_id)}
                            style={{
                              position: "absolute",
                              top: "8px",
                              right: "8px",
                              backgroundColor: "#BE123C",
                              borderColor: "#BE123C",
                              fontFamily: "'Playfair Display', serif",
                              opacity: 0.9,
                            }}
                          >
                            Xóa
                          </Button>
                        </div>
                      </Col>
                    ))}
                  </Row>
                )}
              </Form.Group>

              <h3
                className="mt-5 mb-3"
                style={{
                  fontFamily: "'Great Vibes', cursive",
                  color: "#BE123C",
                }}
              >
                Thông tin chuyển khoản
              </h3>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "#9F1239",
                      }}
                    >
                      Tên ngân hàng
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="bankInfo.bankName"
                      value={form.bankInfo.bankName}
                      onChange={handleChange}
                      style={{ borderColor: "#FECACA" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "#9F1239",
                      }}
                    >
                      Số tài khoản
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="bankInfo.accountNumber"
                      value={form.bankInfo.accountNumber}
                      onChange={handleChange}
                      style={{ borderColor: "#FECACA" }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "#9F1239",
                      }}
                    >
                      Chủ tài khoản
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="bankInfo.accountHolder"
                      value={form.bankInfo.accountHolder}
                      onChange={handleChange}
                      style={{ borderColor: "#FECACA" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "#9F1239",
                      }}
                    >
                      Số tiền đề xuất (VNĐ)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="bankInfo.amount"
                      value={form.bankInfo.amount}
                      onChange={handleChange}
                      style={{ borderColor: "#FECACA" }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#9F1239",
                  }}
                >
                  Nội dung chuyển khoản
                </Form.Label>
                <Form.Control
                  type="text"
                  name="bankInfo.description"
                  value={form.bankInfo.description}
                  onChange={handleChange}
                  style={{ borderColor: "#FECACA" }}
                />
              </Form.Group>

              <h3
                className="mt-5 mb-3"
                style={{
                  fontFamily: "'Great Vibes', cursive",
                  color: "#BE123C",
                }}
              >
                Hiển thị thành phần
              </h3>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="showCountdown"
                      name="showCountdown"
                      label="Đếm ngược"
                      checked={form.showCountdown}
                      onChange={handleChange}
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "#9F1239",
                      }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="showGallery"
                      name="showGallery"
                      label="Thư viện ảnh"
                      checked={form.showGallery}
                      onChange={handleChange}
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "#9F1239",
                      }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="showLoveStory"
                      name="showLoveStory"
                      label="Chuyện tình yêu"
                      checked={form.showLoveStory}
                      onChange={handleChange}
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "#9F1239",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="showWishForm"
                      name="showWishForm"
                      label="Form lời chúc"
                      checked={form.showWishForm}
                      onChange={handleChange}
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "#9F1239",
                      }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="showWishList"
                      name="showWishList"
                      label="Danh sách lời chúc"
                      checked={form.showWishList}
                      onChange={handleChange}
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "#9F1239",
                      }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="showQRCode"
                      name="showQRCode"
                      label="Mã QR chuyển khoản"
                      checked={form.showQRCode}
                      onChange={handleChange}
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "#9F1239",
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <h3
                className="mt-5 mb-3"
                style={{
                  fontFamily: "'Great Vibes', cursive",
                  color: "#BE123C",
                }}
              >
                Sắp xếp thành phần
              </h3>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={form.componentOrder}
                  strategy={verticalListSortingStrategy}
                >
                  {form.componentOrder.map((id) => (
                    <SortableItem
                      key={id}
                      id={id}
                      label={componentLabels[id]}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              <h3
                className="mt-5 mb-3"
                style={{
                  fontFamily: "'Great Vibes', cursive",
                  color: "#BE123C",
                }}
              >
                Quản lý lời chúc
              </h3>
              {wishes.length > 0 ? (
                <ListGroup className="mb-4">
                  {wishes.map((wish) => (
                    <ListGroup.Item
                      key={wish.id}
                      className="d-flex justify-content-between align-items-center"
                      style={{ borderColor: "#FECACA" }}
                    >
                      <div>
                        <strong
                          style={{
                            fontFamily: "'Playfair Display', serif",
                            color: "#9F1239",
                          }}
                        >
                          {wish.name}
                        </strong>
                        : {wish.message}
                        <br />
                        <small
                          style={{
                            fontFamily: "'Playfair Display', serif",
                            color: "#BE123C",
                          }}
                        >
                          {wish.createdAt.toDate().toLocaleDateString("vi-VN")}{" "}
                          - {wish.approved ? "Đã duyệt" : "Chưa duyệt"}
                        </small>
                      </div>
                      <div className="d-flex gap-2">
                        {!wish.approved && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleApproveWish(wish.id)}
                            style={{
                              backgroundColor: "#D97706",
                              borderColor: "#D97706",
                              fontFamily: "'Playfair Display', serif",
                            }}
                          >
                            Duyệt
                          </Button>
                        )}
                        {wish.approved && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRejectWish(wish.id)}
                            style={{
                              backgroundColor: "#BE123C",
                              borderColor: "#BE123C",
                              fontFamily: "'Playfair Display', serif",
                            }}
                          >
                            Hủy duyệt
                          </Button>
                        )}
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteWish(wish.id)}
                          style={{
                            borderColor: "#BE123C",
                            color: "#BE123C",
                            fontFamily: "'Playfair Display', serif",
                          }}
                        >
                          Xóa
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#9F1239",
                  }}
                >
                  Chưa có lời chúc nào.
                </p>
              )}

              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={uploading}
                  style={{
                    backgroundColor: "#F43F5E",
                    borderColor: "#F43F5E",
                    fontFamily: "'Playfair Display', serif",
                    borderRadius: "20px",
                    padding: "8px 20px",
                  }}
                >
                  Lưu thông tin
                </Button>
                <Button
                  variant="success"
                  onClick={handleRedirect}
                  disabled={uploading || !form.slug}
                  style={{
                    backgroundColor: "#BE123C",
                    borderColor: "#BE123C",
                    fontFamily: "'Playfair Display', serif",
                    borderRadius: "20px",
                    padding: "8px 20px",
                  }}
                >
                  Xem trang cưới
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
      <WeddingPreviewCard form={form} wishes={approvedWishes} />
    </>
  );
}
