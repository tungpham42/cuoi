import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";
import "animate.css";
import "bootstrap/dist/css/bootstrap.min.css";

export const metadata = {
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

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
      <GoogleAnalytics gaId="G-TY26D3X2LF" />
      <GoogleTagManager gtmId="GTM-5R8XPP4P" />
    </html>
  );
}
