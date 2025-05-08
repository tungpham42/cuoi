import { db } from "@/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function generateMetadata({ params }) {
  const { slug } = params;

  try {
    // Query Firestore for a user document with the matching slug
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Get the first matching document
      const userDoc = querySnapshot.docs[0].data();
      const { brideName, groomName } = userDoc;

      // Return dynamic metadata
      return {
        title: `Tình Yêu Vĩnh Cửu - ${brideName} & ${groomName}`,
        description: `Chào mừng bạn đến với trang web hôn lễ của ${brideName} và ${groomName}, nơi lưu giữ những khoảnh khắc đẹp nhất của tình yêu và hạnh phúc.`,
        openGraph: {
          title: `Tình Yêu Vĩnh Cửu - ${brideName} & ${groomName}`,
          description:
            "Chào mừng bạn đến với trang web hôn lễ của chúng tôi, nơi lưu giữ những khoảnh khắc đẹp nhất của tình yêu và hạnh phúc.",
          type: "website",
          url: `https://cuoi.soft.io.vn/dam-cuoi/${slug}`,
          images: [
            {
              url: "https://cuoi.soft.io.vn/1200x630.jpg",
              width: 1200,
              height: 630,
            },
          ],
        },
      };
    } else {
      // Fallback metadata if no matching document is found
      return {
        title: "Tình Yêu Vĩnh Cửu - Hành Trình Hôn Nhân",
        description:
          "Chào mừng bạn đến với trang web hôn lễ của chúng tôi, nơi lưu giữ những khoảnh khắc đẹp nhất của tình yêu và hạnh phúc.",
        openGraph: {
          title: "Tình Yêu Vĩnh Cửu - Hành Trình Hôn Nhân",
          description:
            "Chào mừng bạn đến với trang web hôn lễ của chúng tôi, nơi lưu giữ những khoảnh khắc đẹp nhất của tình yêu và hạnh phúc.",
          type: "website",
          url: `https://cuoi.soft.io.vn/dam-cuoi/${slug}`,
          images: [
            {
              url: "https://cuoi.soft.io.vn/1200x630.jpg",
              width: 1200,
              height: 630,
            },
          ],
        },
      };
    }
  } catch (error) {
    console.error("Error fetching metadata from Firestore:", error);
    // Fallback metadata in case of error
    return {
      title: "Tình Yêu Vĩnh Cửu - Hành Trình Hôn Nhân",
      description:
        "Chào mừng bạn đến với trang web hôn lễ của chúng tôi, nơi lưu giữ những khoảnh khắc đẹp nhất của tình yêu và hạnh phúc.",
      openGraph: {
        title: "Tình Yêu Vĩnh Cửu - Hành Trình Hôn Nhân",
        description:
          "Chào mừng bạn đến với trang web hôn lễ của chúng tôi, nơi lưu giữ những khoảnh khắc đẹp nhất của tình yêu và hạnh phúc.",
        type: "website",
        url: `https://cuoi.soft.io.vn/dam-cuoi/${slug}`,
        images: [
          {
            url: "https://cuoi.soft.io.vn/1200x630.jpg",
            width: 1200,
            height: 630,
          },
        ],
      },
    };
  }
}

export default function WeddingPageLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
