# Auditoría UX/UI — Hallazgos

> 27 hallazgos clasificados por severidad: 🔴 Alto / 🟠 Medio / 🟢 Nice to have  
> Código: MultiStock (Next.js 16, React 19, Supabase, TailwindCSS 4)

---

## 🔴 Alto impacto / Bajo esfuerzo

| # | Hallazgo | Impacto | Ubicación | Fix |
|---|----------|---------|-----------|-----|
| 1 | **Diálogo de impresión en cada venta** — el operador hace 100+ ventas/día y cada una requiere click extra "¿Desea imprimir boleta?" | 100 clicks extra/día | `sale-form.tsx:190-194` | Checkbox "Imprimir" en sidebar en vez de diálogo post-venta |
| 2 | **Formulario de pago no muestra la deuda** — el usuario debe memorizar el saldo de una card arriba, scrollear abajo, y escribir el monto a ciegas | Riesgo de error en montos reales de plata | `credit-payment-form.tsx:23-36` | Mostrar "Debe $X,XXX" en placeholder o junto al campo |
| 3 | **3 botones de escanear código simultáneos** — el usuario no sabe cuál presionar, ocupan 150px de altura en mobile | Confusión en momento de venta rápida | `product-search.tsx:206-235` | Unificar en 1 solo botón con detección automática | no por ahora
| 4 | **Filtros de productos requieren click manual "Aplicar filtros"** — cada cambio de categoría necesita submit explícito | 1 click extra por búsqueda | `productos/page.tsx:104-106` | Auto-submit en selects (onChange) |
| 5 | **"Nueva venta" aparece en 3 lugares distintos** del dashboard | Diluye el CTA principal | `dashboard/page.tsx:59-62` + `quick-actions.tsx:17-22` | Unificar en UN solo lugar |
| 6 | **Resumen de venta no muestra contexto de fiado** — al seleccionar "Fiado", el resumen no muestra nombre del cliente, deuda, ni si excede límite | Confirmas venta sin ver datos clave | `sale-summary.tsx:59-62` | Mostrar nombre del cliente + deuda + check de límite en resumen |
| 7 | **Sin botón "pagar deuda completa"** en formulario de pago fiado | Teclear monto manual cada vez | `credit-payment-form.tsx:27-36` | Botón "Pagar deuda completa ($X)" junto al campo monto |
| 8 | **ConfirmDialog no muestra pre-check de límite fiado en venta** — error solo tras submit | Cliente esperando, error del servidor | `sale-form.tsx:136-168` | Validar límite antes de permitir submit |
| 9 | **Badge "Operación activa" siempre visible, siempre igual** — consume espacio en header, cero información | Elemento decorativo sin función | `app-header.tsx:60-62` | Quitar o contextualizar |

---

## 🟠 Medio impacto

| # | Hallazgo | Impacto | Ubicación | Fix |
|---|----------|---------|-----------|-----|
| 10 | **CTAs duplicados en dashboard** — "Nueva venta" y "Nuevo producto" aparecen en header + QuickActions + TaskList | Confusión cognitiva | `dashboard/page.tsx` + `quick-actions.tsx` + task-list | Remover duplicados, mantener solo en header |
| 11 | **Sin confirmation dialog en "Desactivar" producto** — 1-click destructivo sin confirmación | Producto perdido accidentalmente | `productos/[id]/page.tsx:40-43` | Agregar ConfirmDialog |
| 12 | **Sin loading.tsx en subrutas** — fiados/[id], productos/[id], ventas/[id], fiados/nuevo, productos/nuevo | Pantallas en blanco durante carga | Múltiples rutas | Agregar loading skeletons |
| 13 | **Sin bulk resolve en alertas** — cada alerta debe marcarse individualmente | Click por click si hay 20+ alertas | `stock-alerts-list.tsx:68-73` | Checkboxes + "Marcar todas" |
| 14 | **Alertas resueltas mezcladas con pendientes** — sin filtro ni separación visual | Difícil encontrar lo importante | `stock-alerts-list.tsx:52-80` | Tabs Pendientes/Resueltas |
| 15 | **Sin spinner en botones durante submit** — solo cambia texto | Feedback visual débil | Todos los forms | Agregar Loader2 + animate-spin |
| 16 | **Acentos ortográficos faltantes** — "Telefono", "Direccion", "invalido", "maximo", "Metodo", "categoria" (~15+ lugares) | Aspecto poco profesional | Múltiples archivos | Corregir tildes |
| 17 | **Labels del ConfirmDialog invertidos** — "Cancelar" confirma descarte, "Seguir editando" cierra | Usuario descarta cambios sin querer | `confirm-dialog.tsx:25-26` | Cambiar labels |
| 18 | **Ventas muestran UUID.slice(0,8) en vez de ID secuencial** — "a3f2c8b1" no significa nada | Parece sistema en beta | `ventas/[id]/page.tsx:38` | Implementar IDs secuenciales |
| 19 | **Sin back button en detalle de venta** — única página de detalle sin volver atrás | Usuario atrapado | `ventas/[id]/page.tsx` | Agregar BackButton |
| 20 | **Sin pre-check de límite fiado en selector de venta** — no se muestra el límite del cliente al seleccionarlo | Cajero no sabe si puede vender | `credit-customer-select.tsx:112-129` | Mostrar límite + disponible en dropdown |
| 21 | **"Morosos" card siempre roja aunque count=0** — falso positivo visual | Alarma innecesaria | `fiados/page.tsx:80` | Color neutro cuando count=0 |
| 22 | **Timestamps con segundos en historial fiado** — información demasiado granular para auditoría de almacén | Ruido visual | `fiados/[id]/page.tsx:165-166` | Usar solo fecha u hora sin segundos |
| 23 | **Card "productos en alerta" no es cliqueable** en inventario — muestra el número pero no filtra | Usuario debe buscar manualmente | `inventario/page.tsx:39-42` | Hacer la card un link a vista filtrada |
| 24 | **Empty state faltante en productos** — tabla vacía sin mensaje cuando no hay productos | Usuario no sabe qué pasó | `productos/page.tsx` | Agregar EmptyState component |

---

## 🟢 Nice to have

| # | Hallazgo | Impacto | Ubicación | Fix |
|---|----------|---------|-----------|-----|
| 25 | **Botones de acción entre card de resumen y tabla de items** en detalle de venta — rompe flujo de lectura | Molestia menor | `ventas/[id]/page.tsx:42-73` | Mover botones después de la tabla |
| 26 | **Sidebar se vuelve tabs horizontales con scroll** en mobile — patrón no estándar | Usuarios pueden no descubrir items | `app-sidebar.tsx:68` | Evaluar hamburger menu o bottom bar |
| 27 | **Header demasiado denso en mobile** — logo + nombre + tipo + email + badge + theme + avatar + logout envuelven a 3+ líneas | Consume espacio vertical valioso | `app-header.tsx:35-87` | Ocultar elementos no críticos en mobile |

---

*Documento generado el 27-05-2026 — Revisión UX/UI completa del módulo Fiado + cross-module audit.*
