// supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parsear el cuerpo de la solicitud
    const { to, subject, html, from } = await req.json()

    // Validar los parámetros
    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ 
          status: 'error',
          message: 'Faltan parámetros requeridos',
          required: ['to', 'subject', 'html']
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Configurar el servicio de correo (ejemplo con Resend)
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const EMAIL_FROM = from || Deno.env.get('EMAIL_FROM') || 'noreply@tudominio.com'
    
    if (!RESEND_API_KEY) {
      console.error('Error: RESEND_API_KEY no está configurada')
      return new Response(
        JSON.stringify({ 
          status: 'error',
          message: 'Configuración del servidor incompleta'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Enviar el correo usando Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: to,
        subject: subject,
        html: html
      })
    })

    const result = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('Error al enviar el correo:', result)
      return new Response(
        JSON.stringify({ 
          status: 'error',
          message: 'Error al enviar el correo',
          details: result
        }),
        { 
          status: resendResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Éxito
    return new Response(
      JSON.stringify({ 
        status: 'success',
        message: 'Correo enviado correctamente',
        data: result
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error inesperado:', error)
    return new Response(
      JSON.stringify({ 
        status: 'error',
        message: 'Error interno del servidor',
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})