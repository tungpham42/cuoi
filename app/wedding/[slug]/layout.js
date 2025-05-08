import { db } from "@/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getDomain } from "@/utils/getDomain";

export async function generateMetadata({ params }, parent) {
  const { slug } = params;
  const baseUrl = getDomain(parent);

  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0].data();
      const { brideName, groomName } = userDoc;

      return {
        title: `Tình Yêu Vĩnh Cửu - ${brideName} & ${groomName}`,
        description: `Chào mừng bạn đến với trang web hôn lễ của ${brideName} và ${groomName}, nơi lưu giữ những khoảnh khắc đẹp nhất của tình yêu và hạnh phúc.`,
        openGraph: {
          title: `Tình Yêu Vĩnh Cửu - ${brideName} & ${groomName}`,
          description:
            "Chào mừng bạn đến với trang web hôn lễ của chúng tôi, nơi lưu giữ những khoảnh khắc đẹp nhất của tình yêu và hạnh phúc.",
          type: "website",
          url: `${baseUrl}/wedding/${slug}`,
          images: [
            {
              url: `${baseUrl}/1200x630.jpg`,
              width: 1200,
              height: 630,
            },
          ],
        },
      };
    } else {
      return {
        title: "Tình Yêu Vĩnh Cửu - Hành Trình Hôn Nhân",
        description:
          "Chào mừng bạn đến với trang web hôn lễ của chúng tôi, nơi lưu giữ những khoảnh khắc đẹp nhất của tình yêu và hạnh phúc.",
        openGraph: {
          title: "Tình Yêu Vĩnh Cửu - Hành Trình Hôn Nhân",
          description:
            "Chào mừng bạn đến với trang web hôn lễ của chúng tôi, nơi lưu giữ những khoảnh khắc đẹp nhất của tình yêu và hạnh phúc.",
          type: "website",
          url: `${baseUrl}/wedding/${slug}`,
          images: [
            {
              url: `${baseUrl}/1200x630.jpg`,
              width: 1200,
              height: 630,
            },
          ],
        },
      };
    }
  } catch (error) {
    console.error("Error fetching metadata from Firestore:", error);
    return {
      title: "Tình Yêu Vĩnh Cửu - Hành Trình Hôn Nhân",
      description:
        "Chào mừng bạn đến với trang web hôn lễ của chúng tôi, nơi lưu giữ những khoảnh khắc đẹp nhất của tình yêu và hạnh phúc.",
      openGraph: {
        title: "Tình Yêu Vĩnh Cửu - Hành Trình Hôn Nhân",
        description:
          "Chào mừng bạn đến với trang web hôn lễ của chúng tôi, nơi lưu giữ những khoảnh khắc đẹp nhất của tình yêu và hạnh phúc.",
        type: "website",
        url: `${baseUrl}/wedding/${slug}`,
        images: [
          {
            url: `${baseUrl}/1200x630.jpg`,
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
