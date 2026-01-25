import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("=== DEBUG ADMINS ===")
    
    const supabase = createServiceRoleClient()
    
    // 1. Verificar usuarios admin_disciplina
    const { data: admins, error: adminsError } = await supabase
      .from("profiles")
      .select("id, email, rol, nombre, apellido, created_at")
      .eq("rol", "admin_disciplina")
    
    console.log("Admins:", admins?.length || 0, "Error:", adminsError)
    
    // 2. Verificar disciplinas con admin_id
    const { data: disciplinas, error: disciplinasError } = await supabase
      .from("disciplinas")
      .select("id, nombre, admin_id")
      .not("admin_id", "is", null)
    
    console.log("Disciplinas con admin:", disciplinas?.length || 0, "Error:", disciplinasError)
    
    // 3. Verificar todos los usuarios y sus roles
    const { data: allProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("rol")
      .then(res => {
        const roles = res.data?.reduce((acc, profile) => {
          acc[profile.rol] = (acc[profile.rol] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        return { data: roles, error: res.error }
      })
    
    console.log("Roles distribution:", allProfiles, "Error:", profilesError)
    
    // 4. Simular la lógica de la página
    const transformedAdmins = admins?.map(admin => {
      const adminDisciplinas = disciplinas
        ?.filter(d => d.admin_id === admin.id)
        .map(d => ({ nombre: d.nombre }));

      return {
        ...admin,
        created_at: admin.created_at,
        disciplinas: adminDisciplinas || []
      };
    }) || [];
    
    return NextResponse.json({
      success: true,
      debug: {
        adminsCount: admins?.length || 0,
        disciplinasWithAdminCount: disciplinas?.length || 0,
        rolesDistribution: allProfiles,
        admins,
        disciplinas,
        transformedAdmins,
        adminsError: adminsError?.message,
        disciplinasError: disciplinasError?.message,
        profilesError: profilesError?.message
      }
    })
    
  } catch (error) {
    console.error("DEBUG ADMINS ERROR:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
