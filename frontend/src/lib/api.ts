import {
  AdminCreateOrderPayload,
  AdminStats,
  ApiEnvelope,
  CustomerCart,
  LoginResponse,
  Order,
  PaginationInfo,
  PlaceOrderPayload,
  Product,
  SellerOrderSummary,
  User,
} from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

async function parseJsonResponse<T>(response: Response): Promise<ApiEnvelope<T>> {
  const text = await response.text();
  if (!text) {
    throw new Error("Empty API response");
  }

  try {
    return JSON.parse(text) as ApiEnvelope<T>;
  } catch {
    throw new Error("Invalid API response");
  }
}

async function apiGet<T>(path: string, token?: string) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  const payload = await parseJsonResponse<T>(response);
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed request");
  }

  return payload.data;
}

async function apiPost<T>(path: string, body: unknown, token?: string) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const payload = await parseJsonResponse<T>(response);
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed request");
  }

  return payload.data;
}

export async function loginRequest(email: string, password: string) {
  return apiPost<LoginResponse>("/auth/login", { email, password });
}

export async function fetchProducts(query?: Record<string, string | number | undefined>) {
  const qs = toQueryString(query ?? {});
  return apiGet<Product[]>(`/products${qs}`);
}

export async function fetchProductById(productId: string) {
  return apiGet<Product>(`/products/${productId}`);
}

export async function registerRequest(payload: {
  name: string;
  email: string;
  role: string;
  phone: string;
  address: string;
  password: string;
  password_confirmation: string;
}) {
  return apiPost<LoginResponse | User>("/auth/register", payload);
}

export async function fetchProfile(token: string) {
  return apiGet<User>("/auth/profile", token);
}

export async function updateProfile(token: string, data: Partial<User>) {
  return apiPut<User>("/auth/profile", data, token);
}

export async function fetchCustomerCart(token: string) {
  return apiGet<CustomerCart>("/customer/cart", token);
}

export async function addCustomerCartItem(
  token: string,
  payload: { product_id: number; quantity: number },
) {
  return apiPost<CustomerCart>("/customer/cart/items", payload, token);
}

