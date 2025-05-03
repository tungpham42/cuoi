const CLOUDINARY_CLOUD_NAME = "filecuatui";
const CLOUDINARY_UPLOAD_PRESET = "tiec-cuoi";

export async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  return res.json(); // trả về URL ảnh
}
