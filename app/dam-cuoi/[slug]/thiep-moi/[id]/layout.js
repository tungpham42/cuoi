import {
  defaultMetadata,
  fetchWeddingData,
  fetchGuestData,
} from "@/utils/metadata";

export async function generateMetadata({ params }) {
  const { slug, id } = params;

  const weddingData = await fetchWeddingData(slug);
  if (!weddingData) {
    return {
      title: "Khách Mời - Tình Yêu Vĩnh Cửu",
      description:
        "Trang thông tin dành cho khách mời của hôn lễ, nơi chia sẻ những khoảnh khắc đẹp và thông tin quan trọng.",
      openGraph: {
        title: "Khách Mời - Tình Yêu Vĩnh Cửu",
        description:
          "Trang thông tin dành cho khách mời của hôn lễ, nơi chia sẻ những khoảnh khắc đẹp và thông tin quan trọng.",
        type: "website",
        url: `https://marry.io.vn/dam-cuoi/${slug}/thiep-moi/${id}`,
        images: [
          {
            url: defaultMetadata.openGraph.images[0].url,
            width: 1200,
            height: 630,
            alt: "Hình ảnh mặc định của hôn lễ",
          },
        ],
      },
    };
  }

  const { brideName, groomName, coverPhoto, id: weddingId } = weddingData;
  const guestName = await fetchGuestData(weddingId, id);

  return {
    title: `Kính mời ${guestName} đến hôn lễ của ${brideName} & ${groomName}`,
    description: `Trang thông tin dành cho ${guestName} tại hôn lễ của ${brideName} và ${groomName}.`,
    openGraph: {
      title: `Kính mời ${guestName} đến hôn lễ của ${brideName} & ${groomName}`,
      description: `Trang thông tin dành cho ${guestName} tại hôn lễ của ${brideName} và ${groomName}.`,
      type: "website",
      url: `https://marry.io.vn/dam-cuoi/${slug}/thiep-moi/${id}`,
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

export default function GuestLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
