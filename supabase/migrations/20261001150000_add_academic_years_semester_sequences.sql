create table public.academic_years (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  starts_on date,
  ends_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint academic_years_user_name_unique unique (user_id, name),
  constraint academic_years_user_id_unique unique (user_id, id),
  constraint academic_years_dates_check check (starts_on is null or ends_on is null or ends_on >= starts_on)
);

alter table public.academic_years enable row level security;

create policy "Users can view own academic years" on public.academic_years for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create own academic years" on public.academic_years for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own academic years" on public.academic_years for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own academic years" on public.academic_years for delete to authenticated using ((select auth.uid()) = user_id);

alter table public.academic_periods add column academic_year_id uuid, add column semester smallint;

insert into public.academic_years (user_id,name,starts_on,ends_on)
select user_id,'2026/27',starts_on,ends_on from public.academic_periods
where not exists (select 1 from public.academic_years ay where ay.user_id=academic_periods.user_id and ay.name='2026/27');

update public.academic_periods ap set academic_year_id=ay.id, semester=1
from public.academic_years ay where ay.user_id=ap.user_id and ay.name='2026/27';

alter table public.academic_periods alter column academic_year_id set not null, alter column semester set not null;
alter table public.academic_periods
 add constraint academic_periods_semester_check check (semester in (1,2)),
 add constraint academic_periods_year_semester_unique unique (user_id,academic_year_id,semester),
 add constraint academic_periods_user_year_fk foreign key (user_id,academic_year_id) references public.academic_years(user_id,id);

create table public.course_relationships (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 from_course_id uuid not null,
 to_course_id uuid not null,
 relationship_type text not null default 'sequence',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint course_relationships_type_check check (relationship_type='sequence'),
 constraint course_relationships_not_self_check check (from_course_id<>to_course_id),
 constraint course_relationships_unique unique (user_id,from_course_id,to_course_id,relationship_type),
 constraint course_relationships_from_fk foreign key (user_id,from_course_id) references public.courses(user_id,id) on delete cascade,
 constraint course_relationships_to_fk foreign key (user_id,to_course_id) references public.courses(user_id,id) on delete cascade
);

alter table public.course_relationships enable row level security;
create policy "Users can view own course relationships" on public.course_relationships for select to authenticated using ((select auth.uid())=user_id);
create policy "Users can create own course relationships" on public.course_relationships for insert to authenticated with check ((select auth.uid())=user_id);
create policy "Users can update own course relationships" on public.course_relationships for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "Users can delete own course relationships" on public.course_relationships for delete to authenticated using ((select auth.uid())=user_id);

create or replace function public.create_current_academic_period(p_name text,p_academic_year text,p_semester smallint,p_starts_on date,p_ends_on date)
returns public.academic_periods language plpgsql security invoker set search_path=public as $$
declare v_user_id uuid:=auth.uid(); v_year_id uuid; v_period public.academic_periods;
begin
 if v_user_id is null then raise exception 'You must be signed in.'; end if;
 if nullif(trim(p_name),'') is null then raise exception 'Period name is required.'; end if;
 if nullif(trim(p_academic_year),'') is null then raise exception 'Academic year is required.'; end if;
 if p_semester not in (1,2) then raise exception 'Semester must be 1 or 2.'; end if;
 if p_ends_on < p_starts_on then raise exception 'ends_on cannot be before starts_on.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(v_user_id::text,0));
 insert into public.academic_years(user_id,name,starts_on,ends_on) values(v_user_id,trim(p_academic_year),p_starts_on,p_ends_on)
 on conflict(user_id,name) do nothing;
 select id into v_year_id from public.academic_years where user_id=v_user_id and name=trim(p_academic_year);
 update public.academic_periods set is_current=false where user_id=v_user_id and is_current=true;
 insert into public.academic_periods(user_id,academic_year_id,name,semester,starts_on,ends_on,is_current)
 values(v_user_id,v_year_id,trim(p_name),p_semester,p_starts_on,p_ends_on,true) returning * into v_period;
 return v_period;
end; $$;

revoke execute on function public.create_current_academic_period(text,text,smallint,date,date) from public;
grant execute on function public.create_current_academic_period(text,text,smallint,date,date) to authenticated;