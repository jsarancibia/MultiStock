Excelente. El documento de MultiStock es exhaustivo y proporciona una radiografía perfecta del sistema. Como Arquitecto de Software, veo que la estructura modular por rubros está bien encaminada, pero hay vulnerabilidades críticas de arquitectura, problemas de concurrencia inminentes y una deuda técnica en la UI/UX que debemos corregir antes de que el sistema escale o se abra a más usuarios en Chile.

__________________________
¡Me parece una excelente estrategia! Pasar este diagnóstico estructurado a DeepSeek (o Cursor usando DeepSeek) te va a ahorrar horas de trabajo manual, ya que el modelo es fantástico siguiendo instrucciones técnicas precisas y escribiendo migraciones SQL nativas.

Para asegurarte de que DeepSeek resuelva todo a la perfección sin generar nuevas "alucinaciones", te recomiendo que le pases el archivo original junto con las siguientes 3 instrucciones clave basadas en nuestra auditoría:

Orden de Prioridad Absoluto: Dile que antes de tocar nada del Frontend, aplique la migración del Trigger SQL en la base de datos de Supabase. Así, cualquier Server Action que use después se acoplará automáticamente a la lógica atómica de stock_movements.

Defensa Multi-Tenant: Pídele explícitamente que en cada Server Action que refactorice, verifique que el business_id provenga de la sesión validada del usuario (o de una cookie segura/JWT) y nunca sea un parámetro plano que el cliente pueda manipular desde el navegador.

Migración Limpia a Tailwind v4: Al pasarle el fragmento de globals.css, indícale que use la sintaxis @theme nativa (como la que te armé arriba) para que no intente usar el viejo archivo tailwind.config.js, evitando conflictos de versiones.

Si durante el proceso con DeepSeek te genera algún código, componente o lógica compleja que quieras que analicemos juntos para darle el visto bueno o refinar el diseño visual (como gráficos dinámicos o micro-interacciones), pégamelo por aquí.

¡Mucho éxito con esa refactorización masiva! Quedo atento a tus comandos cuando estés listo para el siguiente módulo.
--------------------------------------------------------------

A continuación, presento la auditoría profunda dividida en los 4 pilares solicitados, junto con los bloques de código listos para implementar en Cursor.

1. Análisis de Integridad y Lógica (Gestión de Stock)
El Diagnóstico Crítico
El sistema confía el descuento de stock a una función RPC (create_sale_with_items) con un bloqueo FOR UPDATE. Eso está bien para las ventas atómicas, pero el backend está completamente roto en la gestión diaria del inventario.

Problema: La acción agregarStockRapidoAction y el formulario StockMovementForm ejecutan mutaciones directas. Si un empleado registra una merma o una compra mientras se realiza una venta, se pueden generar condiciones de carrera (Race Conditions) o desfases en current_stock.

Solución: Debemos implementar un Trigger reactivo a nivel de Base de Datos en PostgreSQL. La columna current_stock en la tabla products nunca debería ser modificada manualmente por una API o Server Action; debe ser el resultado estricto y automático de los inserts en stock_movements.

Estado Actual vs. Propuesta de Mejora
Componente / Lógica	Estado Actual	Propuesta de Mejora (Arquitectura Profesional)
Cálculo de Existencias	Doble flujo: La RPC de ventas descuenta stock por un lado, y las Server Actions de movimientos modifican current_stock por otro.	Single Source of Truth: Un trigger AFTER INSERT en stock_movements recalcula o altera el current_stock de forma atómica para cualquier tipo de movimiento (purchase, waste, sale, etc.).
Auditoría del Histórico	Si se edita un producto mediante updateProductAction, se pueden alterar precios sin dejar registro del impacto en el valor del inventario flotante.	Registrar un snapshot del costo histórico directamente en cada movimiento, asegurando la integridad del cálculo del Capital Estimado.
Solución técnica: Migración SQL para el Trigger de Stock Atómico
Ejecuta esta migración en Supabase para centralizar la lógica de stock en la base de datos:

