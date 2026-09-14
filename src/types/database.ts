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
  is_active?: boolean;
  compare_at_price?: number | null;
  stock_status?: string | null;
  wood_options?: unknown[];
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
  origin?: string;
  region?: string;
  swatchImage?: string;
  slug?: string;
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
  slug?: string;
  tagline?: string;
  leadTime?: string;
  isActive?: boolean;
  compareAtPrice?: number | null;
  stockStatus?: "in_stock" | "made_to_order" | "out_of_stock" | "archived" | string;
  gallery?: ProductGalleryItem[];
  timbers?: ProductTimberVariation[];
  woodOptions?: ProductTimberVariation[];
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
  includeHidden?: boolean;
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
  user_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_address: string;
  shipping_address?: string;
  city?: string;
  state?: string;
  pincode: string;
  subtotal: number;
  total: number;
  total_amount?: number;
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
  product_title?: string;
  timber_option: string | null;
  timber_title?: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  image_url?: string;
  created_at?: string;
}

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
  timberOption?: string;
  timberTitle?: string;
  productTitle?: string;
  productName?: string;
  unitPrice?: number;
  imageUrl?: string;
}

export interface CreateOrderInput {
  user_id?: string;
  userId?: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_address: string;
  shipping_address?: string;
  pincode: string;
  city?: string;
  state?: string;
  payment_method?: string;
  items: CreateOrderItemInput[];
}

export interface CreateOrderResponse {
  success: boolean;
  orderNumber?: string;
  orderId?: string;
  error?: string;
}

// ==========================================================
// Customer Interaction Types (Milestone 4)
// ==========================================================
export type BespokeInquiryStatus = "new" | "in_review" | "contacted" | "closed" | "archived";

export interface DbBespokeInquiry {
  id: string;
  patron_name?: string;
  name: string;
  phone: string;
  email: string;
  pincode?: string;
  project_type?: string;
  timber_preference?: string | null;
  wood_preference?: string | null;
  approx_dimensions?: string | null;
  dimensions_notes?: string;
  budget_range?: string | null;
  reference_file_url?: string | null;
  message?: string;
  status: BespokeInquiryStatus;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBespokeInquiryInput {
  patron_name?: string;
  name?: string;
  phone: string;
  email: string;
  pincode?: string;
  project_type?: string;
  timber_preference?: string;
  wood_preference?: string;
  approx_dimensions?: string;
  dimensions_notes?: string;
  budget_range?: string;
  reference_file_url?: string;
  message?: string;
}

export type StudioBookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface DbStudioBooking {
  id: string;
  patron_name: string;
  email: string;
  phone: string;
  studio_location: string;
  preferred_date: string;
  preferred_time_slot: string;
  notes?: string | null;
  status: StudioBookingStatus;
  created_at?: string;
  updated_at?: string;
}

export interface CreateStudioBookingInput {
  patron_name: string;
  email: string;
  phone: string;
  studio_location: string;
  preferred_date: string;
  preferred_time_slot: string;
  notes?: string;
}

export type SwatchRequestStatus = "requested" | "dispatched" | "delivered";

export interface DbSwatchRequest {
  id: string;
  name: string;
  phone: string;
  address: string;
  pincode: string;
  status: SwatchRequestStatus;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSwatchRequestInput {
  name: string;
  phone: string;
  address: string;
  pincode: string;
}

export interface DbNewsletterSubscriber {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at?: string;
}

export interface CreateNewsletterSubscriberInput {
  email: string;
}

// ==========================================================
// Patron Lifecycle Types (Milestone 5)
// ==========================================================
export interface DbPatronProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  marketing_opt_in?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type AddressTag = "Home" | "Work" | "Others";

export interface DbPatronAddress {
  id: string;
  user_id: string;
  floor_building: string;
  area_street: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  save_as: AddressTag;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePatronAddressInput {
  floor_building: string;
  area_street: string;
  pincode: string;
  city?: string;
  state?: string;
  country?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  save_as: AddressTag;
  is_default?: boolean;
}

export interface DbPatronWishlist {
  id: string;
  user_id: string;
  product_id: string;
  selected_timber_id?: string | null;
  created_at?: string;
  product?: Product;
}

export type OrderTimeframeFilter = "all" | "30_days" | "3_months" | "2026" | "2025";
export type OrderStatusFilter = "all" | OrderStatus;


