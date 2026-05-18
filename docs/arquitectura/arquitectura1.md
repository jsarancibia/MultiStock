# Arquitectura 1 - Base tecnica, base de datos y onboarding

Este archivo contiene las primeras 3 fases del proyecto MultiStock. El objetivo es dejar preparada la base tecnica para que el sistema pueda funcionar como una aplicacion SaaS de control de inventario para verdulerias, almacenes y ferreterias.

Estas fases deben ejecutarse en orden. No avanzar a `arquitectura2.md` hasta completar los criterios de aceptacion de las fases 1, 2 y 3.

## Reglas para Cursor

- Trabajar siempre pensando en un MVP funcional.
- No crear funcionalidades avanzadas que no esten pedidas en la fase.
- Mantener el codigo modular y facil de ampliar.
- Usar nombres internos en ingles para codigo, tablas, tipos y variables.
- Usar textos visibles en espanol para la interfaz.
- Separar la logica comun del sistema de la logica especifica por rubro.
- No crear tres aplicaciones distintas: todo debe ser una sola plataforma.
- Todo dato operativo debe pertenecer a un `business_id`.
- Preparar la estructura para Supabase y Row Level Security desde el inicio.

---

# Fase 1 - Inicializacion tecnica del proyecto

## Objetivo

Crear la base del proyecto web con Next.js y preparar la estructura inicial para desarrollar MultiStock de forma ordenada.

## Resultado esperado

Al finalizar esta fase debe existir una aplicacion Next.js funcional, con TypeScript, Tailwind CSS, estructura de carpetas inicial y una pantalla principal basica.

## Stack a usar

- Next.js con App Router.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Supabase JS Client.
- Zod.
- React Hook Form.
- TanStack Table.
- Recharts.

## Tareas para Cursor

1. Crear el proyecto Next.js en la carpeta actual si todavia no existe.
2. Configurar TypeScript.
3. Configurar Tailwind CSS.
4. Instalar y configurar shadcn/ui.
5. Instalar dependencias iniciales:
   - `@supabase/supabase-js`
   - `zod`
   - `react-hook-form`
   - `@hookform/resolvers`
   - `@tanstack/react-table`
   - `recharts`
   - `lucide-react`
6. Crear estructura base de carpetas:

```txt
app/
components/
components/ui/
components/layout/
components/forms/
components/dashboard/
components/productos/
config/
lib/
lib/supabase/
lib/auth/
lib/business/
lib/validations/
modules/
modules/core/
modules/verduleria/
modules/almacen/
modules/ferreteria/
types/
supabase/
supabase/migrations/
```

7. Crear una pagina inicial simple en `app/page.tsx`.
8. Crear layout global en `app/layout.tsx`.
9. Preparar estilos globales.
10. Crear archivo `.env.example` con las variables necesarias:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

11. Crear cliente de Supabase para navegador en `lib/supabase/client.ts`.
12. Crear cliente de Supabase para servidor en `lib/supabase/server.ts` si se usa SSR o Server Actions.

## Archivos esperados

```txt
app/page.tsx
app/layout.tsx
app/globals.css
components/ui/
components/layout/
config/
lib/supabase/client.ts
lib/supabase/server.ts
.env.example
```

## Criterios de aceptacion

- El proyecto inicia localmente sin errores.
- Tailwind CSS funciona.
- shadcn/ui queda listo para usar componentes.
- Existe una estructura clara de carpetas.
- Existen los clientes de Supabase.
- No hay datos sensibles reales dentro del repositorio.

## Manual

Estas tareas debe hacerlas el desarrollador si Cursor no puede completarlas solo:

- Crear el proyecto en Supabase desde el panel web.
- Copiar la URL del proyecto de Supabase.
- Copiar la anon key publica de Supabase.
- Crear el archivo `.env.local` basado en `.env.example`.
- Completar las variables:

```env
NEXT_PUBLIC_SUPABASE_URL=valor_real
NEXT_PUBLIC_SUPABASE_ANON_KEY=valor_real
```

- Verificar que la aplicacion levante con `npm run dev`.

---

