-- MultiStock: plan comercial por negocio.
-- Todo negocio nuevo parte en Gratis hasta que se actualice manualmente o exista checkout.

alter table public.businesses
  add column if not exists subscription_plan text not null default 'free';

alter table public.businesses
  drop constraint if exists businesses_subscription_plan_check;

alter table public.businesses
  add constraint businesses_subscription_plan_check
  check (subscription_plan in ('free', 'pro', 'business'));

update public.businesses
set subscription_plan = 'free'
where subscription_plan is null;
