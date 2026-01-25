
import { requireAuth } from "@/lib/auth"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { AdminsTable } from "@/components/admin/admins-table"

export default async function AdminsPage() {
  await requireAuth(["super_admin"])
  const supabase = createServiceRoleClient()

  // Step 1: Fetch all admins with all fields required by the table
  const { data: admins, error: adminsError } = await supabase
    .from("profiles")
    .select("id, nombre, apellido, email, telefono, created_at")
    .eq("rol", "admin_disciplina");

  if (adminsError) {
    console.error('[admins-page] Error fetching admins:', adminsError);
  }

  // Step 2: Fetch all disciplines with their assigned admin
  const { data: disciplinas, error: disciplinasError } = await supabase
    .from("disciplinas")
    .select("nombre, admin_id")
    .not("admin_id", "is", null);

  if (disciplinasError) {
    console.error('[admins-page] Error fetching disciplinas:', disciplinasError);
  }

  // Step 3: Combine the data to match the structure expected by AdminsTable
  const transformedAdmins = admins?.map(admin => {
    // Find disciplines for the current admin and format them correctly
    const adminDisciplinas = disciplinas
      ?.filter(d => d.admin_id === admin.id)
      .map(d => ({ nombre: d.nombre })); // Create the { nombre: '...' } structure

    return {
      ...admin,
      nombre_completo: `${admin.nombre} ${admin.apellido}`.trim(), // Combine nombre and apellido
      created_at: admin.created_at, // Ensure created_at is passed
      disciplinas: adminDisciplinas || [] // Add the correctly formatted adisciplinas array
    };
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight" style={{color: '#efb600'}}>Administradores de Disciplina</h2>
          <p className="text-muted-foreground" style={{color: '#efb600'}}>Gestiona los administradores de cada disciplina</p>
        </div>
        <Button asChild className="bg-[#efb600] hover:bg-[#efb600]/90 text-white" >
          <Link href="/admin/admins/nuevo" style={{color: '#1e3a8a'}}>
            <Plus className="mr-2 h-4 w-4"/>
            Nuevo Admin
          </Link>
        </Button>
      </div>

      <AdminsTable admins={transformedAdmins} />
    </div>
  )
}