SQL
-- Migración: Sincronización atómica de stock mediante movimientos
CREATE OR REPLACE FUNCTION public.ts_sync_product_stock()
RETURNS TRIGGER AS $$
DECLARE
    v_delta NUMERIC(14,4);
BEGIN
    -- Determinar el impacto real en el inventario según el tipo de movimiento
    IF NEW.type IN ('purchase', 'return', 'initial_stock') THEN
        v_delta := ABS(NEW.quantity);
    ELSIF NEW.type IN ('sale', 'waste') THEN
        v_delta := -ABS(NEW.quantity);
    ELSIF NEW.type = 'adjustment' THEN
        v_delta := NEW.quantity; -- Puede ser positivo o negativo
    ELSE
        v_delta := NEW.quantity;
    END IF;

    -- Actualizar el stock con un Row Lock implícito
    UPDATE public.products
    SET 
        current_stock = current_stock + v_delta,
        updated_at = NOW()
    WHERE id = NEW.product_id AND business_id = NEW.business_id;

    -- Invocar la sincronización de alertas in-app automáticamente
    PERFORM public.sync_low_stock_alert(NEW.product_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER tr_sync_stock_on_movement
AFTER INSERT ON public.stock_movements
FOR EACH ROW EXECUTE FUNCTION public.ts_sync_product_stock();
2. Estética y Experiencia de Usuario (UI/UX)
El Diagnóstico Crítico
El sistema sufre de un "look de software antiguo" debido al uso de la paleta marrón (#2b1b16) en el Sidebar y layouts planos. Además, inicializar next-themes con enableSystem={false} y depender de layouts condicionales rompe la fluidez visual. Las 15 consultas en paralelo del dashboard bloquean la renderización si el cliente tiene una conexión móvil lenta en su negocio.

Estado Actual vs. Propuesta de Mejora
Elemento UI	Estado Actual	Propuesta de Mejora "Llamativa" y Moderna
Arquitectura de Color	Paleta estática marrón. Modo oscuro manual forzado sin armonía con Tailwind v4.	Color Tokens Dinámicos: Configurar variables CSS en globals.css usando gradientes modernos y un efecto Glassmorphism translúcido para el Sidebar.
Soporte Dark/Light	Clases CSS rígidas que dificultan el mantenimiento.	Uso de variables nativas de Tailwind v4 y @/components/ui basados en Shadcn adaptables con un solo prefijo dark:.
Implementación: Variables de Diseño de Alto Impacto (app/globals.css)
Copia esta estructura en tu archivo global. Reemplaza el marrón antiguo por una paleta Esmeralda Cyber/Ámbar de alta fidelidad, ideal para sistemas de alta frecuencia visual como los puntos de venta.

CSS
@import "tailwindcss";

@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-primary: var(--primary);
  --color-muted: var(--muted);
  --color-accent: var(--accent);
  --color-border: var(--border);
}

:root {
  --background: oklch(0.98 0.005 30);
  --foreground: oklch(0.15 0.01 240);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.15 0.01 240);
  --popover: oklch(1 0 0);
  --primary: oklch(0.62 0.19 155); /* Verde Esmeralda Vibrante */
  --muted: oklch(0.92 0.01 240);
  --accent: oklch(0.78 0.17 72);    /* Ámbar de Foco */
  --border: oklch(0.88 0.01 240);
}

.dark {
  --background: oklch(0.12 0.015 240);
  --foreground: oklch(0.98 0.005 30);
  --card: oklch(0.16 0.016 240);
  --card-foreground: oklch(0.98 0.005 30);
  --popover: oklch(0.16 0.016 240);
  --primary: oklch(0.68 0.18 155);
  --muted: oklch(0.22 0.02 240);
  --accent: oklch(0.82 0.16 72);
  --border: oklch(0.26 0.02 240);
}

