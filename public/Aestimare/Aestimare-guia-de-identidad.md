# Aestimare — guía breve de identidad

Esta entrega reconstruye la identidad mostrada en el concepto original. Los archivos SVG contienen contornos vectoriales y no dependen de tipografías instaladas ni de imágenes raster incrustadas.

## Paleta principal

| Color | Hexadecimal | Uso sugerido |
|---|---:|---|
| Azul profundo | `#14283B` | Marca, interfaz, encabezados y fondos institucionales |
| Grafito | `#2B2F33` | Texto y superficies neutras |
| Cobre | `#B87333` | Acentos relacionados con valor y acción |
| Dorado discreto | `#D4B06A` | Gradientes, detalles y estados destacados |
| Marfil | `#F6F2EA` | Fondos cálidos y contraste sobre azul |

## Archivos y usos

- `Aestimare-logo-horizontal.svg`: versión principal con descriptor; úsela en encabezados, documentos y presentaciones.
- `Aestimare-logo-horizontal-sin-descriptor.svg`: alternativa para espacios horizontales más reducidos.
- `Aestimare-monograma.svg`: símbolo transparente para portadas, marcas de agua y composiciones editoriales.
- `Aestimare-favicon.ico`: favicon multirresolución para la raíz del sitio web.
- `Aestimare-favicon.svg`: favicon vectorial para navegadores modernos.
- `Aestimare-avatar.svg`: versión clara y enmarcada para perfiles, avatares e iconos de aplicación.
- Los PNG son versiones listas para plataformas que no admiten SVG.

## Recomendaciones de implementación

- Use el logotipo con descriptor a partir de 320 px de ancho. En tamaños menores, use la versión sin descriptor o el monograma.
- Conserve un margen libre alrededor de la marca equivalente, como mínimo, a la altura del rombo central.
- No cambie la proporción, el espaciado ni la posición de la línea y el rombo.
- No coloque el logotipo azul sobre fondos oscuros sin preparar antes una variante de color inversa.
- Para favicon, incluya tanto `.ico` como `.svg`; el ICO contiene tamaños de 16, 32, 48, 64, 128 y 256 px.

## Ejemplo HTML

```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/Aestimare-favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/Aestimare-avatar.png">
```
