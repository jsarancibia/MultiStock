# Arquitectura 13 - Landing informativa y auth simplificado

Este documento define la siguiente mejora visual de MultiStock despues de `arquitectura12.md`: corregir la experiencia de login/registro hacia formularios centrados con logo arriba y ampliar la pagina principal para que sea mas informativa, clara y convincente.

## Objetivo

Mejorar la primera impresion del producto sin romper la estetica actual:

- Mantener login y registro simples, centrados y elegantes.
- Poner el logo arriba del formulario en ambas pantallas.
- Usar degradados laterales con colores de la marca para que no se vean planos.
- Convertir la pagina principal en una landing mas informativa.
- Explicar mejor que hace MultiStock, para quien es y como se usa.
- Mantener buena experiencia en mobile, tablet y desktop.

## Problemas detectados

### Login y registro

El layout con columna comercial lateral no funciona bien visualmente para este producto:

- El login se siente mas pesado que antes.
- La informacion lateral distrae de la accion principal.
- El formulario pierde protagonismo.
- En desktop se ve demasiado separado.
- En mobile puede generar scroll innecesario.

Decision:

- Login y registro deben volver a ser pantallas centradas.
- El logo debe estar arriba.
- El formulario debe ser el centro visual.
- Los beneficios pueden ir debajo en una card pequeña o desaparecer si molestan.

### Pagina principal

La landing actual es limpia, pero todavia es corta. Falta explicar mejor:

- Que problema resuelve.
- Como funciona el flujo.
- Que modulos incluye.
- Como cambia por rubro.
- Que se puede hacer desde el panel.
- Que no incluye todavia.
- Por que sirve para comercios chicos.

## Direccion visual

Mantener:

- Fondo oscuro cafe/negro.
- Verde como accion principal.
- Bordes suaves.
- Cards oscuras.
- Logo actual.
- Mockup del dashboard.
- Tipografia y espaciado actuales.

Agregar:

- Degradados laterales suaves.
- Secciones informativas con cards.
- Iconos chicos en verde.
- Separadores sutiles.
- Bloques con texto corto y util.
- CTAs repetidos de forma natural al final de secciones.

Evitar:

- Recargar la landing con demasiado texto.
- Usar colores que no pertenecen a la marca.
- Hacer formularios con columnas grandes.
- Animaciones pesadas.
- Secciones muy altas en mobile.

## Auth simplificado

### Layout para login

Estructura:

1. Fondo oscuro con degradados laterales.
2. Logo centrado arriba.
3. Nombre `MultiStock` o badge corto.
4. Card de login.
5. Beneficios compactos opcionales debajo.

Card:

- Titulo: `Iniciar sesion`.
- Descripcion: `Continua con tu negocio en MultiStock.`
- Campos:
  - Email.
  - Contrasena.
- Boton: `Ingresar al panel`.
- Link: `No tenes cuenta? Crear cuenta`.

### Layout para registro

Estructura:

1. Fondo oscuro con degradados laterales.
2. Logo centrado arriba.
3. Nombre `MultiStock` o badge corto.
4. Card de registro.
5. Beneficios compactos debajo.

Card:

- Badge: `Cuenta gratis`.
- Titulo: `Crear cuenta`.
- Descripcion: `Configura tu negocio y accede al panel de MultiStock.`
- Campos:
  - Nombre completo.
  - Email.
  - Contrasena.
- Boton: `Crear cuenta gratis`.
- Link: `Ya tenes cuenta? Iniciar sesion`.

### Degradados

Usar decoracion simple:

- Lado izquierdo: verde principal con opacidad baja.
- Lado derecho: cafe/ambar oscuro.
- Parte inferior: verde muy sutil.

Reglas:

- Los degradados no deben competir con el formulario.
- No deben tapar texto.
- Deben quedar bien en claro/oscuro si se mantiene soporte de tema.
- No usar imagenes nuevas.

## Landing principal informativa

La pagina principal debe pasar de una landing corta a una landing de producto mas completa.

### Seccion 1 - Hero

Mantener el hero actual, pero afinarlo:

- Badge: `Para verdulerias, almacenes y ferreterias`.
- Titulo fuerte.
- Texto corto.
- Botones:
  - `Crear cuenta gratis`.
  - `Iniciar sesion`.
  - `Ver demo`.
- Microcopy: `Sin tarjeta. Configuracion en minutos.`
- Mockup del dashboard.

### Seccion 2 - Que problema resuelve

Agregar bloque despues del hero.

Titulo sugerido:

- `Deja de controlar tu negocio con hojas sueltas`

Contenido:

- Stock desordenado.
- Ventas sin trazabilidad.
- Productos sin minimo.
- Alertas que llegan tarde.
- Proveedores dispersos.

Formato:

- 3 a 5 cards chicas.
- Icono verde.
- Texto corto.

### Seccion 3 - Como funciona

Explicar el flujo en pasos simples.

Titulo sugerido:

