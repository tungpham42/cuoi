import { defaultMetadata, fetchWeddingData } from "@/utils/metadata";

export async function generateMetadata({ params }) {
  const { slug } = params;

  const weddingData = await fetchWeddingData(slug);
  if (!weddingData) {
    return {
      title: defaultMetadata.title,
      description: defaultMetadata.description,
      openGraph: {
        ...defaultMetadata.openGraph,
        url: `https://marry.io.vn/wedding/${slug}`,
      },
    };
  }

  const { brideName, groomName, coverPhoto } = weddingData;
  return {
    title: `Đám cưới của ${brideName} và ${groomName}`,
    description: `Chào mừng bạn đến với trang web hôn lễ của ${brideName} và ${groomName}, nơi lưu giữ những khoảnh khắc đẹp nhất của tình yêu và hạnh phúc.`,
    openGraph: {
      title: `Đám cưới của ${brideName} và ${groomName}`,
      description: `Chào mừng bạn đến với trang web hôn lễ của ${brideName} và ${groomName}, nơi lưu giữ những khoảnh khắc đẹp nhất của tình yêu và hạnh phúc.`,
      type: "website",
      url: `https://marry.io.vn/wedding/${slug}`,
      images: [
        {
          url: coverPhoto,
          width: 1200,
          height: 630,
          alt: `Hình ảnh hôn lễ của ${brideName} và ${groomName}`,
        },
      ],
    },
  };
}

export default function WeddingPageLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
