
import { requireAuth } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { MiDisciplinaDashboard } from "@/components/admin/mi-disciplina-dashboard";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  // 1. Autenticación y obtención del perfil
  const profile = await requireAuth(["admin_disciplina"]);
  if (!profile) {
    redirect("/auth/login");
  }

  // 2. Llamada a la base de datos para obtener los miembros
  const supabaseService = createServiceRoleClient();
  const { data: miembros, error } = await supabaseService.rpc(
    "get_miembros_por_disciplina",
    { admin_id_param: profile.id }
  );

  // 3. Manejo de errores
  if (error) {
    console.error("Error al cargar los datos para el dashboard:", error.message);
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight text-red-500">Error al Cargar el Resumen</h2>
        <p className="text-muted-foreground">
          No se pudieron cargar las estadísticas de la disciplina. <br />
          <small>Detalle: {error.message}</small>
        </p>
      </div>
    );
  }

  // 4. Cálculo de las estadísticas
  const miembrosData = miembros || [];
  const totalInscriptos = miembrosData.length;
  const totalAbonados = miembrosData.filter(m => m.estado_cuota === 'Al día').length;
  const totalPendientes = totalInscriptos - totalAbonados;

  // 5. Renderizado de la página del dashboard
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight" style={{color: '#efb600'}}>Resumen de mi Disciplina</h2>
        <p className="text-muted-foreground" style={{color: '#efb600'}}>
          Un vistazo rápido al estado actual de tus miembros y cuotas.
        </p>
      </div>

      <MiDisciplinaDashboard 
        totalInscriptos={totalInscriptos}
        totalAbonados={totalAbonados}
        totalPendientes={totalPendientes}
      />

      {/* Aquí se podrían añadir más tarjetas o gráficos en el futuro */}
    </div>
  );
}
