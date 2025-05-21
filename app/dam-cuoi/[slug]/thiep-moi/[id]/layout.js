import { db, auth } from "@/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export async function generateMetadata({ params }) {
  const { slug, id } = params;

  // Fallback metadata
  const fallbackMetadata = {
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

    // Query Firestore for the wedding document with the matching slug
    const weddingsRef = collection(db, "weddings");
    const weddingQuery = query(weddingsRef, where("slug", "==", slug));
    const weddingSnapshot = await getDocs(weddingQuery);

    if (weddingSnapshot.empty) {
      console.warn(`No wedding found for slug: ${slug}`);
      return fallbackMetadata;
    }

    // Get the wedding document
    const weddingDoc = weddingSnapshot.docs[0].data();
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

    // Query Firestore for the guest document with the matching id
    const guestsRef = collection(
      db,
      `weddings/${weddingSnapshot.docs[0].id}/guests`
    );
    const guestQuery = query(guestsRef, where("id", "==", id));
    const guestSnapshot = await getDocs(guestQuery);

    let guestName = "Khách Mời";
    if (!guestSnapshot.empty) {
      const guestDoc = guestSnapshot.docs[0].data();
      guestName = guestDoc.name || "Khách Mời";
    } else {
      console.warn(`No guest found for id: ${id}`);
    }

    // Return dynamic metadata
    return {
      title: `${guestName} - Hôn Lễ ${brideName} & ${groomName}`,
      description: `Trang thông tin dành cho ${guestName} tại hôn lễ của ${brideName} và ${groomName}.`,
      openGraph: {
        title: `${guestName} - Hôn Lễ ${brideName} & ${groomName}`,
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
  } catch (error) {
    console.error("Error fetching metadata from Firestore:", error);
    return fallbackMetadata;
  }
}

export default function GuestLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
