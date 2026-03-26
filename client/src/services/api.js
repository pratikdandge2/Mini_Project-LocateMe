import { auth } from "./firebase";

const BASE_URL = import.meta.env.VITE_API_URL;

export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  const data = await res.json();
  return data.secure_url;
};

const getToken = async () => auth.currentUser?.getIdToken();

export const fetchItems = async (type = "", page = 1) => {
  const query = type ? `?type=${type}&page=${page}` : `?page=${page}`;
  const res = await fetch(`${BASE_URL}/api/items${query}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.items || [];
};

export const fetchItemsPaged = async ({
  type = "",
  page = 1,
  limit = 12,
  search = "",
  location = "all",
  sort = "newest",
} = {}) => {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  params.set("page", String(page));
  params.set("limit", String(limit));
  params.set("location", location || "all");
  params.set("sort", sort || "newest");
  if (search) params.set("search", search);
  params.set("includeMeta", "true");

  const res = await fetch(`${BASE_URL}/api/items?${params.toString()}`);
  return res.json();
};

export const fetchItem = async (id) => {
  const res = await fetch(`${BASE_URL}/api/items/${id}`);
  return res.json();
};

export const createItem = async (data) => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/api/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const resolveItem = async (id) => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/api/items/${id}/resolve`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const deleteItem = async (id) => {
  const token = await getToken();
  await fetch(`${BASE_URL}/api/items/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const fetchComments = async (itemId) => {
  const res = await fetch(`${BASE_URL}/api/items/${itemId}/comments`);
  return res.json();
};

export const postComment = async (itemId, text) => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/api/items/${itemId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  });
  return res.json();
};

export const deleteComment = async (itemId, commentId) => {
  const token = await getToken();
  await fetch(`${BASE_URL}/api/items/${itemId}/comments/${commentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const fetchNotifications = async () => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/api/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const markNotificationsRead = async () => {
  const token = await getToken();
  await fetch(`${BASE_URL}/api/notifications/read-all`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const clearNotifications = async () => {
  const token = await getToken();
  await fetch(`${BASE_URL}/api/notifications/clear`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const fetchMyItems = async (status = '') => {
  const token = await getToken();
  const q = status ? `?status=${status}` : '';
  const res = await fetch(`${BASE_URL}/api/items/mine${q}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
