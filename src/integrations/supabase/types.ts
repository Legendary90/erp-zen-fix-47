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
      accounting_periods: {
        Row: {
          client_id: string
          created_at: string
          end_date: string
          fiscal_year_id: string | null
          id: string
          period_name: string
          period_type: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          end_date: string
          fiscal_year_id?: string | null
          id?: string
          period_name: string
          period_type?: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          end_date?: string
          fiscal_year_id?: string | null
          id?: string
          period_name?: string
          period_type?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounting_periods_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "fiscal_years"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          account_code: string
          account_name: string
          account_type: string
          client_id: string
          created_at: string
          id: string
          is_active: boolean
          parent_account_id: string | null
          updated_at: string
        }
        Insert: {
          account_code: string
          account_name: string
          account_type: string
          client_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          parent_account_id?: string | null
          updated_at?: string
        }
        Update: {
          account_code?: string
          account_name?: string
          account_type?: string
          client_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          parent_account_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          password_hash: string
          user_id: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash: string
          user_id?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash?: string
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      admins: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          is_super_admin: boolean | null
          last_login: string | null
          password_hash: string
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_super_admin?: boolean | null
          last_login?: string | null
          password_hash: string
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_super_admin?: boolean | null
          last_login?: string | null
          password_hash?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      attendance_periods: {
        Row: {
          client_id: string
          created_at: string | null
          end_date: string
          id: string
          month_number: number
          period_name: string
          start_date: string
          status: string
          updated_at: string | null
          year: number
        }
        Insert: {
          client_id: string
          created_at?: string | null
          end_date: string
          id?: string
          month_number: number
          period_name: string
          start_date: string
          status?: string
          updated_at?: string | null
          year: number
        }
        Update: {
          client_id?: string
          created_at?: string | null
          end_date?: string
          id?: string
          month_number?: number
          period_name?: string
          start_date?: string
          status?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      attendance_tracking: {
        Row: {
          attendance_date: string
          client_id: string
          created_at: string | null
          employee_id: string
          id: string
          notes: string | null
          period_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          attendance_date: string
          client_id: string
          created_at?: string | null
          employee_id: string
          id?: string
          notes?: string | null
          period_id?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          attendance_date?: string
          client_id?: string
          created_at?: string | null
          employee_id?: string
          id?: string
          notes?: string | null
          period_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bills: {
        Row: {
          bill_date: string
          bill_number: string
          client_id: string
          created_at: string
          due_date: string
          id: string
          notes: string | null
          paid_amount: number
          period_id: string
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          bill_date: string
          bill_number: string
          client_id: string
          created_at?: string
          due_date: string
          id?: string
          notes?: string | null
          paid_amount?: number
          period_id: string
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          bill_date?: string
          bill_number?: string
          client_id?: string
          created_at?: string
          due_date?: string
          id?: string
          notes?: string | null
          paid_amount?: number
          period_id?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "accounting_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
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
          last_data_backup: string | null
          last_login: string | null
          password_hash: string
          phone: string | null
          subscription_billing_day: number | null
          subscription_day: number | null
          subscription_end: string
          subscription_end_date: string | null
          subscription_start: string
          subscription_start_date: string | null
          subscription_status: string
          updated_at: string
          user_id: string | null
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
          last_data_backup?: string | null
          last_login?: string | null
          password_hash: string
          phone?: string | null
          subscription_billing_day?: number | null
          subscription_day?: number | null
          subscription_end?: string
          subscription_end_date?: string | null
          subscription_start?: string
          subscription_start_date?: string | null
          subscription_status?: string
          updated_at?: string
          user_id?: string | null
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
          last_data_backup?: string | null
          last_login?: string | null
          password_hash?: string
          phone?: string | null
          subscription_billing_day?: number | null
          subscription_day?: number | null
          subscription_end?: string
          subscription_end_date?: string | null
          subscription_start?: string
          subscription_start_date?: string | null
          subscription_status?: string
          updated_at?: string
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      customer_relations: {
        Row: {
          address: string | null
          client_id: string
          company_type: string | null
          contact_person: string | null
          created_at: string
          customer_name: string
          email: string | null
          id: string
          industry: string | null
          last_contact_date: string | null
          notes: string | null
          phone: string | null
          rating: number | null
          relationship_type: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          client_id: string
          company_type?: string | null
          contact_person?: string | null
          created_at?: string
          customer_name: string
          email?: string | null
          id?: string
          industry?: string | null
          last_contact_date?: string | null
          notes?: string | null
          phone?: string | null
          rating?: number | null
          relationship_type?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          client_id?: string
          company_type?: string | null
          contact_person?: string | null
          created_at?: string
          customer_name?: string
          email?: string | null
          id?: string
          industry?: string | null
          last_contact_date?: string | null
          notes?: string | null
          phone?: string | null
          rating?: number | null
          relationship_type?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          client_id: string
          contact_person: string | null
          created_at: string
          credit_limit: number | null
          customer_code: string
          customer_name: string
          email: string | null
          id: string
          is_active: boolean
          payment_terms: number | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          client_id: string
          contact_person?: string | null
          created_at?: string
          credit_limit?: number | null
          customer_code: string
          customer_name: string
          email?: string | null
          id?: string
          is_active?: boolean
          payment_terms?: number | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          client_id?: string
          contact_person?: string | null
          created_at?: string
          credit_limit?: number | null
          customer_code?: string
          customer_name?: string
          email?: string | null
          id?: string
          is_active?: boolean
          payment_terms?: number | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      daily_attendance: {
        Row: {
          attendance_date: string
          client_id: string
          created_at: string | null
          employee_id: string
          id: string
          notes: string | null
          period_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          attendance_date: string
          client_id: string
          created_at?: string | null
          employee_id: string
          id?: string
          notes?: string | null
          period_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          attendance_date?: string
          client_id?: string
          created_at?: string | null
          employee_id?: string
          id?: string
          notes?: string | null
          period_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_attendance_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "attendance_periods"
            referencedColumns: ["id"]
          },
        ]
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
      employee_attendance: {
        Row: {
          client_id: string
          created_at: string
          date: string
          employee_id: string
          id: string
          notes: string | null
          period_id: string
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          date?: string
          employee_id: string
          id?: string
          notes?: string | null
          period_id: string
          status: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          date?: string
          employee_id?: string
          id?: string
          notes?: string | null
          period_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_attendance_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "accounting_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_monthly_summary: {
        Row: {
          absent_days: number | null
          client_id: string
          created_at: string | null
          employee_id: string
          id: string
          leave_days: number | null
          month_number: number
          period_id: string
          present_days: number | null
          total_days: number | null
          updated_at: string | null
          year: number
        }
        Insert: {
          absent_days?: number | null
          client_id: string
          created_at?: string | null
          employee_id: string
          id?: string
          leave_days?: number | null
          month_number: number
          period_id: string
          present_days?: number | null
          total_days?: number | null
          updated_at?: string | null
          year: number
        }
        Update: {
          absent_days?: number | null
          client_id?: string
          created_at?: string | null
          employee_id?: string
          id?: string
          leave_days?: number | null
          month_number?: number
          period_id?: string
          present_days?: number | null
          total_days?: number | null
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      employees: {
        Row: {
          attendance_days: number | null
          client_id: string
          created_at: string
          department: string | null
          email: string | null
          employee_code: string
          hire_date: string | null
          id: string
          leave_days: number | null
          name: string
          period_id: string | null
          phone: string | null
          position: string
          salary: number | null
          status: string
          updated_at: string
        }
        Insert: {
          attendance_days?: number | null
          client_id: string
          created_at?: string
          department?: string | null
          email?: string | null
          employee_code: string
          hire_date?: string | null
          id?: string
          leave_days?: number | null
          name: string
          period_id?: string | null
          phone?: string | null
          position: string
          salary?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          attendance_days?: number | null
          client_id?: string
          created_at?: string
          department?: string | null
          email?: string | null
          employee_code?: string
          hire_date?: string | null
          id?: string
          leave_days?: number | null
          name?: string
          period_id?: string | null
          phone?: string | null
          position?: string
          salary?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "accounting_periods"
            referencedColumns: ["id"]
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
          period_id: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          client_id: string
          created_at?: string
          date?: string
          description: string
          id?: string
          period_id?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          client_id?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          period_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "expense_entries_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "accounting_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      fiscal_years: {
        Row: {
          client_id: string
          created_at: string | null
          end_date: string
          id: string
          start_date: string
          status: string
          updated_at: string | null
          year_name: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          end_date: string
          id?: string
          start_date: string
          status?: string
          updated_at?: string | null
          year_name: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          end_date?: string
          id?: string
          start_date?: string
          status?: string
          updated_at?: string | null
          year_name?: string
        }
        Relationships: []
      }
      general_ledger: {
        Row: {
          account_id: string
          client_id: string
          created_at: string
          credit_amount: number | null
          debit_amount: number | null
          description: string
          id: string
          period_id: string
          reference_id: string | null
          reference_type: string | null
          transaction_date: string
          updated_at: string
        }
        Insert: {
          account_id: string
          client_id: string
          created_at?: string
          credit_amount?: number | null
          debit_amount?: number | null
          description: string
          id?: string
          period_id: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_date: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          client_id?: string
          created_at?: string
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string
          id?: string
          period_id?: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "general_ledger_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "general_ledger_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "accounting_periods"
            referencedColumns: ["id"]
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
      invoices: {
        Row: {
          client_id: string
          created_at: string
          customer_id: string
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          paid_amount: number
          period_id: string
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          customer_id: string
          due_date: string
          id?: string
          invoice_date: string
          invoice_number: string
          notes?: string | null
          paid_amount?: number
          period_id: string
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          customer_id?: string
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          paid_amount?: number
          period_id?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "accounting_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          authority: string | null
          client_id: string
          created_at: string
          description: string | null
          document_number: string | null
          document_type: string
          expiry_date: string | null
          file_path: string | null
          id: string
          issue_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          authority?: string | null
          client_id: string
          created_at?: string
          description?: string | null
          document_number?: string | null
          document_type: string
          expiry_date?: string | null
          file_path?: string | null
          id?: string
          issue_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          authority?: string | null
          client_id?: string
          created_at?: string
          description?: string | null
          document_number?: string | null
          document_type?: string
          expiry_date?: string | null
          file_path?: string | null
          id?: string
          issue_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      monthly_attendance_summary: {
        Row: {
          absent_days: number | null
          client_id: string
          created_at: string | null
          employee_id: string
          half_days: number | null
          id: string
          leave_days: number | null
          month_number: number
          period_id: string | null
          present_days: number | null
          total_working_days: number | null
          updated_at: string | null
          year: number
        }
        Insert: {
          absent_days?: number | null
          client_id: string
          created_at?: string | null
          employee_id: string
          half_days?: number | null
          id?: string
          leave_days?: number | null
          month_number: number
          period_id?: string | null
          present_days?: number | null
          total_working_days?: number | null
          updated_at?: string | null
          year: number
        }
        Update: {
          absent_days?: number | null
          client_id?: string
          created_at?: string | null
          employee_id?: string
          half_days?: number | null
          id?: string
          leave_days?: number | null
          month_number?: number
          period_id?: string | null
          present_days?: number | null
          total_working_days?: number | null
          updated_at?: string | null
          year?: number
        }
        Relationships: []
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
          period_id: string | null
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
          period_id?: string | null
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
          period_id?: string | null
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
          {
            foreignKeyName: "purchase_entries_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "accounting_periods"
            referencedColumns: ["id"]
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
          period_id: string | null
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
          period_id?: string | null
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
          period_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "sales_entries_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "accounting_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          client_id: string
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          payment_terms: number | null
          phone: string | null
          updated_at: string
          vendor_code: string
          vendor_name: string
        }
        Insert: {
          address?: string | null
          client_id: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          payment_terms?: number | null
          phone?: string | null
          updated_at?: string
          vendor_code: string
          vendor_name: string
        }
        Update: {
          address?: string | null
          client_id?: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          payment_terms?: number | null
          phone?: string | null
          updated_at?: string
          vendor_code?: string
          vendor_name?: string
        }
        Relationships: []
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
      calculate_next_billing_date: {
        Args: { billing_day: number; start_date: string }
        Returns: string
      }
      calculate_subscription_end_date: {
        Args: { months?: number; start_date: string }
        Returns: string
      }
      check_expired_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_default_period: {
        Args: { p_client_id: string }
        Returns: string
      }
      create_test_client: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      create_test_client_complete: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      extend_client_subscription: {
        Args: { p_client_id: string; p_months?: number }
        Returns: boolean
      }
      extend_client_subscription_by_months: {
        Args: { p_client_id: string; p_months?: number }
        Returns: boolean
      }
      generate_client_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_active_fiscal_year: {
        Args: { p_client_id: string }
        Returns: string
      }
      get_active_period: {
        Args: { p_client_id: string }
        Returns: string
      }
      get_client_id_for_user: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      hash_password: {
        Args: { password: string }
        Returns: string
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_period_editable: {
        Args: { p_period_id: string }
        Returns: boolean
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
