-- Absorbi storage: a private bucket for MRI files, scoped by hospital.

insert into storage.buckets (id, name, public)
values ('mri', 'mri', false)
on conflict (id) do nothing;

create policy "hospital can read mri"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'mri'
    and (storage.foldername(name))[1] = public.current_hospital_id()::text
  );

create policy "hospital can upload mri"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'mri'
    and (storage.foldername(name))[1] = public.current_hospital_id()::text
  );

create policy "hospital can update mri"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'mri'
    and (storage.foldername(name))[1] = public.current_hospital_id()::text
  );
