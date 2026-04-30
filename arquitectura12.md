# Arquitectura 12 - Mejora de landing, registro y login

Este documento define una mejora visual para la primera experiencia de MultiStock: la pantalla inicial publica, los botones de ingreso/registro y las paginas de autenticacion. El objetivo es hacerlas mas llamativas y modernas sin cambiar la estetica actual del producto.

## Objetivo

Mejorar lo que ve el usuario al entrar a la pagina:

- Landing publica mas clara, comercial y con llamados a la accion visibles.
- Botones `Iniciar sesion` y `Crear cuenta` mas importantes visualmente.
- Registro mas atractivo, menos plano y con mas confianza.
- Login mas profesional y directo.
- Misma identidad visual: fondo oscuro cafe/negro, verde principal, bordes suaves, tarjetas oscuras y logo actual.
- Excelente responsive en desktop, tablet y mobile.

## Problema actual

La primera pantalla ya comunica bien el producto, pero la accion principal queda algo fria:

- Los botones del header son chicos.
- `Ingresar` se ve secundario y poco visible.
- `Crear cuenta` esta correcto, pero podria tener mas jerarquia.
- El hero tiene buena estetica, pero podria integrar mejor las acciones principales.
- Las pantallas de registro y login son funcionales, pero se sienten simples y poco memorables.
- El formulario aparece aislado, sin beneficios, confianza o contexto del producto.
- En pantallas chicas debe cuidarse que los botones sigan siendo faciles de tocar.

## Principios visuales

Mantener:

- Fondo oscuro calido.
- Cards oscuras con borde sutil.
- Verde como color principal de accion.
- Logo actual como centro de identidad.
- Tipografia actual.
- Espaciado amplio y ordenado.
- Estilo SaaS moderno, limpio y confiable.

Evitar:

- Colores nuevos que rompan la marca.
- Fondos blancos grandes.
- Gradientes demasiado brillantes.
- Animaciones pesadas.
- Formularios recargados.
- Layouts que funcionen solo en desktop.

## Landing publica

### Header

El header debe reforzar la conversion.

Cambios propuestos:

- Mantener logo a la izquierda.
- Mantener links `Caracteristicas`, `Precios` y `Demo`.
- Cambiar `Ingresar` de boton ghost simple a boton secundario con borde suave.
- Mantener `Crear cuenta` como boton principal verde.
- En mobile, mostrar acciones principales accesibles sin ocupar demasiado alto.

Jerarquia recomendada:

- `Crear cuenta` debe ser el boton mas visible.
- `Iniciar sesion` debe ser visible, pero secundario.
- En usuario autenticado, reemplazar por `Ir al panel`.

Estilo sugerido:

- `Crear cuenta`: verde, sombra sutil verde, hover mas luminoso.
- `Iniciar sesion`: borde claro, fondo oscuro translucido, hover con borde verde.
- Altura minima touch-friendly: 40px en mobile, 36px en desktop si esta en header.

### Hero

El hero debe incluir la accion principal dentro del contenido, no solo en el header.

Estructura sugerida:

- Badge superior: `Para verdulerias, almacenes y ferreterias`.
- Titulo fuerte: `Controla stock, ventas y alertas sin complicarte`.
- Texto de apoyo corto.
- Grupo de botones principal:
  - `Crear cuenta gratis`.
  - `Iniciar sesion`.
  - Link discreto `Ver demo`.
- Microcopy debajo: `Sin tarjeta. Configuracion en minutos.`
- Mockup visual a la derecha con mas vida: brillo suave, borde, sombras y pequenos indicadores.

La idea es que el usuario no tenga que buscar donde entrar: las dos acciones deben estar en el hero y tambien en el header.

### Bloque de confianza

Agregar una fila corta bajo los botones del hero:

- `Inventario`.
- `Ventas`.
- `Alertas`.
- `Reportes`.

Puede verse como pills o mini tarjetas con iconos verdes. Esto mantiene la pagina viva sin sumar ruido.

### Seccion "Todo lo esencial"

La seccion actual funciona, pero puede ganar presencia:

- Cards con borde un poco mas visible.
- Iconos dentro de cuadrados verdes oscuros.
- Hover suave.
- Separacion correcta en mobile.
- Titulos mas claros orientados a beneficio.

## Pagina de crear cuenta

### Objetivo de la pantalla

La pantalla de registro debe sentirse como el inicio de una configuracion guiada, no como un formulario generico.

### Layout desktop

Usar un layout de dos columnas:

- Columna izquierda: marca, mensaje comercial y beneficios.
- Columna derecha: tarjeta de registro.

Columna izquierda:

- Logo.
- Titulo: `Empeza a ordenar tu negocio hoy`.
- Texto: `Crea tu cuenta, configura tu rubro y carga tus primeros productos en minutos.`
- Beneficios cortos:
  - `Inventario y ventas en un solo lugar`.
  - `Alertas de stock bajo`.
  - `Adaptado a verduleria, almacen y ferreteria`.
  - `Sin tarjeta para empezar`.
- Mini mockup o panel visual sutil si el espacio lo permite.

Columna derecha:

- Tarjeta con borde sutil y fondo oscuro.
- Encabezado mas atractivo:
  - Badge: `Cuenta gratis`.
  - Titulo: `Crear cuenta`.
  - Descripcion: `Configura tu negocio y accede al panel de MultiStock.`
- Formulario.
- Boton principal grande: `Crear cuenta gratis`.
- Link secundario: `Ya tenes cuenta? Iniciar sesion`.

### Layout mobile

En mobile:

- Una sola columna.
- Logo arriba.
- Titulo corto.
- Beneficios compactos como pills o lista de 2 items.
- Formulario inmediatamente visible.
- Boton principal ancho completo.
- Link de login debajo.

No debe requerir scroll excesivo antes de llegar al formulario.

### Estilo del formulario de registro

Mejoras visuales:

- Inputs mas altos: 44px a 48px.
- Bordes mas suaves.
- Fondo del input ligeramente mas oscuro que la tarjeta.
- Focus ring verde.
- Labels claros.
- Placeholders con contraste suficiente.
- Mensajes de error visibles y consistentes.
- Boton con sombra verde sutil.
- Estado pending con texto claro: `Creando cuenta...`.

Campos actuales a mantener:

- Nombre completo.
- Email.
- Contrasena.

No agregar campos nuevos en esta fase para no aumentar friccion.

## Pagina de login

### Objetivo de la pantalla

El login debe ser rapido, sobrio y profesional, pero no aburrido.

### Layout desktop

Usar una variante similar al registro, pero mas compacta.

Columna izquierda:

- Logo.
- Titulo: `Volver a tu panel`.
- Texto: `Ingresa para revisar stock, ventas y alertas de tu negocio.`
- Mini lista:
  - `Dashboard actualizado`.
  - `Ventas y movimientos`.
  - `Alertas pendientes`.

Columna derecha:

- Tarjeta de login.
- Titulo: `Iniciar sesion`.
- Descripcion: `Continua con tu negocio en MultiStock.`
- Formulario.
- Boton principal: `Ingresar al panel`.
- Link secundario: `No tenes cuenta? Crear cuenta`.

### Layout mobile

En mobile:

- Logo y titulo arriba.
- Formulario central.
- Boton ancho completo.
- Link a registro claro.
- Sin mockup grande para evitar scroll innecesario.

### Estilo del formulario de login

Mantener campos:

- Email.
- Contrasena.

Mejoras:

- Boton principal mas llamativo.
- Link de crear cuenta como texto con color verde o subrayado elegante.
- Card con sombra y borde mas premium.
- Fondo con gradiente radial sutil.
- Copy mas cercano y claro.

## Fondo y decoracion

Usar decoracion ligera para que las pantallas no se vean planas.

Recursos visuales sugeridos:

- Gradiente radial verde muy suave detras de la tarjeta.
- Gradiente cafe oscuro desde arriba.
- Lineas o manchas blur muy sutiles.
- Mockup pequeño del dashboard en desktop.
- Pills de beneficios con iconos.

Reglas:

- La decoracion no debe bajar legibilidad.
- No debe afectar performance.
- No debe depender de imagenes pesadas nuevas.
- El contenido principal debe seguir siendo el formulario.

## Componentes recomendados

Crear o reutilizar componentes para evitar duplicacion.

### `components/auth/auth-shell.tsx`

Componente contenedor para login y registro.

Responsabilidades:

- Fondo visual.
- Grid responsive.
- Columna de marca/beneficios.
- Card del formulario.
- Logo.
- Control de ancho y espaciado.

Props sugeridas:

```ts
type AuthShellProps = {
  mode: "login" | "register";
  eyebrow?: string;
  title: string;
  description: string;
  benefits: string[];
  children: React.ReactNode;
};
```

### `components/auth/auth-card.tsx`

Card visual del formulario.

Responsabilidades:

- Borde.
- Fondo.
- Sombra.
- Encabezado.
- Slot de formulario.

### `components/auth/auth-benefits.tsx`

Lista de beneficios compacta.

Responsabilidades:

- Renderizar items con iconos pequenos.
- Adaptarse a mobile.

### `components/marketing/hero-actions.tsx`

Grupo de botones del hero.

Responsabilidades:

