# Academic Assistant — Development Roadmap

## 1. Purpose

Build the smallest complete academic decision loop before adding breadth.

~~~text
academic reality → evidence → state → priority → action → outcome → recalculation
~~~

## 2. Current Starting Point

The project has a Next.js/React/TypeScript application, Git/GitHub repository, Supabase project, initial academic schema, row-level security, ownership constraints, tasks, assessments, recurring requirements, timetable entries, events, observations, study sessions, unit state, and state history.

The existing database is a foundation. It must be reconciled against the canonical domain documentation before application logic is built around it.

## 3. Phase 1 — MVP Domain Reconciliation

The MVP domain is now sufficiently defined to implement the core decision loop.

Established MVP concepts:

- academic period
- unit
- unit state
- task
- assessment
- recurring requirement
- timetable
- academic event
- observation
- study session
- unit state history
- protected preservation state
- deterministic priority decision

The MVP intentionally defers:

- recurring occurrence generation
- persistent availability
- assessment result entity
- richer unit characteristics
- assistant interface
- reminders
- integrations

Exit condition: the database and application can represent the student's current academic situation and produce a defensible next action.

## 4. Phase 2 — Application and Domain Layer

Create a controlled boundary between UI/assistant and Supabase.

~~~text
UI / Assistant
      ↓
Application commands
      ↓
Domain validation
      ↓
Persistence
      ↓
Evidence / Events
      ↓
State
      ↓
Priority
~~~

Initial conceptual commands include:

- createTask
- completeTask
- createAssessment
- completeAssessment
- createObservation
- recordStudySession
- recordAcademicEvent
- createRecurringRequirement
- generateRecurringOccurrence
- calculateAcademicState
- calculateNextAction

Exit condition: important mutations pass through predictable domain/application operations.

## 5. Phase 3 — Academic State Engine

Build deterministic, testable state calculation from:

- active gates
- unresolved backlog
- assessment pressure
- practice and evidence recency
- understanding evidence
- completion status
- recent outcomes
- uncertainty

Requirements:

- same input produces same state
- meaningful transitions create history
- every meaningful state is explainable
- hours alone never establish mastery
- lack of recorded evidence is not automatically evidence of failure
- AI does not secretly calculate authoritative state

## 6. Phase 4 — Priority Engine

Build next-action selection from:

- hard gates
- deadline pressure
- backlog
- weakness/cooling
- action effectiveness
- duration fit
- context fit
- energy fit
- strategic value

Requirements:

- actions are evaluated by current situation, not permanent unit ranking
- infeasible actions are removed
- reasons are retained
- timetable disruption triggers recalculation
- urgency is distinct from weakness
- no opaque AI score is authoritative

## 7. Phase 5 — Core Dashboard

Build a dashboard that exposes the system without requiring conversation.

~~~text
TODAY
confirmed classes / changes

NEEDS ATTENTION
gates / deadlines / backlog

ACADEMIC STATE
unit conditions

AVAILABLE
current opportunity

WHAT SHOULD I DO NEXT?
recommended action + reason + duration
~~~

Initial sections:

- dashboard
- units
- tasks
- assessments
- timetable
- recurring requirements
- study sessions
- state/history

Business rules belong in the application/domain layer, not duplicated in React components.

## 8. Phase 6 — Action Loop

Implement:

~~~text
recommendation → start → work → outcome → evidence → state recalculation → priority recalculation
~~~

Starting a task is not completing it. Completing a task is not automatically mastery. Study outcomes determine what evidence is produced.

Exit condition: completing an action can materially change the next recommendation.

## 9. Phase 7 — Availability and Context

Add flexible availability information such as:

- start/end
- duration
- energy
- location
- context constraints

The purpose is to answer:

> What useful academic action fits the opportunity that exists now?

Do not turn availability into another rigid timetable.

## 10. Phase 8 — Recurring Requirements

Model the lifecycle:

~~~text
Recurring rule → concrete occurrence → obligation/task → completion
~~~

Prevent duplicate occurrence generation and preserve the originating rule.

## 11. Phase 9 — Assistant Interface

Only after the deterministic core is reliable, add natural-language operation.

Initial intents:

- What should I do now?
- What needs attention?
- I completed the Economics assignment.
- I studied Programming for an hour.
- The OS class was cancelled.
- Add this assignment.
- When is my next assessment?
- Why is Programming cooling?
- Why did you choose this task?