/* Efecto Glassmorphism Moderno para Paneles */
.glass-panel {
  background: rgba(var(--card), 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
}
Componente Premium: Tarjeta de Métrica Interactiva con Micro-Interacciones
Copia este componente en components/ui/MetricCard.tsx. Reemplaza las tarjetas planas por una con gradientes internos, sombreado flotante y transformaciones de hardware al pasar el cursor (hover).

TypeScript
import React from 'react';
import { Slot } from '@radix-ui/react-slot';

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  description?: string;
  trend?: { value: number; isPositive: boolean };
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export function MetricCard({
  title,
  value,
  description,
  trend,
  icon,
  variant = 'default',
  className = '',
  ...props
}: MetricCardProps) {
  const variantStyles = {
    default: 'border-border hover:border-primary/40',
    success: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400',
    warning: 'border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400',
    danger: 'border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400',
    info: 'border-sky-500/20 bg-sky-500/5 text-sky-600 dark:text-sky-400',
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 ${variantStyles[variant]} ${className}`}
      {props}
    >
      <div className="absolute -right-4 -top-4 size-24 rounded-full bg-primary/5 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-primary/10" />
      
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className="rounded-xl p-2.5 bg-muted/50 text-foreground transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
        {trend && (
          <span className={`text-xs font-semibold ${trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      {description && (
        <p className="mt-1 text-xs text-muted-foreground/80 line-clamp-1">{description}</p>
      )}
    </div>
  );
}
3. Limpieza de "Alucinaciones" de IA y Refactorización
El Diagnóstico Crítico
El backend sufre de la típica fragmentación generada por IAs desordenadas: admin.ts y server.ts duplican clientes de Supabase con los mismos alcances, y la tabla profiles arrastra una columna plan obsoleta (deprecated). Además, el fetch masivo de 15 consultas pesadas simultáneas en el Dashboard degrada la experiencia del usuario.

Refactorización: Centralización de Clientes de Supabase (lib/supabase/server.ts)
Vamos a eliminar la redundancia de archivos unificando el cliente del servidor y el cliente administrativo de alta seguridad con protección estricta del service_role.

TypeScript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';

// Cliente estándar respetando RLS según la sesión del usuario
export async function getSupabaseServer() {
  const cookieStore = await cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Mitiga fallos si se invoca desde Server Components de solo lectura
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Mitiga fallos
          }
        },
      },
    }
  );
}

// Cliente con bypass de RLS exclusivo para tareas críticas del sistema y automatizaciones
export function getSupabaseAdmin() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get: () => undefined, set: () => {}, remove: () => {} } }
  );
}
4. Escalabilidad y Seguridad
El Diagnóstico Crítico
Vulnerabilidad de Middleware Ausente: Proteger rutas exclusivamente dentro de los Server Components es peligroso. Si un desarrollador olvida añadir requireUser() en una nueva página bajo app/(app)/*, el layout o la vista quedarán expuestos públicamente. La autenticación debe estar centralizada en la capa de red perimetral de Next.js.

Inyección de Datos Multi-Tenant: Las Server Actions que modifican entidades confían en los argumentos pasados por el cliente. Un usuario malicioso podría interceptar una Server Action y enviar un business_id ajeno para inyectar o alterar registros de otra empresa.

Solución de Seguridad Avanzada: Middleware Centralizado (middleware.ts)
Crea este archivo en la raíz del proyecto para blindar la plataforma y manejar los redireccionamientos antes de procesar cualquier componente.

TypeScript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const url = request.nextUrl.clone();

  // 1. Proteger rutas privadas del ecosistema SaaS
  if (url.pathname.startsWith('/(app)') || (!url.pathname.startsWith('/auth') && !url.pathname.startsWith('/_next') && url.pathname !== '/')) {
    if (!session) {
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }

    // Validar existencia de la cookie del negocio activo
    const businessId = request.cookies.get('multistock_active_business_id')?.value;
    if (!businessId && !url.pathname.startsWith('/onboarding')) {
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }
  }

  // 2. Evitar que usuarios autenticados vuelvan al Login/Registro
  if (url.pathname.startsWith('/auth/') && session) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|brand|.*\\..*|$).*)'],
};

