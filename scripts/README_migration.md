Instrucciones de migración para nuevo proyecto Supabase

Sigue estos pasos en el nuevo proyecto Supabase para recrear tu esquema y triggers.

1) Habilitar extensiones necesarias

En el SQL Editor ejecuta primero:

```sql
-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- opcional
```

2) Ejecutar scripts en este orden

- `scripts/001_create_tables.sql`
- `scripts/002_create_profile_trigger.sql`
- `scripts/fix_auth_trigger.sql` (archivo que añadimos para asegurar triggers)

Opcional: `scripts/003_insert_super_admin.sql` si quieres marcar un perfil existente como super_admin (editalo antes con el email correcto).

3) Notas importantes / checks

- Si alguno de los scripts falla por permisos, revisa que estás usando el proyecto correcto y que tu cuenta tiene privilegios de Owner.
- Verifica que la tabla `public.profiles` exista y que el trigger `on_auth_user_created` está creado.
- Verifica que el usuario de prueba exista en `auth.users` o crea uno desde el panel de Authentication → Users (Invite) o usando el formulario `/auth/signup` de la app.

4) Recomendación para pruebas locales (evitar emails)

En el proyecto Supabase, Settings → Auth → Email → puedes desactivar temporalmente "Confirm email" para pruebas locales, o configurar un SMTP si quieres que se envíen correos.

5) Reiniciar tu app local

Después de actualizar `.env.local` con las nuevas credenciales (Project URL y anon key), reinicia tu servidor de desarrollo.

PowerShell (en la raíz del proyecto):

```powershell
# si usas pnpm
pnpm install
pnpm dev

# si usas npm
npm install
npm run dev
```

6) Probar signup/login

- Abre http://localhost:3000/auth/signup y crea un usuario.
- Comprueba en Supabase Dashboard → Authentication → Users que el usuario quedó creado en `auth.users`.
- Comprueba también `public.profiles` que se creó el perfil (trigger).

Si algo falla, copia aquí el error exacto y lo reviso.
