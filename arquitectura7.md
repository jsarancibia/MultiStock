# Arquitectura 7 - Direccion visual UI y experiencia SaaS operativa

Este documento define la direccion visual de MultiStock para que la aplicacion se sienta como un panel profesional, moderno y simple de operar.

La referencia visual tomada es un dashboard con:

- sidebar oscura y fija
- fondo calido claro
- tarjetas grandes con bordes redondeados
- metricas principales visibles al entrar
- graficos simples y coloridos
- acciones rapidas cerca del contenido
- jerarquia clara entre resumen, tareas y alertas

La idea no es copiar otra interfaz, sino usar esa referencia para llevar MultiStock a una experiencia mas clara, comercial y facil de usar.

---

# Fase 19 - Rediseño visual del panel privado

## Objetivo

Hacer que el area privada de MultiStock se vea como un dashboard SaaS profesional, manteniendo la funcionalidad actual.

## Principios visuales

- Sidebar oscura para navegacion principal.
- Header liviano con negocio activo, usuario y acciones.
- Fondo principal claro con tono calido suave.
- Cards blancas con sombra sutil y bordes redondeados.
- Colores de accion consistentes:
  - verde para ventas, stock correcto y confirmaciones
  - amarillo para tareas pendientes o advertencias suaves
  - rojo para alertas criticas
  - azul/violeta para informacion y analisis
- Iconos simples, no decorativos.
- Graficos simples antes que graficos complejos.

## Layout objetivo

```txt
┌───────────────────────────────────────────────┐
│ Header: negocio activo + busqueda + usuario   │
├───────────────┬───────────────────────────────┤
│ Sidebar       │ Contenido principal            │
│ oscuro        │                               │
│               │ Cards resumen                 │
│ Dashboard     │ Graficos simples              │
│ Punto venta   │ Alertas y tareas              │
│ Productos     │ Actividad reciente            │
│ Inventario    │                               │
└───────────────┴───────────────────────────────┘
```

## Componentes esperados

```txt
components/layout/app-shell.tsx
components/layout/app-sidebar.tsx
components/layout/app-header.tsx
components/ui/metric-card.tsx
components/ui/action-card.tsx
components/ui/status-ring.tsx
components/ui/simple-chart-card.tsx
components/ui/task-list-card.tsx
components/ui/page-surface.tsx
```

## Dashboard objetivo

El dashboard debe mostrar al entrar:

- ventas del dia
- ventas del mes
- productos activos
- stock saludable
- alertas criticas
- ultimas ventas
- movimientos recientes
- tareas sugeridas
- accesos rapidos

## Criterios de aceptacion

- El dashboard se entiende en menos de 10 segundos.
- Las acciones principales estan visibles sin buscar en menus.
- El usuario puede iniciar una venta o crear producto desde el dashboard.
- Las tarjetas mantienen consistencia visual en todas las paginas.
- La interfaz funciona bien en escritorio, tablet y movil.

---

# Fase 20 - Sistema visual reutilizable

## Objetivo

Evitar que cada pantalla tenga estilos distintos. Crear piezas UI reutilizables para acelerar futuras fases.

## Tokens visuales

```txt
background_app: tono claro calido
surface_card: blanco
surface_sidebar: marron/negro suave
primary: amarillo/dorado MultiStock
success: verde
warning: amarillo
danger: rojo
info: azul/violeta
radius: grande
shadow: suave
```

## Reglas de componentes

- Cada pagina usa un `PageHeader`.
- Cada bloque importante usa una `Card`.
- Cada accion principal usa boton primario.
- Acciones secundarias usan outline.
- Estados vacios siempre explican el proximo paso.
- Errores siempre dicen que paso y que hacer.
- Tablas deben tener version mobile o scroll claro.

## No hacer

- No agregar graficos complejos si no aportan decision.
- No llenar el dashboard de informacion tecnica.
- No usar colores distintos para el mismo significado.
- No crear variantes visuales por cada modulo.

## Criterios de aceptacion

- Nuevas pantallas se pueden armar con componentes existentes.
- La app mantiene identidad visual unificada.
- El diseño no depende de datos demo para verse bien.
