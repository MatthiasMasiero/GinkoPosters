export interface Artist {
  id: string;
  name: string;
  slug: string;
  domain: string;
  primary_color: string;
  secondary_color: string;
  bio: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  sku: string;
  price: number;
  cost_price: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  artist_id: string;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  variants: ProductVariant[];
}

export interface OrderItem {
  id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
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
  stripe_session_id: string | null;
  notes: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  order_id: string;
  artist_id: string;
  type: string;
  revenue: number;
  cogs: number;
  stripe_fee: number;
  net_profit: number;
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
  total_net_profit: number;
  period_start: string;
  period_end: string;
  per_artist: {
    artist_id: string;
    artist_name: string;
    revenue: number;
    cogs: number;
    stripe_fees: number;
    net_profit: number;
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
