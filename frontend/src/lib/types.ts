export interface Artist {
  id: string;
  name: string;
  slug: string;
  domain: string;
  logo_url: string | null;
  hero_image_url: string | null;
  brand_primary_color: string | null;
  brand_secondary_color: string | null;
  bio: string | null;
  commission_rate: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  artist_id: string;
  title: string;
  description: string | null;
  slug: string;
  image_url: string | null;
  sku_prefix: string;
  is_active: boolean;
  sort_order: number;
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size_label: string;
  width_cm: number;
  height_cm: number;
  sku: string;
  price: number;
  is_active: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  artist_id: string;
  status: string;
  customer_name: string;
  customer_email: string;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string | null;
  shipping_postal_code: string;
  shipping_country: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  stripe_checkout_session_id: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_title: string;
  variant_label: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Transaction {
  id: string;
  order_id: string;
  revenue: number;
  cogs: number;
  stripe_fee: number;
  artist_payout: number;
  platform_profit: number;
  created_at: string;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface AccountingSummary {
  total_revenue: number;
  total_cogs: number;
  total_stripe_fees: number;
  total_artist_payouts: number;
  total_platform_profit: number;
  period_start: string;
  period_end: string;
  per_artist: {
    artist_id: string;
    artist_name: string;
    revenue: number;
    cogs: number;
    stripe_fees: number;
    artist_payout: number;
    platform_profit: number;
    order_count: number;
  }[];
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface DashboardStats {
  total_orders: number;
  revenue_today: number;
  pending_orders: number;
  artists_count: number;
}
