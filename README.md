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

## Contenido demo

Match y Comunidad muestran artistas y publicaciones de ejemplo, marcados con la etiqueta **Demo**. Viven en `lib/demo.ts`, no en la base de datos, así que los swipes y likes sobre ellos no se guardan y reaparecen al refrescar.

- **Apagar:** `NEXT_PUBLIC_DEMO_MODE=off`
- **Eliminar:** borrar `lib/demo.ts` y sus usos (`withDemoCandidates` y `withDemoPosts`, más el manejo de `demo` en `match-deck.tsx` y `post-card.tsx`)

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
