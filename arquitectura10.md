# Arquitectura 10 - Ajustes de layout, header fijo y pantalla completa

Este documento define los ajustes visuales necesarios para corregir la estructura actual del panel privado de MultiStock.

Objetivo:

```txt
El panel debe ocupar toda la pantalla disponible, tener un header superior profesional,
mantener el menu lateral fijo y adaptarse correctamente a escritorio, tablet y movil.
```

> Estado: Fases 30 a 32 implementadas en codigo. Queda la Fase 33 (prueba visual en dispositivos reales) como verificacion manual.

---

# Fase 30 - Header superior profesional

## Problema actual

La parte superior muestra el nombre del negocio, correo, estado y cierre de sesion de forma separada y poco integrada.

Se ve como elementos sueltos:

- nombre del negocio arriba a la izquierda
- correo en texto chico
- badge de operacion activa separado
- boton cerrar sesion aislado

## Objetivo

Convertir el header superior en una barra visual clara, compacta y profesional.

## Diseño esperado

```txt
┌──────────────────────────────────────────────────────────────┐
│ MultiStock / Nombre negocio        [Operacion activa] [Usuario] │
│ Rubro · correo                         [Cambiar negocio] [Salir] │
└──────────────────────────────────────────────────────────────┘
```

## Reglas UI

- El header debe tener altura consistente.
- El nombre del negocio debe ser el elemento principal.
- El rubro y correo deben verse como informacion secundaria.
- El boton de cerrar sesion debe integrarse dentro de un bloque de usuario.
- El estado "Operacion activa" debe verse como badge, no como elemento flotante.
- En mobile, el header debe compactarse sin romper el layout.

## Componentes afectados

```txt
components/layout/app-header.tsx
components/layout/business-switcher.tsx
components/layout/app-shell.tsx
```

## Criterios de aceptacion

- El header se ve ordenado y alineado.
- El correo no queda suelto ni visualmente perdido.
- Cerrar sesion queda asociado al usuario.
- El header no ocupa demasiado alto en pantallas chicas.

---

# Fase 31 - Sidebar cafe fijo e inmovil

## Problema actual

El menu lateral cafe forma parte del contenido que scrollea. Cuando baja el contenido principal, el menu puede moverse o perder posicion visual.

## Objetivo

El sidebar debe quedar fijo dentro de la pantalla en escritorio.

## Comportamiento esperado

Desktop:

```txt
Sidebar cafe fijo
Contenido principal scrollea
Header superior visible
```

Mobile/tablet:

```txt
Sidebar se vuelve navegacion superior o bloque colapsable
Contenido ocupa todo el ancho
No debe generar scroll horizontal
```

## Reglas UI

- En desktop, usar sidebar con altura `calc(100dvh - headerHeight)`.
- Sidebar con `position: sticky` o contenedor fijo dentro del app shell.
- Solo el area principal debe tener scroll vertical.
- El sidebar debe mantener ancho estable.
- No debe tapar contenido.

## Componentes afectados

```txt
components/layout/app-shell.tsx
components/layout/app-sidebar.tsx
app/(app)/layout.tsx
```

## Criterios de aceptacion

- Al scrollear el dashboard, el menu cafe queda en su lugar.
- El menu no baja junto con las cards.
- El contenido principal scrollea correctamente.
- No aparece doble scroll innecesario.

---

# Fase 32 - Layout full screen y responsive real

## Problema actual

El panel queda visualmente limitado y no aprovecha toda la pantalla. En resoluciones anchas se siente centrado pero con demasiado margen. En pantallas chicas puede sentirse comprimido.

## Objetivo

La app debe ocupar todo el ancho y alto disponible, ajustando espacios segun tamaño de pantalla.

## Layout esperado

```txt
viewport completo
┌───────────────────────────────────────────────┐
│ Header superior                               │
├───────────────┬───────────────────────────────┤
│ Sidebar fijo  │ Main scrolleable              │
│               │ ancho flexible                │
└───────────────┴───────────────────────────────┘
```

## Reglas responsive

Desktop grande:

- Usar ancho completo.
- Mantener padding lateral moderado.
- Dashboard puede usar grillas de 4 columnas.
- Sidebar fijo entre 240px y 280px.

Notebook:

- Mantener 3 o 4 columnas segun espacio.
- Evitar cards excesivamente angostas.

Tablet:

- Sidebar pasa a bloque superior o ancho completo.
- Grillas pasan a 2 columnas.

Mobile:

- Una columna.
- Botones principales con ancho cómodo.
- Tablas con scroll horizontal controlado.
- Sin desbordes horizontales del body.

## Componentes afectados

```txt
components/layout/app-shell.tsx
components/ui/page-surface.tsx
app/(app)/dashboard/page.tsx
components/dashboard/*
components/ventas/*
components/productos/*
components/inventario/*
```

## Criterios de aceptacion

- El panel ocupa toda la pantalla disponible.
- No hay margen lateral excesivo en desktop.
- No hay scroll horizontal accidental.
- El contenido principal se adapta a mobile, tablet y desktop.
- El dashboard mantiene buena lectura en pantallas grandes.

---

# Fase 33 - Prueba visual y ajustes finos

## Objetivo

Validar que el layout nuevo se vea correcto en tamaños reales.

## Breakpoints a revisar

```txt
mobile: 360px - 430px
tablet: 768px
notebook: 1366px
desktop: 1920px
```

## Checklist QA visual

- Header alineado.
- Usuario/correo legible.
- Boton cerrar sesion integrado.
- Sidebar cafe fijo en desktop.
- Main scrollea sin mover sidebar.
- Dashboard ocupa ancho disponible.
- Cards no quedan demasiado pequeñas.
- Mobile sin scroll horizontal.
- Tablas siguen siendo usables.
- Botones tactiles comodos.

## Validacion tecnica

```txt
npm run lint
npm run build
```

## Criterios de aceptacion

- La app se ve profesional en desktop.
- La app se puede operar desde mobile.
- No se rompe ningun flujo existente.
- No se cambia base de datos.
