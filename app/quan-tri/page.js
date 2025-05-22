"use client";
import { useEffect, useState, useRef } from "react";
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
  Card,
  Dropdown as BootstrapDropdown,
  Modal,
  Tabs,
  Tab,
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
  addDoc,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { slugify } from "@/utils/slug";
import {
  uploadImageToCloudinary,
  uploadAudioToCloudinary,
} from "@/utils/cloudinary";
import WeddingPreviewPane from "@/components/WeddingPreviewPane";
import WishesManager from "@/components/WishesManager";
import GuestsManager from "@/components/GuestsManager";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faEye,
  faSignOutAlt,
  faUser,
  faCalendarAlt,
  faMapMarkerAlt,
  faPalette,
  faHeart,
  faImages,
  faMoneyBillWave,
  faCommentDots,
  faSort,
  faLink,
  faFont,
  faPlus,
  faTrash,
  faEdit,
  faPen,
  faInfoCircle,
  faMap,
  faMusic,
  faUsers,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import themes from "@/data/themes";
import primaryFonts from "@/data/primaryFonts";
import secondaryFonts from "@/data/secondaryFonts";

export const dynamic = "force-dynamic";

const DroppableSidebar = ({ children }) => {
  const { setNodeRef } = useDroppable({ id: "sidebar" });

  return (
    <div ref={setNodeRef} className="component-container">
      {children}
    </div>
  );
};

const DroppableWorkspace = ({ children }) => {
  const { setNodeRef } = useDroppable({ id: "workspace" });

  return (
    <div ref={setNodeRef} className="component-container">
      {children}
    </div>
  );
};

const SortableItem = ({ id, label, isActive }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`sortable-item ${isActive ? "active" : "inactive"}`}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        transition,
      }}
      {...attributes}
      {...listeners}
    >
      <FontAwesomeIcon icon={faSort} className="me-3" />
      {label}
    </div>
  );
};

const ThemePreview = ({ theme, selected }) => (
  <div
    className={`card theme-preview mb-0 w-100 ${selected ? "selected" : ""}`}
    style={{
      background: `linear-gradient(to bottom right, var(--gradient-start), var(--gradient-end))`,
      padding: "10px",
    }}
    data-theme={theme.value}
  >
    <div
      style={{
        color: `var(--foreground)`,
        fontFamily: '"Playfair Display", serif',
        fontSize: "14px",
      }}
    >
      {theme.label}
    </div>
  </div>
);

const FontPreview = ({ font, isPrimary, selected }) => (
  <div
    className={`card font-preview mb-0 w-100 ${selected ? "selected" : ""}`}
    style={{
      fontFamily: `"${font.value}", ${isPrimary ? "cursive" : "serif"}`,
      padding: "10px",
    }}
  >
    <div
      style={{
        fontSize: "16px",
        color: `var(--foreground)`,
        border: "none !important",
        boxShadow: "none !important",
      }}
    >
      {font.label}
    </div>
  </div>
);

