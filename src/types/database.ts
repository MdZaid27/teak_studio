// ==========================================================
// KILN STUDIO — Database & API Type Definitions
// ==========================================================

export interface DbCategory {
  id: string;
  name: string;
  created_at?: string;
}

export interface DbTimber {
  id: string;
  name: string;
  provenance: string;
  swatch_url: string;
  description: string;
  created_at?: string;
}

export interface DbProductSpec {
  label: string;
  value: string;
}

export interface DbProduct {
  id: string;
  name: string;
  category_id: string;
  primary_timber_id: string;
  price: number;
  primary_image: string;
  dimensions: string;
  description: string;
  is_popular: boolean;
  link: string;
  tagline: string | null;
  lead_time: string | null;
  features: string[];
  specs: DbProductSpec[];
  created_at?: string;
}

export interface DbProductImage {
  id: string;
  product_id: string;
  src: string;
  alt: string;
  title: string;
  display_order: number;
  created_at?: string;
}

export interface DbProductTimberOption {
  id: string;
  product_id: string;
  timber_id: string;
  price: number;
  description: string | null;
  created_at?: string;
  timbers?: DbTimber;
}

export interface ProductTimberVariation {
  id: string;
  name: string;
  provenance: string;
  swatch: string;
  price: number;
  desc: string;
}

export interface ProductGalleryItem {
  src: string;
  alt: string;
  title: string;
}

// Full hydrated Product domain model consumed by frontend and API
export interface Product {
  id: string;
  name: string;
  category: string;
  timber: string;
  price: number;
  image: string;
  dimensions: string;
  description: string;
  isPopular?: boolean;
  link: string;
  tagline?: string;
  leadTime?: string;
  gallery?: ProductGalleryItem[];
  timbers?: ProductTimberVariation[];
  features?: string[];
  specs?: DbProductSpec[];
}

// Standard API response envelope
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  error?: string;
}

export interface ProductFilters {
  category?: string;
  timber?: string;
}

// ==========================================================
// Order Types (Milestone 2)
// ==========================================================
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "production"
  | "dispatched"
  | "delivered"
  | "cancelled";

export interface DbOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_address: string;
  pincode: string;
  subtotal: number;
  total: number;
  payment_method: string;
  status: OrderStatus;
  created_at?: string;
  updated_at?: string;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  timber_option: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  created_at?: string;
}

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
  timberOption?: string;
}

export interface CreateOrderInput {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_address: string;
  pincode: string;
  payment_method?: string;
  items: CreateOrderItemInput[];
}

export interface CreateOrderResponse {
  success: boolean;
  orderNumber?: string;
  orderId?: string;
  error?: string;
}