- Mostrar `Crear cuenta gratis`.
- Mostrar `Iniciar sesion`.
- Mostrar `Ver demo`.
- Mantener espaciado responsive.

## Archivos a modificar cuando se implemente

Landing:

- `app/(site)/page.tsx`.
- `components/marketing/marketing-nav.tsx`.
- `components/marketing/dashboard-mockup.tsx`.

Auth:

- `app/auth/register/page.tsx`.
- `app/auth/login/page.tsx`.
- `components/forms/register-form.tsx`.
- `components/forms/login-form.tsx`.

Nuevos componentes sugeridos:

- `components/auth/auth-shell.tsx`.
- `components/auth/auth-card.tsx`.
- `components/auth/auth-benefits.tsx`.
- `components/marketing/hero-actions.tsx`.

## Responsive

Breakpoints recomendados:

- Mobile: una columna, botones ancho completo o apilados.
- Tablet: una columna amplia con beneficios compactos.
- Desktop: dos columnas para auth y hero con mockup a la derecha.

Reglas:

- Ningun boton principal debe quedar fuera de la primera vista.
- Los inputs deben ocupar todo el ancho disponible.
- Las cards deben tener padding menor en mobile.
- Evitar textos largos en mobile.
- Mantener contraste correcto en modo oscuro.
- Usar `min-h-dvh` para auth, pero permitir scroll cuando el contenido lo necesite.

## Accesibilidad

Requisitos:

- Labels visibles en todos los inputs.
- Focus ring claro.
- Contraste suficiente en texto secundario.
- Botones con texto explicito.
- Links distinguibles sin depender solo del color.
- Estados pending y errores comprensibles.
- El orden del tab debe ser natural.

## Copy sugerido

Landing:

- Boton principal: `Crear cuenta gratis`.
- Boton secundario: `Iniciar sesion`.
- Link: `Ver demo`.
- Microcopy: `Sin tarjeta. Configuracion en minutos.`

Registro:

- Titulo: `Empeza a ordenar tu negocio hoy`.
- Descripcion: `Crea tu cuenta, configura tu rubro y carga tus primeros productos en minutos.`
- Boton: `Crear cuenta gratis`.
- Link: `Ya tenes cuenta? Iniciar sesion`.

Login:

- Titulo: `Volver a tu panel`.
- Descripcion: `Ingresa para revisar stock, ventas y alertas de tu negocio.`
- Boton: `Ingresar al panel`.
- Link: `No tenes cuenta? Crear cuenta`.

## Fases de implementacion

### Fase 1 - CTA de landing

- Mejorar botones del header.
- Agregar `Iniciar sesion` y `Crear cuenta gratis` dentro del hero.
- Agregar microcopy bajo acciones.
- Ajustar responsive de acciones.

Resultado esperado:

- El usuario entiende inmediatamente donde crear cuenta o iniciar sesion.

### Fase 2 - Registro atractivo

- Crear `AuthShell`.
- Redisenar `/auth/register`.
- Mejorar inputs y boton del formulario.
- Agregar beneficios de registro.

Resultado esperado:

- La creacion de cuenta se ve moderna, confiable y alineada con la landing.

### Fase 3 - Login profesional

- Reusar `AuthShell`.
- Redisenar `/auth/login`.
- Mejorar CTA y link a registro.
- Mantener pantalla rapida y liviana.

Resultado esperado:

- El login se siente parte del producto y no como una pagina aislada.

### Fase 4 - Pulido responsive

- Revisar mobile chico.
- Revisar tablet.
- Revisar desktop ancho.
- Ajustar espaciados, alturas y wraps.

Resultado esperado:

- La experiencia se ve bien en todos los dispositivos.

## Criterios de exito

La mejora se considera completa si:

- La landing muestra claramente `Crear cuenta gratis` e `Iniciar sesion`.
- El registro se ve llamativo, moderno y confiable.
- El login se ve profesional y rapido.
- La estetica sigue siendo la misma: oscuro, verde, cards y logo.
- No se agregan pasos innecesarios al registro.
- Todo funciona bien en mobile, tablet y desktop.
- No se rompe la logica de autenticacion existente.
- No se modifica el modelo de datos.

## Fuera de alcance

No incluir en esta fase:

- Login con Google u otros proveedores.
- Recuperacion de contrasena.
- Verificacion por email personalizada.
- Nuevos campos de registro.
- Cambios en Supabase Auth.
- Animaciones complejas.
- Redisenar todo el sitio publico.

## Nota de implementacion

Esta arquitectura debe implementarse como mejora visual incremental. La logica actual de registro, login, redireccion y negocio activo ya funciona y debe conservarse. El trabajo principal esta en layout, jerarquia visual, copy, responsive y componentes reutilizables.
