export type StockStatus = "available" | "sold_out" | "on_request";

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  created_at: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category_id: string | null;
  price: number;
  old_price: number | null;
  currency: string;
  images: string[];
  metal: string | null;
  stone: string | null;
  carat: string | null;
  ring_size: string | null;
  is_published: boolean;
  is_featured: boolean;
  stock_status: StockStatus;
  created_at: string;
  updated_at: string;
};

export type ProductWithCategory = Product & {
  categories: Pick<Category, "id" | "slug" | "name"> | null;
};

export type OrderItem = {
  product_id: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
};

export type OrderStatus =
  | "new"
  | "contacted"
  | "confirmed"
  | "shipped"
  | "completed"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "not_required";

export type Order = {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  address_line: string | null;
  city: string | null;
  district: string | null;
  postal_code: string | null;
  items: OrderItem[];
  subtotal: number;
  total: number;
  currency: string;
  customer_note: string | null;
  admin_note: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string | null;
  payment_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};
