import BackToTop from "@/components/BackToTop";
import { auth } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";

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

export async function generateMetadata() {
  try {
    // Check if the user is authenticated
    const user = await new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        resolve(user || null); // Resolve with null if no user
      });
    });

    // If no user is authenticated, return fallback metadata
    if (!user) {
      console.warn("No authenticated user found for Quản trị page.");
      return fallbackMetadata;
    }

    // If authenticated, return the default metadata (same as fallback in this case, but could be customized)
    return {
      title: "Tình Yêu Vĩnh Cửu - Quản Trị",
      description:
        "Chào mừng bạn đến với trang web hôn lễ của chúng tôi, nơi lưu giữ những khoảnh khắc đẹp nhất của tình yêu và hạnh phúc.",
      openGraph: {
        title: "Tình Yêu Vĩnh Cửu - Quản Trị",
        description:
          "Chào mừng bạn đến với trang web hôn lễ của chúng tôi, nơi lưu giữ những khoảnh khắc đẹp nhất của tình yêu và hạnh phúc.",
        type: "website",
        url: "https://marry.io.vn/quan-tri",
        images: [
          {
            url: "https://marry.io.vn/1200x630.jpg",
            width: 1200,
            height: 630,
          },
        ],
      },
    };
  } catch (error) {
    console.error("Error checking authentication for metadata:", error);
    return fallbackMetadata;
  }
}

export default function DashboardLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        {children}
        <BackToTop />
      </body>
    </html>
  );
}
