# STARBONDS — Handoff

> Léelo completo antes de trabajar en el proyecto. Última actualización: 2026-10-05 (commit `f8582d0`).
> Al terminar una sesión de trabajo, actualiza las secciones **Estado** y **Pendientes**.

## Qué es
PWA de red social para artistas emergentes a quienes les cuesta que su arte se vea: comunidad, marketplace (obras + servicios), match tipo swipe para colaborar, mensajes en tiempo real, actividad, perfil y ajustes. Bilingüe es/en. Mascota: **Plei**, una estrella (nombre por las Pléyades) que vive en Match.

- **Producción:** https://starbonds.vercel.app (push a `main` = deploy automático)
- **Repo (público):** https://github.com/Marc0Codex/starbonds
- **Local:** `C:\Users\marco\Documents\starbonds`
- **Dueño:** Marco Antonio Calderón (Costa Rica). Cuenta real en la app: **@kosmicorpse**. No crear ni cambiar datos en ella al probar.
- **Idioma con el usuario:** español.

## Stack
| Pieza | Detalle |
|---|---|
| Framework | **Next.js 16.3** (App Router, Turbopack). `proxy.ts` reemplaza middleware; `params`/`searchParams`/`cookies` son async; tipos `PageProps<"/ruta">`, `LayoutProps`. **Leer `AGENTS.md` y la doc en `node_modules/next/dist/docs/` antes de escribir código Next.** |
| UI | Tailwind v4, shadcn "base-nova" (Base UI: se usa la prop `render`, no `asChild`), lucide, sonner |
| i18n | next-intl 4, locale por cookie `NEXT_LOCALE` (sin segmento `[locale]`), `messages/es.json` y `en.json`, `timeZone: "UTC"` |
| Backend | Supabase, proyecto "StarBonds", ref `deyyrcruqjipchofigzz` (us-east-1), `@supabase/ssr` con `getClaims()` y la clave **publishable** |
| Hosting | Vercel, team `kosmi-carp`, proyecto `starbonds`, con la integración de Supabase |
| Video | Remotion 4 en `video/` (paquete aparte, fuera del tsconfig, eslint y build de la app) |

## Variables de entorno (nunca al repo)
`.env.local` está en `.gitignore`; en el repo solo va `.env.example`. En Vercel las inyecta la integración de Supabase.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (opcional; si falta se usa `VERCEL_PROJECT_PRODUCTION_URL`, y si no, localhost)
- `NEXT_PUBLIC_DEMO_MODE=off` apaga el contenido demo

La clave secreta o `service_role` no se usa en ninguna parte y no debe usarse en el cliente.

## Mapa del código
- `app/page.tsx`: landing, con el video promo (`components/landing/promo-video.tsx`, mp4 en `public/videos/`)
- `app/(auth)/`: login, signup (email + contraseña; **Google login fuera de alcance por ahora**). `app/onboarding/`
- `app/(app)/`: área con sesión: `community` (+ `groups/[slug]`), `marketplace` (`new`, `[id]/edit`), `match`, `messages` (+ `[id]`), `activity`, `profile` (`edit`, `artworks/new`), `settings`
- `app/(public)/`: páginas sin sesión: `u/[username]`, `artworks/[id]`, `posts/[id]`, `listing/[id]`, `privacy`, `qr`
- `app/qr/png`, `app/qr/svg`: descargas estáticas del QR (`lib/qr.ts`; siempre codifica `publicAppUrl()`, nunca localhost)
- `app/offline`, `app/icons/[size]`, `manifest.ts`, `opengraph-image.tsx`, `robots.ts`, `public/sw.js` (fallback offline)
- `lib/supabase/{client,server,proxy,realtime}.ts`. **Las rutas públicas están en `PUBLIC_PATHS` dentro de `lib/supabase/proxy.ts`; una ruta pública nueva hay que agregarla ahí.**
- `lib/`: `profile`, `posts`, `groups`, `match`, `messages`, `listings`, `activity`, `format`, `uploads`, `storage`, `site`, `demo`, `qr`
- `components/plei/` (mascota; `plei-art.tsx` la comparte con el video), `components/brand/star-path.ts`
- `components/legal/privacy-content.tsx`: política de privacidad es/en (Ley 8968 / PRODHAB, edad mínima 16)
- `supabase/migrations/`: fuente de verdad del esquema
- `design-system/`: referencias de diseño; `_legacy/`: prototipos viejos (ignorado)

## Base de datos y seguridad
- **Tablas:** profiles, tags, profile_tags, artworks, groups, group_members, posts, likes, comments, follows, listings, swipes, conversations (una por par, `user_a < user_b`), matches, messages, notifications, blocks, reports.
- **Buckets:** `avatars` y `artworks` (públicos, carpeta = uid), `chat-media` (privado, carpeta = id de conversación).
- **RLS activo en todas las tablas**, con políticas por dueño. La revisión de seguridad del 2026-10-05 agregó (migraciones `rls_hardening` y `column_insert_grants`):
  - membresía explícita en los mensajes;
  - los bloqueos impiden likes, comentarios y swipes;
  - permisos de INSERT/UPDATE **por columna**, así que el cliente no puede escribir `created_at`, contadores ni `role`.
