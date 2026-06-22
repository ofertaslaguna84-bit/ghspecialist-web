# GH Specialist - Guia Paso a Paso para Wix Editor

---

## RESUMEN RAPIDO

Esta guia te lleva seccion por seccion para construir el sitio completo de GH Specialist en Wix. Usa los documentos complementarios:
- **GH_Website_Content.md** → Todo el texto/copy
- **GH_Design_Guide.md** → Colores, fuentes, layout
- **GH_Blog_Strategy.md** → Estrategia y estructura del blog

---

## PASO 0: CONFIGURACION INICIAL

### Crear el sitio:
1. Ve a **wix.com** y entra a tu cuenta
2. Click en **"Create New Site"**
3. Selecciona **"Business"** como tipo de sitio
4. **NO uses una plantilla** — selecciona **"Start from Scratch"** con el Wix Editor clasico (no Wix ADI)
5. Esto te da control total del diseno

### Configurar dominio:
1. Ve a **Settings > Domains**
2. Si ya tienes dominio en Wix, conectalo
3. Si tu dominio esta en otro registrador, sigue las instrucciones de Wix para apuntar DNS

### Configurar fuentes globales:
1. Click en cualquier texto de la pagina
2. Ve a **"Site Design"** (icono de paleta en el menu izquierdo)
3. Click **"Text"**
4. Configura cada nivel:
   - **Heading 1:** Poppins Bold, 52px, #1A1A2E
   - **Heading 2:** Poppins Semi-Bold, 38px, #1A1A2E
   - **Heading 3:** Poppins Semi-Bold, 26px, #1A1A2E
   - **Heading 4:** Poppins Medium, 20px, #1A1A2E
   - **Paragraph 1:** Inter Regular, 17px, #4A4A5A
   - **Paragraph 2:** Inter Regular, 14px, #9E9EAE

### Configurar colores globales:
1. En **"Site Design"** > **"Colors"**
2. Agrega tu paleta personalizada:
   - Color 1: #7C4DFF (morado primario)
   - Color 2: #5C35CC (morado oscuro)
   - Color 3: #EDE7FF (morado claro)
   - Color 4: #1A1A2E (negro)
   - Color 5: #F5F5FA (gris fondo)

---

## PASO 1: HEADER (Barra de Navegacion)

1. Click en el **header** de la pagina (arriba)
2. **"Change Header Design"** > Elige un estilo limpio
3. **Logo:**
   - Click "Add" en el header
   - Sube tu logo (2.png)
   - Posicion: izquierda
   - Tamano: aprox 150px de ancho
4. **Menu de navegacion:**
   - Agrega un menu horizontal
   - Paginas: Inicio, Servicios, Casos de Exito, Precios, Blog, Contacto
   - Fuente: Poppins Medium 15px
   - Color: #1A1A2E / Hover: #7C4DFF
5. **Boton CTA:**
   - Agrega un boton a la derecha del menu
   - Texto: "Agenda tu Consulta Gratis"
   - Estilo: Fondo #7C4DFF, texto blanco, border-radius 8px
   - Link: a la seccion del formulario de contacto
6. **Header fijo:** Activa "Freeze header" para que se quede visible al scrollear

---

## PASO 2: HERO SECTION

