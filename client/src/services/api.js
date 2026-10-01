import axios from "axios";

const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const BACKEND_ORIGIN = API_ORIGIN.replace(/\/api\/?$/, "");
export const FALLBACK_BOOK_IMAGE = "https://placehold.co/300x400?text=No+Cover";

export const getBookImageUrl = (book) => {
  const image = String(book?.image || book?.coverImage || "").trim();
  if (!image) return FALLBACK_BOOK_IMAGE;
  if (/^(https?:|data:|blob:)/i.test(image)) return image;
  const normalizedImage = image.replace(/\\/g, "/");
  const imagePath = normalizedImage.startsWith("/uploads/")
    ? normalizedImage
    : normalizedImage.startsWith("uploads/")
      ? `/${normalizedImage}`
      : `/uploads/${normalizedImage.replace(/^\/+/, "")}`;
  return `${BACKEND_ORIGIN}${imagePath}`;
};

const api = axios.create({
  baseURL: API_ORIGIN,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bookverse_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.join(", ") ||
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

export default api;
