import { db, auth } from "@/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export async function generateMetadata({ params }) {
  const { slug } = params;

  // Fallback metadata
  const fallbackMetadata = {
    title: "Tình Yêu Vĩnh Cửu - Hành Trình Hôn Nhân",
    description:
      "Chào mừng bạn đến với trang web hôn lễ của chúng tôi, nơi lưu giữ những khoảnh khắc đẹp nhất của tình yêu và hạnh phúc.",
    openGraph: {
      title: "Tình Yêu Vĩnh Cửu - Hành Trình Hôn Nhân",
      description:
        "Chào mừng bạn đến với trang web hôn lễ của chúng tôi, nơi lưu giữ những khoảnh khắc đẹp nhất của tình yêu và hạnh phúc.",
      type: "website",
      url: `https://marry.io.vn/wedding/${slug}`,
      images: [
        {
          url: "https://marry.io.vn/1200x630.jpg",
          width: 1200,
          height: 630,
        },
      ],
    },
  };

  try {
    // Get the current authenticated user
    const user = await new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        resolve(user || null); // Resolve with null if no user
      });
    });

    // Query Firestore for a wedding document with the matching slug
    const weddingsRef = collection(db, "weddings");
    const q = query(weddingsRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Get the first matching document
      const weddingDoc = querySnapshot.docs[0].data();
      const { brideName, groomName, userId } = weddingDoc;

      // Validate required fields
      if (!brideName || !groomName) {
        throw new Error("Missing brideName or groomName in wedding document");
      }

      // If user is authenticated, verify they own the wedding
      if (user && user.uid !== userId) {
        console.warn("Authenticated user does not own this wedding.");
        return fallbackMetadata;
      }

      // Return dynamic metadata
      return {
        title: `Tình Yêu Vĩnh Cửu - ${brideName} & ${groomName}`,
        description: `Chào mừng bạn đến với trang web hôn lễ của ${brideName} và ${groomName}, nơi lưu giữ những khoảnh khắc đẹp nhất của tình yêu và hạnh phúc.`,
        openGraph: {
          title: `Tình Yêu Vĩnh Cửu - ${brideName} & ${groomName}`,
          description:
            "Chào mừng bạn đến với trang web hôn lễ của chúng tôi, nơi lưu giữ những khoảnh khắc đẹp nhất của tình yêu và hạnh phúc.",
          type: "website",
          url: `https://marry.io.vn/wedding/${slug}`,
          images: [
            {
              url: "https://marry.io.vn/1200x630.jpg",
              width: 1200,
              height: 630,
            },
          ],
        },
      };
    }

    // Return fallback metadata if no matching document is found
    console.warn(`No wedding found for slug: ${slug}`);
    return fallbackMetadata;
  } catch (error) {
    console.error("Error fetching metadata from Firestore:", error);
    return fallbackMetadata;
  }
}

export default function WeddingPageLayout({ children }) {
  return (
    <>
      <html lang="vi">
        <body>{children}</body>
      </html>
    </>
  );
}