1. **Agrega una seccion nueva** (click "+" entre secciones)
2. Selecciona un layout de **strip/seccion** en blanco
3. **Fondo:** Blanco o gradiente suave (blanco a #F5F5FA)
4. **Layout: 2 columnas** (60% texto izquierda, 40% imagen derecha)

### Columna izquierda:
5. **Headline (H1):**
   - Texto: "Automatiza tu Negocio con Inteligencia Artificial y Multiplica tus Resultados"
   - Poppins Bold, 48px, color #1A1A2E
6. **Subtitulo:**
   - Texto del contenido (ver GH_Website_Content.md seccion Hero)
   - Inter Regular, 18px, color #4A4A5A
   - Margen superior: 20px
7. **Botones (2 juntos):**
   - Boton 1: "Quiero Automatizar mi Negocio →" — fondo #7C4DFF, texto blanco
   - Boton 2: "Ver Casos de Exito" — borde #7C4DFF, fondo transparente
   - Margen superior: 30px
8. **Texto de confianza:**
   - "+50 empresas ya automatizan con nosotros | Resultados en 30 dias"
   - Inter Regular, 14px, color #9E9EAE

### Columna derecha:
9. Agrega una imagen de mockup o ilustracion de IA/tecnologia
   - Busca en Unsplash: "AI business" o "dashboard mockup"
   - O usa una ilustracion abstracta de Wix Media

---

## PASO 3: BARRA DE LOGOS

1. Agrega una **strip** nueva con fondo #F5F5FA
2. **Titulo:** "Empresas que confian en nosotros" — centrado, Inter Medium, 14px, #9E9EAE, mayusculas
3. Agrega logos de clientes/partners en una fila horizontal
   - Si no tienes logos aun, usa badges como "Kommo Partner", "Google Partner"
   - Haz los logos en escala de grises (30% opacidad) para que se vea elegante

---

## PASO 4: SECCION PROBLEMA

1. **Strip** con fondo blanco
2. **Titulo H2:** "¿Tu negocio enfrenta estos problemas?" — centrado
3. **3 columnas iguales** (usa "Columns" de Wix):

Para cada columna:
- Icono: 48x48px en #7C4DFF (usa iconos de Wix: Add > Icons)
- Titulo H4: texto del contenido
- Descripcion: texto del contenido
- Todo centrado

---

## PASO 5: SECCION SOLUCION (3 Pasos)

1. **Strip** con fondo #F5F5FA
2. **Titulo H2:** "Nosotros lo resolvemos. Asi es como funciona:" — centrado
3. **3 columnas**:

Para cada paso:
- Numero grande: "01", "02", "03" — Poppins Bold, 64px, color #EDE7FF (suave, como fondo)
- Titulo H3: texto del contenido
- Descripcion: texto del contenido

**Tip:** Puedes agregar una linea horizontal o flechas entre los pasos para mostrar progresion

---

## PASO 6: SECCION SERVICIOS

1. **Strip** con fondo blanco
2. **Titulo H2:** "Nuestros Servicios" — centrado
3. **Subtitulo:** texto del contenido — centrado, Inter, 18px, #4A4A5A
4. **Grid de 3 columnas x 2 filas:**

Para crear cards de servicio en Wix:
- Usa **"Box"** (Add > Box) para cada card
- Fondo blanco, border-radius 12px
- Sombra: Design > Shadow > suave
- Padding interno: 32px
- Contenido de cada card:
  - Icono (48px, #7C4DFF)
  - Titulo H4
  - Descripcion
  - Beneficio clave en negrita o con icono de check
- **Hover:** En Wix, selecciona el box > Design > Hover > agrega sombra mas pronunciada

### Para que sea responsive:
- Desktop: 3 columnas
- En vista mobile de Wix: ajusta a 1 columna stacked

---

## PASO 7: CASOS DE EXITO

1. **Strip** con fondo gradiente morado: #7C4DFF → #5C35CC
   - En Wix: Background > Color > Custom > Gradient
2. **Titulo H2:** "Resultados Reales de Empresas Reales" — color blanco, centrado
3. **3 cards** (Box con fondo blanco semi-transparente o blanco solido con border-radius)

Cada card:
- **Badge industria:** "E-commerce" / "Clinica" / "Agencia" — pequeno, fondo #EDE7FF
- **Desafio:** texto
- **Solucion:** texto
- **Resultados:** 3 metricas con numeros grandes
  - Ej: "+65%" en Poppins Bold 36px #7C4DFF + "en ventas" debajo

---

## PASO 8: TESTIMONIOS

1. **Strip** con fondo #F5F5FA
2. **Titulo H2:** "Lo que dicen nuestros clientes" — centrado
3. Usa un **Repeater** o **Slideshow** de Wix para los testimonios

Cada testimonio:
- Icono de comillas (") grande en #7C4DFF
- Texto del testimonio en Inter 18px italica
- 5 estrellas (⭐ usa iconos en #FFB400)
- Foto circular (80x80px) + nombre + cargo

**Tip:** Si usas Slideshow, configura autoplay cada 5 segundos

---

## PASO 9: PRECIOS

1. **Strip** con fondo blanco
2. **Titulo H2:** "Planes que se Adaptan a tu Negocio" — centrado
3. **3 cards de precio** (usa Columns o Boxes):

### Card normal (Starter y Enterprise):
- Fondo blanco, border-radius 16px, sombra suave
- Nombre del plan (H3)
- Precio grande (Poppins Bold 42px)
- Lista de features con checks verdes (#00C853)
- Boton CTA

### Card destacada (Business):
- Mismo estilo PERO:
  - Borde 2px solid #7C4DFF
  - Badge arriba: "Mas Popular" — fondo #7C4DFF, texto blanco, border-radius 20px
  - Ligeramente mas grande (scale 1.05) o mas padding
  - Boton con fondo #7C4DFF (los otros con outline)

4. **Texto debajo:** "Todos los planes incluyen..." — centrado, 14px, #9E9EAE

---

## PASO 10: FAQ

1. **Strip** con fondo #F5F5FA
2. **Titulo H2:** "Preguntas Frecuentes" — centrado
3. Usa el componente **"Accordion"** de Wix:
   - Add > Interactive > Accordion
4. Agrega las 10 preguntas y respuestas del contenido
5. Estilo:
   - Pregunta: Poppins Semi-Bold 18px, #1A1A2E
   - Respuesta: Inter Regular 16px, #4A4A5A
   - Icono +/-: #7C4DFF
   - Divider entre preguntas: 1px #E0E0E0

---

## PASO 11: CTA FINAL + FORMULARIO

1. **Strip** con fondo solido #7C4DFF
2. **Titulo H2:** "¿Listo para Automatizar tu Negocio?" — blanco, centrado
3. **Subtitulo:** texto del contenido — blanco, centrado

4. **Formulario de contacto:**
   - Add > Contact & Forms > Form
   - Campos:
     - Nombre completo (text)
     - Email (email)
     - WhatsApp con codigo de pais (phone/text)
     - ¿Cual es tu mayor desafio? (dropdown con opciones del contenido)
   - Boton submit: "Agendar mi Consulta Gratis →"
     - Fondo blanco, texto #7C4DFF (invertido)
   - Estilo de los campos: fondo blanco con border-radius 8px

5. **Configurar a donde llegan los formularios:**
   - Click en el formulario > Settings > Submissions
   - Agrega tu email para recibir notificaciones
   - Opcional: conectar con Kommo CRM via Zapier o integracion directa

6. **Texto de confianza debajo:** "Respondemos en menos de 24 horas | Sin compromiso"

---

## PASO 12: FOOTER

1. Click en el **footer** de la pagina
2. **Fondo:** #1A1A2E (casi negro)
3. **Layout: 4 columnas**

- Columna 1: Logo + descripcion corta (texto blanco/gris claro)
- Columna 2: Links rapidos (blanco, hover #7C4DFF)
- Columna 3: Servicios (blanco)
- Columna 4: Contacto (email, WhatsApp, ubicacion)

4. **Iconos de redes sociales:**
   - Add > Social > Social Bar
   - Agrega links a Instagram, LinkedIn, Facebook, YouTube, TikTok
   - Estilo: iconos blancos

5. **Linea de copyright:** centrada abajo, Inter 13px, #9E9EAE

---

## PASO 13: CONFIGURAR EL BLOG

### Activar el blog de Wix:
1. En el Dashboard: **Blog > Create New Post** (esto activa el blog)
2. O: Add > Blog > Add Blog Page

### Configurar la pagina del blog:
1. La pagina del blog se crea automaticamente en `/blog`
2. Personalizar el layout:
   - Click en la pagina del blog
   - Configura el grid de posts (recomendado: 2 o 3 columnas)
   - Agrega sidebar con: categorias, busqueda, CTA

### Configurar categorias:
1. Blog > Categories (en Dashboard)
2. Crear las 6 categorias del GH_Blog_Strategy.md:
   - Automatizacion con IA
   - Chatbots y Agentes IA
   - CRM y Ventas
   - Marketing Digital
   - Tendencias IA
   - Guias Practicas

### Crear un post (para cada articulo):
1. Blog > Create New Post
2. **Titulo:** Copia el titulo del GH_Blog_Strategy.md
3. **Contenido:** Escribe o pega el articulo
   - Usa H2 para subtitulos
   - Usa H3 para sub-subtitulos
   - Agrega imagenes con alt text
   - Agrega links internos a otros posts y paginas
4. **SEO Settings** (panel derecho):
   - SEO Title: "Titulo del Post | GH Specialist"
   - Meta Description: del documento de estrategia
   - URL Slug: del documento de estrategia
5. **Cover Image:** 800x450px, descriptiva
6. **Categoria:** selecciona la apropiada
7. **Tags:** agrega 3-5 tags relevantes
8. **Publicar** o programar segun calendario editorial

---

## PASO 14: SEO GLOBAL DEL SITIO

### Google Search Console:
1. Dashboard > Marketing & SEO > SEO Tools
2. Click **"Go to Google Search Console"**
3. Verifica tu sitio con el metodo que Wix sugiere (automatico si tu dominio esta en Wix)

### Google Analytics:
1. Dashboard > Marketing & SEO > Marketing Integrations
2. Conecta Google Analytics 4
3. Pega tu Measurement ID (G-XXXXXXXX)

### Configurar SEO por pagina:
1. Para cada pagina del sitio:
   - Click en la pagina > **"SEO (Google)"** en el panel
   - Completa Title Tag y Meta Description (usa los del GH_Website_Content.md)
2. **Pagina de inicio:**
   - Title: "GH Specialist | Automatiza tu Negocio con IA"
   - Description: del contenido

### Sitemap:
- Wix genera el sitemap automaticamente en `tusitio.com/sitemap.xml`
- Envialo a Google Search Console: Sitemaps > Add > `/sitemap.xml`

### Indexacion:
- Despues de publicar, ve a Search Console > URL Inspection
- Pega la URL de cada pagina nueva y pide "Request Indexing"

---

## PASO 15: CONFIGURACIONES FINALES

### Favicon:
1. Settings > Favicon
2. Sube una version cuadrada de tu logo (32x32 o 64x64px)

### Social Sharing (OG Tags):
1. Settings > Social Share
2. Sube una imagen para compartir en redes (1200x630px)
3. Configura titulo y descripcion default

### Mobile:
1. Cambia a **Mobile Editor** (icono de telefono arriba)
2. Revisa CADA seccion:
   - Textos legibles (no muy grandes ni pequenos)
   - Botones con ancho completo
   - Imagenes ajustadas
   - Espaciado adecuado
3. El menu ya deberia ser hamburguesa automaticamente

### Velocidad:
- Comprime imagenes antes de subirlas (usa tinypng.com)
- No uses videos pesados como fondo
- Limita las animaciones a lo esencial
- Wix maneja el lazy loading automaticamente

### Paginas adicionales a crear:
1. **Politica de Privacidad** — requerida legalmente
2. **Terminos y Condiciones** — recomendada
3. **Pagina 404 personalizada** — optional pero profesional

---

## PASO 16: PUBLICAR

1. Revisa todo en Preview (desktop y mobile)
2. Click **"Publish"**
3. Verifica que tu dominio esta conectado
4. Prueba el formulario de contacto (enviate un test)
5. Revisa todas las paginas en un navegador
6. Comparte en redes sociales

---

## CHECKLIST FINAL DE LANZAMIENTO

- [ ] Logo subido y visible en header y footer
- [ ] Todas las secciones del contenido estan completas
- [ ] Colores y fuentes consistentes con la guia de diseno
- [ ] Formulario de contacto funciona (probar envio)
- [ ] Blog configurado con categorias
- [ ] Al menos 3-5 articulos publicados antes del lanzamiento
- [ ] SEO configurado (meta tags, Search Console, Analytics)
- [ ] Version mobile revisada y optimizada
- [ ] Links de redes sociales funcionan
- [ ] Favicon configurado
- [ ] Pagina de politica de privacidad creada
- [ ] Velocidad aceptable (probar en pagespeed.web.dev)
- [ ] Dominio conectado y SSL activo (HTTPS)
- [ ] Formulario conectado a email o CRM

---

## TIPS EXTRA PARA WIX

### Atajos utiles:
- **Ctrl/Cmd + D:** Duplicar elemento
- **Ctrl/Cmd + Z:** Deshacer
- **Ctrl/Cmd + G:** Agrupar elementos
- **Shift + Arrastrar:** Mover en linea recta

### Componentes utiles de Wix:
- **Lightbox/Popup:** Para lead magnets o promos
- **Chat widget:** Agregar chat de WhatsApp flotante
- **Countdown timer:** Para ofertas limitadas
- **Video background:** Para el hero (usar con moderacion)

### WhatsApp flotante:
1. Add > Contact & Forms > Chat buttons
2. Selecciona WhatsApp
3. Configura tu numero
4. Posicion: esquina inferior derecha
5. Esto permite que visitantes te escriban directo