- `De la cuenta al control del stock en minutos`

Pasos:

1. Crea tu cuenta.
2. Configura tu negocio.
3. Elige rubro.
4. Carga productos.
5. Registra ventas y movimientos.
6. Revisa dashboard y alertas.

Formato:

- Timeline horizontal en desktop.
- Cards apiladas en mobile.

### Seccion 4 - Modulos incluidos

Mostrar modulos reales del sistema.

Modulos:

- Productos.
- Inventario.
- Movimientos.
- Ventas.
- Proveedores.
- Alertas.
- Dashboard.
- Reportes.
- Exportaciones.
- Auditoria.

Formato:

- Grid de cards.
- Cada card con descripcion breve.

### Seccion 5 - Adaptado por rubro

Explicar que MultiStock no es generico solamente, sino adaptable.

Rubros:

- Verduleria:
  - Venta por peso.
  - Perecibles.
  - Merma.
- Almacen:
  - Rotacion rapida.
  - Margenes.
  - Codigo de barras/SKU.
- Ferreteria:
  - Marca.
  - Modelo.
  - Medidas.
  - Datos tecnicos.

Formato:

- Tres cards grandes.
- Cada card con lista corta.
- Mantener fondo oscuro y borde sutil.

### Seccion 6 - Vista operativa

Mostrar que hay dentro del panel:

- Dashboard con metricas.
- Productos bajo stock.
- Ventas del dia.
- Movimientos recientes.
- Alertas pendientes.
- Reportes simples.
- Exportaciones CSV.

Formato:

- Mockup del dashboard.
- Lista lateral de capacidades.

### Seccion 7 - Que incluye hoy y que no

Ser transparente ayuda a generar confianza.

Incluye hoy:

- Inventario.
- Productos.
- Ventas simples.
- Proveedores.
- Alertas.
- Reportes.
- Exportaciones CSV.
- Auditoria.

No incluye todavia:

- Caja.
- Facturacion fiscal.
- Sucursales reales.
- App movil.
- Suscripciones/pagos.

Formato:

- Dos columnas.
- `Incluido` y `Proximamente`.

### Seccion 8 - CTA final

Cerrar con accion clara.

Titulo sugerido:

- `Empeza a ordenar tu stock hoy`

Botones:

- `Crear cuenta gratis`.
- `Iniciar sesion`.

Microcopy:

- `Ideal para pruebas reales con comercios chicos.`

## Archivos a modificar cuando se implemente

Landing:

- `app/(site)/page.tsx`.
- `components/marketing/hero-actions.tsx`.
- `components/marketing/dashboard-mockup.tsx`.

Auth:

- `components/auth/auth-shell.tsx`.
- `components/auth/auth-card.tsx`.
- `app/auth/login/page.tsx`.
- `app/auth/register/page.tsx`.

Componentes nuevos sugeridos:

- `components/marketing/problem-cards.tsx`.
- `components/marketing/how-it-works.tsx`.
- `components/marketing/modules-grid.tsx`.
- `components/marketing/business-type-section.tsx`.
- `components/marketing/included-now.tsx`.
- `components/marketing/final-cta.tsx`.

## Responsive

Mobile:

- Hero en una columna.
- Botones ancho completo o apilados.
- Cards de informacion en una columna.
- Timeline convertido en lista.
- No mostrar mockups gigantes.

Tablet:

- Cards en dos columnas.
- Hero con mockup debajo o a un lado segun espacio.

Desktop:

- Hero en dos columnas.
- Secciones con grids.
- Mockup y texto lado a lado.

## Criterios de exito

La mejora se considera lista si:

- Login y registro se ven limpios, con logo arriba y formulario protagonista.
- Los degradados hacen la pantalla mas atractiva sin molestar.
- La pagina principal explica claramente que es MultiStock.
- El usuario entiende los modulos antes de registrarse.
- Se entiende que el sistema esta adaptado a verduleria, almacen y ferreteria.
- Hay CTAs visibles al inicio y al final.
- Todo se ve bien en mobile, tablet y desktop.

## Fases recomendadas

### Fase 1 - Corregir auth

- Dejar formulario centrado.
- Logo arriba.
- Degradados laterales.
- Beneficios compactos debajo.

### Fase 2 - Agregar secciones informativas basicas

- Problema que resuelve.
- Como funciona.
- Modulos incluidos.

### Fase 3 - Agregar especializacion por rubro

- Verduleria.
- Almacen.
- Ferreteria.

### Fase 4 - Agregar transparencia y CTA final

- Incluye hoy.
- Proximamente.
- CTA final.

### Fase 5 - Pulido responsive

- Revisar mobile chico.
- Revisar tablet.
- Revisar desktop.
- Ajustar espacios y orden visual.

## Nota

La prioridad inmediata es que login y registro vuelvan a sentirse simples y profesionales. La landing puede crecer por secciones, sin hacer un rediseño total en un solo paso.
