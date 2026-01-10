import { requireAuth } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { MiDisciplinaDashboard } from "@/components/admin/mi-disciplina-dashboard";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  // Usamos los roles como strings, que es el patrón existente en la app
  const profile = await requireAuth(["super_admin", "admin_disciplina"]);
  if (!profile) {
    redirect("/auth/login");
  }

  const supabaseService = createServiceRoleClient();

  let dashboardProps;

  // Comparamos el rol con un string
  if (profile.rol === "super_admin") {
    // --- Lógica para SUPER ADMIN con RPC ---
    const { data, error } = await supabaseService.rpc('get_super_admin_dashboard_stats');

    if (error) {
        console.error("[dashboard-page] Error fetching super admin stats:", error);
        dashboardProps = {
            isSuperAdmin: true,
            gruposFamiliares: 0,
            disciplinasActivas: 0,
            cuotasPendientes: 0,
            recaudadoMes: 0
        };
    } else {
        const stats = data[0] || {}; // Agregamos un fallback por si data[0] es undefined
        dashboardProps = {
            isSuperAdmin: true,
            gruposFamiliares: stats.grupos_familiares_count || 0,
            disciplinasActivas: stats.disciplinas_activas_count || 0,
            cuotasPendientes: stats.cuotas_pendientes_count || 0,
            recaudadoMes: stats.recaudado_mes_sum || 0
        };
    }

  } else {
    // --- Lógica para ADMIN DISCIPLINA ---
    const { data: miembros, error } = await supabaseService.rpc(
      "get_miembros_por_disciplina",
      { admin_id_param: profile.id }
    );

    if (error) {
        console.error("[dashboard-page] Error fetching discipline stats:", error);
    }

    const miembrosData = miembros || [];
    const totalInscriptos = miembrosData.length;
    const totalAbonados = miembrosData.filter(m => m.estado_cuota === 'Al día').length;
    const totalPendientes = totalInscriptos - totalAbonados;

    dashboardProps = {
      isSuperAdmin: false,
      totalInscriptos: totalInscriptos,
      totalAbonados: totalAbonados,
      totalPendientes: totalPendientes
    };
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight" style={{color: '#efb600'}}>
          {dashboardProps.isSuperAdmin ? 'Dashboard' : 'Resumen de mi Disciplina'}
        </h2>
        <p className="text-muted-foreground" style={{color: '#efb600'}}>
          Bienvenido, {profile.nombre_completo || 'Administrador'}
        </p>
      </div>
      <MiDisciplinaDashboard {...dashboardProps} />
    </div>
  );
}
