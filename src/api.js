const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export async function api(path, options = {}) {
  const token = sessionStorage.getItem("passopToken");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  if (response.status === 401) sessionStorage.removeItem("passopToken");
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}
