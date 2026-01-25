'''
import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return NextResponse.json({
    "NEXT_PUBLIC_SUPABASE_URL_is_present": !!supabaseUrl,
    "SUPABASE_SERVICE_ROLE_KEY_is_present": !!supabaseServiceRoleKey,
    "Partial_Service_Key": supabaseServiceRoleKey ? `...${supabaseServiceRoleKey.slice(-4)}` : "missing"
  });
}
'''