const CustomDropdown = ({
  name,
  value,
  options,
  onChange,
  previewComponent: PreviewComponent,
  isPrimary = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [toggleWidth, setToggleWidth] = useState("auto");
  const dropdownRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const updateWidth = () => {
      if (toggleRef.current) {
        const width = toggleRef.current.getBoundingClientRect().width;
        setToggleWidth(`${width}px`);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handleSelect = (optionValue) => {
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
  };

  const selectedOption =
    options.find((option) => option.value === value) || options[0];

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <Form.Label className="form-label">
        <FontAwesomeIcon
          icon={name === "theme" ? faPalette : faFont}
          className="me-2"
        />
        {name === "theme"
          ? "Chủ đề"
          : name === "primaryFont"
          ? "Font tiêu đề (Cursive)"
          : "Font nội dung (Serif)"}
      </Form.Label>
      <div
        className="dropdown-toggle"
        ref={toggleRef}
        onClick={() => setIsOpen(!isOpen)}
      >
        <PreviewComponent
          theme={name === "theme" ? selectedOption : undefined}
          font={name !== "theme" ? selectedOption : undefined}
          isPrimary={isPrimary}
          selected={true}
        />
      </div>
      {isOpen && (
        <div
          className="dropdown-menu show"
          style={{
            maxHeight: "300px",
            overflowY: "auto",
            width: toggleWidth,
          }}
        >
          {options.map((option) => (
            <div
              key={option.value}
              className="dropdown-item"
              onClick={() => handleSelect(option.value)}
              style={{ cursor: "pointer" }}
            >
              <PreviewComponent
                theme={name === "theme" ? option : undefined}
                font={name !== "theme" ? option : undefined}
                isPrimary={isPrimary}
                selected={option.value === value}
              />
            </div>
          ))}
        </div>
      )}
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
  const [weddings, setWeddings] = useState([]);
  const [selectedWeddingId, setSelectedWeddingId] = useState(null);
  const [activeTab, setActiveTab] = useState("weddingDetails");
  const [form, setForm] = useState({
    brideName: "",
    groomName: "",
    weddingDate: "",
    weddingTime: "",
    location: "",
    loveStory: "",
    theme: "romantic",
    slug: "",
    gallery: [],
    playlist: [],
    showCountdown: true,
    showGallery: true,
    showLoveStory: true,
    showWishForm: true,
    showWishList: true,
    showQRCode: true,
    showIntroduction: true,
    showLocationMap: true,
    showAudioPlayer: true,
    bankInfo: {
      bankName: "",
      accountNumber: "",
      accountHolder: "",
      description: "",
    },
    introduction: "",
    mapInfo: {
      embedCode: "",
      address: "",
    },
    componentOrder: [
      "WeddingHeader",
      "Introduction",
      "Countdown",
      "Gallery",
      "LoveStory",
      "LocationMap",
      "QRCode",
      "WishForm",
      "WishList",
      "AudioPlayer",
    ],
    primaryFont: "Dancing Script",
    secondaryFont: "Lora",
    coverPhoto: { public_id: "", url: "" },
  });
  const [wishes, setWishes] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [coverPhotoUploading, setCoverPhotoUploading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [audioUploading, setAudioUploading] = useState(false);
  const [error, setError] = useState("");
  const [slugError, setSlugError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newWeddingName, setNewWeddingName] = useState("");
  const [editWeddingId, setEditWeddingId] = useState(null);
  const [editWeddingName, setEditWeddingName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteWeddingId, setDeleteWeddingId] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const componentLabels = {
    WeddingHeader: "Tiêu đề đám cưới",
    Introduction: "Giới thiệu",
    Countdown: "Đếm ngược",
    Gallery: "Thư viện ảnh",
    LoveStory: "Chuyện tình yêu",
    LocationMap: "Bản đồ",
    QRCode: "Mã QR chuyển khoản",
    WishForm: "Form lời chúc",
    WishList: "Danh sách lời chúc",
    AudioPlayer: "Trình phát nhạc",
  };

  const componentShowFields = {
    Introduction: "showIntroduction",
    Countdown: "showCountdown",
    Gallery: "showGallery",
    LoveStory: "showLoveStory",
    LocationMap: "showLocationMap",
    QRCode: "showQRCode",
    WishForm: "showWishForm",
    WishList: "showWishList",
    AudioPlayer: "showAudioPlayer",
  };

  const allComponents = Object.keys(componentLabels);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 50,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !active.data.current?.sortable?.containerId) return;

    const activeContainer = active.data.current.sortable.containerId;
    const overContainer = over.data.current?.sortable?.containerId || over.id;

    if (activeContainer === overContainer && activeContainer === "workspace") {
      reorderWorkspace(active.id, over.id);
    } else if (activeContainer === "workspace" && overContainer === "sidebar") {
      moveToSidebar(active.id);
    } else if (activeContainer === "sidebar" && overContainer === "workspace") {
      moveToWorkspace(active.id, over.id);
    }
  };

  const reorderWorkspace = (activeId, overId) => {
    setForm((prev) => {
      const oldIndex = prev.componentOrder.indexOf(activeId);
      const newIndex = prev.componentOrder.indexOf(overId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return prev;
      }
      return {
        ...prev,
        componentOrder: arrayMove(prev.componentOrder, oldIndex, newIndex),
      };
    });
  };

  const moveToSidebar = (activeId) => {
    const showField = componentShowFields[activeId];
    if (!showField) return;

    setForm((prev) => {
      const newOrder = [
        ...prev.componentOrder.filter((id) => id !== activeId),
        activeId,
      ];
      return {
        ...prev,
        [showField]: false,
        componentOrder: newOrder,
      };
    });
  };

  const moveToWorkspace = (activeId, overId) => {
    const showField = componentShowFields[activeId];
    if (!showField) return;

    setForm((prev) => {
      let newOrder = [...prev.componentOrder];
      const activeIndex = newOrder.indexOf(activeId);
      const newIndex =
        overId === "workspace" ? newOrder.length : newOrder.indexOf(overId);

      if (activeIndex !== -1) {
        newOrder = arrayMove(
          newOrder,
          activeIndex,
          newIndex === -1 ? newOrder.length : newIndex
        );
      } else {
        newIndex === -1
          ? newOrder.push(activeId)
          : newOrder.splice(newIndex + 1, 0, activeId);
      }

      return {
        ...prev,
        [showField]: true,
        componentOrder: newOrder,
      };
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      setError("Lỗi khi đăng xuất. Vui lòng thử lại.");
    }
  };

  const validateSlug = async (slug, currentWeddingId) => {
    if (!slug) return false;
    try {
      const weddingsRef = collection(db, "weddings");
      const q = query(weddingsRef, where("slug", "==", slug));
      const weddingSnapshot = await getDocs(q);
      let isTaken = false;

      weddingSnapshot.forEach((doc) => {
        if (currentWeddingId && doc.id !== currentWeddingId) {
          isTaken = true;
        } else if (!currentWeddingId) {
          isTaken = true;
        }
      });

      return !isTaken;
    } catch (err) {
      console.error("Error validating slug:", err);
      setError("Lỗi khi kiểm tra liên kết. Vui lòng thử lại.");
      return false;
    }
  };

  const loadWeddings = async () => {
    if (!user) return;
    try {
      const weddingsRef = collection(db, "weddings");
      const q = query(weddingsRef, where("userId", "==", user.uid));
      const weddingsSnap = await getDocs(q);
      const weddingsList = weddingsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWeddings(weddingsList);
    } catch (err) {
      setError("Lỗi khi tải danh sách đám cưới. Vui lòng thử lại.");
    }
  };

  const loadWeddingData = async (weddingId) => {
    try {
      const weddingRef = doc(db, "weddings", weddingId);
      const docSnap = await getDoc(weddingRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const weddingDateTime = data.weddingDate
          ? data.weddingDate.toDate()
          : null;
        setForm({
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
          slug: data.slug || "",
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
          bankInfo: {
            bankName: data.bankInfo?.bankName || "",
            accountNumber: data.bankInfo?.accountNumber || "",
            accountHolder: data.bankInfo?.accountHolder || "",
            description: data.bankInfo?.description || "",
          },
          introduction: data.introduction || "",
          mapInfo: {
            embedCode: data.mapInfo?.embedCode || "",
            address: data.mapInfo?.address || "",
          },
          componentOrder: data.componentOrder || [
            "WeddingHeader",
            "Introduction",
            "Countdown",
            "Gallery",
            "LoveStory",
            "LocationMap",
            "QRCode",
            "WishForm",
            "WishList",
            "AudioPlayer",
          ],
          primaryFont: data.primaryFont || "Dancing Script",
          secondaryFont: data.secondaryFont || "Lora",
          coverPhoto: data.coverPhoto || { public_id: "", url: "" },
        });

        const wishesRef = collection(db, "weddings", weddingId, "wishes");
        const wishesSnap = await getDocs(wishesRef);
        const wishesList = wishesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWishes(wishesList);
      } else {
        setForm({
          brideName: "",
          groomName: "",
          weddingDate: "",
          weddingTime: "",
          location: "",
          loveStory: "",
          theme: "romantic",
          slug: "",
          gallery: [],
          playlist: [],
          showCountdown: true,
          showGallery: true,
          showLoveStory: true,
          showWishForm: true,
          showWishList: true,
          showQRCode: true,
          showIntroduction: true,
          showLocationMap: true,
          showAudioPlayer: true,
          bankInfo: {
            bankName: "",
            accountNumber: "",
            accountHolder: "",
            description: "",
          },
          introduction: "",
          mapInfo: {
            embedCode: "",
            address: "",
          },
          componentOrder: [
            "WeddingHeader",
            "Introduction",
            "Countdown",
            "Gallery",
            "LoveStory",
            "LocationMap",
            "QRCode",
            "WishForm",
            "WishList",
            "AudioPlayer",
          ],
          primaryFont: "Dancing Script",
          secondaryFont: "Lora",
          coverPhoto: { public_id: "", url: "" },
        });
        setWishes([]);
      }
    } catch (err) {
      setError("Lỗi khi tải dữ liệu. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    if (user) {
      loadWeddings();
    } //eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    setActiveTab("weddingDetails");
  }, [selectedWeddingId]);

  useEffect(() => {
    if (selectedWeddingId) {
      loadWeddingData(selectedWeddingId);
    } else {
      setForm({
        brideName: "",
        groomName: "",
        weddingDate: "",
        weddingTime: "",
        location: "",
        loveStory: "",
        theme: "romantic",
        slug: "",
        gallery: [],
        playlist: [],
        showCountdown: true,
        showGallery: true,
        showLoveStory: true,
        showWishForm: true,
        showWishList: true,
        showQRCode: true,
        showIntroduction: true,
        showLocationMap: true,
        showAudioPlayer: true,
        bankInfo: {
          bankName: "",
          accountNumber: "",
          accountHolder: "",
          description: "",
        },
        introduction: "",
        mapInfo: {
          embedCode: "",
          address: "",
        },
        componentOrder: [
          "WeddingHeader",
          "Introduction",
          "Countdown",
          "Gallery",
          "LoveStory",
          "LocationMap",
          "QRCode",
          "WishForm",
          "WishList",
          "AudioPlayer",
        ],
        primaryFont: "Dancing Script",
        secondaryFont: "Lora",
        coverPhoto: { public_id: "", url: "" },
      });
      setWishes([]);
    }
  }, [selectedWeddingId]);

  useEffect(() => {
    if (form.brideName && form.groomName && selectedWeddingId) {
      let combinedName = `${form.brideName} ${form.groomName}`;
      if (form.weddingDate) {
        combinedName += ` ${form.weddingDate}`;
      }
      const newSlug = slugify(combinedName);
      setForm((prev) => ({ ...prev, slug: newSlug }));
    } else {
      setForm((prev) => ({ ...prev, slug: "" }));
      setSlugError("");
    }
  }, [
    form.brideName,
    form.groomName,
    form.weddingDate,
    user,
    selectedWeddingId,
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("bankInfo.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        bankInfo: { ...prev.bankInfo, [field]: value },
      }));
    } else if (name.startsWith("mapInfo.")) {
      const field = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        mapInfo: { ...prev.mapInfo, [field]: value },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleImageUpload = async (e) => {
    if (!selectedWeddingId) {
      setError("Vui lòng chọn hoặc tạo một đám cưới trước khi tải ảnh.");
      return;
    }
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const maxSize = 25 * 1024 * 1024;
    const invalidFiles = files.filter((file) => file.size > maxSize);
    if (invalidFiles.length > 0) {
      setError("Một số tệp vượt quá giới hạn kích thước 25MB.");
      return;
    }

    setImageUploading(true);
    setError("");
    try {
      const uploadPromises = files.map(async (file) => {
        const result = await uploadImageToCloudinary(file);
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
          const weddingRef = doc(db, "weddings", selectedWeddingId);
          updateDoc(weddingRef, { gallery: updatedGallery }).catch((err) => {
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
      setImageUploading(false);
      e.target.value = "";
    }
  };

  const handleCoverPhotoUpload = async (e) => {
    if (!selectedWeddingId) {
      setError("Vui lòng chọn hoặc tạo một đám cưới trước khi tải ảnh bìa.");
      return;
    }
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Tệp ảnh bìa vượt quá giới hạn kích thước 25MB.");
      return;
    }

    setCoverPhotoUploading(true);
    setError("");
    try {
      const result = await uploadImageToCloudinary(file);
      if (result && result.secure_url) {
        const newCoverPhoto = {
          public_id: result.public_id,
          url: result.secure_url,
        };
        setForm((prev) => {
          if (user) {
            const weddingRef = doc(db, "weddings", selectedWeddingId);
            updateDoc(weddingRef, { coverPhoto: newCoverPhoto }).catch(
              (err) => {
                console.error("Firestore save error:", err);
                setError(
                  "Lỗi khi lưu ảnh bìa vào Firestore. Vui lòng thử lại."
                );
              }
            );
          }
          return { ...prev, coverPhoto: newCoverPhoto };
        });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        throw new Error("Không thể tải ảnh bìa lên.");
      }
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      setError(err.message || "Lỗi khi tải ảnh bìa. Vui lòng thử lại.");
    } finally {
      setCoverPhotoUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveCoverPhoto = (public_id) => {
    if (!selectedWeddingId) {
      setError("Vui lòng chọn một đám cưới trước khi xóa ảnh bìa.");
      return;
    }
    setForm((prev) => {
      if (user) {
        const weddingRef = doc(db, "weddings", selectedWeddingId);
        updateDoc(weddingRef, { coverPhoto: { public_id: "", url: "" } });
      }
      return { ...prev, coverPhoto: { public_id: "", url: "" } };
    });
  };

  const handleAudioUpload = async (e) => {
    if (!selectedWeddingId) {
      setError("Vui lòng chọn hoặc tạo một đám cưới trước khi tải âm thanh.");
      return;
    }
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const maxSize = 25 * 1024 * 1024;
    const invalidFiles = files.filter((file) => file.size > maxSize);
    if (invalidFiles.length > 0) {
      setError("Một số tệp âm thanh vượt quá giới hạn kích thước 25MB.");
      return;
    }

    setAudioUploading(true);
    setError("");
    try {
      const uploadPromises = files.map(async (file) => {
        const result = await uploadAudioToCloudinary(file);
        if (result && result.secure_url) {
          return {
            public_id: result.public_id,
            url: result.secure_url,
            name: file.name.replace(/\.[^/.]+$/, ""),
          };
        }
        return null;
      });

      const uploadedAudios = (await Promise.all(uploadPromises)).filter(
        (result) => result !== null
      );

      if (uploadedAudios.length === 0) {
        throw new Error("Không có âm thanh nào được tải lên thành công.");
      }

      setForm((prev) => {
        const updatedPlaylist = [...prev.playlist, ...uploadedAudios];
        if (user) {
          const weddingRef = doc(db, "weddings", selectedWeddingId);
          updateDoc(weddingRef, { playlist: updatedPlaylist }).catch((err) => {
            console.error("Firestore save error:", err);
            setError("Lỗi khi lưu âm thanh vào Firestore. Vui lòng thử lại.");
          });
        }
        return { ...prev, playlist: updatedPlaylist };
      });

      if (uploadedAudios.length < files.length) {
        setError(
          `${uploadedAudios.length} trong số ${files.length} âm thanh được tải lên thành công. Một số âm thanh tải lên thất bại.`
        );
      } else {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      setError(err.message || "Lỗi khi tải âm thanh. Vui lòng thử lại.");
    } finally {
      setAudioUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveAudio = (public_id) => {
    if (!selectedWeddingId) {
      setError("Vui lòng chọn một đám cưới trước khi xóa âm thanh.");
      return;
    }
    setForm((prev) => {
      const updatedPlaylist = prev.playlist.filter(
        (audio) => audio.public_id !== public_id
      );
      if (user) {
        const weddingRef = doc(db, "weddings", selectedWeddingId);
        updateDoc(weddingRef, { playlist: updatedPlaylist });
      }
      return { ...prev, playlist: updatedPlaylist };
    });
  };

  const handleRemoveImage = (public_id) => {
    if (!selectedWeddingId) {
      setError("Vui lòng chọn một đám cưới trước khi xóa ảnh.");
      return;
    }
    setForm((prev) => {
      const updatedGallery = prev.gallery.filter(
        (img) => img.public_id !== public_id
      );
      if (user) {
        const weddingRef = doc(db, "weddings", selectedWeddingId);
        updateDoc(weddingRef, { gallery: updatedGallery });
      }
      return { ...prev, gallery: updatedGallery };
    });
  };

  const handleCreateWedding = async () => {
    if (!user) {
      setError("Không thể tạo đám cưới vì chưa đăng nhập。");
      return;
    }
    try {
      const weddingsRef = collection(db, "weddings");
      const newWeddingRef = await addDoc(weddingsRef, {
        userId: user.uid,
        brideName: "",
        groomName: "",
        weddingDate: null,
        weddingTime: "",
        location: "",
        loveStory: "",
        theme: "romantic",
        slug: "",
        gallery: [],
        playlist: [],
        showCountdown: true,
        showGallery: true,
        showLoveStory: true,
        showWishForm: true,
        showWishList: true,
        showQRCode: true,
        showIntroduction: true,
        showLocationMap: true,
        showAudioPlayer: true,
        bankInfo: {
          bankName: "",
          accountNumber: "",
          accountHolder: "",
          description: "",
        },
        introduction: "",
        mapInfo: {
          embedCode: "",
          address: "",
        },
        componentOrder: [
          "WeddingHeader",
          "Introduction",
          "Countdown",
          "Gallery",
          "LoveStory",
          "LocationMap",
          "QRCode",
          "WishForm",
          "WishList",
          "AudioPlayer",
        ],
        primaryFont: "Dancing Script",
        secondaryFont: "Lora",
        coverPhoto: { public_id: "", url: "" },
        createdAt: new Date(),
        name: newWeddingName || "Đám cưới mới",
      });
      setWeddings((prev) => [
        ...prev,
        { id: newWeddingRef.id, name: newWeddingName || "Đám cưới mới" },
      ]);
      setSelectedWeddingId(newWeddingRef.id);
      setShowCreateModal(false);
      setNewWeddingName("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError("Lỗi khi tạo đám cưới mới。Vui lòng thử lại。");
    }
  };

  const handleEditWeddingName = async () => {
    if (!user || !editWeddingId) {
      setError(
        "Không thể chỉnh sửa tên đám cưới vì chưa đăng nhập hoặc chưa chọn đám cưới。"
      );
      return;
    }
    try {
      const weddingRef = doc(db, "weddings", editWeddingId);
      await updateDoc(weddingRef, {
        name: editWeddingName || "Đám cưới mới",
      });
      setWeddings((prev) =>
        prev.map((wedding) =>
          wedding.id === editWeddingId
            ? { ...wedding, name: editWeddingName || "Đám cưới mới" }
            : wedding
        )
      );
      setShowEditModal(false);
      setEditWeddingId(null);
      setEditWeddingName("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError("Lỗi khi chỉnh sửa tên đám cưới。Vui lòng thử lại。");
    }
  };

  const handleDeleteWedding = async (weddingId) => {
    if (!user) {
      setError("Không thể xóa đám cưới vì chưa đăng nhập。");
      return;
    }
    try {
      const batch = writeBatch(db);
      const weddingRef = doc(db, "weddings", weddingId);

      // Delete all documents in the 'wishes' subcollection
      const wishesRef = collection(db, "weddings", weddingId, "wishes");
      const wishesSnap = await getDocs(wishesRef);
      wishesSnap.docs.forEach((wishDoc) => {
        batch.delete(doc(db, "weddings", weddingId, "wishes", wishDoc.id));
      });

      // Delete all documents in the 'guests' subcollection
      const guestsRef = collection(db, "weddings", weddingId, "guests");
      const guestsSnap = await getDocs(guestsRef);
      guestsSnap.docs.forEach((guestDoc) => {
        batch.delete(doc(db, "weddings", weddingId, "guests", guestDoc.id));
      });

      // Delete the wedding document
      batch.delete(weddingRef);

      // Commit the batch
      await batch.commit();

      // Update state
      setWeddings((prev) => prev.filter((wedding) => wedding.id !== weddingId));
      if (selectedWeddingId === weddingId) {
        setSelectedWeddingId(null);
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Error deleting wedding or subcollections:", err);
      setError(
        "Lỗi khi xóa đám cưới hoặc dữ liệu liên quan。Vui lòng thử lại。"
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteWeddingId) {
      await handleDeleteWedding(deleteWeddingId);
      setShowDeleteModal(false);
      setDeleteWeddingId(null);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setError("Không thể lưu thông tin vì chưa đăng nhập。");
      return;
    }
    if (!selectedWeddingId) {
      setError("Vui lòng chọn hoặc tạo một đám cưới để lưu。");
      return;
    }
    if (!form.slug) {
      setError(
        "Vui lòng nhập tên cô dâu, chú rể và ngày cưới để tạo liên kết。"
      );
      return;
    }

    const isSlugAvailable = await validateSlug(form.slug, selectedWeddingId);
    if (!isSlugAvailable) {
      setSlugError(
        "Liên kết này đã được sử dụng。Vui lòng thay đổi tên hoặc ngày cưới。"
      );
      return;
    }

    try {
      const weddingRef = doc(db, "weddings", selectedWeddingId);
      const combinedDateTime =
        form.weddingDate && form.weddingTime
          ? new Date(`${form.weddingDate}T${form.weddingTime}`)
          : null;
      await updateDoc(weddingRef, {
        ...form,
        userId: user.uid,
        weddingDate: combinedDateTime,
        coverPhoto: form.coverPhoto,
      });
      setShowSuccess(true);
      setSlugError("");
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError("Lỗi khi lưu thông tin。Vui lòng thử lại。");
    }
  };

  const handleRedirect = () => {
    if (form.slug && !slugError) {
      router.push(`/dam-cuoi/${form.slug}`);
    } else {
      setError(
        "Vui lòng nhập tên cô dâu, chú rể và ngày cưới để tạo liên kết hợp lệ。"
      );
    }
  };

  const approvedWishes = wishes.filter((wish) => wish.approved);

  const inactiveComponents = allComponents.filter(
    (id) => !form[componentShowFields[id]] && id !== "WeddingHeader"
  );

  const activeComponents = form.componentOrder.filter(
    (id) => form[componentShowFields[id]] || id === "WeddingHeader"
  );

  if (loading || !user) {
    return (
      <Container fluid className="loading-container">
        <Spinner animation="border" variant="danger" />
        <span className="loading-text">Đang tải...</span>
      </Container>
    );
  }

  return (
    <>
      <style jsx>{`
        .sortable-map {
          background-color: #e6f3ff;
          border-left: 4px solid #007bff;
        }
        .component-sidebar {
          background-color: #f8f9fa;
          border-right: 1px solid #dee2e6;
          padding: 15px;
          min-height: 300px;
        }
        .component-workspace {
          background-color: #ffffff;
          padding: 15px;
          min-height: 300px;
        }
        .sortable-item {
          padding: 10px;
          margin-bottom: 8px;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          background-color: #fff;
          cursor: grab;
          user-select: none;
        }
        .sortable-item.inactive {
          background-color: #f1f1f1;
          opacity: 0.7;
        }
        .sortable-item.active {
          background-color: #e6f3ff;
        }
        .component-container {
          border: 2px dashed #dee2e6;
          border-radius: 8px;
          padding: 10px;
          min-height: 200px;
        }
        .drag-overlay {
          opacity: 0.8;
          z-index: 1000;
          background-color: #e6f3ff;
          border: 1px solid #007bff;
        }
      `}</style>
      <Container fluid className="dashboard-container wedding-section">
        <div className="d-flex justify-content-between mb-4">
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="btn-create"
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Tạo đám cưới mới
          </Button>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={handleLogout}
            className="btn-logout"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
            Đăng xuất
          </Button>
        </div>

        <Modal
          show={showCreateModal}
          onHide={() => setShowCreateModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Tạo đám cưới mới</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tên đám cưới (tùy chọn)</Form.Label>
              <Form.Control
                type="text"
                value={newWeddingName}
                onChange={(e) => setNewWeddingName(e.target.value)}
                placeholder="Nhập tên đám cưới"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Hủy
            </Button>
            <Button variant="primary" onClick={handleCreateWedding}>
              Tạo
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Chỉnh sửa tên đám cưới</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tên đám cưới</Form.Label>
              <Form.Control
                type="text"
                value={editWeddingName}
                onChange={(e) => setEditWeddingName(e.target.value)}
                placeholder="Nhập tên đám cưới"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleEditWeddingName}>
              Lưu
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Xác nhận xóa đám cưới</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Bạn có chắc chắn muốn xóa đám cưới này? Hành động này không thể hoàn
            tác。
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteWeddingId(null);
              }}
            >
              Hủy
            </Button>
            <Button variant="primary" onClick={handleConfirmDelete}>
              Xóa
            </Button>
          </Modal.Footer>
        </Modal>

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
                className="alert"
              >
                🎉 Thông tin đã được lưu thành công!
              </Alert>
            )}

            {error && (
              <Alert
                variant="danger"
                onClose={() => setError("")}
                dismissible
                className="alert"
              >
                {error}
              </Alert>
            )}

            {slugError && (
              <Alert
                variant="danger"
                onClose={() => setSlugError("")}
                dismissible
                className="alert"
              >
                {slugError}
              </Alert>
            )}

            <Form.Group className="mb-4">
              <Form.Label className="form-label">
                <FontAwesomeIcon icon={faEdit} className="me-2" />
                Chọn đám cưới
              </Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {weddings.map((wedding) => (
                  <div key={wedding.id} className="d-flex align-items-center">
                    <Button
                      variant={
                        selectedWeddingId === wedding.id
                          ? "primary"
                          : "outline-primary"
                      }
                      onClick={() => setSelectedWeddingId(wedding.id)}
                      className="d-flex align-items-center me-2 position-relative wedding-id"
                    >
                      {wedding.name ||
                        (wedding.brideName && wedding.groomName
                          ? `${wedding.brideName} & ${wedding.groomName}`
                          : "Chưa đặt tên")}
                      <div
                        className="position-absolute"
                        style={{ right: "10px", display: "flex", gap: "10px" }}
                      >
                        <FontAwesomeIcon
                          icon={faPen}
                          className="text-light"
                          style={{ cursor: "pointer" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditWeddingId(wedding.id);
                            setEditWeddingName(wedding.name || "");
                            setShowEditModal(true);
                          }}
                        />
                        <FontAwesomeIcon
                          icon={faTrash}
                          className="text-light"
                          style={{ cursor: "pointer" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteWeddingId(wedding.id);
                            setShowDeleteModal(true);
                          }}
                        />
                      </div>
                    </Button>
                  </div>
                ))}
              </div>
              {weddings.length === 0 && (
                <p className="text-muted mt-2">
                  Chưa có đám cưới nào。Hãy tạo một đám cưới mới!
                </p>
              )}
            </Form.Group>

            {selectedWeddingId ? (
              <Tabs
                activeKey={activeTab}
                onSelect={(key) => setActiveTab(key)}
                id="dashboard-tabs"
                className="mb-4"
              >
                <Tab eventKey="weddingDetails" title="Chi tiết đám cưới">
                  <Form>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="form-label">
                            <FontAwesomeIcon icon={faUser} className="me-2" />
                            Cô dâu
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="brideName"
                            value={form.brideName}
                            onChange={handleChange}
                            className="form-control"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="form-label">
                            <FontAwesomeIcon icon={faUser} className="me-2" />
                            Chú rể
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="groomName"
                            value={form.groomName}
                            onChange={handleChange}
                            className="form-control"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label className="form-label">
                        <FontAwesomeIcon icon={faLink} className="me-2" />
                        Liên kết
                      </Form.Label>
                      <div className="d-flex gap-2">
                        <Form.Control
                          type="text"
                          name="slug"
                          value={form.slug}
                          readOnly
                          disabled
                          className="form-control-disabled"
                        />
                        <Button
                          variant="success"
                          onClick={handleRedirect}
                          disabled={
                            coverPhotoUploading ||
                            imageUploading ||
                            audioUploading ||
                            !form.slug ||
                            !selectedWeddingId
                          }
                          className="btn-redirect"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          <FontAwesomeIcon icon={faEye} className="me-2" />
                          Xem
                        </Button>
                      </div>
                      <Form.Text className="form-text">
                        Tự động tạo từ tên cô dâu, chú rể và ngày cưới
                      </Form.Text>
                    </Form.Group>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="form-label">
                            <FontAwesomeIcon
                              icon={faCalendarAlt}
                              className="me-2"
                            />
                            Ngày cưới
                          </Form.Label>
                          <Form.Control
                            type="date"
                            name="weddingDate"
                            value={form.weddingDate}
                            onChange={handleChange}
                            className="form-control"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="form-label">
                            <FontAwesomeIcon icon={faClock} className="me-2" />
                            Giờ cưới
                          </Form.Label>
                          <Form.Control
                            type="time"
                            name="weddingTime"
                            value={form.weddingTime}
                            onChange={handleChange}
                            className="form-control"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label className="form-label">
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="me-2"
                        />
                        Địa điểm
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </Form.Group>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <CustomDropdown
                            name="theme"
                            value={form.theme}
                            options={themes}
                            onChange={handleChange}
                            previewComponent={ThemePreview}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <CustomDropdown
                            name="primaryFont"
                            value={form.primaryFont}
                            options={primaryFonts}
                            onChange={handleChange}
                            previewComponent={FontPreview}
                            isPrimary={true}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <CustomDropdown
                            name="secondaryFont"
                            value={form.secondaryFont}
                            options={secondaryFonts}
                            onChange={handleChange}
                            previewComponent={FontPreview}
                            isPrimary={false}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label className="form-label">
                        <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                        Giới thiệu về Cô dâu Chú rể
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="introduction"
                        value={form.introduction}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label className="form-label">
                        <FontAwesomeIcon icon={faHeart} className="me-2" />
                        Chuyện tình yêu
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="loveStory"
                        value={form.loveStory}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label className="form-label">
                        <FontAwesomeIcon icon={faImages} className="me-2" />
                        Ảnh bìa (dùng cho Open Graph)
                      </Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleCoverPhotoUpload}
                        disabled={coverPhotoUploading}
                        className="form-control"
                      />
                      {coverPhotoUploading && (
                        <Spinner
                          animation="border"
                          size="sm"
                          className="mt-2"
                          variant="danger"
                        />
                      )}
                      {form.coverPhoto.url && (
                        <div className="mt-3">
                          <div className="gallery-image-wrapper">
                            <Image
                              src={form.coverPhoto.url}
                              alt="Cover photo"
                              className="gallery-image"
                              style={{ maxWidth: "200px" }}
                            />
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() =>
                                handleRemoveCoverPhoto(
                                  form.coverPhoto.public_id
                                )
                              }
                              className="gallery-delete-button"
                            >
                              Xóa
                            </Button>
                          </div>
                        </div>
                      )}
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label className="form-label">
                        <FontAwesomeIcon icon={faImages} className="me-2" />
                        Thư viện ảnh
                      </Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={imageUploading}
                        className="form-control"
                      />
                      {imageUploading && (
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
                                  onClick={() =>
                                    handleRemoveImage(img.public_id)
                                  }
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
                    <Form.Group className="mb-3">
                      <Form.Label className="form-label">
                        <FontAwesomeIcon icon={faMusic} className="me-2" />
                        Danh sách nhạc
                      </Form.Label>
                      <Form.Control
                        type="file"
                        accept="audio/*"
                        multiple
                        onChange={handleAudioUpload}
                        disabled={audioUploading}
                        className="form-control"
                      />
                      {audioUploading && (
                        <Spinner
                          animation="border"
                          size="sm"
                          className="mt-2"
                          variant="danger"
                        />
                      )}
                      {form.playlist.length > 0 && (
                        <ListGroup className="mt-3">
                          {form.playlist.map((audio) => (
                            <ListGroup.Item
                              key={audio.public_id}
                              className="d-flex justify-content-between align-items-center"
                            >
                              <span>{audio.name}</span>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                  handleRemoveAudio(audio.public_id)
                                }
                              >
                                Xóa
                              </Button>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      )}
                    </Form.Group>
                    <h3 className="section-heading">
                      <FontAwesomeIcon icon={faMap} className="me-2" />
                      Thông tin bản đồ
                    </h3>
                    <Form.Group className="mb-3">
                      <Form.Label className="form-label">
                        Liên kết Google Maps
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="mapInfo.embedCode"
                        value={form.mapInfo.embedCode}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Dán liên kết Google Maps hoặc mã nhúng iframe"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label className="form-label">Địa chỉ</Form.Label>
                      <Form.Control
                        type="text"
                        name="mapInfo.address"
                        value={form.mapInfo.address}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Nhập địa chỉ chi tiết"
                      />
                    </Form.Group>
                    <h3 className="section-heading">
                      <FontAwesomeIcon
                        icon={faMoneyBillWave}
                        className="me-2"
                      />
                      Thông tin chuyển khoản
                    </h3>
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
                            className="form-control"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="form-label">
                            Số tài khoản
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="bankInfo.accountNumber"
                            value={form.bankInfo.accountNumber}
                            onChange={handleChange}
                            className="form-control"
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
                            className="form-control"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="form-label">
                            Nội dung chuyển khoản
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="bankInfo.description"
                            value={form.bankInfo.description}
                            onChange={handleChange}
                            className="form-control"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <h3 className="section-heading">
                      <FontAwesomeIcon icon={faEye} className="me-2" />
                      Hiển thị thành phần
                    </h3>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    >
                      <Row>
                        <Col md={4} className="component-sidebar">
                          <h5>Thành phần ẩn</h5>
                          <DroppableSidebar>
                            <SortableContext
                              id="sidebar"
                              items={inactiveComponents}
                              strategy={verticalListSortingStrategy}
                            >
                              {inactiveComponents.length > 0 ? (
                                inactiveComponents.map((id) => (
                                  <SortableItem
                                    key={id}
                                    id={id}
                                    label={componentLabels[id]}
                                    isActive={false}
                                  />
                                ))
                              ) : (
                                <div
                                  className="text-muted text-center"
                                  style={{
                                    padding: "20px",
                                    border: "2px dashed #ccc",
                                    borderRadius: "4px",
                                    backgroundColor: "#f8f9fa",
                                    minHeight: "100px",
                                  }}
                                >
                                  Kéo thả thành phần vào đây để ẩn
                                </div>
                              )}
                            </SortableContext>
                          </DroppableSidebar>
                        </Col>
                        <Col md={8} className="component-workspace">
                          <h5>Thành phần hiển thị</h5>
                          <DroppableWorkspace>
                            <SortableContext
                              id="workspace"
                              items={activeComponents}
                              strategy={verticalListSortingStrategy}
                            >
                              {" "}
                              {activeComponents.map((id) => (
                                <SortableItem
                                  key={id}
                                  id={id}
                                  label={componentLabels[id]}
                                  isActive={true}
                                />
                              ))}
                            </SortableContext>
                          </DroppableWorkspace>
                        </Col>
                      </Row>
                      <DragOverlay>
                        {activeId ? (
                          <div className="sortable-item drag-overlay">
                            <FontAwesomeIcon icon={faSort} className="me-3" />
                            {componentLabels[activeId]}
                          </div>
                        ) : null}
                      </DragOverlay>
                    </DndContext>
                    <div className="d-flex gap-2 mt-4">
                      <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={
                          coverPhotoUploading ||
                          imageUploading ||
                          audioUploading ||
                          !selectedWeddingId
                        }
                        className="btn-save"
                      >
                        <FontAwesomeIcon icon={faSave} className="me-2" />
                        Lưu thông tin
                      </Button>
                      <Button
                        variant="success"
                        onClick={handleRedirect}
                        disabled={
                          coverPhotoUploading ||
                          imageUploading ||
                          audioUploading ||
                          !form.slug ||
                          !selectedWeddingId
                        }
                        className="btn-redirect"
                      >
                        <FontAwesomeIcon icon={faEye} className="me-2" />
                        Xem trang cưới
                      </Button>
                    </div>
                  </Form>
                </Tab>
                <Tab eventKey="guestsManager" title="Quản lý khách mời">
                  <GuestsManager
                    slug={form.slug}
                    weddingId={selectedWeddingId}
                    userId={user.uid}
                  />
                </Tab>
                <Tab eventKey="wishesManager" title="Quản lý lời chúc">
                  <WishesManager
                    weddingId={selectedWeddingId}
                    wishes={wishes}
                    setWishes={setWishes}
                    setError={setError}
                  />
                </Tab>
              </Tabs>
            ) : (
              <p className="text-muted">
                Vui lòng chọn một đám cưới để chỉnh sửa hoặc tạo một đám cưới
                mới。
              </p>
            )}
          </Card.Body>
        </Card>
      </Container>
      {selectedWeddingId && (
        <WeddingPreviewPane form={form} wishes={approvedWishes} />
      )}
    </>
  );
}
