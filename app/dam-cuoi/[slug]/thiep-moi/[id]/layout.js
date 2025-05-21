import { db } from "@/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

// Default metadata to use when data fetching fails or data is incomplete
const fallbackMetadata = {
  title: "Khách Mời - Tình Yêu Vĩnh Cửu",
  description:
    "Trang thông tin dành cho khách mời của hôn lễ, nơi chia sẻ những khoảnh khắc đẹp và thông tin quan trọng.",
  openGraph: {
    title: "Khách Mời - Tình Yêu Vĩnh Cửu",
    description:
      "Trang thông tin dành cho khách mời của hôn lễ, nơi chia sẻ những khoảnh khắc đẹp và thông tin quan trọng.",
    type: "website",
    url: "https://marry.io.vn",
    images: [
      {
        url: "https://marry.io.vn/1200x630.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
};

/**
 * Generates metadata for the guest page based on wedding and guest data.
 * @param {Object} params - The route parameters containing slug and id.
 * @returns {Object} Metadata object with title, description, and Open Graph data.
 */
export async function generateMetadata({ params }) {
  const { slug, id } = params;

  try {
    // Query Firestore for the wedding document
    const weddingsRef = collection(db, "weddings");
    const weddingQuery = query(weddingsRef, where("slug", "==", slug));
    const weddingSnapshot = await getDocs(weddingQuery);

    if (weddingSnapshot.empty) {
      console.warn(`No wedding found for slug: ${slug}`);
      return {
        ...fallbackMetadata,
        openGraph: {
          ...fallbackMetadata.openGraph,
          url: `https://marry.io.vn/dam-cuoi/${slug}/thiep-moi/${id}`,
        },
      };
    }

    // Extract wedding data
    const weddingDoc = weddingSnapshot.docs[0];
    const { brideName, groomName } = weddingDoc.data();

    // Validate required wedding fields
    if (!brideName || !groomName) {
      console.warn("Missing brideName or groomName in wedding document");
      return {
        ...fallbackMetadata,
        openGraph: {
          ...fallbackMetadata.openGraph,
          url: `https://marry.io.vn/dam-cuoi/${slug}/thiep-moi/${id}`,
        },
      };
    }

    // Query Firestore for the guest document
    const guestDocRef = doc(db, `weddings/${weddingDoc.id}/guests/${id}`);
    const guestDoc = await getDoc(guestDocRef);

    // Set guest name, fallback to default if not found
    const guestName = guestDoc.exists()
      ? guestDoc.data().name || "Khách Mời"
      : "Khách Mời";

    // Construct dynamic metadata
    const metadata = {
      title: `Kính mời ${guestName} đến hôn lễ của ${brideName} & ${groomName}`,
      description: `Trang thông tin dành cho ${guestName} tại hôn lễ của ${brideName} và ${groomName}.`,
      openGraph: {
        title: `Kính mời ${guestName} đến hôn lễ của ${brideName} & ${groomName}`,
        description: `Trang thông tin dành cho ${guestName} tại hôn lễ của ${brideName} và ${groomName}.`,
        type: "website",
        url: `https://marry.io.vn/dam-cuoi/${slug}/thiep-moi/${id}`,
        images: [
          {
            url: "https://marry.io.vn/1200x630.jpg",
            width: 1200,
            height: 630,
          },
        ],
      },
    };

    return metadata;
  } catch (error) {
    console.error("Error fetching metadata from Firestore:", error);
    return {
      ...fallbackMetadata,
      openGraph: {
        ...fallbackMetadata.openGraph,
        url: `https://marry.io.vn/dam-cuoi/${slug}/thiep-moi/${id}`,
      },
    };
  }
}

export default function GuestLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