export async function updateCustomerCartItem(
  token: string,
  cartItemId: number,
  payload: { quantity: number },
) {
  const response = await fetch(`${API_BASE_URL}/customer/cart/items/${cartItemId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const envelope = await parseJsonResponse<CustomerCart>(response);
  if (!response.ok || !envelope.success) {
    throw new Error(envelope.message || "Failed to update cart item");
  }

  return envelope.data;
}

export async function removeCustomerCartItem(token: string, cartItemId: number) {
  const response = await fetch(`${API_BASE_URL}/customer/cart/items/${cartItemId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const envelope = await parseJsonResponse<CustomerCart>(response);
  if (!response.ok || !envelope.success) {
    throw new Error(envelope.message || "Failed to remove cart item");
  }

  return envelope.data;
}

export async function placeCustomerOrder(token: string, payload: PlaceOrderPayload) {
  return apiPost<Order>("/customer/orders", payload, token);
}

export async function fetchCustomerOrders(token: string) {
  return apiGet<{ data?: Order[] } | Order[]>("/customer/orders", token);
}

export async function fetchAdminOrders(token: string, query?: Record<string, string | number | undefined>) {
  const qs = toQueryString(query ?? {});
  return apiGet<{ data?: Order[] } | Order[]>(`/admin/orders${qs}`, token);
}

export async function fetchAdminOrderById(token: string, orderId: string) {
  return apiGet<Order>(`/admin/orders/${orderId}`, token);
}

export async function fetchAdminProductById(token: string, productId: string | number) {
  return apiGet<Product>(`/admin/products/${productId}`, token);
}

export async function fetchAdminUsers(token: string, query?: Record<string, string | number | undefined>) {
  const qs = toQueryString(query ?? {});
  return apiGet<{ data?: User[] } | User[]>(`/admin/users${qs}`, token);
}

export async function fetchSellerProducts(token: string) {
  return apiGet<{ data?: Product[] } | Product[]>("/seller/products", token);
}

export async function fetchSellerOrders(token: string) {
  return apiGet<{ data?: SellerOrderSummary[] } | SellerOrderSummary[]>(
    "/seller/orders",
    token,
  );
}

export async function fetchDeliveryOrders(token: string) {
  return apiGet<{ data?: Order[] } | Order[]>("/delivery/orders", token);
}

export async function createSellerProduct(token: string, formData: FormData) {
  const response = await fetch(`${API_BASE_URL}/seller/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const payload = await parseJsonResponse<Product>(response);
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Product creation failed");
  }

  return payload.data;
}

export async function updateSellerProduct(
  token: string,
  productId: number | string,
  formData: FormData,
) {
  // Multipart file uploads are unreliable with PATCH in many clients; API accepts POST too.
  const response = await fetch(`${API_BASE_URL}/seller/products/${productId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const payload = await parseJsonResponse<Product>(response);
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Product update failed");
  }

  return payload.data;
}

export async function deleteSellerProduct(token: string, productId: number | string) {
  const response = await fetch(`${API_BASE_URL}/seller/products/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await parseJsonResponse<null>(response);
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Product deletion failed");
  }
}

export function listFromPaginated<T>(value: { data?: T[] } | T[]): T[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function toQueryString(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    sp.set(key, String(value));
  });
  const q = sp.toString();
  return q ? `?${q}` : "";
}

async function fetchEnvelope<T>(path: string, init?: { token?: string; method?: string; body?: string }): Promise<ApiEnvelope<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    method: init?.method ?? "GET",
    headers: {
      ...(init?.token ? { Authorization: `Bearer ${init.token}` } : {}),
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init?.body,
  });

  const payload = await parseJsonResponse<T>(response);
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed request");
  }

  return payload as ApiEnvelope<T>;
}

export function getPagination(meta: unknown): PaginationInfo {
  const m = meta as { pagination?: Partial<PaginationInfo> } | null | undefined;
  const p = m?.pagination;
  return {
    current_page: Number(p?.current_page) || 1,
    last_page: Number(p?.last_page) || 1,
    per_page: Number(p?.per_page) || 15,
    total: Number(p?.total) || 0,
  };
}

export async function fetchAdminUsersPaged(
  token: string,
  query?: { role?: string; search?: string; page?: number; per_page?: number },
): Promise<{ items: User[]; pagination: PaginationInfo }> {
  const envelope = await fetchEnvelope<unknown>(`/admin/users${toQueryString(query ?? {})}`, { token });
  return {
    items: listFromPaginated<User>(envelope.data as User[] | { data?: User[] }),
    pagination: getPagination(envelope.meta),
  };
}

export async function fetchAdminOrdersPaged(
  token: string,
  query?: { status?: string; search?: string; page?: number; per_page?: number },
): Promise<{ items: Order[]; pagination: PaginationInfo }> {
  const envelope = await fetchEnvelope<unknown>(`/admin/orders${toQueryString(query ?? {})}`, { token });
  return {
    items: listFromPaginated<Order>(envelope.data as Order[] | { data?: Order[] }),
    pagination: getPagination(envelope.meta),
  };
}

export async function fetchAdminProductsPaged(
  token: string,
  query?: { seller_id?: string | number; search?: string; is_active?: string; page?: number; per_page?: number },
): Promise<{ items: Product[]; pagination: PaginationInfo }> {
  const envelope = await fetchEnvelope<unknown>(`/admin/products${toQueryString(query ?? {})}`, { token });
  return {
    items: listFromPaginated<Product>(envelope.data as Product[] | { data?: Product[] }),
    pagination: getPagination(envelope.meta),
  };
}

export async function fetchAdminStats(token: string) {
  return apiGet<AdminStats>("/admin/stats", token);
}

export async function fetchAdminUserById(token: string, userId: string | number) {
  return apiGet<User>(`/admin/users/${userId}`, token);
}

export async function createAdminUser(
  token: string,
  body: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    role: string;
    password: string;
    password_confirmation: string;
  },
) {
  return apiPost<User>("/admin/users", body, token);
}

export async function updateAdminUser(
  token: string,
  userId: string | number,
  body: Partial<{
    name: string;
    email: string;
    phone: string;
    address: string;
    role: string;
    password: string;
    password_confirmation: string;
  }>,
) {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const payload = await parseJsonResponse<User>(response);
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed request");
  }

  return payload.data;
}

export async function deleteAdminUser(token: string, userId: string | number) {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const payload = await parseJsonResponse<null>(response);
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed request");
  }
}

export async function createAdminOrder(token: string, body: AdminCreateOrderPayload) {
  return apiPost<Order>("/admin/orders", body, token);
}

export async function updateAdminOrder(
  token: string,
  orderId: string | number,
  body: Partial<PlaceOrderPayload>,
) {
  const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const payload = await parseJsonResponse<Order>(response);
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed request");
  }

  return payload.data;
}

export async function patchAdminOrderStatus(token: string, orderId: string | number, status: string) {
  const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  const payload = await parseJsonResponse<Order>(response);
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed request");
  }

  return payload.data;
}

export async function patchAdminAssignDelivery(
  token: string,
  orderId: string | number,
  delivery_person_id: number,
) {
  const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/assign-delivery`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ delivery_person_id }),
  });

  const payload = await parseJsonResponse<Order>(response);
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed request");
  }

  return payload.data;
}

export async function createAdminProduct(token: string, formData: FormData) {
  const response = await fetch(`${API_BASE_URL}/admin/products`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const payload = await parseJsonResponse<Product>(response);
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Product creation failed");
  }

  return payload.data;
}

export async function updateAdminProduct(token: string, productId: number | string, formData: FormData) {
  const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const payload = await parseJsonResponse<Product>(response);
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Product update failed");
  }

  return payload.data;
}

export async function deleteAdminProduct(token: string, productId: number | string) {
  const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const payload = await parseJsonResponse<null>(response);
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Product deletion failed");
  }
}
