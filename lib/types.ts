export type UserRole = "super_admin" | "admin_disciplina" | "socio"

export interface Profile {
  id: string
  email: string
  nombre_completo: string
  telefono?: string
  rol: UserRole
  created_at: string
  updated_at: string
}

export interface Disciplina {
  id: string
  nombre: string
  descripcion?: string
  cuota_deportiva: number
  admin_id?: string
  activa: boolean
  created_at: string
  updated_at: string
}

export interface GrupoFamiliar {
  id: string
  nombre: string
  titular_id: string
  cuota_social: number
  created_at: string
  updated_at: string
}

export interface MiembroFamilia {
  id: string
  grupo_id: string
  socio_id?: string
  nombre_completo: string
  dni?: string
  fecha_nacimiento?: string
  parentesco?: string
  created_at: string
}

export interface Inscripcion {
  id: string
  miembro_id: string
  disciplina_id: string
  fecha_inscripcion: string
  activa: boolean
  created_at: string
}

export interface Cuota {
  id: string
  grupo_id: string
  tipo: "social" | "deportiva"
  disciplina_id?: string
  mes: number
  anio: number
  monto: number
  fecha_vencimiento: string
  fecha_pago?: string
  metodo_pago?: "efectivo" | "transferencia" | "online"
  pagada: boolean
  created_at: string
  updated_at: string
}