# Fase 2 - Base de datos multi-negocio en Supabase

## Objetivo

Crear el modelo inicial de base de datos para soportar usuarios, negocios, rubros, productos, inventario, ventas, proveedores y alertas.

## Resultado esperado

Al finalizar esta fase debe existir una base de datos preparada para que multiples negocios usen la misma plataforma sin mezclarse entre si.

## Principio principal

Toda tabla operativa debe tener `business_id` para aislar los datos de cada comercio.

## Tablas iniciales

Crear migraciones SQL para:

- `profiles`
- `businesses`
- `business_users`
- `categories`
- `suppliers`
- `products`
- `stock_movements`
- `sales`
- `sale_items`
- `stock_alerts`

## Enums recomendados

Crear enums o checks para valores controlados:

```txt
business_type:
- verduleria
- almacen
- ferreteria

business_role:
- owner
- admin
- staff

unit_type:
- unit
- kg
- g
- box
- liter
- meter

stock_movement_type:
- purchase
- sale
- adjustment
- waste
- return
- initial_stock

stock_alert_type:
- low_stock
- out_of_stock
- perishable_warning
- waste_warning
```

## Estructura de tablas

### profiles

```txt
id uuid primary key references auth.users(id)
full_name text
email text
created_at timestamp
updated_at timestamp
```

### businesses

```txt
id uuid primary key
owner_id uuid references profiles(id)
name text not null
business_type text not null
created_at timestamp
updated_at timestamp
```

### business_users

```txt
id uuid primary key
business_id uuid references businesses(id)
user_id uuid references profiles(id)
role text not null
created_at timestamp
```

### categories

```txt
id uuid primary key
business_id uuid references businesses(id)
name text not null
business_type text
created_at timestamp
updated_at timestamp
```

### suppliers

```txt
id uuid primary key
business_id uuid references businesses(id)
name text not null
phone text
email text
address text
created_at timestamp
updated_at timestamp
```

### products

```txt
id uuid primary key
business_id uuid references businesses(id)
category_id uuid references categories(id)
supplier_id uuid references suppliers(id)
name text not null
sku text
barcode text
unit_type text not null
cost_price numeric default 0
sale_price numeric default 0
min_stock numeric default 0
current_stock numeric default 0
business_type text not null
metadata jsonb default '{}'
active boolean default true
created_at timestamp
updated_at timestamp
```

### stock_movements

```txt
id uuid primary key
business_id uuid references businesses(id)
product_id uuid references products(id)
type text not null
quantity numeric not null
reason text
unit_cost numeric
created_by uuid references profiles(id)
created_at timestamp
```

### sales

```txt
id uuid primary key
business_id uuid references businesses(id)
total numeric not null
payment_method text
created_by uuid references profiles(id)
created_at timestamp
```

### sale_items

```txt
id uuid primary key
sale_id uuid references sales(id)
product_id uuid references products(id)
quantity numeric not null
unit_price numeric not null
subtotal numeric not null
```

### stock_alerts

```txt
id uuid primary key
business_id uuid references businesses(id)
product_id uuid references products(id)
type text not null
message text not null
resolved boolean default false
created_at timestamp
```

## Tareas para Cursor

1. Crear migracion SQL inicial en `supabase/migrations/`.
2. Definir tablas con claves primarias UUID.
3. Agregar relaciones entre tablas.
4. Agregar campos `created_at` y `updated_at` donde corresponda.
5. Agregar indices para:
   - `business_id`
   - `product_id`
   - `user_id`
   - `business_type`
6. Activar Row Level Security en todas las tablas operativas.
7. Crear politicas iniciales para que un usuario solo vea datos de negocios donde exista en `business_users`.
8. Crear funcion o trigger para crear `profiles` al registrarse un usuario.
9. Crear tipos TypeScript basicos en `types/database.ts`.

## Criterios de aceptacion

- Las migraciones se ejecutan sin errores.
- Las tablas existen en Supabase.
- Cada tabla operativa tiene `business_id` directo o indirecto.
- RLS esta activado.
- Un usuario no puede leer datos de negocios ajenos.
- `metadata` existe en productos para campos especificos por rubro.

