
import { createServiceRoleClient } from "@/lib/supabase/server";
import {NextResponse} from "next/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const { newPassword } = await req.json();

    if (!newPassword) {
        return NextResponse.json({ error: 'La nueva contraseña es obligatoria' }, { status: 400 });
    }

    const supabaseAdmin = createServiceRoleClient();

    const { error } = await supabaseAdmin.auth.admin.updateUserById(
        params.id,
        { password: newPassword }
    );

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Contraseña actualizada correctamente' });
}
