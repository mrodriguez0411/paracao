
import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase URL or service role key is not defined');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const sql = `
      -- Enable RLS for relevant tables
      ALTER TABLE public.grupos_familiares ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.miembros_familia ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.cuotas ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.inscripciones ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies to prevent conflicts
      DROP POLICY IF EXISTS "Socios can view their own family group." ON public.grupos_familiares;
      DROP POLICY IF EXISTS "Socios can view members of their own family group." ON public.miembros_familia;
      DROP POLICY IF EXISTS "Socios can view cuotas of their own family group." ON public.cuotas;
      DROP POLICY IF EXISTS "Socios can view inscripciones of their own family group." ON public.inscripciones;
      DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;

      -- RLS Policies for "socio" role

      -- Allow socios to view their own family group
      CREATE POLICY "Socios can view their own family group."
      ON public.grupos_familiares
      FOR SELECT
      TO authenticated
      USING (titular_id = auth.uid());

      -- Allow socios to view members of their family group
      CREATE POLICY "Socios can view members of their own family group."
      ON public.miembros_familia
      FOR SELECT
      TO authenticated
      USING (
        grupo_id IN (
          SELECT id FROM public.grupos_familiares WHERE titular_id = auth.uid()
        )
      );

      -- Allow socios to view cuotas of their family group
      CREATE POLICY "Socios can view cuotas of their own family group."
      ON public.cuotas
      FOR SELECT
      TO authenticated
      USING (
        grupo_id IN (
          SELECT id FROM public.grupos_familiares WHERE titular_id = auth.uid()
        )
      );

      -- Allow socios to view inscripciones of their family group
      CREATE POLICY "Socios can view inscripciones of their own family group."
      ON public.inscripciones
      FOR SELECT
      TO authenticated
      USING (
        miembro_id IN (
          SELECT id FROM public.miembros_familia WHERE grupo_id IN (
            SELECT id FROM public.grupos_familiares WHERE titular_id = auth.uid()
          )
        )
      );

      -- Allow users to view their own profile
      CREATE POLICY "Users can view their own profile."
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (id = auth.uid());
    `;

    const { error } = await supabase.rpc('execute_sql', { sql });

    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(200).json({ message: 'RLS policies applied successfully' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