## Manual

Estas tareas puede tener que realizarlas el desarrollador:

- Ejecutar las migraciones en Supabase.
- Revisar en el panel de Supabase que las tablas fueron creadas.
- Confirmar que RLS este activo.
- Crear usuarios de prueba desde la app o desde Supabase Auth.
- Verificar manualmente las politicas si Supabase requiere ajustes desde el panel.

---

# Fase 3 - Autenticacion, negocio y seleccion de rubro

## Objetivo

Permitir que un usuario se registre, inicie sesion, cree su negocio y seleccione el rubro con el que va a trabajar.

## Resultado esperado

Al finalizar esta fase, el usuario debe poder entrar al sistema y quedar asociado a un negocio de tipo verduleria, almacen o ferreteria.

## Flujo requerido

1. Usuario entra a la plataforma.
2. Se registra o inicia sesion.
3. Si no tiene negocio, va a onboarding.
4. Crea el negocio.
5. Selecciona rubro.
6. El sistema guarda el negocio.
7. El sistema crea relacion en `business_users`.
8. El usuario entra al dashboard.

## Rutas sugeridas

```txt
/auth/login
/auth/register
/onboarding
/dashboard
```

## Tareas para Cursor

1. Crear pantallas de login y registro.
2. Conectar formularios con Supabase Auth.
3. Crear validaciones con Zod.
4. Crear pantalla de onboarding.
5. Crear formulario para:
   - nombre del negocio
   - tipo de negocio
6. Crear selector visual de rubro:
   - Verduleria
   - Almacen
   - Ferreteria
7. Guardar registro en `businesses`.
8. Guardar relacion en `business_users` con rol `owner`.
9. Crear helper para obtener el negocio activo del usuario.
10. Proteger rutas privadas.
11. Redirigir:
   - usuarios sin sesion a login
   - usuarios sin negocio a onboarding
   - usuarios con negocio a dashboard
12. Crear configuracion inicial en `config/business-types.ts`.

## Configuracion de rubros

Crear una configuracion parecida a esta:

```ts
export const businessTypes = {
  verduleria: {
    label: "Verduleria",
    modules: ["products", "inventory", "sales", "suppliers", "waste"],
    productFields: ["expiration", "weight_sale", "waste_enabled"],
    dashboard: "verduleria"
  },
  almacen: {
    label: "Almacen",
    modules: ["products", "inventory", "sales", "suppliers", "margins"],
    productFields: ["category_margin", "fast_rotation"],
    dashboard: "almacen"
  },
  ferreteria: {
    label: "Ferreteria",
    modules: ["products", "inventory", "sales", "suppliers", "technical_specs"],
    productFields: ["brand", "variant", "technical_specs"],
    dashboard: "ferreteria"
  }
};
```

## Archivos esperados

```txt
app/auth/login/page.tsx
app/auth/register/page.tsx
app/onboarding/page.tsx
app/dashboard/page.tsx
config/business-types.ts
lib/auth/
lib/business/
lib/validations/
```

## Criterios de aceptacion

- El usuario puede registrarse.
- El usuario puede iniciar sesion.
- El usuario puede crear un negocio.
- El usuario puede seleccionar rubro.
- El rubro queda guardado en `businesses.business_type`.
- Se crea la relacion del usuario con su negocio.
- Las rutas privadas quedan protegidas.

## Manual

Estas tareas puede tener que hacerlas el desarrollador:

- Activar proveedores de autenticacion en Supabase.
- Configurar URL del sitio en Supabase Auth.
- Configurar redirect URLs para local y Vercel.
- Probar registro con un email real.
- Confirmar emails si Supabase lo requiere.
- Revisar en la base que se hayan creado `profiles`, `businesses` y `business_users`.

## Checklist para pasar a arquitectura2.md

- Proyecto Next.js funcionando.
- Supabase conectado.
- Base de datos creada.
- RLS inicial configurado.
- Registro e inicio de sesion funcionando.
- Onboarding funcionando.
- Negocio creado con tipo de rubro.
- Dashboard privado accesible.
