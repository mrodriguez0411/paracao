
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ChangePasswordForm from "@/components/admin/change-password-form";

export default async function EditAdminPage({ params }: { params: { id: string } }) {
    await requireAuth(["super_admin"]);
    const supabase = await createClient();

    const { data: admin, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.id)
        .single();

    if (error || !admin) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight" style={{ color: '#efb600' }}>Editar Administrador</h2>
            <ChangePasswordForm userId={admin.id} />
        </div>
    );
}
