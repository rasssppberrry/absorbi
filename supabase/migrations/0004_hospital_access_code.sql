-- Store a readable access code on each hospital so the register page can
-- auto fill it. The hospitals table is already readable by everyone.

alter table public.hospitals add column if not exists access_code text;

update public.hospitals set access_code = 'NCN-2026'
  where name = 'National Centre for Neurosurgery';
update public.hospitals set access_code = 'UMC-2026'
  where name = 'University Medical Center';
update public.hospitals set access_code = 'ALM-2026'
  where name = 'Almaty Central Hospital';
