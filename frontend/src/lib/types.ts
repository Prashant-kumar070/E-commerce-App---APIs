export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  meta: unknown;
};

export type User = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  role: "admin" | "seller" | "customer" | "delivery_person";
};

export type LoginResponse = {
  user: User;
  auth: {
    access_token: string;
    token_type: string;
    expires_at: string;
  };
};

export type ProductImage = {
  id: number;
  path: string;
  url: string;
  is_primary?: boolean;
};

export type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number | string;
  stock: number;
  is_active?: boolean;
  image_url?: string | null;
  images?: ProductImage[];
  rating?: number;
  category?: string;
  original_price?: number | string;
  seller_id?: number;
  seller?: User;
};

export type CartLineItem = {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number | string;
  subtotal: number | string;
  product: Product;
};

export type CustomerCart = {
  id: number;
  items: CartLineItem[];
  total_amount: number | string;
};

export type PlaceOrderPayload = {
  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  notes?: string;
};

export type Order = {
  id: number;
  order_number?: string;
  status: string;
  total_amount: number;
  created_at?: string;
  placed_at?: string | null;
  notes?: string | null;
  recipient_name?: string;
  recipient_phone?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  customer?: {
    id?: number;
    name?: string;
    email?: string;
  };
  items?: Array<{
    id: number;
    product_id?: number;
    product_name?: string;
    quantity: number;
    unit_price?: number | string;
    subtotal?: number | string;
    /** @deprecated use unit_price from API */
    price?: number;
    product?: Product;
  }>;
};

export type AdminStats = {
  total_revenue: number;
  orders_count: number;
  users_count: number;
  customers_count: number;
  sellers_count: number;
  products_count: number;
  avg_order_value: number;
};

export type PaginationInfo = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type AdminCreateOrderPayload = PlaceOrderPayload & {
  customer_id: number;
  items: { product_id: number; quantity: number }[];
};

export type SellerOrderSummary = {
  id: number;
  order_number: string;
  status: string;
  seller_subtotal: number;
  placed_at: string | null;
  customer?: {
    id?: number;
    name?: string;
    email?: string;
  };
};
