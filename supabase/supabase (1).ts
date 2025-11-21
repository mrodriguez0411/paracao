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
      cuotas: {
        Row: {
          anio: number
          created_at: string | null
          disciplina_id: string | null
          fecha_pago: string | null
          fecha_vencimiento: string
          grupo_id: string
          id: string
          mes: number
          metodo_pago: string | null
          monto: number
          pagada: boolean | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          anio: number
          created_at?: string | null
          disciplina_id?: string | null
          fecha_pago?: string | null
          fecha_vencimiento: string
          grupo_id: string
          id?: string
          mes: number
          metodo_pago?: string | null
          monto: number
          pagada?: boolean | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          anio?: number
          created_at?: string | null
          disciplina_id?: string | null
          fecha_pago?: string | null
          fecha_vencimiento?: string
          grupo_id?: string
          id?: string
          mes?: number
          metodo_pago?: string | null
          monto?: number
          pagada?: boolean | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cuotas_disciplina_id_fkey"
            columns: ["disciplina_id"]
            isOneToOne: false
            referencedRelation: "disciplinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos_familiares"
            referencedColumns: ["id"]
          },
        ]
      }
      cuotas_tipos: {
        Row: {
          activo: boolean
          created_at: string | null
          id: string
          monto: number
          nombre: string
          por_disciplina: boolean
          tipo: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean
          created_at?: string | null
          id?: string
          monto: number
          nombre: string
          por_disciplina?: boolean
          tipo: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean
          created_at?: string | null
          id?: string
          monto?: number
          nombre?: string
          por_disciplina?: boolean
          tipo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      disciplinas: {
        Row: {
          activa: boolean | null
          admin_id: string | null
          created_at: string | null
          cuota_deportiva: number
          descripcion: string | null
          id: string
          nombre: string
          updated_at: string | null
        }
        Insert: {
          activa?: boolean | null
          admin_id?: string | null
          created_at?: string | null
          cuota_deportiva?: number
          descripcion?: string | null
          id?: string
          nombre: string
          updated_at?: string | null
        }
        Update: {
          activa?: boolean | null
          admin_id?: string | null
          created_at?: string | null
          cuota_deportiva?: number
          descripcion?: string | null
          id?: string
          nombre?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disciplinas_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      grupos_familiares: {
        Row: {
          created_at: string | null
          cuota_social: number
          id: string
          nombre: string
          titular_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cuota_social?: number
          id?: string
          nombre: string
          titular_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cuota_social?: number
          id?: string
          nombre?: string
          titular_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grupos_familiares_titular_id_fkey"
            columns: ["titular_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inscripciones: {
        Row: {
          activa: boolean | null
          created_at: string | null
          disciplina_id: string
          fecha_inscripcion: string | null
          id: string
          miembro_id: string
        }
        Insert: {
          activa?: boolean | null
          created_at?: string | null
          disciplina_id: string
          fecha_inscripcion?: string | null
          id?: string
          miembro_id: string
        }
        Update: {
          activa?: boolean | null
          created_at?: string | null
          disciplina_id?: string
          fecha_inscripcion?: string | null
          id?: string
          miembro_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscripciones_disciplina_id_fkey"
            columns: ["disciplina_id"]
            isOneToOne: false
            referencedRelation: "disciplinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscripciones_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "miembros_familia"
            referencedColumns: ["id"]
          },
        ]
      }
      miembros_familia: {
        Row: {
          created_at: string | null
          dni: string | null
          fecha_nacimiento: string | null
          grupo_id: string
          id: string
          nombre_completo: string
          parentesco: string | null
          socio_id: string | null
        }
        Insert: {
          created_at?: string | null
          dni?: string | null
          fecha_nacimiento?: string | null
          grupo_id: string
          id?: string
          nombre_completo: string
          parentesco?: string | null
          socio_id?: string | null
        }
        Update: {
          created_at?: string | null
          dni?: string | null
          fecha_nacimiento?: string | null
          grupo_id?: string
          id?: string
          nombre_completo?: string
          parentesco?: string | null
          socio_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "miembros_familia_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos_familiares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "miembros_familia_socio_id_fkey"
            columns: ["socio_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          dni: string | null
          email: string
          id: string
          nombre_completo: string
          rol: string
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dni?: string | null
          email: string
          id: string
          nombre_completo: string
          rol: string
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dni?: string | null
          email?: string
          id?: string
          nombre_completo?: string
          rol?: string
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_miembros_familia: {
        Args: { p_grupo_id: string }
        Returns: {
          created_at: string | null
          dni: string | null
          fecha_nacimiento: string | null
          grupo_id: string
          id: string
          nombre_completo: string
          parentesco: string | null
          socio_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "miembros_familia"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_profile_by_id: {
        Args: { profile_id: string }
        Returns: {
          created_at: string | null
          dni: string | null
          email: string
          id: string
          nombre_completo: string
          rol: string
          telefono: string | null
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_user_role: { Args: never; Returns: string }
      is_super_admin: { Args: never; Returns: boolean }
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
