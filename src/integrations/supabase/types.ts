export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          password_hash: string
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash: string
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash?: string
          username?: string
        }
        Relationships: []
      }
      admins: {
        Row: {
          created_at: string | null
          id: string
          last_login: string | null
          password_hash: string
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_login?: string | null
          password_hash: string
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_login?: string | null
          password_hash?: string
          username?: string
        }
        Relationships: []
      }
      challans: {
        Row: {
          batch_number: string | null
          challan_number: string
          client_id: string
          courier_service: string | null
          created_at: string
          date: string
          driver_name: string | null
          goods_description: string
          id: string
          quantity: string
          receiver_address: string | null
          receiver_name: string
          sender_address: string | null
          sender_name: string
          truck_number: string | null
          units: string | null
          weight: string | null
        }
        Insert: {
          batch_number?: string | null
          challan_number: string
          client_id: string
          courier_service?: string | null
          created_at?: string
          date?: string
          driver_name?: string | null
          goods_description: string
          id?: string
          quantity: string
          receiver_address?: string | null
          receiver_name: string
          sender_address?: string | null
          sender_name: string
          truck_number?: string | null
          units?: string | null
          weight?: string | null
        }
        Update: {
          batch_number?: string | null
          challan_number?: string
          client_id?: string
          courier_service?: string | null
          created_at?: string
          date?: string
          driver_name?: string | null
          goods_description?: string
          id?: string
          quantity?: string
          receiver_address?: string | null
          receiver_name?: string
          sender_address?: string | null
          sender_name?: string
          truck_number?: string | null
          units?: string | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["client_id"]
          },
        ]
      }
      clients: {
        Row: {
          access_status: boolean
          client_id: string
          company_name: string
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          last_login: string | null
          password_hash: string
          phone: string | null
          subscription_end: string
          subscription_start: string
          subscription_status: string
          updated_at: string
          username: string
        }
        Insert: {
          access_status?: boolean
          client_id: string
          company_name: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_login?: string | null
          password_hash: string
          phone?: string | null
          subscription_end?: string
          subscription_start?: string
          subscription_status?: string
          updated_at?: string
          username: string
        }
        Update: {
          access_status?: boolean
          client_id?: string
          company_name?: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_login?: string | null
          password_hash?: string
          phone?: string | null
          subscription_end?: string
          subscription_start?: string
          subscription_status?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          client_id: string
          created_at: string
          document_data: Json
          id: string
          type: string
        }
        Insert: {
          client_id: string
          created_at?: string
          document_data: Json
          id?: string
          type: string
        }
        Update: {
          client_id?: string
          created_at?: string
          document_data?: Json
          id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["client_id"]
          },
        ]
      }
      expense_entries: {
        Row: {
          amount: number
          category: string | null
          client_id: string
          created_at: string
          date: string
          description: string
          id: string
        }
        Insert: {
          amount: number
          category?: string | null
          client_id: string
          created_at?: string
          date?: string
          description: string
          id?: string
        }
        Update: {
          amount?: number
          category?: string | null
          client_id?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["client_id"]
          },
        ]
      }
      group_items: {
        Row: {
          client_id: string
          container_name: string
          created_at: string
          group_id: string
          id: string
          qr_code: string | null
          quantity: number
          quota: number | null
          scanned_count: number
          tag_id: string | null
        }
        Insert: {
          client_id: string
          container_name: string
          created_at?: string
          group_id: string
          id?: string
          qr_code?: string | null
          quantity: number
          quota?: number | null
          scanned_count?: number
          tag_id?: string | null
        }
        Update: {
          client_id?: string
          container_name?: string
          created_at?: string
          group_id?: string
          id?: string
          qr_code?: string | null
          quantity?: number
          quota?: number | null
          scanned_count?: number
          tag_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_items_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "group_items_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          client_id: string
          closed_at: string | null
          created_at: string
          id: string
          name: string
          status: string
        }
        Insert: {
          client_id: string
          closed_at?: string | null
          created_at?: string
          id?: string
          name: string
          status?: string
        }
        Update: {
          client_id?: string
          closed_at?: string | null
          created_at?: string
          id?: string
          name?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["client_id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          client_id: string
          created_at: string
          current_stock: number
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          current_stock?: number
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          current_stock?: number
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["client_id"]
          },
        ]
      }
      monthly_expenses: {
        Row: {
          amount: number
          category: string | null
          client_id: string
          created_at: string
          date: string
          description: string
          id: string
          month_number: number
          year: number
        }
        Insert: {
          amount: number
          category?: string | null
          client_id: string
          created_at?: string
          date?: string
          description: string
          id?: string
          month_number: number
          year?: number
        }
        Update: {
          amount?: number
          category?: string | null
          client_id?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          month_number?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_expenses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["client_id"]
          },
        ]
      }
      profit_loss: {
        Row: {
          client_id: string
          id: string
          month_number: number
          net_profit_loss: number
          total_expenses: number
          total_sales: number
          updated_at: string
          year: number
        }
        Insert: {
          client_id: string
          id?: string
          month_number: number
          net_profit_loss?: number
          total_expenses?: number
          total_sales?: number
          updated_at?: string
          year?: number
        }
        Update: {
          client_id?: string
          id?: string
          month_number?: number
          net_profit_loss?: number
          total_expenses?: number
          total_sales?: number
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "profit_loss_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["client_id"]
          },
        ]
      }
      purchase_entries: {
        Row: {
          amount: number
          category: string | null
          client_id: string
          created_at: string
          date: string
          description: string
          id: string
          month_number: number
          year: number
        }
        Insert: {
          amount: number
          category?: string | null
          client_id: string
          created_at?: string
          date?: string
          description: string
          id?: string
          month_number: number
          year?: number
        }
        Update: {
          amount?: number
          category?: string | null
          client_id?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          month_number?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["client_id"]
          },
        ]
      }
      sales_entries: {
        Row: {
          amount: number
          category: string | null
          client_id: string
          created_at: string
          date: string
          description: string
          id: string
          payment_status: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          client_id: string
          created_at?: string
          date?: string
          description: string
          id?: string
          payment_status?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          client_id?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          payment_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["client_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authenticate_admin: {
        Args: { p_password: string; p_username: string }
        Returns: {
          admin_username: string
        }[]
      }
      authenticate_admin_user: {
        Args: { p_password: string; p_username: string }
        Returns: {
          admin_username: string
          session_token: string
        }[]
      }
      auto_expire_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_client_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      validate_admin_session: {
        Args: { session_token: string }
        Returns: {
          admin_username: string
          is_valid: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
