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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          attendance_date: string
          created_at: string | null
          discipline_id: string
          id: string
          member_id: string
          notes: string | null
          recorded_by: string | null
          status: string
        }
        Insert: {
          attendance_date: string
          created_at?: string | null
          discipline_id: string
          id?: string
          member_id: string
          notes?: string | null
          recorded_by?: string | null
          status: string
        }
        Update: {
          attendance_date?: string
          created_at?: string | null
          discipline_id?: string
          id?: string
          member_id?: string
          notes?: string | null
          recorded_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      disciplines: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_capacity: number | null
          monthly_fee: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_capacity?: number | null
          monthly_fee: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_capacity?: number | null
          monthly_fee?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string | null
          document_type: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          member_id: string | null
          notes: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          member_id?: string | null
          notes?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          member_id?: string | null
          notes?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      family_discounts: {
        Row: {
          applicable_to: string
          created_at: string | null
          created_by: string | null
          discount_type: string
          discount_value: number
          end_date: string | null
          family_group_id: string
          id: string
          is_active: boolean | null
          notes: string | null
          start_date: string
          updated_at: string | null
        }
        Insert: {
          applicable_to: string
          created_at?: string | null
          created_by?: string | null
          discount_type: string
          discount_value: number
          end_date?: string | null
          family_group_id: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          start_date: string
          updated_at?: string | null
        }
        Update: {
          applicable_to?: string
          created_at?: string | null
          created_by?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string | null
          family_group_id?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_discounts_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      family_groups: {
        Row: {
          address: string
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          phone: string
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          phone: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      member_disciplines: {
        Row: {
          created_at: string | null
          discipline_id: string
          discount_percentage: number | null
          id: string
          is_active: boolean | null
          join_date: string
          member_id: string
          monthly_fee: number
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          discipline_id: string
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          join_date: string
          member_id: string
          monthly_fee: number
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          discipline_id?: string
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          join_date?: string
          member_id?: string
          monthly_fee?: number
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_disciplines_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_disciplines_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          address: string | null
          birth_date: string
          blood_type: string | null
          city: string | null
          created_at: string | null
          dni: string
          email: string
          emergency_contact_name: string
          emergency_contact_phone: string
          emergency_contact_relation: string | null
          family_group_id: string | null
          first_name: string
          gender: string | null
          has_medical_insurance: boolean | null
          id: string
          is_active: boolean | null
          is_primary_contact: boolean | null
          last_name: string
          medical_insurance_name: string | null
          medical_insurance_number: string | null
          notes: string | null
          phone: string
          postal_code: string | null
          relationship_to_primary: string | null
          social_fee: number
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          birth_date: string
          blood_type?: string | null
          city?: string | null
          created_at?: string | null
          dni: string
          email: string
          emergency_contact_name: string
          emergency_contact_phone: string
          emergency_contact_relation?: string | null
          family_group_id?: string | null
          first_name: string
          gender?: string | null
          has_medical_insurance?: boolean | null
          id?: string
          is_active?: boolean | null
          is_primary_contact?: boolean | null
          last_name: string
          medical_insurance_name?: string | null
          medical_insurance_number?: string | null
          notes?: string | null
          phone: string
          postal_code?: string | null
          relationship_to_primary?: string | null
          social_fee?: number
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          birth_date?: string
          blood_type?: string | null
          city?: string | null
          created_at?: string | null
          dni?: string
          email?: string
          emergency_contact_name?: string
          emergency_contact_phone?: string
          emergency_contact_relation?: string | null
          family_group_id?: string | null
          first_name?: string
          gender?: string | null
          has_medical_insurance?: boolean | null
          id?: string
          is_active?: boolean | null
          is_primary_contact?: boolean | null
          last_name?: string
          medical_insurance_name?: string | null
          medical_insurance_number?: string | null
          notes?: string | null
          phone?: string
          postal_code?: string | null
          relationship_to_primary?: string | null
          social_fee?: number
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          member_id: string | null
          message: string
          notification_type: string
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          member_id?: string | null
          message: string
          notification_type: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          member_id?: string | null
          message?: string
          notification_type?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          discipline_id: string | null
          due_date: string
          family_group_id: string | null
          id: string
          member_id: string | null
          notes: string | null
          payment_date: string
          payment_method: string
          payment_type: string
          period_end: string | null
          period_start: string | null
          receipt_number: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          discipline_id?: string | null
          due_date: string
          family_group_id?: string | null
          id?: string
          member_id?: string | null
          notes?: string | null
          payment_date: string
          payment_method: string
          payment_type: string
          period_end?: string | null
          period_start?: string | null
          receipt_number?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          discipline_id?: string | null
          due_date?: string
          family_group_id?: string | null
          id?: string
          member_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: string
          payment_type?: string
          period_end?: string | null
          period_start?: string | null
          receipt_number?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nombre_completo: string
          rol: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          nombre_completo: string
          rol?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nombre_completo?: string
          rol?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_type: string
          setting_value: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_type: string
          setting_value?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string
          setting_value?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_next_due_date: {
        Args: { p_discipline_id?: string; p_member_id: string }
        Returns: string
      }
      check_scheduled_jobs: {
        Args: never
        Returns: {
          active: boolean
          command: string
          database: string
          jobid: number
          jobname: string
          schedule: string
          username: string
        }[]
      }
      create_admin_notification: {
        Args: {
          p_message: string
          p_notification_type: string
          p_related_entity_id: string
          p_title: string
        }
        Returns: undefined
      }
      generate_monthly_fees: { Args: never; Returns: undefined }
      notify_upcoming_due_dates: { Args: never; Returns: Json }
      remove_scheduled_job: { Args: { p_jobname: string }; Returns: boolean }
      run_monthly_fee_generation: { Args: never; Returns: Json }
      schedule_daily_reminders: { Args: never; Returns: Json }
      schedule_monthly_fee_generation: { Args: never; Returns: undefined }
      send_email_notification: {
        Args: { p_html_content: string; p_subject: string; p_to_email: string }
        Returns: Json
      }
      test_notification_system: { Args: never; Returns: Json }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
