const CLOUDINARY_CLOUD_NAME = "filecuatui";
const CLOUDINARY_UPLOAD_PRESET = "tiec-cuoi";

export async function uploadImageToCloudinary(file) {
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

export async function uploadAudioToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("resource_type", "audio"); // Specify audio resource type

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`, // Use raw upload for audio
    {
      method: "POST",
      body: formData,
    }
  );

  return res.json(); // Returns the audio URL and other metadata
}
