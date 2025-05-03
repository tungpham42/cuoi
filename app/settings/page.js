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

export const dynamic = "force-dynamic";

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

export default function SettingsPage() {
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
  ];

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
            });
          }

          // Load wishes
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
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const maxSize = 25 * 1024 * 1024; // 25MB
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

      // Update state with new images
      setForm((prev) => {
        const updatedGallery = [...prev.gallery, ...uploadedImages];
        // Save to Firestore
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
      // Save updated gallery to Firestore
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
      router.push(`/wedding/${form.slug}`);
    } else {
      setError("Vui lòng nhập tên cô dâu, chú rể và ngày cưới để tạo slug.");
    }
  };

  const handlePreview = () => {
    if (form.slug) {
      router.push(`/wedding/preview/${form.slug}`);
    } else {
      setError("Vui lòng nhập tên cô dâu, chú rể và ngày cưới để tạo slug.");
    }
  };

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
    <Container
      fluid
      className="py-5"
      style={{
        background: "linear-gradient(to bottom right, #FFF1F2, #FFE4E6)",
        backgroundImage:
          "url('/paper-fibers.png')",
        minHeight: "100vh",
      }}
    >
      {/* Logout Button */}
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
                <ListGroup className="mt-3">
                  {form.gallery.map((img) => (
                    <ListGroup.Item
                      key={img.public_id}
                      className="d-flex align-items-center"
                      style={{ borderColor: "#FECACA" }}
                    >
                      <Image
                        src={img.url}
                        alt="Gallery item"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          marginRight: "10px",
                          border: "1px solid #FECACA",
                        }}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveImage(img.public_id)}
                        style={{
                          backgroundColor: "#BE123C",
                          borderColor: "#BE123C",
                          fontFamily: "'Playfair Display', serif",
                        }}
                      >
                        Xóa
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Form.Group>

            <h3
              className="mt-5 mb-3"
              style={{ fontFamily: "'Great Vibes', cursive", color: "#BE123C" }}
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
                        {wish.createdAt.toDate().toLocaleDateString("vi-VN")} -{" "}
                        {wish.approved ? "Đã duyệt" : "Chưa duyệt"}
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
                variant="info"
                onClick={handlePreview}
                disabled={uploading || !form.slug}
                style={{
                  backgroundColor: "#D97706",
                  borderColor: "#D97706",
                  fontFamily: "'Playfair Display', serif",
                  borderRadius: "20px",
                  padding: "8px 20px",
                }}
              >
                Xem trước
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
  );
}