The assistant interprets language, resolves entities, retrieves records, proposes or executes permitted mutations, preserves provenance, handles ambiguity, and explains state/priority.

It must never bypass validation or become the source of truth.

## 12. Phase 10 — Reminders

Later, derive reminders from persistent facts and current priority for classes, changed classes, online requirements, quizzes, assignments, assessments, backlog, neglected units, and promised actions.

Do not flood the student with reminders.

## 13. Phase 11 — Assessment Feedback

Later add scores, marks, feedback, topic-level weaknesses, and assessment evidence so the system can distinguish study activity from demonstrated performance.

## 14. Phase 12 — Integrations

Potential later integrations include calendar, university timetable, LMS, notifications, and imported unit material.

Imported information must preserve provenance and must not silently become unquestioned truth.

## 15. Phase 13 — Personalization

Only after the deterministic system works reliably should usage patterns influence recommendations, such as actual task duration, action effectiveness, context preferences, or typical energy patterns.

Personalization may adjust recommendations but must not override explicit academic constraints.

## 16. MVP Scope

### Required

- authenticated user
- academic period
- units
- tasks
- assessments
- timetable
- recurring requirements
- study sessions
- observations/events
- unit state
- state history
- deterministic state engine
- deterministic priority engine
- dashboard
- next-action loop

### Deferred

- recurring occurrence generation
- persistent availability model
- richer unit characteristics
- assessment results
- natural-language assistant
- reminders
- external integrations
- advanced personalization
- predictive analytics

## 17. What Not to Build First

Do not begin with a sophisticated chatbot, machine-learning priority prediction, elaborate notifications, complex calendar synchronization, full LMS integration, automatic academic scraping, a large analytics dashboard, or a rigid study scheduler.

These can hide whether the core academic decision loop actually works.

## 18. Testing Strategy

### State

- no evidence must not produce false mastery
- stale practice can produce cooling
- backlog produces an appropriate warning
- successful independent practice improves evidence
- assessment pressure responds to preparation gaps
- unchanged evidence does not create duplicate history

### Priority

- an expiring hard gate outranks ordinary maintenance
- impossible actions are excluded
- short blocks select fitting actions
- weakness produces targeted actions
- completion triggers recalculation
- timetable disruption changes opportunity
- there is no permanent unit ranking

### Assistant

- ambiguous references request clarification
- uncertain deadlines remain proposed
- explicit completion updates the correct task
- academic facts are never invented
- conflicts are surfaced
- repeated commands do not duplicate records

## 19. Implementation Order

~~~text
1. Reconcile domain model ↔ Supabase
2. Build application/domain commands
3. Build deterministic state engine
4. Build deterministic priority engine
5. Build dashboard
6. Build action loop
7. Deploy MVP
8. Use the system with real academic data
9. Add recurring occurrence generation
10. Add availability/context
11. Add assistant interface
12. Add reminders
13. Add assessment results
14. Add integrations
15. Add personalization
~~~

## 20. Real Academic Data

After the core model works, enter the actual semester through the product:

- current academic period
- units
- timetable
- known assessments
- assignments
- recurring online requirements
- confirmed events
- current evidence

Unconfirmed information remains explicitly uncertain. Do not invent dates or requirements merely to make the dashboard look complete.

## 21. Development Discipline

Every feature should answer:

1. What domain problem does this solve?
2. What persistent data does it require?
3. What evidence does it create?
4. Does it change state?
5. Does it change priority?
6. How is it tested?
7. What happens when information is uncertain?
8. Can the action be explained afterward?

Documentation defines intended behavior; code implements it. If implementation reveals a contradiction, update the domain documentation and schema deliberately rather than allowing accidental behavior to become the specification.

## 22. Definition of Completion

The product is meaningful when this loop works reliably:

~~~text
Academic reality
      ↓
Persistent evidence
      ↓
Correct current state
      ↓
Useful next action
      ↓
Student acts
      ↓
Outcome recorded
      ↓
State + priority update
~~~

## 23. Canonical Development Principle

~~~text
DOMAIN → EVIDENCE → STATE → PRIORITY → ACTION → UI → ASSISTANT → INTEGRATIONS
~~~

The underlying academic model must remain correct even without the assistant.
