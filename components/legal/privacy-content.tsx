// Privacy policy text. Should be reviewed by a lawyer before a wide launch (template, not legal advice).

export const PRIVACY_UPDATED = "2026-10-05"

type Section = { id: string; title: string; body: (string | string[])[] }

const es: Section[] = [
  {
    id: "quienes",
    title: "Quiénes somos",
    body: [
      "STARBONDS es una red social para artistas emergentes: comunidad, mercado, match para colaborar y mensajes. Esta política explica qué datos recopilamos, para qué los usamos y qué control tienes sobre ellos.",
      "Responsable del tratamiento: Marco Antonio Calderón, con domicilio en Costa Rica. Contacto de privacidad: marcoantonio.calderonc@gmail.com.",
    ],
  },
  {
    id: "datos",
    title: "Qué datos recopilamos",
    body: [
      "Datos que nos das directamente:",
      [
        "Cuenta: correo electrónico y contraseña (la contraseña se guarda cifrada por nuestro proveedor de autenticación; nosotros nunca la vemos).",
        "Perfil: nombre artístico, nombre de usuario, biografía, ubicación, sitio web, avatar y tus tags de técnicas, estilos y objetivos.",
        "Contenido: obras e imágenes, publicaciones, comentarios, grupos y publicaciones del mercado (precio, descripción e imágenes).",
        "Mensajes: las conversaciones privadas con otros artistas.",
        "Reportes que envíes sobre otros usuarios o contenidos.",
      ],
      "Datos que se generan al usar la app:",
      [
        "Interacciones: likes, seguidores, swipes del Match (conectar o pasar), matches, membresías de grupos, bloqueos y notificaciones.",
        "Datos técnicos mínimos necesarios para que el servicio funcione, como registros del servidor (dirección IP, fecha y hora de las solicitudes).",
      ],
      "No recopilamos datos de pago: por ahora las ventas se acuerdan directamente entre artistas por chat.",
    ],
  },
  {
    id: "uso",
    title: "Para qué los usamos",
    body: [
      [
        "Crear y mantener tu cuenta e iniciar sesión.",
        "Mostrar tu perfil, portafolio, publicaciones y ventas a otros usuarios.",
        "Sugerirte artistas afines en el Match según los tags que compartes.",
        "Ordenar el feed Descubrir dando más visibilidad a artistas con pocos seguidores.",
        "Entregar tus mensajes y avisarte de actividad (likes, comentarios, seguidores, matches).",
        "Mantener la seguridad de la comunidad: bloqueos, reportes y prevención de abusos.",
      ],
      "No vendemos tus datos, no mostramos publicidad y no usamos rastreadores de terceros.",
    ],
  },
  {
    id: "publico",
    title: "Qué es público y qué es privado",
    body: [
      [
        "Público (visible incluso sin cuenta): tu perfil, portafolio, publicaciones fuera de grupos privados, comentarios en ellas y tus publicaciones del mercado que no estén ocultas.",
        "Solo para usuarios con sesión: el feed, el Match y los grupos.",
        "Privado: tus mensajes (solo los ven los dos participantes), tus swipes, tus bloqueos, tus reportes y tus notificaciones.",
      ],
      "Si desactivas «Abierto a colaborar» en tu perfil, dejas de aparecer en el Match de otros artistas.",
    ],
  },
  {
    id: "proveedores",
    title: "Proveedores y dónde se guardan los datos",
    body: [
      "Usamos proveedores que tratan los datos en nuestro nombre:",
      [
        "Supabase: base de datos, autenticación, almacenamiento de imágenes y mensajes en tiempo real. Los datos se alojan en Estados Unidos (región us-east-1).",
        "Vercel: alojamiento de la aplicación web.",
        "Google Fonts: tipografías de la interfaz (se descargan desde servidores de Google).",
      ],
      "Al usar STARBONDS, tus datos pueden transferirse y guardarse fuera de tu país. Solo compartimos tus datos con estos proveedores para operar el servicio y bajo sus propias medidas de seguridad y confidencialidad.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies y almacenamiento local",
    body: [
      "Solo usamos cookies necesarias para que la app funcione:",
      [
        "Cookies de sesión de autenticación (para mantenerte con la sesión iniciada).",
        "NEXT_LOCALE: recuerda el idioma que elegiste en Configuración.",
      ],
      "No usamos cookies de analítica ni de publicidad.",
    ],
  },
  {
    id: "conservacion",
    title: "Cuánto tiempo los guardamos",
    body: [
      "Guardamos tus datos mientras tu cuenta esté activa. Puedes borrar publicaciones, obras, comentarios y ventas en cualquier momento.",
      "Si eliminas tu cuenta, borramos tu perfil y todo lo asociado (obras, publicaciones, mensajes, matches, ventas y archivos). Las copias de seguridad de nuestros proveedores pueden conservar datos por un tiempo limitado antes de borrarse. Los reportes que hayas enviado pueden conservarse de forma anónima por motivos de seguridad.",
    ],
  },
  {
    id: "derechos",
    title: "Tus derechos y controles",
    body: [
      [
        "Acceder y corregir: puedes ver y editar tu perfil en cualquier momento.",
        "Eliminar: en Configuración › Zona de peligro puedes borrar tu cuenta y tus datos.",
        "Bloquear y reportar: desde el menú de cualquier perfil.",
        "Solicitar una copia de tus datos u oponerte a un tratamiento: escríbenos a marcoantonio.calderonc@gmail.com.",
      ],
      "Tratamos tus datos conforme a la Ley N.º 8968 de Protección de la Persona frente al Tratamiento de sus Datos Personales de Costa Rica. Puedes presentar una reclamación ante la Agencia de Protección de Datos de los Habitantes (PRODHAB) o ante la autoridad de tu país.",
    ],
  },
  {
    id: "seguridad",
    title: "Seguridad",
    body: [
      "Aplicamos controles de acceso a nivel de base de datos para que cada persona solo pueda leer y modificar lo que le corresponde, conexiones cifradas (HTTPS) y almacenamiento de contraseñas cifradas. Ningún sistema es infalible: si detectamos un incidente que te afecte, te lo informaremos.",
    ],
  },
  {
    id: "menores",
    title: "Menores de edad",
    body: [
      "STARBONDS no está dirigido a menores de 16 años. Si crees que un menor nos dio sus datos, escríbenos a marcoantonio.calderonc@gmail.com y los eliminaremos.",
    ],
  },
  {
    id: "cambios",
    title: "Cambios a esta política",
    body: [
      "Podemos actualizar esta política cuando la app cambie (por ejemplo, cuando agreguemos pagos). Publicaremos la versión nueva aquí con su fecha y, si el cambio es importante, te avisaremos dentro de la app.",
    ],
  },
]

const en: Section[] = [
  {
    id: "who",
    title: "Who we are",
    body: [
      "STARBONDS is a social network for emerging artists: community, marketplace, matching to collaborate, and messages. This policy explains what data we collect, why we use it, and what control you have over it.",
      "Data controller: Marco Antonio Calderón, based in Costa Rica. Privacy contact: marcoantonio.calderonc@gmail.com.",
    ],
  },
  {
    id: "data",
    title: "What data we collect",
    body: [
      "Data you give us directly:",
      [
        "Account: email and password (the password is stored hashed by our authentication provider; we never see it).",
        "Profile: artist name, username, bio, location, website, avatar, and your medium, style, and goal tags.",
        "Content: artworks and images, posts, comments, groups, and marketplace listings (price, description, and images).",
        "Messages: private conversations with other artists.",
        "Reports you send about other users or content.",
      ],
      "Data generated when you use the app:",
      [
        "Interactions: likes, followers, Match swipes (connect or pass), matches, group memberships, blocks, and notifications.",
        "Minimal technical data required to run the service, such as server logs (IP address, date and time of requests).",
      ],
      "We don't collect payment data: for now, sales are arranged directly between artists in the chat.",
    ],
  },
  {
    id: "use",
    title: "How we use it",
    body: [
      [
        "Create and maintain your account and sign you in.",
        "Show your profile, portfolio, posts, and listings to other users.",
        "Suggest like-minded artists in Match based on the tags you share.",
        "Rank the Discover feed to give more visibility to artists with few followers.",
        "Deliver your messages and notify you about activity (likes, comments, followers, matches).",
        "Keep the community safe: blocks, reports, and abuse prevention.",
      ],
      "We don't sell your data, show ads, or use third-party trackers.",
    ],
  },
  {
    id: "visibility",
    title: "What's public and what's private",
    body: [
      [
        "Public (visible even without an account): your profile, portfolio, posts outside private groups, comments on them, and listings that aren't hidden.",
        "Signed-in users only: the feed, Match, and groups.",
        "Private: your messages (only the two participants can see them), your swipes, blocks, reports, and notifications.",
      ],
      "If you turn off “Open to collaborate” in your profile, you stop appearing in other artists' Match.",
    ],
  },
  {
    id: "providers",
    title: "Service providers and where data is stored",
    body: [
      "We use providers that process data on our behalf:",
      [
        "Supabase: database, authentication, image storage, and realtime messaging. Data is hosted in the United States (us-east-1 region).",
        "Vercel: hosting for the web app.",
        "Google Fonts: interface typefaces (downloaded from Google's servers).",
      ],
      "By using STARBONDS, your data may be transferred to and stored outside your country. We only share your data with these providers to run the service, under their own security and confidentiality measures.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies and local storage",
    body: [
      "We only use cookies needed for the app to work:",
      [
        "Authentication session cookies (to keep you signed in).",
        "NEXT_LOCALE: remembers the language you chose in Settings.",
      ],
      "We don't use analytics or advertising cookies.",
    ],
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: [
      "We keep your data while your account is active. You can delete posts, artworks, comments, and listings at any time.",
      "If you delete your account, we delete your profile and everything associated with it (artworks, posts, messages, matches, listings, and files). Our providers' backups may retain data for a limited time before it is erased. Reports you sent may be kept anonymously for safety reasons.",
    ],
  },
  {
    id: "rights",
    title: "Your rights and controls",
    body: [
      [
        "Access and correct: you can view and edit your profile at any time.",
        "Delete: in Settings › Danger zone you can delete your account and your data.",
        "Block and report: from the menu on any profile.",
        "Request a copy of your data or object to processing: email us at marcoantonio.calderonc@gmail.com.",
      ],
      "We process your data under Costa Rica's Law No. 8968 on the Protection of Individuals regarding the Processing of their Personal Data. You can file a complaint with Costa Rica's Data Protection Agency (PRODHAB) or with the authority in your country.",
    ],
  },
  {
    id: "security",
    title: "Security",
    body: [
      "We use database-level access controls so each person can only read and change what belongs to them, encrypted connections (HTTPS), and hashed password storage. No system is perfect: if we detect an incident that affects you, we'll let you know.",
    ],
  },
  {
    id: "minors",
    title: "Minors",
    body: [
      "STARBONDS is not intended for people under 16. If you believe a minor has given us their data, email marcoantonio.calderonc@gmail.com and we'll delete it.",
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: [
      "We may update this policy as the app changes (for example, when we add payments). We'll publish the new version here with its date and, if the change is significant, let you know in the app.",
    ],
  },
]

export function privacySections(locale: string) {
  return locale === "en" ? en : es
}
