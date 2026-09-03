export interface User {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  role: 'OWNER' | 'ADMIN' | 'SELLER' | 'CUSTOMER';
  status: 'active' | 'suspended';
  must_change_password: number;
  created_at: string;
  updated_at: string;
}

export interface Seller {
  id: number;
  user_id: number;
  business_name: string;
  slug: string;
  whatsapp_number: string;
  phone: string | null;
  email: string | null;
  region: string;
  city: string | null;
  address: string | null;
  bio: string | null;
  logo_url: string | null;
  banner_url: string | null;
  commission_rate: number;
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  delivery_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: number;
  product_count?: number;
}

export interface Region {
  id: number;
  name: string;
  code: string;
  is_active: number;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  thumbnail_url: string | null;
  alt_text: string | null;
  display_order: number;
  is_primary: number;
}

export interface Product {
  id: number;
  seller_id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string;
  price_ghs: number;
  compare_price_ghs: number | null;
  stock_quantity: number;
  is_unlimited_stock: number;
  status: 'draft' | 'pending_approval' | 'published' | 'unavailable' | 'archived' | 'rejected';
  is_featured: number;
  sku: string | null;
  specifications: string | null;
  delivery_info: string | null;
  views_count: number;
  created_at: string;
  updated_at: string;
  category_name?: string;
  category_slug?: string;
  seller_name?: string;
  seller_slug?: string;
  seller_whatsapp?: string;
  seller_region?: string;
  seller_city?: string;
  seller_bio?: string;
  seller_delivery_notes?: string;
  images?: ProductImage[];
  primary_image?: string;
  thumbnail_image?: string;
}

export interface OrderEnquiry {
  id: number;
  product_id: number | null;
  seller_id: number | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_region: string | null;
  message: string | null;
  source: 'whatsapp_click' | 'form_inquiry' | 'direct_reachout';
  status: 'lead_initiated' | 'contacted' | 'fulfilled' | 'cancelled';
  order_amount_ghs: number | null;
  foundation_contribution_ghs: number | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  product_name?: string;
  seller_name?: string;
}

export interface FoundationImpact {
  id: number;
  initiative_name: string;
  slug: string;
  summary: string;
  description: string;
  image_url: string | null;
  metric_label: string | null;
  metric_value: string | null;
  status: 'active' | 'completed';
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  site_title?: string;
  foundation_name?: string;
  foundation_tagline?: string;
  marketplace_tagline?: string;
  hero_title?: string;
  hero_subtitle?: string;
  contact_phone_1?: string;
  contact_phone_2?: string;
  contact_email?: string;
  contact_address?: string;
  foundation_relationship_text?: string;
  seller_rules_text?: string;
  [key: string]: string | undefined;
}
