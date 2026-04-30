# Modelo SaaS - preparacion comercial (sin pagos reales)

## Objetivo

Preparar estructura tecnica para planes, limites y roles sin introducir cobros reales todavia.

## Planes iniciales propuestos

- Starter: 1 negocio, 1 usuario, catalogo limitado.
- Pro: 1 negocio, multiusuario, exportaciones y auditoria visible.
- Business: multi-negocio/sucursales, roles avanzados y reportes extendidos.

## Roles objetivo

- owner
- admin
- staff
- viewer

## Tablas tecnicas candidatas

```txt
plans
subscriptions
usage_limits
invitations
```

## Feature flags sugeridos

- `plans_v3`
- `invitations_v3`
- `branches_v2`
- `cash_simple_v2`
- `cafeteria_v2`

## Regla de despliegue

1. Se validan usuarios y propuesta de valor.
2. Se activan planes sin cobro (modo manual).
3. Se mide uso y limites.
4. Luego se evalua proveedor de pagos.

## No implementar antes de validar

- pasarela de pago real
- suscripciones automaticas
- facturacion fiscal
