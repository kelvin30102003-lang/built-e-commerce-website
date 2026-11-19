export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "unpaid"
  | "payment_pending_review"
  | "paid"
  | "failed"
  | "rejected"
  | "refunded"
  | "partial_refund";

export type ShippingStatus =
  | "not_shipped"
  | "preparing"
  | "shipped"
  | "in_transit"
  | "delivered"
  | "returned";

export type ProductStatus = "draft" | "active" | "inactive" | "archived";
export type UserRole = "customer" | "staff" | "admin";
export type ReviewStatus = "pending" | "approved" | "rejected";
export type CouponDiscountType = "percentage" | "fixed_amount" | "free_shipping";
export type PaymentSlipStatus = "pending" | "approved" | "rejected";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: UserRole;
          can_manage_products: boolean;
          can_manage_orders: boolean;
          can_manage_users: boolean;
          can_manage_coupons: boolean;
          can_manage_reports: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      addresses: {
        Row: {
          id: number;
          user_id: string;
          full_name: string;
          phone: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          township: string | null;
          state: string | null;
          country: string;
          postal_code: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["addresses"]["Row"]> & {
          user_id: string;
          full_name: string;
          phone: string;
          address_line1: string;
          city: string;
        };
        Update: Partial<Database["public"]["Tables"]["addresses"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          id: number;
          parent_id: number | null;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          is_active: boolean;
          is_color_filter_category: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]> & { name: string; slug: string };
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      brands: {
        Row: {
          id: number;
          name: string;
          slug: string;
          logo_url: string | null;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["brands"]["Row"]> & { name: string; slug: string };
        Update: Partial<Database["public"]["Tables"]["brands"]["Row"]>;
        Relationships: [];
      };
      product_colors: {
        Row: {
          id: number;
          name: string;
          slug: string;
          image_url: string | null;
          hex_value: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["product_colors"]["Row"]> & {
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_colors"]["Row"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: number;
          category_id: number | null;
          brand_id: number | null;
          name: string;
          slug: string;
          short_description: string | null;
          description: string | null;
          status: ProductStatus;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]> & { name: string; slug: string };
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_brand_id_fkey";
            columns: ["brand_id"];
            isOneToOne: false;
            referencedRelation: "brands";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variants: {
        Row: {
          id: number;
          product_id: number;
          sku: string;
          variant_name: string | null;
          color_id: number | null;
          price: number;
          compare_price: number | null;
          stock_quantity: number;
          low_stock_threshold: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["product_variants"]["Row"]> & {
          product_id: number;
          sku: string;
          price: number;
        };
        Update: Partial<Database["public"]["Tables"]["product_variants"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_variants_color_id_fkey";
            columns: ["color_id"];
            isOneToOne: false;
            referencedRelation: "product_colors";
            referencedColumns: ["id"];
          },
        ];
      };
      product_images: {
        Row: {
          id: number;
          product_id: number;
          image_url: string;
          sort_order: number;
        };
        Insert: Partial<Database["public"]["Tables"]["product_images"]["Row"]> & {
          product_id: number;
          image_url: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          id: number;
          product_id: number;
          user_id: string;
          rating: number;
          comment: string | null;
          status: ReviewStatus;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["reviews"]["Row"]> & {
          product_id: number;
          user_id: string;
          rating: number;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      coupons: {
        Row: {
          id: number;
          code: string;
          discount_type: CouponDiscountType;
          discount_value: number;
          min_order_amount: number;
          max_discount_amount: number | null;
          usage_limit: number | null;
          used_count: number;
          starts_at: string | null;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["coupons"]["Row"]> & {
          code: string;
          discount_type: CouponDiscountType;
        };
        Update: Partial<Database["public"]["Tables"]["coupons"]["Row"]>;
        Relationships: [];
      };
      carts: {
        Row: { id: number; user_id: string; created_at: string; updated_at: string };
        Insert: { id?: number; user_id: string };
        Update: Partial<Database["public"]["Tables"]["carts"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "carts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      cart_items: {
        Row: {
          id: number;
          cart_id: number;
          product_id: number;
          product_variant_id: number | null;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["cart_items"]["Row"]> & {
          cart_id: number;
          product_id: number;
        };
        Update: Partial<Database["public"]["Tables"]["cart_items"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey";
            columns: ["cart_id"];
            isOneToOne: false;
            referencedRelation: "carts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_product_variant_id_fkey";
            columns: ["product_variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      wishlist_items: {
        Row: {
          id: number;
          user_id: string;
          product_id: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["wishlist_items"]["Row"]> & {
          user_id: string;
          product_id: number;
        };
        Update: Partial<Database["public"]["Tables"]["wishlist_items"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "wishlist_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wishlist_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: number;
          order_number: string;
          user_id: string | null;
          subtotal: number;
          discount_amount: number;
          tax_amount: number;
          shipping_fee: number;
          total_amount: number;
          order_status: OrderStatus;
          payment_status: PaymentStatus;
          shipping_status: ShippingStatus;
          payment_method: string;
          customer_note: string | null;
          placed_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]> & {
          order_number: string;
          payment_method: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: number;
          order_id: number;
          product_id: number | null;
          product_variant_id: number | null;
          product_name: string;
          variant_name: string | null;
          sku: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["order_items"]["Row"]> & {
          order_id: number;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      shipments: {
        Row: {
          id: number;
          order_id: number;
          courier_name: string | null;
          tracking_number: string | null;
          shipping_address: Record<string, unknown>;
          shipping_fee: number;
          status: string;
          shipped_at: string | null;
          delivered_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["shipments"]["Row"]> & { order_id: number };
        Update: Partial<Database["public"]["Tables"]["shipments"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_methods: {
        Row: {
          id: number;
          name: string;
          code: string;
          account_name: string | null;
          account_phone: string | null;
          account_number: string | null;
          qr_image_url: string | null;
          instructions: string | null;
          is_active: boolean;
          sort_order: number;
        };
        Insert: Partial<Database["public"]["Tables"]["payment_methods"]["Row"]> & {
          name: string;
          code: string;
        };
        Update: Partial<Database["public"]["Tables"]["payment_methods"]["Row"]>;
        Relationships: [];
      };
      payment_slips: {
        Row: {
          id: number;
          order_id: number;
          user_id: string | null;
          payment_method_id: number;
          slip_image_path: string;
          amount: number;
          sender_name: string | null;
          sender_phone: string | null;
          transaction_id: string | null;
          transferred_at: string | null;
          status: PaymentSlipStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          admin_note: string | null;
          reject_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["payment_slips"]["Row"]> & {
          order_id: number;
          payment_method_id: number;
          slip_image_path: string;
          amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["payment_slips"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "payment_slips_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_slips_payment_method_id_fkey";
            columns: ["payment_method_id"];
            isOneToOne: false;
            referencedRelation: "payment_methods";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          id: number;
          order_id: number;
          payment_method: string;
          transaction_id: string | null;
          amount: number;
          status: "pending" | "paid" | "failed" | "refunded";
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["payments"]["Row"]> & {
          order_id: number;
          payment_method: string;
          amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_activity_logs: {
        Row: {
          id: number;
          admin_id: string | null;
          action: string;
          details: Record<string, unknown> | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["admin_activity_logs"]["Row"]> & { action: string };
        Update: Partial<Database["public"]["Tables"]["admin_activity_logs"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "admin_activity_logs_admin_id_fkey";
            columns: ["admin_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_settings: {
        Row: {
          id: number;
          support_email: string | null;
          support_phone: string | null;
          support_address: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["contact_settings"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["contact_settings"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      place_order: {
        Args: {
          p_shipping: Record<string, unknown>;
          p_shipping_method: string;
          p_shipping_fee: number;
          p_payment_method: string;
          p_customer_note?: string | null;
          p_payment_transaction_id?: string | null;
          p_slip_image_path?: string | null;
        };
        Returns: { order_id: number; order_number: string }[];
      };
      approve_payment_slip: {
        Args: { p_slip_id: number; p_admin_note?: string | null };
        Returns: undefined;
      };
      reject_payment_slip: {
        Args: { p_slip_id: number; p_reject_reason: string; p_admin_note?: string | null };
        Returns: undefined;
      };
      log_admin_activity: {
        Args: { p_action: string; p_details?: Record<string, unknown> | null };
        Returns: undefined;
      };
      update_user_role: {
        Args: {
          p_user_id: string;
          p_role: string;
          p_can_manage_products?: boolean;
          p_can_manage_orders?: boolean;
          p_can_manage_users?: boolean;
          p_can_manage_coupons?: boolean;
          p_can_manage_reports?: boolean;
        };
        Returns: undefined;
      };
      list_users_with_email: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          can_manage_products: boolean;
          can_manage_orders: boolean;
          can_manage_users: boolean;
          can_manage_coupons: boolean;
          can_manage_reports: boolean;
          created_at: string;
        }[];
      };
      consume_action_rate_limit: {
        Args: { p_key: string; p_max_requests: number; p_window_seconds: number };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
