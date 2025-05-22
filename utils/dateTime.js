export const formatDateTime = (date, time) => {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  const dateObj = new Date(year, month - 1, day); // month is 0-based in JS
  const weekday = dateObj.toLocaleDateString("vi-VN", { weekday: "long" });
  const formattedDate = `${day}/${month}/${year}`;
  return time
    ? `${weekday}, ${formattedDate}, ${time}`
    : `${weekday}, ${formattedDate}`;
};
