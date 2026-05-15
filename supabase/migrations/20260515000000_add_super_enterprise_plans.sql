-- MultiStock: migrar a 4 planes (free, pro, super, enterprise)
-- Se elimina business (ahora super) y se migran datos existentes

-- 1. Migrar negocios business → super
update public.businesses
set subscription_plan = 'super'
where subscription_plan = 'business';

-- 2. Actualizar constraint con solo 4 planes
alter table public.businesses
  drop constraint if exists businesses_subscription_plan_check;

alter table public.businesses
  add constraint businesses_subscription_plan_check
  check (subscription_plan in ('free', 'pro', 'super', 'enterprise'));
