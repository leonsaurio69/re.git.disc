import { getAuthHeaders } from "./auth-context";

const API_BASE = "/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Error de conexión" }));
    throw new Error(error.message || "Error en la solicitud");
  }
  return response.json();
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{ user: any; token: string }>(res);
  },

  register: async (name: string, email: string, password: string, role: string) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    return handleResponse<{ user: any; token: string }>(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },
};

// Tours API
export const toursApi = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/tours`);
    return handleResponse<any[]>(res);
  },

  getFeatured: async (limit = 6) => {
    const res = await fetch(`${API_BASE}/tours/featured?limit=${limit}`);
    return handleResponse<any[]>(res);
  },

  getById: async (id: number) => {
    const res = await fetch(`${API_BASE}/tours/${id}`);
    return handleResponse<any>(res);
  },

  create: async (data: any) => {
    const res = await fetch(`${API_BASE}/tours`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  update: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE}/tours/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  delete: async (id: number) => {
    const res = await fetch(`${API_BASE}/tours/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  getMyTours: async () => {
    const res = await fetch(`${API_BASE}/guide/tours`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any[]>(res);
  },
};

// Bookings API
export const bookingsApi = {
  create: async (tourId: number, date: string, guests: number) => {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ tourId, date, guests }),
    });
    return handleResponse<any>(res);
  },

  getMyBookings: async () => {
    const res = await fetch(`${API_BASE}/bookings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  getGuideBookings: async () => {
    const res = await fetch(`${API_BASE}/guide/bookings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  updateStatus: async (id: number, status: string) => {
    const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ status }),
    });
    return handleResponse<any>(res);
  },

  cancel: async (id: number) => {
    const res = await fetch(`${API_BASE}/bookings/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },
};

// Guides API
export const guidesApi = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/guides`);
    return handleResponse<any[]>(res);
  },

  getStats: async () => {
    const res = await fetch(`${API_BASE}/guide/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },
};

// Admin API
export const adminApi = {
  getStats: async () => {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  getUsers: async () => {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  getAllBookings: async () => {
    const res = await fetch(`${API_BASE}/admin/bookings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  updateUser: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  deleteUser: async (id: number) => {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },
};
