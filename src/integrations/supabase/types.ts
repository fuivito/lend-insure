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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agreements: {
        Row: {
          activated_at: string | null
          apr_bps: number
          broker_fee_bps: number
          client_id: string
          created_at: string
          id: string
          organisation_id: string
          policy_id: string
          principal_amount_pennies: number
          signed_at: string | null
          status: Database["public"]["Enums"]["agreement_status_enum"]
          term_months: number
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          apr_bps: number
          broker_fee_bps?: number
          client_id: string
          created_at?: string
          id?: string
          organisation_id: string
          policy_id: string
          principal_amount_pennies: number
          signed_at?: string | null
          status?: Database["public"]["Enums"]["agreement_status_enum"]
          term_months: number
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          apr_bps?: number
          broker_fee_bps?: number
          client_id?: string
          created_at?: string
          id?: string
          organisation_id?: string
          policy_id?: string
          principal_amount_pennies?: number
          signed_at?: string | null
          status?: Database["public"]["Enums"]["agreement_status_enum"]
          term_months?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agreements_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agreements_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agreements_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_type: string
          after: Json | null
          before: Json | null
          created_at: string
          entity: string
          id: string
          organisation_id: string
        }
        Insert: {
          action: string
          actor_type: string
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity: string
          id?: string
          organisation_id: string
        }
        Update: {
          action?: string
          actor_type?: string
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity?: string
          id?: string
          organisation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      broker_users: {
        Row: {
          auth_user_id: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          organisation_id: string
          role: Database["public"]["Enums"]["broker_role_enum"]
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          organisation_id: string
          role?: Database["public"]["Enums"]["broker_role_enum"]
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          organisation_id?: string
          role?: Database["public"]["Enums"]["broker_role_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "broker_users_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          organisation_id: string
          phone: string | null
          postcode: string | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          organisation_id: string
          phone?: string | null
          postcode?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          organisation_id?: string
          phone?: string | null
          postcode?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      instalments: {
        Row: {
          agreement_id: string
          amount_pennies: number
          created_at: string
          due_date: string
          id: string
          paid_at: string | null
          sequence_number: number
          status: Database["public"]["Enums"]["instalment_status_enum"]
          updated_at: string
        }
        Insert: {
          agreement_id: string
          amount_pennies: number
          created_at?: string
          due_date: string
          id?: string
          paid_at?: string | null
          sequence_number: number
          status?: Database["public"]["Enums"]["instalment_status_enum"]
          updated_at?: string
        }
        Update: {
          agreement_id?: string
          amount_pennies?: number
          created_at?: string
          due_date?: string
          id?: string
          paid_at?: string | null
          sequence_number?: number
          status?: Database["public"]["Enums"]["instalment_status_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "instalments_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "agreements"
            referencedColumns: ["id"]
          },
        ]
      }
      organisations: {
        Row: {
          created_at: string
          id: string
          name: string
          status: Database["public"]["Enums"]["organisation_status_enum"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["organisation_status_enum"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["organisation_status_enum"]
          updated_at?: string
        }
        Relationships: []
      }
      policies: {
        Row: {
          client_id: string
          created_at: string
          end_date: string
          id: string
          insurer: string
          organisation_id: string
          policy_number: string
          premium_amount_pennies: number
          product_type: string
          start_date: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          end_date: string
          id?: string
          insurer: string
          organisation_id: string
          policy_number: string
          premium_amount_pennies: number
          product_type: string
          start_date: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          end_date?: string
          id?: string
          insurer?: string
          organisation_id?: string
          policy_number?: string
          premium_amount_pennies?: number
          product_type?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "policies_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policies_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          organisation_id: string
          role: Database["public"]["Enums"]["broker_role_enum"]
          user_id: string
        }
        Insert: {
          id?: string
          organisation_id: string
          role: Database["public"]["Enums"]["broker_role_enum"]
          user_id: string
        }
        Update: {
          id?: string
          organisation_id?: string
          role?: Database["public"]["Enums"]["broker_role_enum"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["broker_role_enum"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      agreement_status_enum:
        | "DRAFT"
        | "PROPOSED"
        | "SIGNED"
        | "ACTIVE"
        | "DEFAULTED"
        | "TERMINATED"
      broker_role_enum: "BROKER" | "BROKER_ADMIN" | "INTERNAL"
      instalment_status_enum: "UPCOMING" | "PAID" | "MISSED"
      organisation_status_enum: "ACTIVE" | "SUSPENDED" | "INACTIVE"
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
    Enums: {
      agreement_status_enum: [
        "DRAFT",
        "PROPOSED",
        "SIGNED",
        "ACTIVE",
        "DEFAULTED",
        "TERMINATED",
      ],
      broker_role_enum: ["BROKER", "BROKER_ADMIN", "INTERNAL"],
      instalment_status_enum: ["UPCOMING", "PAID", "MISSED"],
      organisation_status_enum: ["ACTIVE", "SUSPENDED", "INACTIVE"],
    },
  },
} as const
