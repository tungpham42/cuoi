export const metadata = {
  title: "Tình Yêu Vĩnh Cửu - Quản Trị",
  description:
    "Chào mừng bạn đến với trang web hôn lễ của chúng tôi, nơi lưu giữ những khoảnh khắc đẹp nhất của tình yêu và hạnh phúc.",
  openGraph: {
    title: "Tình Yêu Vĩnh Cửu - Quản Trị",
    description:
      "Chào mừng bạn đến với trang web hôn lễ của chúng tôi, nơi lưu giữ những khoảnh khắc đẹp nhất của tình yêu và hạnh phúc.",
    type: "website",
    url: "https://cuoi.soft.io.vn/quan-tri",
    images: [
      {
        url: "https://cuoi.soft.io.vn/1200x630.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function DashboardLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
