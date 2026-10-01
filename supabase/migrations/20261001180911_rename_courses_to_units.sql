-- Historical reconciliation for the live courses -> units rename.
-- Migration version: 20261001180911
--
-- This migration has already been applied to the production Supabase project.
-- The repository file is restored so migration history is complete. It must
-- not be re-applied to an already-renamed database.

alter table public.courses rename to units;
alter table public.course_states rename to unit_states;
alter table public.course_state_history rename to unit_state_history;
alter table public.course_relationships rename to unit_relationships;

alter table public.units rename column course_type to unit_type;

alter table public.unit_states rename column course_id to unit_id;
alter table public.unit_state_history rename column course_id to unit_id;
alter table public.unit_relationships rename column from_course_id to from_unit_id;
alter table public.unit_relationships rename column to_course_id to to_unit_id;

alter table public.tasks rename column course_id to unit_id;
alter table public.assessments rename column course_id to unit_id;
alter table public.academic_events rename column course_id to unit_id;
alter table public.observations rename column course_id to unit_id;
alter table public.recurring_requirements rename column course_id to unit_id;
alter table public.timetable_entries rename column course_id to unit_id;
alter table public.study_sessions rename column course_id to unit_id;

update public.academic_events
set event_type = 'unit_state_changed'
where event_type = 'course_state_changed';

alter table public.academic_events
  drop constraint if exists academic_events_event_type_check;

alter table public.academic_events
  add constraint academic_events_event_type_check
  check (event_type in (
    'class_attended','class_cancelled','class_rescheduled','class_started',
    'class_ended','task_created','task_completed','assessment_completed',
    'assessment_missed','study_session_completed','unit_state_changed',
    'observation_recorded','note'
  ));

-- Rename indexes, sequences, constraints, and policies containing the old
-- domain term where PostgreSQL permits it and where no replacement exists.
do $$
declare r record; new_name text;
begin
  for r in
    select n.nspname schema_name, c.relname object_name, c.relkind
    from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind in ('i','S') and c.relname ilike '%course%'
  loop
    new_name := replace(replace(r.object_name,'courses','units'),'course','unit');
    if new_name <> r.object_name and not exists (
      select 1 from pg_class e join pg_namespace en on en.oid=e.relnamespace
      where en.nspname=r.schema_name and e.relname=new_name
    ) then
      execute format(
        'alter %s %I.%I rename to %I',
        case when r.relkind='i' then 'index' else 'sequence' end,
        r.schema_name,r.object_name,new_name
      );
    end if;
  end loop;
end $$;

do $$
declare r record; new_name text;
begin
  for r in
    select n.nspname schema_name,c.relname table_name,con.conname constraint_name
    from pg_constraint con
    join pg_class c on c.oid=con.conrelid
    join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and con.conname ilike '%course%'
  loop
    new_name := replace(replace(r.constraint_name,'courses','units'),'course','unit');
    if new_name <> r.constraint_name then
      execute format(
        'alter table %I.%I rename constraint %I to %I',
        r.schema_name,r.table_name,r.constraint_name,new_name
      );
    end if;
  end loop;
end $$;

do $$
declare r record; new_name text;
begin
  for r in
    select n.nspname schema_name,c.relname table_name,p.polname policy_name
    from pg_policy p
    join pg_class c on c.oid=p.polrelid
    join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and p.polname ilike '%course%'
  loop
    new_name := replace(replace(r.policy_name,'courses','units'),'course','unit');
    if new_name <> r.policy_name then
      execute format(
        'alter policy %I on %I.%I rename to %I',
        r.policy_name,r.schema_name,r.table_name,new_name
      );
    end if;
  end loop;
end $$;
