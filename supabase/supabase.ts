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
      admin_disciplinas: {
        Row: {
          admin_id: string
          disciplina_id: string
          nombre: string
        }
        Insert: {
          admin_id: string
          disciplina_id: string
          nombre: string
        }
        Update: {
          admin_id?: string
          disciplina_id?: string
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_disciplinas_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_disciplinas_disciplina_id_fkey"
            columns: ["disciplina_id"]
            isOneToOne: false
            referencedRelation: "disciplinas"
            referencedColumns: ["id"]
          },
        ]
      }
      cuotas: {
        Row: {
          anio: number
          comprobante_url: string | null
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
          comprobante_url?: string | null
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
          comprobante_url?: string | null
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
          imagen_url: string | null
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
          imagen_url?: string | null
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
          imagen_url?: string | null
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
          tipo_cuota_id: string
          titular_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cuota_social?: number
          id?: string
          nombre: string
          tipo_cuota_id: string
          titular_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cuota_social?: number
          id?: string
          nombre?: string
          tipo_cuota_id?: string
          titular_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grupos_familiares_tipo_cuota_id_fkey"
            columns: ["tipo_cuota_id"]
            isOneToOne: false
            referencedRelation: "cuotas_tipos"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "inscripciones_miembro_id_fkey"
            columns: ["miembro_id"]
            isOneToOne: false
            referencedRelation: "miembros_sin_rls"
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
      miembros_sin_rls: {
        Row: {
          grupo_id: string | null
          id: string | null
          socio_id: string | null
        }
        Insert: {
          grupo_id?: string | null
          id?: string | null
          socio_id?: string | null
        }
        Update: {
          grupo_id?: string | null
          id?: string | null
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
    }
    Functions: {
      es_admin_de_disciplina_del_grupo: {
        Args: { grupo_id_param: string }
        Returns: boolean
      }
      es_admin_de_disciplina_del_miembro: {
        Args: { miembro_id_param: string }
        Returns: boolean
      }
      get_miembros_de_mi_disciplina: {
        Args: never
        Returns: {
          activa: boolean
          dni_miembro: string
          estado_cuota: string
          id: string
          nombre_miembro: string
          nombre_titular: string
        }[]
      }
      get_miembros_disciplina_por_mes: {
        Args: { admin_id_param: string; anio_param: number; mes_param: number }
        Returns: Database["public"]["CompositeTypes"]["miembro_estado_cuota"][]
        SetofOptions: {
          from: "*"
          to: "miembro_estado_cuota"
          isOneToOne: false
          isSetofReturn: true
        }
      }
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
      get_miembros_por_disciplina:
        | {
            Args: never
            Returns: Database["public"]["CompositeTypes"]["miembro_disciplina"][]
            SetofOptions: {
              from: "*"
              to: "miembro_disciplina"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: {
              admin_id_param: string
              anio_param: number
              mes_param: number
            }
            Returns: {
              dni: string
              estado_cuota: string
              fecha_inscripcion: string
              id: string
              nombre_completo: string
            }[]
          }
      get_my_group_id: { Args: never; Returns: string }
      get_my_grupo_id: { Args: never; Returns: string }
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
      is_member_of_same_group: {
        Args: { profile_id_to_check: string }
        Returns: boolean
      }
      is_super_admin: { Args: never; Returns: boolean }
      registrar_pago_cuotas: {
        Args: {
          p_cuota_ids: string[]
          p_fecha_pago: string
          p_tipo_pago: string
        }
        Returns: {
          anio: number
          comprobante_url: string | null
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
        }[]
        SetofOptions: {
          from: "*"
          to: "cuotas"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      registrar_pago_y_actualizar_cuotas: {
        Args: {
          p_cuota_ids: string[]
          p_fecha_pago: string
          p_grupo_id: string
          p_monto: number
          p_notas?: string
          p_referencia?: string
          p_tipo_pago: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      miembro_disciplina: {
        id: string | null
        nombre_completo: string | null
        email: string | null
        telefono: string | null
        dni: string | null
        created_at: string | null
      }
      miembro_disciplina_info: {
        id: string | null
        miembro_id: string | null
        nombre_completo: string | null
        dni: string | null
        fecha_inscripcion: string | null
        activo: boolean | null
        titular_nombre: string | null
        titular_email: string | null
        titular_telefono: string | null
      }
      miembro_estado_cuota: {
        id: string | null
        nombre_completo: string | null
        dni: string | null
        fecha_inscripcion: string | null
        estado_cuota: string | null
      }
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
