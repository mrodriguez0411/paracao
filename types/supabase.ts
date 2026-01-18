
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      actividades: {
        Row: {
          id: string
          disciplina_id: string
          nombre: string
          costo: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          disciplina_id: string
          nombre: string
          costo: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          disciplina_id?: string
          nombre?: string
          costo?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "actividades_disciplina_id_fkey"
            columns: ["disciplina_id"]
            referencedRelation: "disciplinas"
            referencedColumns: ["id"]
          }
        ]
      }
      cuotas: {
        Row: {
          id: string
          grupo_id: string
          tipo: "social" | "deportiva"
          mes: number
          anio: number
          monto: number
          fecha_vencimiento: string
          fecha_pago: string | null
          metodo_pago: "efectivo" | "transferencia" | "online" | null
          pagada: boolean
          created_at: string
          updated_at: string
          actividad_id: string | null
        }
        Insert: {
          id?: string
          grupo_id: string
          tipo: "social" | "deportiva"
          mes: number
          anio: number
          monto: number
          fecha_vencimiento: string
          fecha_pago?: string | null
          metodo_pago?: "efectivo" | "transferencia" | "online" | null
          pagada?: boolean
          created_at?: string
          updated_at?: string
          actividad_id?: string | null
        }
        Update: {
          id?: string
          grupo_id?: string
          tipo?: "social" | "deportiva"
          mes?: number
          anio?: number
          monto?: number
          fecha_vencimiento?: string
          fecha_pago?: string | null
          metodo_pago?: "efectivo" | "transferencia" | "online" | null
          pagada?: boolean
          created_at?: string
          updated_at?: string
          actividad_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cuotas_grupo_id_fkey"
            columns: ["grupo_id"]
            referencedRelation: "grupos_familiares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cuotas_actividad_id_fkey"
            columns: ["actividad_id"]
            referencedRelation: "actividades"
            referencedColumns: ["id"]
          }
        ]
      }
      disciplinas: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          admin_id: string | null
          activa: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          admin_id?: string | null
          activa?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          admin_id?: string | null
          activa?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disciplinas_admin_id_fkey"
            columns: ["admin_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      grupos_familiares: {
        Row: {
          id: string
          nombre: string
          titular_id: string
          cuota_social: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          titular_id: string
          cuota_social: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          titular_id?: string
          cuota_social?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grupos_familiares_titular_id_fkey"
            columns: ["titular_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      inscripciones: {
        Row: {
          id: string
          miembro_id: string
          fecha_inscripcion: string
          activa: boolean
          created_at: string
          actividad_id: string
        }
        Insert: {
          id?: string
          miembro_id: string
          fecha_inscripcion?: string
          activa?: boolean
          created_at?: string
          actividad_id: string
        }
        Update: {
          id?: string
          miembro_id?: string
          fecha_inscripcion?: string
          activa?: boolean
          created_at?: string
          actividad_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inscripciones_miembro_id_fkey"
            columns: ["miembro_id"]
            referencedRelation: "miembros_familia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inscripciones_actividad_id_fkey"
            columns: ["actividad_id"]
            referencedRelation: "actividades"
            referencedColumns: ["id"]
          }
        ]
      }
      miembros_familia: {
        Row: {
          id: string
          grupo_id: string
          socio_id: string | null
          nombre_completo: string
          dni: string | null
          fecha_nacimiento: string | null
          parentesco: string | null
          created_at: string
        }
        Insert: {
          id?: string
          grupo_id: string
          socio_id?: string | null
          nombre_completo: string
          dni?: string | null
          fecha_nacimiento?: string | null
          parentesco?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          grupo_id?: string
          socio_id?: string | null
          nombre_completo?: string
          dni?: string | null
          fecha_nacimiento?: string | null
          parentesco?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "miembros_familia_grupo_id_fkey"
            columns: ["grupo_id"]
            referencedRelation: "grupos_familiares"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "miembros_familia_socio_id_fkey"
            columns: ["socio_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          nombre_completo: string
          telefono: string | null
          rol: "super_admin" | "admin_disciplina" | "socio"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          nombre_completo: string
          telefono?: string | null
          rol: "super_admin" | "admin_disciplina" | "socio"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nombre_completo?: string
          telefono?: string | null
          rol?: "super_admin" | "admin_disciplina" | "socio"
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
