/**
 * Base types for the public schema (Fase 2). Kept in sync with
 * supabase/migrations/20260424200000_init_multitenant_core.sql
 * Regenerate with: npx supabase gen types typescript --local (when using CLI)
 */

export type BusinessType = "verduleria" | "almacen" | "ferreteria";
export type BusinessRole = "owner" | "employee";
export type GlobalRole = "admin" | "user";
export type SubscriptionPlan = "free" | "pro" | "super" | "enterprise";
export type UnitType = "unit" | "kg" | "g" | "box" | "liter" | "meter";
export type StockMovementType =
  | "purchase"
  | "sale"
  | "adjustment"
  | "waste"
  | "return"
  | "initial_stock";
export type StockAlertType =
  | "low_stock"
  | "out_of_stock"
  | "perishable_warning"
  | "waste_warning";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          role: GlobalRole;
          plan: SubscriptionPlan;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          role?: GlobalRole;
          plan?: SubscriptionPlan;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          role?: GlobalRole;
          plan?: SubscriptionPlan;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      businesses: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          business_type: BusinessType;
          subscription_plan: SubscriptionPlan;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          business_type: BusinessType;
          subscription_plan?: SubscriptionPlan;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          business_type?: BusinessType;
          subscription_plan?: SubscriptionPlan;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "businesses_owner_id_fkey"; columns: ["owner_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      business_users: {
        Row: {
          id: string;
          business_id: string;
          user_id: string;
          role: BusinessRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          user_id: string;
          role: BusinessRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          user_id?: string;
          role?: BusinessRole;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "business_users_business_id_fkey"; columns: ["business_id"]; isOneToOne: false; referencedRelation: "businesses"; referencedColumns: ["id"] },
          { foreignKeyName: "business_users_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      categories: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          business_type: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          business_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          business_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "categories_business_id_fkey"; columns: ["business_id"]; isOneToOne: false; referencedRelation: "businesses"; referencedColumns: ["id"] },
        ];
      };
      suppliers: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "suppliers_business_id_fkey"; columns: ["business_id"]; isOneToOne: false; referencedRelation: "businesses"; referencedColumns: ["id"] },
        ];
      };
      products: {
        Row: {
          id: string;
          business_id: string;
          category_id: string | null;
          supplier_id: string | null;
          name: string;
          sku: string | null;
          barcode: string | null;
          unit_type: UnitType;
          cost_price: string;
          sale_price: string;
          min_stock: string;
          current_stock: string;
          business_type: BusinessType;
          metadata: Json;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          category_id?: string | null;
          supplier_id?: string | null;
          name: string;
          sku?: string | null;
          barcode?: string | null;
          unit_type: UnitType;
          cost_price?: string;
          sale_price?: string;
          min_stock?: string;
          current_stock?: string;
          business_type: BusinessType;
          metadata?: Json;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          category_id?: string | null;
          supplier_id?: string | null;
          name?: string;
          sku?: string | null;
          barcode?: string | null;
          unit_type?: UnitType;
          cost_price?: string;
          sale_price?: string;
          min_stock?: string;
          current_stock?: string;
          business_type?: BusinessType;
          metadata?: Json;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "products_business_id_fkey"; columns: ["business_id"]; isOneToOne: false; referencedRelation: "businesses"; referencedColumns: ["id"] },
          { foreignKeyName: "products_category_id_fkey"; columns: ["category_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] },
          { foreignKeyName: "products_supplier_id_fkey"; columns: ["supplier_id"]; isOneToOne: false; referencedRelation: "suppliers"; referencedColumns: ["id"] },
        ];
      };
      stock_movements: {
        Row: {
          id: string;
          business_id: string;
          product_id: string;
          type: StockMovementType;
          quantity: string;
          reason: string | null;
          unit_cost: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          product_id: string;
          type: StockMovementType;
          quantity: string;
          reason?: string | null;
          unit_cost?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          product_id?: string;
          type?: StockMovementType;
          quantity?: string;
          reason?: string | null;
          unit_cost?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "stock_movements_business_id_fkey"; columns: ["business_id"]; isOneToOne: false; referencedRelation: "businesses"; referencedColumns: ["id"] },
          { foreignKeyName: "stock_movements_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] },
        ];
      };
      sales: {
        Row: {
          id: string;
          business_id: string;
          total: string;
          payment_method: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          total: string;
          payment_method?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          total?: string;
          payment_method?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "sales_business_id_fkey"; columns: ["business_id"]; isOneToOne: false; referencedRelation: "businesses"; referencedColumns: ["id"] },
        ];
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          product_id: string;
          quantity: string;
          unit_price: string;
          subtotal: string;
        };
        Insert: {
          id?: string;
          sale_id: string;
          product_id: string;
          quantity: string;
          unit_price: string;
          subtotal: string;
        };
        Update: {
          id?: string;
          sale_id?: string;
          product_id?: string;
          quantity?: string;
          unit_price?: string;
          subtotal?: string;
        };
        Relationships: [
          { foreignKeyName: "sale_items_sale_id_fkey"; columns: ["sale_id"]; isOneToOne: false; referencedRelation: "sales"; referencedColumns: ["id"] },
          { foreignKeyName: "sale_items_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] },
        ];
      };
      stock_alerts: {
        Row: {
          id: string;
          business_id: string;
          product_id: string;
          type: StockAlertType;
          message: string;
          resolved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          product_id: string;
          type: StockAlertType;
          message: string;
          resolved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          product_id?: string;
          type?: StockAlertType;
          message?: string;
          resolved?: boolean;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "stock_alerts_business_id_fkey"; columns: ["business_id"]; isOneToOne: false; referencedRelation: "businesses"; referencedColumns: ["id"] },
          { foreignKeyName: "stock_alerts_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] },
        ];
      };
      pending_invitations: {
        Row: {
          id: string;
          business_id: string;
          email: string;
          role: string;
          invited_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          email: string;
          role?: string;
          invited_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          email?: string;
          role?: string;
          invited_by?: string;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "pending_invitations_business_id_fkey"; columns: ["business_id"]; isOneToOne: false; referencedRelation: "businesses"; referencedColumns: ["id"] },
          { foreignKeyName: "pending_invitations_invited_by_fkey"; columns: ["invited_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      credit_customers: {
        Row: {
          id: string;
          business_id: string;
          rut: string | null;
          name: string;
          phone: string | null;
          credit_limit: string;
          current_balance: string;
          notes: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          rut?: string | null;
          name: string;
          phone?: string | null;
          credit_limit?: string;
          current_balance?: string;
          notes?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          rut?: string | null;
          name?: string;
          phone?: string | null;
          credit_limit?: string;
          current_balance?: string;
          notes?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "credit_customers_business_id_fkey"; columns: ["business_id"]; isOneToOne: false; referencedRelation: "businesses"; referencedColumns: ["id"] },
        ];
      };
      credit_transactions: {
        Row: {
          id: string;
          business_id: string;
          customer_id: string;
          type: string;
          amount: string;
          balance_before: string;
          balance_after: string;
          reference_sale_id: string | null;
          payment_method: string | null;
          description: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          customer_id: string;
          type: string;
          amount: string;
          balance_before: string;
          balance_after: string;
          reference_sale_id?: string | null;
          payment_method?: string | null;
          description?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          customer_id?: string;
          type?: string;
          amount?: string;
          balance_before?: string;
          balance_after?: string;
          reference_sale_id?: string | null;
          payment_method?: string | null;
          description?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "credit_transactions_business_id_fkey"; columns: ["business_id"]; isOneToOne: false; referencedRelation: "businesses"; referencedColumns: ["id"] },
          { foreignKeyName: "credit_transactions_customer_id_fkey"; columns: ["customer_id"]; isOneToOne: false; referencedRelation: "credit_customers"; referencedColumns: ["id"] },
          { foreignKeyName: "credit_transactions_reference_sale_id_fkey"; columns: ["reference_sale_id"]; isOneToOne: false; referencedRelation: "sales"; referencedColumns: ["id"] },
          { foreignKeyName: "credit_transactions_created_by_fkey"; columns: ["created_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          business_id: string;
          user_id: string | null;
          entity_type: string;
          entity_id: string | null;
          action: string;
          summary: string;
          before_data: Json | null;
          after_data: Json | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          user_id?: string | null;
          entity_type: string;
          entity_id?: string | null;
          action: string;
          summary: string;
          before_data?: Json | null;
          after_data?: Json | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          user_id?: string | null;
          entity_type?: string;
          entity_id?: string | null;
          action?: string;
          summary?: string;
          before_data?: Json | null;
          after_data?: Json | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "audit_logs_business_id_fkey"; columns: ["business_id"]; isOneToOne: false; referencedRelation: "businesses"; referencedColumns: ["id"] },
          { foreignKeyName: "audit_logs_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_business_member: { Args: { p_business_id: string }; Returns: boolean };
      is_business_admin: { Args: { p_business_id: string }; Returns: boolean };
      get_business_role: { Args: { p_business_id: string }; Returns: string };
      create_sale_with_items: {
        Args: {
          p_business_id: string;
          p_created_by: string;
          p_items: Json;
          p_payment_method: string;
        };
        Returns: string;
      };
      create_credit_sale: {
        Args: {
          p_business_id: string;
          p_created_by: string;
          p_items: Json;
          p_payment_method: string;
          p_customer_id: string;
        };
        Returns: string;
      };
      register_credit_payment: {
        Args: {
          p_business_id: string;
          p_customer_id: string;
          p_amount: number;
          p_payment_method: string;
          p_description: string | null;
          p_created_by: string;
        };
        Returns: string;
      };
      void_credit_transaction: {
        Args: {
          p_business_id: string;
          p_transaction_id: string;
          p_reason: string;
          p_created_by: string;
        };
        Returns: string;
      };
      reconcile_customer_balance: {
        Args: {
          p_customer_id: string;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
  };
};
