# STARBONDS — Video promocional

Video de 15 s en motion graphics, hecho con [Remotion](https://www.remotion.dev). Usa la misma marca "Noche violeta", la estrella y a Plei que la app.

- **Composiciones:** `PromoVertical` (1080×1920, Reels/TikTok/Shorts) y `PromoHorizontal` (1920×1080, YouTube/web).
- **Escenas:** Gancho → Comunidad → Match con Plei → Mercado y Mensajes → Cierre (`src/scenes/`).
- **Ritmo:** 30 fps y 120 BPM (1 tiempo = 15 cuadros). No lleva audio; agrega una pista libre de derechos al publicar.
- **Arte compartido con la app:** `../components/plei/plei-art.tsx` y `../components/brand/star-path.ts`.

```bash
npm install
npm run studio    # vista previa interactiva
npm run render    # genera out/*.mp4 y las portadas *-poster.png
```

Licencia de Remotion: gratis para personas y empresas de hasta 3 empleados.
