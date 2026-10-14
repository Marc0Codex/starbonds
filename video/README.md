# STARBONDS — Videos

Motion graphics hechos con [Remotion](https://www.remotion.dev). Usan la misma marca "Noche violeta", la estrella y a Plei que la app.

## Promo de 15 s (landing)
- **Composiciones:** `PromoVertical` (1080×1920) y `PromoHorizontal` (1920×1080).
- **Escenas:** Gancho → Comunidad → Match con Plei → Mercado y Mensajes → Cierre (`src/scenes/`).
- **Ritmo:** 30 fps y 120 BPM (1 tiempo = 15 cuadros). No lleva audio; agrega una pista libre de derechos al publicar.

## Explicativo de 30 s (redes)
- **Composiciones:** `ExplainerVertical` (1080×1920, Reels/TikTok/Shorts) y `ExplainerHorizontal` (1920×1080, YouTube/web).
- **Recorrido:** Intro → Perfil y portafolio → Comunidad → Grupos → Match → Mensajes → Mercado → Actividad → Seguridad y app → Cierre (`src/explainer/scenes/`).
- **Plei guía todo:** es una capa única sobre las escenas (`src/explainer/PleiGuide.tsx`) que vuela en arco de una escena a otra. Posiciones, estados de ánimo y reacciones están en `src/explainer/plei-path.ts`.
- **Tiempos:** `src/explainer/timing.ts` (10 escenas, transiciones de 10 cuadros, 900 cuadros en total).
- **Sonido:** efectos sintéticos generados por código (`scripts/make-sfx.mjs` → `public/sfx/*.wav`), sin música ni muestras con licencia. Se colocan con `<Sfx at={cuadro} name="pop" />`.

## Comandos
```bash
npm install
npm run studio              # vista previa interactiva
npm run render              # promo de 15 s: out/*.mp4 y portadas
npm run render:explainer    # explicativo de 30 s: out/starbonds-explainer-*.mp4
npm run sfx                 # regenera los efectos de sonido
```

- **Arte compartido con la app:** `../components/plei/plei-art.tsx` y `../components/brand/star-path.ts`.
- **Licencia de Remotion:** gratis para personas y empresas de hasta 3 empleados.
