import type {
  Artist,
  Product,
  Order,
  AccountingSummary,
  DashboardStats,
  LoginResponse,
} from "./types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `API error: ${res.status}`);
  }
  return res.json();
}

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  artists: {
    list: () => fetchAPI<Artist[]>("/api/v1/artists"),
    getByDomain: (domain: string) =>
      fetchAPI<Artist>(`/api/v1/artists/by-domain/${encodeURIComponent(domain)}`),
    getBySlug: (slug: string) =>
      fetchAPI<Artist>(`/api/v1/artists/by-slug/${encodeURIComponent(slug)}`),
    getProducts: (artistId: string) =>
      fetchAPI<Product[]>(`/api/v1/artists/${artistId}/products`),
  },

  products: {
    get: (id: string) => fetchAPI<Product>(`/api/v1/products/${id}`),
  },

  orders: {
    create: (data: {
      artist_id: string;
      customer_name: string;
      customer_email: string;
      shipping_address_line1: string;
      shipping_address_line2?: string;
      shipping_city: string;
      shipping_state?: string;
      shipping_postal_code: string;
      shipping_country: string;
      items: { product_id: string; variant_id: string; quantity: number }[];
    }) =>
      fetchAPI<{ id: string; stripe_checkout_url: string }>("/api/v1/orders", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getStatus: (id: string) =>
      fetchAPI<{ status: string; order_number: string }>(
        `/api/v1/orders/${id}/status`
      ),
  },

  payments: {
    createCheckoutSession: (data: { order_id: string }) =>
      fetchAPI<{ checkout_url: string }>(
        "/api/v1/payments/create-checkout-session",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      ),
  },

  admin: {
    login: (email: string, password: string) =>
      fetchAPI<LoginResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),

    dashboard: () =>
      fetchAPI<DashboardStats>("/api/v1/admin/dashboard", {
        headers: authHeaders(),
      }),

    orders: {
      list: (params?: {
        status?: string;
        artist_id?: string;
        page?: number;
      }) => {
        const searchParams = new URLSearchParams();
        if (params?.status) searchParams.set("status", params.status);
        if (params?.artist_id)
          searchParams.set("artist_id", params.artist_id);
        if (params?.page) searchParams.set("page", String(params.page));
        const qs = searchParams.toString();
        return fetchAPI<Order[]>(`/api/v1/admin/orders${qs ? `?${qs}` : ""}`, {
          headers: authHeaders(),
        });
      },
      get: (id: string) =>
        fetchAPI<Order>(`/api/v1/admin/orders/${id}`, {
          headers: authHeaders(),
        }),
      updateStatus: (id: string, status: string) =>
        fetchAPI<Order>(`/api/v1/admin/orders/${id}/status`, {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ status }),
        }),
    },

    artists: {
      list: () =>
        fetchAPI<Artist[]>("/api/v1/admin/artists", {
          headers: authHeaders(),
        }),
      get: (id: string) =>
        fetchAPI<Artist>(`/api/v1/admin/artists/${id}`, {
          headers: authHeaders(),
        }),
      create: (data: Partial<Artist>) =>
        fetchAPI<Artist>("/api/v1/admin/artists", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(data),
        }),
      update: (id: string, data: Partial<Artist>) =>
        fetchAPI<Artist>(`/api/v1/admin/artists/${id}`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(data),
        }),
    },

    accounting: {
      summary: (startDate?: string, endDate?: string) => {
        const params = new URLSearchParams();
        if (startDate) params.set("start_date", startDate);
        if (endDate) params.set("end_date", endDate);
        const qs = params.toString();
        return fetchAPI<AccountingSummary>(
          `/api/v1/admin/accounting/summary${qs ? `?${qs}` : ""}`,
          { headers: authHeaders() }
        );
      },
    },

    export: {
      csv: (orderIds: string[]) =>
        fetch(`${BACKEND_URL}/api/v1/admin/export/csv`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify({ order_ids: orderIds }),
        }).then((res) => {
          if (!res.ok) throw new Error("Export failed");
          return res.blob();
        }),
      markSent: (orderIds: string[]) =>
        fetchAPI<{ updated: number }>(
          "/api/v1/admin/export/mark-sent",
          {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ order_ids: orderIds }),
          }
        ),
    },
  },
};
