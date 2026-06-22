# GH Specialist - Guia de Diseno para Wix

---

## 1. PALETA DE COLORES

| Uso | Color | HEX | Donde usarlo |
|-----|-------|-----|-------------|
| **Primario** | Morado/Violeta | `#7C4DFF` | Botones CTA, acentos, iconos, links hover |
| **Primario Oscuro** | Morado oscuro | `#5C35CC` | Hover de botones, headers de seccion |
| **Primario Claro** | Morado suave | `#EDE7FF` | Fondos de seccion alternos, badges, cards |
| **Negro** | Negro puro | `#1A1A2E` | Textos principales, headlines |
| **Gris Oscuro** | Gris carbon | `#4A4A5A` | Textos secundarios, descripciones |
| **Gris Medio** | Gris neutro | `#9E9EAE` | Textos terciarios, placeholders |
| **Gris Claro** | Gris fondo | `#F5F5FA` | Fondos de seccion alternos |
| **Blanco** | Blanco | `#FFFFFF` | Fondo principal, texto sobre morado |
| **Acento Verde** | Verde exito | `#00C853` | Checks, resultados positivos, badges de exito |
| **Acento Naranja** | Naranja CTA | `#FF6D00` | CTA secundario (opcional), urgencia |

### Regla de uso:
- **Fondo blanco (#FFF)** → texto negro (#1A1A2E)
- **Fondo morado (#7C4DFF)** → texto blanco (#FFF)
- **Fondo gris claro (#F5F5FA)** → texto negro (#1A1A2E)
- Alternar secciones entre fondo blanco y gris claro para crear ritmo visual

---

## 2. TIPOGRAFIAS (Disponibles en Wix)

### Opcion A (Recomendada):
| Uso | Fuente | Peso | Tamano |
|-----|--------|------|--------|
| **H1 (Hero)** | Poppins | Bold (700) | 48-56px desktop / 32-36px mobile |
| **H2 (Titulos seccion)** | Poppins | Semi-Bold (600) | 36-42px desktop / 28-32px mobile |
| **H3 (Subtitulos)** | Poppins | Semi-Bold (600) | 24-28px desktop / 20-24px mobile |
| **H4 (Card titles)** | Poppins | Medium (500) | 20-22px desktop / 18px mobile |
| **Body** | Inter | Regular (400) | 16-18px desktop / 15-16px mobile |
| **Body Small** | Inter | Regular (400) | 14px |
| **Boton** | Poppins | Semi-Bold (600) | 16px |
| **Caption** | Inter | Medium (500) | 12-13px |

### Opcion B (Alternativa):
- Headlines: **Montserrat** (Bold)
- Body: **Open Sans** (Regular)

### En Wix:
1. Ve a "Site Design" > "Text Themes"
2. Configura cada heading y body con las fuentes indicadas
3. Las fuentes Poppins e Inter estan disponibles en la biblioteca de Wix

---

## 3. LAYOUT Y ESPACIADO

### Ancho maximo del contenido:
- **Desktop:** 1200px (centrado)
- **Tablet:** 768px
- **Mobile:** 100% con padding 20px a cada lado

### Espaciado entre secciones:
- **Desktop:** 80-100px arriba y abajo
- **Mobile:** 50-60px arriba y abajo

### Espaciado interno de secciones:
- **Padding de seccion:** 60px vertical, contenido centrado
- **Gap entre cards:** 24-32px
- **Gap entre elementos:** 16px

### Grid de servicios:
- **Desktop:** 3 columnas x 2 filas
- **Tablet:** 2 columnas x 3 filas
- **Mobile:** 1 columna x 6 filas

### Grid de precios:
- **Desktop:** 3 columnas (plan del medio ligeramente mas grande)
- **Mobile:** Stack vertical, plan popular primero

---

## 4. BOTONES

### Boton Primario (CTA principal):
- **Fondo:** #7C4DFF
- **Texto:** Blanco, Poppins Semi-Bold 16px
- **Border radius:** 8px
- **Padding:** 16px 32px
- **Hover:** #5C35CC (mas oscuro)
- **Sombra:** 0 4px 12px rgba(124, 77, 255, 0.3)

### Boton Secundario (CTA secundario):
- **Fondo:** Transparente
- **Borde:** 2px solid #7C4DFF
- **Texto:** #7C4DFF, Poppins Semi-Bold 16px
- **Border radius:** 8px
- **Hover:** Fondo #7C4DFF, texto blanco

### Boton Terciario (links de texto):
- **Texto:** #7C4DFF con underline
- **Hover:** #5C35CC

---

## 5. CARDS (Servicios, Testimonios, etc.)

### Card de Servicio:
- **Fondo:** Blanco
- **Border radius:** 12px
- **Padding:** 32px
- **Sombra:** 0 2px 8px rgba(0,0,0,0.06)
- **Hover:** Sombra aumenta a 0 8px 24px rgba(0,0,0,0.1), borde superior 3px #7C4DFF
- **Icono:** 48x48px, color #7C4DFF

### Card de Precio:
- **Fondo:** Blanco
- **Border radius:** 16px
- **Padding:** 40px
- **Sombra:** 0 4px 16px rgba(0,0,0,0.08)
- **Plan destacado (Business):** Borde 2px #7C4DFF, badge "Mas Popular" en morado

### Card de Testimonio:
- **Fondo:** #F5F5FA
- **Border radius:** 12px
- **Padding:** 32px
- **Comillas:** Icono de comillas grande en #7C4DFF arriba del texto
- **Estrellas:** 5 estrellas en color #FFB400

---

## 6. ICONOS

### Estilo recomendado:
- **Tipo:** Line icons (contorno, no rellenos)
- **Tamano:** 48px para cards de servicios, 24px para listas
- **Color:** #7C4DFF (primario) o #1A1A2E (neutro)
- **Grosor de linea:** 2px

### Donde encontrarlos gratis:
- **Phosphor Icons** (phosphoricons.com) - estilo limpio y moderno
- **Tabler Icons** (tabler-icons.io) - amplia coleccion
- **Heroicons** (heroicons.com) - minimalistas
- En Wix: Usa el panel de "Add" > "Icons" y busca por estilo "outline"

---

## 7. IMAGENES

### Estilo fotografico:
- **Tipo:** Fotos de equipos de trabajo modernos, oficinas tech, personas usando laptops/tablets
- **Tono:** Luminoso, profesional pero cercano, diverso
- **Filtro:** Ligeramente desaturado con tinte morado sutil (opcional)
- **NO usar:** Stock generico de personas senalando pantallas, graficos falsos, manos estrechando

### Donde encontrar stock gratuito:
- **Unsplash** (unsplash.com) - buscar: "team technology", "business automation", "AI business"
- **Pexels** (pexels.com) - buscar: "office tech", "startup team"
- **Wix Media** - Galeria integrada en el editor

### Imagenes para el Hero:
- Opcion A: Mockup de dashboard/chat en laptop (abstracto)
- Opcion B: Ilustracion 3D abstracta con temas de IA/automatizacion
- Opcion C: Foto de equipo trabajando con overlay de gradiente morado

### Tamanos recomendados:
- **Hero background:** 1920x1080px
- **Cards/thumbnails:** 600x400px
- **Iconos de servicio:** 100x100px (PNG transparente)
- **Fotos de testimonios:** 80x80px (circulares)
- **Blog thumbnails:** 800x450px (ratio 16:9)

---

## 8. EFECTOS Y ANIMACIONES (en Wix)

### Scroll animations (sutiles):
- **Secciones:** Fade in al hacer scroll (usar "Scroll Effects" en Wix)
- **Cards:** Fade in + slide up con delay escalonado (0.1s entre cada una)
- **Numeros/metricas:** Counter animation (de 0 al numero final)

### NO hacer:
- Evitar animaciones que reboten o se muevan lateralmente
- No usar mas de 2 tipos de animacion por pagina
- No animar el header ni el footer

---

## 9. ESTRUCTURA VISUAL POR SECCION

```
┌─────────────────────────────────────┐
│  HEADER (fijo al scroll)            │  Fondo: Blanco, sombra sutil
│  Logo izq | Menu centro | CTA der  │
├─────────────────────────────────────┤
│                                     │
│  HERO                               │  Fondo: Blanco o gradiente morado suave
│  Headline + Sub + 2 CTAs            │  Layout: Texto izq, imagen/mockup der
│  Badges de confianza                │
│                                     │
├─────────────────────────────────────┤
│  LOGOS CLIENTES                     │  Fondo: #F5F5FA | Logos en gris
├─────────────────────────────────────┤
│                                     │
│  PROBLEMA (3 columnas)              │  Fondo: Blanco
│                                     │
├─────────────────────────────────────┤
│                                     │
│  SOLUCION (3 pasos)                 │  Fondo: #F5F5FA
│                                     │
├─────────────────────────────────────┤
│                                     │
│  SERVICIOS (grid 3x2)              │  Fondo: Blanco
│                                     │
├─────────────────────────────────────┤
│                                     │
│  CASOS DE EXITO (3 cards)           │  Fondo: Gradiente morado (#7C4DFF → #5C35CC)
│                                     │  Texto: Blanco
├─────────────────────────────────────┤
│                                     │
│  TESTIMONIOS (carousel)             │  Fondo: #F5F5FA
│                                     │
├─────────────────────────────────────┤
│                                     │
│  PRECIOS (3 columnas)               │  Fondo: Blanco
│                                     │
├─────────────────────────────────────┤
│                                     │
│  FAQ (acordeon)                     │  Fondo: #F5F5FA
│                                     │
├─────────────────────────────────────┤
│                                     │
│  CTA FINAL + FORMULARIO             │  Fondo: #7C4DFF (morado solido)
│                                     │  Texto: Blanco
├─────────────────────────────────────┤
│  FOOTER                             │  Fondo: #1A1A2E (casi negro)
│  4 columnas + social + copyright    │  Texto: Blanco/gris claro
└─────────────────────────────────────┘
```

---

## 10. RESPONSIVE CHECKPOINTS

| Breakpoint | Ancho | Ajustes clave |
|-----------|-------|---------------|
| **Desktop** | >1024px | Layout completo, 3 columnas |
| **Tablet** | 768-1024px | 2 columnas, hero stacked |
| **Mobile** | <768px | 1 columna, menu hamburguesa, CTAs full-width |

### Mobile first tips en Wix:
1. Despues de disenar en desktop, cambia a vista mobile en Wix
2. Ajusta tamanos de texto (ver tabla de tipografia)
3. Asegurate que los CTAs son full-width en mobile
4. Los cards se stackean verticalmente
5. El menu pasa a hamburguesa automaticamente
