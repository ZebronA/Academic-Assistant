# Academic Assistant — Schema Reconciliation

## Purpose

This records the first reconciliation between the canonical domain documents and the live Supabase schema. It is a decision record, not a migration.

## Live baseline

Tables currently present: profiles, academic_periods, courses, course_states, tasks, assessments, academic_events, observations, recurring_requirements, timetable_entries, study_sessions, course_state_history.

Current migrations: initial_academic_assistant_schema, add_academic_events, formalize_academic_v0_model, fix_task_ownership_constraint.

All listed tables currently have RLS enabled.

## Findings

### 1. Protected semantics remain intentionally open

The current course state values are protected, stable, cooling, weak, and critical. `protected` is intentionally retained for now because it is already part of the live course-state schema.

The reviewed product discussion does not define `protected` or establish its transition rules. The earlier reconciliation therefore went beyond the available design evidence when it treated `protected` as an academic gate and proposed removing it.

Current decision: retain `protected` while explicitly marking its semantics as unresolved. Do not redefine it as an online-course state, timetable condition, assessment flag, deadline state, or gate without a further domain decision.

A future design may change the representation once the meaning of `protected` is established. That is an open domain decision, not a migration decision at this stage.

### 2. Current course state is a projection

course_states should be treated as a read-oriented current projection. Evidence should drive recalculation, and course_state_history should preserve meaningful transitions. Direct manual state editing should not be the normal application path.

### 3. Recurring requirements need concrete occurrences

recurring_requirements correctly represents the recurring rule, but there is no explicit identity for each generated occurrence.

Decision: introduce a recurring-occurrence concept so each generated instance has identity, lifecycle, intended date/window, duplicate protection, and a link back to its originating rule. Generated tasks should reference the occurrence.

### 4. Cross-user ownership must be universal

Most user-owned parent relationships already use composite ownership constraints. Two confirmed gaps need correction:

- tasks to recurring_requirements currently rely on a simple parent foreign key rather than a user-scoped relationship.
- course_state_history currently lacks the same composite user/course ownership constraint used by course_states.

Decision: every user-owned child referencing a user-owned parent must enforce both ownership and identity through the database relationship.

### 5. Confirmation must be explicit

academic_events and observations currently default confirmation_status to confirmed.

Decision: confirmation is an application/domain decision, not a convenient database default. Assistant interpretations that remain uncertain should be proposed. Explicit, unambiguous user-reported facts may be confirmed.

### 6. Provenance needs a canonical vocabulary

Source values differ slightly between entities. This is acceptable where semantics differ, but application code must not invent source values ad hoc.

Decision: define a canonical provenance vocabulary and document intentional entity-specific restrictions before assistant writes are implemented.

### 7. Assessment results are a later concept

The assessments table describes evaluation points but does not yet contain a dedicated result/evidence model.

Decision: keep assessment results out of the first schema refinement unless the initial state engine requires them. Add a separate result/evidence concept later rather than overloading assessments.

### 8. Persistent availability is deferred

The domain needs availability for mature block-aware decisions, but persistent availability is not required for the first core loop.

Decision: initially use timetable plus current time and, where needed, a request-level available block. Defer a persistent availability model.

### 9. Priority remains derived

No priority table or permanent next-action column is required now. Priority must be recalculable from current academic data and opportunity.

### 10. Event vocabulary stays deliberately small

Current event types cover the concrete workflows already modeled. Do not expand the event enum speculatively. Add event types only when a real workflow needs an auditable occurrence that does not belong as a task, assessment, observation, or study session.

### 11. State history should normally be system-generated

User and assistant statements should normally become evidence or observations. State-history records should normally be produced by deterministic state calculation.

### 12. Academic period currentness needs database enforcement

academic_periods has is_current but does not yet enforce at most one current academic period per user.

Decision: add a database-level uniqueness rule so a user cannot have two current academic periods.

## Security and performance follow-up

The live Supabase advisors report one security finding around the public execution permissions of the handle_new_user trigger helper, plus performance findings concerning unindexed foreign keys and RLS policies that repeatedly evaluate authentication functions.

These should be hardened deliberately before production. They are separate from the core domain redesign.

## Migration groups

### A — Domain integrity

- preserve `protected` while refining its semantics and transition rules
- enforce one current academic period per user
- add missing composite ownership constraints
- define confirmation behavior
- establish provenance rules

### B — Recurring occurrences

- add occurrence identity
- prevent duplicate generation
- connect occurrences to generated tasks

### C — Hardening

- restrict unnecessary trigger-helper execution
- optimize RLS authentication expressions
- add relationship indexes based on actual application queries

### Later

- assessment results
- persistent availability
- richer evidence
- additional event types when required

## Do not change yet

- no AI memory table
- no permanent priority score
- no permanent next_action field
- no speculative event types
- no rigid availability scheduler
- no invented academic data
- no assistant direct-to-database writes

## Exit condition

Application-layer implementation begins only after course condition/gates, ownership constraints, recurring occurrence identity, confirmation behavior, current-period uniqueness, state projection semantics, and hardening priorities have been deliberately resolved.

## Principle

Refine the existing database through intentional migrations. Do not replace the schema wholesale.
