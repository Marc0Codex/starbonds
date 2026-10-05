# STARBONDS

La red social para artistas emergentes: comunidad, marketplace, match para colaborar, actividad, perfil y configuración. Es una PWA instalable en celular y computadora.

## Stack

- **Next.js 16** (App Router, Server Actions, `proxy.ts`), React 19, TypeScript
- **Tailwind CSS v4** + shadcn/ui (Base UI), lucide-react
- **Supabase**: Postgres con RLS, Auth (email + Google), Storage y Realtime
- **next-intl**: español e inglés (cookie `NEXT_LOCALE`, selector en Configuración)
- **Vercel** para el hosting

## Desarrollo

```bash
cp .env.example .env.local   # completar con la URL y la publishable key de Supabase
npm install
npm run dev                  # http://localhost:3000
npm run lint && npm run build
```

## Base de datos

Las migraciones están en `supabase/migrations/` y se aplican al proyecto remoto `StarBonds` (`deyyrcruqjipchofigzz`).

- Las funciones privilegiadas viven en el esquema `private`, que no se expone. Las RPC públicas son `SECURITY INVOKER`.
- Las tablas tienen `GRANT` explícitos y RLS en todas; las columnas sensibles, como los contadores y el rol, no son editables por el cliente.
- Si cambias el esquema, vuelve a generar los tipos en `types/database.ts`.

Las RPC principales son `get_match_candidates`, `get_discover_feed`, `get_following_feed`, `start_conversation`, `mark_conversation_read` y `delete_account`.

## Producción

- **URL:** https://starbonds.vercel.app (proyecto `starbonds` en Vercel, equipo `kosmi-carp`).
- **Deploy:** cada push a `main` despliega automáticamente.
- **Variables de entorno:** vienen de la integración de Supabase en Vercel. La app solo usa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. `NEXT_PUBLIC_SITE_URL` es opcional: si no está, se usa el dominio de producción de Vercel.
- **Supabase Auth → URL Configuration:**
  - Site URL: `https://starbonds.vercel.app`
  - Redirect URLs: `https://starbonds.vercel.app/auth/callback` y `http://localhost:3000/auth/callback`
- **Privacidad:** la política está en `/privacy` (`components/legal/privacy-content.tsx`).

## Contenido demo

Match, Comunidad y Mensajes muestran artistas, publicaciones y conversaciones de ejemplo, marcados con la etiqueta **Demo**. Viven en `lib/demo.ts`, no en la base de datos, así que los swipes, likes y mensajes sobre ellos no se guardan y todo reaparece al refrescar. Los chats demo responden con mensajes predefinidos.

- **Apagar:** `NEXT_PUBLIC_DEMO_MODE=off`
- **Eliminar:** borrar `lib/demo.ts`, todos los imports de `@/lib/demo` (páginas de match, comunidad y mensajes), las ramas `demo` de `match-deck.tsx`, `post-card.tsx` y `chat-view.tsx`, y `components/demo-badge.tsx`

## Diseño

El sistema de diseño está en `design-system/starbonds/MASTER.md` y fue generado con la skill ui-ux-pro-max. Los tokens están en `app/globals.css`.

## Estructura

```
app/(auth)/          login, signup, server actions de auth
app/(app)/           secciones con sesión (sidebar en escritorio / nav inferior en móvil)
app/auth/callback    intercambio de código OAuth / confirmación por email
app/manifest.ts      manifest PWA (íconos en app/icons/[size])
lib/supabase/        clientes browser/server + refresco de sesión en proxy
i18n/, messages/     configuración de idioma y textos es/en
supabase/migrations  esquema, RLS, triggers, storage, tags
_legacy/             prototipo anterior (FastAPI + Vite), solo como referencia
```