- **Convenciones obligatorias:**
  - No hay Docker en esta máquina. Escribir la migración en `supabase/migrations/` **y** aplicarla con el MCP de Supabase (`apply_migration`). Luego correr `get_advisors` (security).
  - Las tablas nuevas **no** se exponen solas: hacen falta `GRANT` explícitos (por columna para escribir) y RLS con políticas.
  - El código `SECURITY DEFINER` va en el esquema `private`; las RPC públicas son wrappers `SECURITY INVOKER`. Usar `search_path = ''`.
  - Para probar RLS: un bloque `DO` con usuarios temporales en `auth.users`, `set local role authenticated` + `request.jwt.claims`, y al final `raise exception` para revertir todo.
- **Realtime:** llamar `authorizeRealtime()` (`lib/supabase/realtime.ts`) antes de suscribirse; si no, no llegan los eventos protegidos por RLS.

## Diseño: "Noche violeta"
Canvas: https://claude.ai/artifact/UeBpfFxnvg9VRxhRN5jVpK. Solo modo oscuro, **colores planos y sin gradientes**, nada de "AI slop", minimalista y creativo.
- Tokens en `app/globals.css`: ink `#0d0a12`, card `#16101f`, raise `#1f1730`, plum `#3b1f6b`, grape `#5b2a86`, **lavender `#bfa8ff`** (primario), **spark `#dfff4f`** (con moderación), paper `#f1ebf8`, mist `#a99cbd`, border `#2d2240`.
- Fuentes: Syne (títulos), Instrument Sans (cuerpo), Instrument Serif itálica (`.serif-accent`).
- Animaciones como clases CSS (`reveal`, `rise-in`, `pop`, `press`, `lift`, `plei-*`…), siempre respetando `prefers-reduced-motion`.

## Contenido demo (permanente, se quita solo si el usuario lo pide)
Todo vive en `lib/demo.ts` y no se guarda en Supabase: 5 artistas, 4 posts y 2 conversaciones (`demo-chat-*`).
- **Usos:** páginas de match, community, messages y messages/[id]; ramas "demo" en `match-deck.tsx`, `post-card.tsx` y `chat-view.tsx`; `components/demo-badge.tsx`; namespace `demo` en los mensajes; campos opcionales `demo` en los tipos.
- **Interruptor rápido:** `NEXT_PUBLIC_DEMO_MODE=off`.

## Lint y gotchas
- `react-hooks/purity`: nada de `Date.now()` en el render; en el servidor usar `getNow()` de next-intl.
- `react-hooks/set-state-in-effect`: para saber si está montado, usar `useSyncExternalStore`.
- No asignar `ref.current` en el render, ni definir componentes dentro del render.
- Un archivo `"use server"` solo puede exportar funciones async; las constantes van en otro archivo.
- Las PNG de `next/og` se generan con `ImageResponse` (ver `app/opengraph-image.tsx`).

## Cómo trabajar
- **Verificar:** `npx tsc --noEmit`, `npx eslint lib app components`, `npm run build`.
- **Servidor de dev:** la máquina tiene poca memoria. **No reiniciar `next dev` por tu cuenta**; pedírselo al usuario. Para probar, usar `npx next start -p 3100` tras el build y apagarlo al terminar.
- **Probar en el navegador:** Chrome del usuario (extensión Claude in Chrome). Detalle: hacer clic por `ref` a veces solo desplaza la página; repetir el clic por coordenadas.
- **Commits:** en inglés, descriptivos, push a `main` (despliega solo). Confirmar el deploy en producción.
- **Skills instaladas que hay que usar:** `ui-ux-pro-max` (diseño), skills de Supabase (`supabase`, `supabase-postgres-best-practices`), y Claude Design o Artifacts para propuestas visuales.

## Estado (2026-10-05)
Fases 0–8 completas y en producción:
- base y auth;
- onboarding, perfil y portafolio;
- comunidad (feed, posts, likes, comentarios, follows, grupos);
- match con Plei;
- mensajes en tiempo real con badge de no leídos;
- marketplace (crear, editar, filtrar, contactar al vendedor por chat);
- actividad (notificaciones), bloquear, reportar y borrar cuenta;
- privacidad, PWA offline, OG, headers de seguridad;
- video promo de 15 s (vertical y horizontal) en la landing;
- página `/qr` con descargas PNG/SVG;
- revisión de seguridad y endurecimiento de RLS.

## Pendientes
**Tareas del usuario en los paneles** (no se pueden hacer desde aquí):
- Supabase → Authentication → URL Configuration: Site URL `https://starbonds.vercel.app` y Redirect URLs `https://starbonds.vercel.app/auth/callback` y `http://localhost:3000/auth/callback`.
- Supabase → Authentication → activar **Leaked password protection** (es el único aviso que queda en el análisis de seguridad).
- Vercel: opcionalmente, borrar las variables secretas que agregó la integración y que no se usan.

**No construido todavía:**
- Adjuntos de imagen en el chat. El bucket y las políticas ya existen, y `media_path` debe empezar con `<conversation_id>/`.
- Fase 9 (no pedida aún): pagos con Stripe Connect, notificaciones push, matching con IA, app nativa con Capacitor, Google login.
- Ideas opcionales: versión del video en inglés o de 30 s, dominio propio. Con dominio propio hay que definir `NEXT_PUBLIC_SITE_URL` y **reimprimir los QR**.
