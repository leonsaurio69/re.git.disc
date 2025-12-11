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
    return handleResponse<{ user: any; token: string; guideProfile?: any }>(res);
  },

  register: async (name: string, email: string, password: string, role: string, phone?: string) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role, phone }),
    });
    return handleResponse<{ user: any; token: string }>(res);
  },

  registerGuide: async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    location?: string;
    businessName?: string;
    specialties?: string[];
    languages?: string[];
    experience?: string;
  }) => {
    const res = await fetch(`${API_BASE}/auth/register/guide`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<{ user: any; token: string; message: string }>(res);
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

  search: async (query: string, filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
  }) => {
    const params = new URLSearchParams({ q: query });
    if (filters?.category) params.set("category", filters.category);
    if (filters?.minPrice) params.set("minPrice", filters.minPrice.toString());
    if (filters?.maxPrice) params.set("maxPrice", filters.maxPrice.toString());
    if (filters?.location) params.set("location", filters.location);
    
    const res = await fetch(`${API_BASE}/tours/search?${params}`);
    return handleResponse<any[]>(res);
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

  toggleActive: async (id: number) => {
    const res = await fetch(`${API_BASE}/tours/${id}/toggle`, {
      method: "PATCH",
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

  // Tour Images
  addImage: async (tourId: number, data: { imageUrl: string; caption?: string; isPrimary?: boolean }) => {
    const res = await fetch(`${API_BASE}/tours/${tourId}/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  deleteImage: async (tourId: number, imageId: number) => {
    const res = await fetch(`${API_BASE}/tours/${tourId}/images/${imageId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Tour Availability
  getAvailability: async (tourId: number) => {
    const res = await fetch(`${API_BASE}/tours/${tourId}/availability`);
    return handleResponse<any[]>(res);
  },

  addAvailability: async (tourId: number, data: { date: string; startTime?: string; availableSpots: number }) => {
    const res = await fetch(`${API_BASE}/tours/${tourId}/availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  deleteAvailability: async (tourId: number, availId: number) => {
    const res = await fetch(`${API_BASE}/tours/${tourId}/availability/${availId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Reviews
  getReviews: async (tourId: number) => {
    const res = await fetch(`${API_BASE}/tours/${tourId}/reviews`);
    return handleResponse<any[]>(res);
  },
};

// Bookings API
export const bookingsApi = {
  create: async (data: { tourId: number; date: string; guests: number; availabilityId?: number; notes?: string }) => {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  getMyBookings: async () => {
    const res = await fetch(`${API_BASE}/bookings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  getById: async (id: number) => {
    const res = await fetch(`${API_BASE}/bookings/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  getGuideBookings: async () => {
    const res = await fetch(`${API_BASE}/guide/bookings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  updateStatus: async (id: number, status: string, reason?: string) => {
    const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ status, reason }),
    });
    return handleResponse<any>(res);
  },

  cancel: async (id: number, reason?: string) => {
    const res = await fetch(`${API_BASE}/bookings/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: reason ? JSON.stringify({ reason }) : undefined,
    });
    return handleResponse<any>(res);
  },
};

// Reviews API
export const reviewsApi = {
  create: async (data: { bookingId: number; rating: number; comment?: string }) => {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  addResponse: async (id: number, response: string) => {
    const res = await fetch(`${API_BASE}/reviews/${id}/response`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ response }),
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

  getProfile: async () => {
    const res = await fetch(`${API_BASE}/guide/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  updateProfile: async (data: any) => {
    const res = await fetch(`${API_BASE}/guide/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  getStats: async () => {
    const res = await fetch(`${API_BASE}/guide/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  getEarnings: async () => {
    const res = await fetch(`${API_BASE}/guide/earnings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Documents
  getDocuments: async () => {
    const res = await fetch(`${API_BASE}/guide/documents`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  uploadDocument: async (data: { type: string; name: string; fileUrl: string }) => {
    const res = await fetch(`${API_BASE}/guide/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  deleteDocument: async (id: number) => {
    const res = await fetch(`${API_BASE}/guide/documents/${id}`, {
      method: "DELETE",
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

  getRevenue: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    
    const res = await fetch(`${API_BASE}/admin/revenue?${params}`, {
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

  getAllTours: async () => {
    const res = await fetch(`${API_BASE}/admin/tours`, {
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

  // Guide management
  getPendingGuides: async () => {
    const res = await fetch(`${API_BASE}/admin/guides/pending`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  approveGuide: async (userId: number) => {
    const res = await fetch(`${API_BASE}/admin/guides/${userId}/approve`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  rejectGuide: async (userId: number) => {
    const res = await fetch(`${API_BASE}/admin/guides/${userId}/reject`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  verifyDocument: async (id: number) => {
    const res = await fetch(`${API_BASE}/admin/documents/${id}/verify`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(res);
  },

  // User management
  updateUser: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  toggleUserActive: async (id: number) => {
    const res = await fetch(`${API_BASE}/admin/users/${id}/toggle`, {
      method: "PATCH",
      headers: getAuthHeaders(),
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

  // Settings
  getCommissionRate: async () => {
    const res = await fetch(`${API_BASE}/admin/settings/commission`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ commissionRate: number }>(res);
  },

  setCommissionRate: async (rate: number) => {
    const res = await fetch(`${API_BASE}/admin/settings/commission`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ rate }),
    });
    return handleResponse<any>(res);
  },

  getPendingPayouts: async () => {
    const res = await fetch(`${API_BASE}/admin/payouts/pending`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<any[]>(res);
  },
};
