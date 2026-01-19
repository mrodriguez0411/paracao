export interface ActionResult {
  success: boolean;
  message: string;
}

export interface Actividad {
  id: string;
  nombre: string;
  precio: number;
  disciplina_id: string;
}
