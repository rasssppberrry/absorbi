-- Per user isolation: each account sees only the cases it created.

drop policy if exists "read patients in my hospital" on public.patients;
create policy "read own patients"
  on public.patients for select to authenticated
  using (created_by = auth.uid());

drop policy if exists "insert patients in my hospital" on public.patients;
create policy "insert own patients"
  on public.patients for insert to authenticated
  with check (created_by = auth.uid());

drop policy if exists "read studies in my hospital" on public.studies;
create policy "read own studies"
  on public.studies for select to authenticated
  using (uploaded_by = auth.uid());

drop policy if exists "insert studies in my hospital" on public.studies;
create policy "insert own studies"
  on public.studies for insert to authenticated
  with check (uploaded_by = auth.uid());

drop policy if exists "update studies in my hospital" on public.studies;
create policy "update own studies"
  on public.studies for update to authenticated
  using (uploaded_by = auth.uid())
  with check (uploaded_by = auth.uid());

drop policy if exists "read predictions in my hospital" on public.predictions;
create policy "read own predictions"
  on public.predictions for select to authenticated
  using (exists (select 1 from public.studies s where s.id = predictions.study_id and s.uploaded_by = auth.uid()));

drop policy if exists "insert predictions in my hospital" on public.predictions;
create policy "insert own predictions"
  on public.predictions for insert to authenticated
  with check (exists (select 1 from public.studies s where s.id = predictions.study_id and s.uploaded_by = auth.uid()));

drop policy if exists "update predictions in my hospital" on public.predictions;
create policy "update own predictions"
  on public.predictions for update to authenticated
  using (exists (select 1 from public.studies s where s.id = predictions.study_id and s.uploaded_by = auth.uid()));

drop policy if exists "read signoffs in my hospital" on public.signoffs;
create policy "read own signoffs"
  on public.signoffs for select to authenticated
  using (exists (select 1 from public.predictions p join public.studies s on s.id = p.study_id where p.id = signoffs.prediction_id and s.uploaded_by = auth.uid()));

drop policy if exists "insert own signoffs" on public.signoffs;
create policy "insert own signoffs"
  on public.signoffs for insert to authenticated
  with check (clinician_id = auth.uid() and exists (select 1 from public.predictions p join public.studies s on s.id = p.study_id where p.id = signoffs.prediction_id and s.uploaded_by = auth.uid()));

drop policy if exists "read audit in my hospital" on public.audit_log;
create policy "read own audit"
  on public.audit_log for select to authenticated
  using (actor_id = auth.uid());
