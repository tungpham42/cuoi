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
  query,
  where,
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
  };

  return (
    <div
      ref={setNodeRef}
      className="sortable-item"
      style={style}
      {...attributes}
      {...listeners}
    >
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
    showQRCode: true,
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
  const [slugError, setSlugError] = useState("");

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
      router.push("/");
    } catch (error) {
      setError("Lỗi khi đăng xuất. Vui lòng thử lại.");
    }
  };

  const validateSlug = async (slug, currentUserId) => {
    if (!slug) return false;
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("slug", "==", slug));
      const querySnapshot = await getDocs(q);

      let isTaken = false;
      querySnapshot.forEach((doc) => {
        if (doc.id !== currentUserId) {
          isTaken = true;
        }
      });

      return !isTaken;
    } catch (err) {
      console.error("Error validating slug:", err);
      setError("Lỗi khi kiểm tra slug. Vui lòng thử lại.");
      return false;
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
      const newSlug = slugify(combinedName);
      setForm((prev) => ({ ...prev, slug: newSlug }));

      const checkSlug = async () => {
        const isAvailable = await validateSlug(newSlug, user?.uid || "");
        setSlugError(
          isAvailable
            ? ""
            : "Slug này đã được sử dụng. Vui lòng thay đổi tên hoặc ngày cưới."
        );
      };
      if (user) {
        checkSlug();
      }
    } else {
      setForm((prev) => ({ ...prev, slug: "" }));
      setSlugError("");
    }
  }, [form.brideName, form.groomName, form.weddingDate, user]);

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

    if (!form.slug) {
      setError("Vui lòng nhập tên cô dâu, chú rể và ngày cưới để tạo slug.");
      return;
    }

    const isSlugAvailable = await validateSlug(form.slug, user.uid);
    if (!isSlugAvailable) {
      setSlugError(
        "Slug này đã được sử dụng. Vui lòng thay đổi tên hoặc ngày cưới."
      );
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        ...form,
        weddingDate: form.weddingDate ? new Date(form.weddingDate) : null,
      });

      setShowSuccess(true);
      setSlugError("");
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
    if (form.slug && !slugError) {
      router.push(`/dam-cuoi/${form.slug}`);
    } else {
      setError(
        "Vui lòng nhập tên cô dâu, chú rể và ngày cưới để tạo slug hợp lệ."
      );
    }
  };

  const handlePreview = () => {
    if (form.slug && !slugError) {
      router.push(`/dam-cuoi/preview/${form.slug}`);
    } else {
      setError(
        "Vui lòng nhập tên cô dâu, chú rể và ngày cưới để tạo slug hợp lệ."
      );
    }
  };

  const approvedWishes = wishes.filter((wish) => wish.approved);

  if (loading || !user) {
    return (
      <Container fluid className="loading-container">
        <Spinner animation="border" variant="danger" />
        <span className="loading-text">Loading...</span>
      </Container>
    );
  }

  return (
    <>
      <Container fluid className="dashboard-container wedding-section">
        <div className="d-flex justify-content-end mb-4">
          <Button
            variant="outline-danger"
            size="sm"
            onClick={handleLogout}
            className="btn-logout"
          >
            Đăng xuất
          </Button>
        </div>

        <Card className="dashboard-card">
          <div className="decorative-corner-top" />
          <div className="decorative-corner-bottom" />
          <Card.Body className="dashboard-card-body">
            <Card.Title className="dashboard-card-title h2">
              Quản trị đám cưới
            </Card.Title>

            {showSuccess && (
              <Alert
                variant="success"
                onClose={() => setShowSuccess(false)}
                dismissible
              >
                🎉 Thông tin đã được lưu thành công!
              </Alert>
            )}

            {error && (
              <Alert variant="danger" onClose={() => setError("")} dismissible>
                {error}
              </Alert>
            )}

            {slugError && (
              <Alert
                variant="danger"
                onClose={() => setSlugError("")}
                dismissible
              >
                {slugError}
              </Alert>
            )}

            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label">Cô dâu</Form.Label>
                    <Form.Control
                      type="text"
                      name="brideName"
                      value={form.brideName}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label">Chú rể</Form.Label>
                    <Form.Control
                      type="text"
                      name="groomName"
                      value={form.groomName}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="form-label">Slug</Form.Label>
                <Form.Control
                  type="text"
                  name="slug"
                  value={form.slug}
                  readOnly
                  disabled
                  className="form-control-disabled"
                />
                <Form.Text className="form-text">
                  Tự động tạo từ tên cô dâu, chú rể và ngày cưới
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="form-label">Ngày cưới</Form.Label>
                <Form.Control
                  type="date"
                  name="weddingDate"
                  value={form.weddingDate}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="form-label">Địa điểm</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="form-label">Chủ đề</Form.Label>
                <FormSelect
                  name="theme"
                  value={form.theme}
                  onChange={handleChange}
                >
                  {themes.map((theme) => (
                    <option key={theme.value} value={theme.value}>
                      {theme.label}
                    </option>
                  ))}
                </FormSelect>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="form-label">Chuyện tình yêu</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="loveStory"
                  value={form.loveStory}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="form-label">Thư viện ảnh</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading}
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
                        <div className="gallery-image-wrapper">
                          <Image
                            src={img.url}
                            alt="Gallery item"
                            className="gallery-image"
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveImage(img.public_id)}
                            className="gallery-delete-button"
                          >
                            Xóa
                          </Button>
                        </div>
                      </Col>
                    ))}
                  </Row>
                )}
              </Form.Group>

              <h3 className="section-heading">Thông tin chuyển khoản</h3>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label">
                      Tên ngân hàng
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="bankInfo.bankName"
                      value={form.bankInfo.bankName}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label">Số tài khoản</Form.Label>
                    <Form.Control
                      type="text"
                      name="bankInfo.accountNumber"
                      value={form.bankInfo.accountNumber}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label">
                      Chủ tài khoản
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="bankInfo.accountHolder"
                      value={form.bankInfo.accountHolder}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label">
                      Số tiền đề xuất (VNĐ)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="bankInfo.amount"
                      value={form.bankInfo.amount}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label className="form-label">
                  Nội dung chuyển khoản
                </Form.Label>
                <Form.Control
                  type="text"
                  name="bankInfo.description"
                  value={form.bankInfo.description}
                  onChange={handleChange}
                />
              </Form.Group>

              <h3 className="section-heading">Hiển thị thành phần</h3>
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
                    />
                  </Form.Group>
                </Col>
              </Row>

              <h3 className="section-heading">Sắp xếp thành phần</h3>
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

              <h3 className="section-heading">Quản lý lời chúc</h3>
              {wishes.length > 0 ? (
                <ListGroup className="mb-4">
                  {wishes.map((wish) => (
                    <ListGroup.Item key={wish.id} className="wish-list-item">
                      <div>
                        <strong className="wish-name">{wish.name}</strong>:{" "}
                        {wish.message}
                        <br />
                        <small className="wish-meta">
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
                            className="btn-approve"
                          >
                            Duyệt
                          </Button>
                        )}
                        {wish.approved && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRejectWish(wish.id)}
                            className="btn-reject"
                          >
                            Hủy duyệt
                          </Button>
                        )}
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteWish(wish.id)}
                          className="btn-delete"
                        >
                          Xóa
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="no-wishes">Chưa có lời chúc nào.</p>
              )}

              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={uploading || !!slugError}
                  className="btn-save"
                >
                  Lưu thông tin
                </Button>
                <Button
                  variant="success"
                  onClick={handleRedirect}
                  disabled={uploading || !form.slug || !!slugError}
                  className="btn-redirect"
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
