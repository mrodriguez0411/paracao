import { createServiceRoleClient } from './lib/supabase/server';
import fs from 'fs';
import path from 'path';

async function run() {
    const supabase = createServiceRoleClient();
    const sql = fs.readFileSync(path.resolve('./scripts/rls_para_admin_disciplina.sql')).toString();

    const { error } = await supabase.rpc('execute_sql', { sql });

    if (error) {
        console.error(error);
    } else {
        console.log('RLS policies applied successfully');
    }
}

run();
