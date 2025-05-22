import { db } from "@/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

// Default fallback metadata
export const defaultMetadata = {
  title: "Tình Yêu Vĩnh Cửu - Hành Trình Hôn Nhân",
  description:
    "Chào mừng bạn đến với trang web hôn lễ của chúng tôi, nơi lưu giữ những khoảnh khắc đẹp nhất của tình yêu và hạnh phúc.",
  openGraph: {
    title: "Tình Yêu Vĩnh Cửu - Hành Trình Hôn Nhân",
    description:
      "Chào mừng bạn đến với trang web hôn lễ của chúng tôi, nơi lưu giữ những khoảnh khắc đẹp nhất của tình yêu và hạnh phúc.",
    type: "website",
    url: "https://marry.io.vn",
    images: [
      {
        url: "https://marry.io.vn/1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "Hình ảnh mặc định của hôn lễ",
      },
    ],
  },
};

/**
 * Validates a URL string.
 * @param {string} url - The URL to validate.
 * @returns {string} Valid URL or fallback URL.
 */
export function validateImageUrl(url) {
  const fallbackUrl = "https://marry.io.vn/1200x630.jpg";
  if (!url) return fallbackUrl;
  try {
    new URL(url);
    return url;
  } catch {
    console.warn(`Invalid URL: ${url}`);
    return fallbackUrl;
  }
}

/**
 * Fetches wedding data from Firestore by slug.
 * @param {string} slug - The wedding slug.
 * @returns {Object} Wedding data with safe defaults or null if not found.
 */
export async function fetchWeddingData(slug) {
  try {
    const weddingsRef = collection(db, "weddings");
    const q = query(weddingsRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`No wedding found for slug: ${slug}`);
      return null;
    }

    const weddingDoc = querySnapshot.docs[0];
    const data = weddingDoc.data();
    return {
      brideName: data.brideName || "Cô Dâu",
      groomName: data.groomName || "Chú Rể",
      coverPhoto: validateImageUrl(data.coverPhoto?.url || ""),
      id: weddingDoc.id,
    };
  } catch (error) {
    console.error(
      `Error fetching wedding data for slug ${slug}:`,
      error.message
    );
    return null;
  }
}

/**
 * Fetches guest data from Firestore by wedding ID and guest ID.
 * @param {string} weddingId - The wedding document ID.
 * @param {string} guestId - The guest document ID.
 * @returns {string} Guest name or fallback.
 */
export async function fetchGuestData(weddingId, guestId) {
  try {
    const guestDocRef = doc(db, `weddings/${weddingId}/guests/${guestId}`);
    const guestDoc = await getDoc(guestDocRef);
    return guestDoc.exists()
      ? guestDoc.data().name || "Khách Mời"
      : "Khách Mời";
  } catch (error) {
    console.error(
      `Error fetching guest data for ID ${guestId}:`,
      error.message
    );
    return "Khách Mời";
  }
}
