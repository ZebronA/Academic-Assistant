# Academic Assistant — Domain Model

## 1. Purpose

This document defines the canonical domain model for Academic Assistant.

It sits below `PRODUCT.md` and above implementation details.

The domain model describes:

- what academic entities exist
- what each entity means
- how entities relate
- which information is planned, actual, obligatory, evidentiary, or derived
- which data is authoritative
- where uncertainty and provenance belong

The database schema should implement this model. The schema must not silently redefine the product simply because a table already exists.

---

## 2. Core Model

Academic Assistant models an academic situation through four primary domains:

```
PLANS
What is expected to happen

EVENTS
What actually happened

OBLIGATIONS
What must be done

STATE
What the student's current academic condition is
```

The system derives decisions from them:

```
Plans + Events + Obligations
            ↓
      Academic State
            ↓
      Priority Engine
            ↓
       Next Action
```

---

## 3. Entity Map

The current domain entities are:

```
User
 └── Profile
      │
      └── Academic Period
           │
           └── Course
                │
                ├── Course State
                ├── Course State History
                ├── Tasks
                ├── Assessments
                ├── Recurring Requirements
                ├── Timetable Entries
                ├── Study Sessions
                ├── Observations
                └── Academic Events

Tasks ────────────────┐
Assessments ──────────┤
Courses ──────────────┤
                       ├── Academic Events / Observations
Study Sessions ───────┤
Recurring Requirements┘
```

Not every relationship is mandatory. A task, event, observation, or study session may be associated with a course, while some records can exist without one when the domain permits it.

---

## 4. User and Profile

### User

The authenticated user is the owner of academic data.

Application records are scoped to the authenticated user.

The system must never allow one user's academic records to reference another user's parent records.

### Profile

Stores user-level academic application preferences.

Current fields include:

- user id
- full name
- timezone
- created/updated timestamps

Timezone is important because academic dates and timetable times are interpreted in the student's local context.

The current default is `Africa/Nairobi`, but the model should remain timezone-aware rather than treating Nairobi as a universal rule.

---

## 5. Academic Period

An academic period groups courses and academic records into a bounded academic context.

Examples:

- Semester 1
- Semester 2
- Trimester
- Academic Year 2026

Current attributes:

- user
- name
- start date
- end date
- current/not-current status

A course belongs to an academic period.

The application should use the academic period as data, not hard-code a particular semester.

### Invariant

At most one academic period should normally be current for a user.

The current schema has an `is_current` field, but enforcing the one-current-period rule should be treated as a domain/schema concern before production use.

---

## 6. Course

A course is an academic unit being studied during an academic period.

Current attributes:

- user
- academic period
- code
- name
- course type
- active status

Current course types:

- technical
- conceptual
- practical
- mathematical
- online
- mixed

Course type is a broad classification. It should not become a container for every learning characteristic.

More detailed learning/assessment characteristics can be added as the domain requires them.

### Invariants

A course belongs to exactly one academic period.

A course belongs to exactly one user.

Course codes are unique within a user's academic period.

---

## 7. Course State

Course state is the current projection of the student's academic condition for a course.

Current states:

- protected
- stable
- cooling
- weak
- critical

Supporting attributes currently include:

- understanding level, 0–5
- backlog flag
- last practiced timestamp
- last evidence timestamp
- state reason
- updated timestamp

### Important distinction

Course state is **derived/current state**, not the complete historical record.

The system should increasingly calculate it from evidence such as:

- obligations
- assessment pressure
- completed work
- study sessions
- observations
- practice outcomes
- recency
- backlog
- other validated academic evidence

Manual state changes may exist, but the long-term design should avoid arbitrary permanent labels.

---

## 8. Course State History

Course state history records previous state projections.

Each history record may include:

- course
- state
- understanding level
- backlog
- reason
- recorded time
- source
- metadata

Historical records are append-oriented evidence.

A new state should not erase the previous state.

This allows the system to answer questions such as:

- When did the course become weak?
- What evidence caused the change?
- What happened after additional practice?
- How has the course state changed over time?

---

## 9. Timetable Entry

A timetable entry represents a planned recurring or scheduled academic commitment.

Current attributes include:

- user
- course, when applicable
- day of week
- start time
- end time
- location
- validity dates
- active status
- metadata

A timetable entry belongs to the **Plans** domain.

It does not prove that the event actually occurred.

For example:

```
Timetable:
Programming, 10:00–12:00
```

does not itself mean:

```
Programming class occurred for two hours
```

An actual occurrence should be represented by events.

---

## 10. Academic Event

An academic event records something that actually occurred or was recorded as an academic occurrence.

Current event types are:

- class_attended
- class_cancelled
- class_rescheduled
- class_started
- class_ended
- task_created
- task_completed
- assessment_completed
- assessment_missed
- study_session_completed
- course_state_changed
- observation_recorded
- note

An event can reference:

- course
- task
- assessment

and has:

- occurrence time
- title
- notes
- source
- confirmation status
- duration
- metadata

### Source

Current sources include:

- user
- assistant
- system
- imported
- university

### Confirmation

Current confirmation states are:

- proposed
- confirmed
- rejected

### Important rule

An assistant-generated interpretation should not automatically become a confirmed fact merely because the assistant produced it.

The default confirmation behavior should be reviewed before allowing autonomous assistant writes.

---

## 11. Task

A task is a concrete actionable obligation or activity.

Current attributes include:

- user
- optional course
- title
- description
- task type
- status
- estimated duration
- due time
- completion time
- source
- optional recurring requirement
- created/updated timestamps

Current task types:

- study
- practice
- assignment
- review
- admin
- other

Current statuses:

- pending
- in_progress
- completed
- cancelled

Tasks are intended to be actionable units for the priority engine.

A task should be sufficiently concrete that the system can determine whether it fits a particular available block.

---

## 12. Assessment

An assessment represents an academic evaluation point.

Current assessment types:

- quiz
- CAT
- exam
- assignment
- practical
- other

Current statuses:

- upcoming
- in_progress
- completed
- missed
- cancelled

Current attributes include:

- course
- title
- assessment type
- status
- start time
- due time
- weight
- notes

The system must not invent assessment dates, marks, weights, or requirements.

An uncertain assessment should remain uncertain until confirmed.

---

## 13. Recurring Requirement

A recurring requirement represents an academic obligation rule that generates repeated occurrences.

Examples:

- weekly online quiz
- weekly required activity
- recurring submission requirement

Current attributes include:

- course
- title
- description
- frequency
- start/end dates
- active status
- configuration
- source

Current frequencies:

- daily
- weekly
- monthly
- custom

The recurring requirement is the **rule**.

Concrete tasks/occurrences generated from that rule are separate records.

Conceptually:

```
Recurring Requirement
        ↓
Occurrence
        ↓
Concrete Task / Obligation
        ↓
Completion
        ↓
Evidence / Event
```

A future implementation needs an explicit occurrence/lifecycle strategy so repeated generation does not create duplicates.

---

## 14. Study Session

A study session records an actual period of academic work.

Current attributes include:

- course
- optional task
- start time
- end time
- duration
- outcome
- notes
- source

Study sessions are evidence.

They are not themselves proof of mastery.

The useful information is the combination of:

```
time spent
+
what was attempted
+
what was produced
+
independence
+
difficulty
+
outcome
```

A study session can therefore contribute evidence to course state.

---

## 15. Observation

An observation is a recorded statement about the academic situation.

Current attributes include:

- course
- task
- assessment
- content
- observed time
- source
- confidence
- confirmation status
- metadata

Observations are useful for facts that do not naturally belong to a task, assessment, or event.

Examples:

> "I still cannot explain process states without notes."

> "I solved today's programming exercises independently."

> "Lecturer said the CAT will be next week."

The last example should preserve uncertainty until the relevant information is confirmed.

---

## 16. Obligations vs Tasks vs Assessments

These concepts must remain distinct.

### Assessment

Represents an evaluation point.

Example:

```
Programming CAT
Friday
20%
```

### Task

Represents an actionable unit of work.

Example:

```
Practice if/else problems
30 minutes
```

### Recurring Requirement

Represents a rule that produces repeated obligations.

Example:

```
Complete one CILS quiz every week
```

An assessment can create or require tasks, but an assessment is not itself merely a task.

---

## 17. Evidence

Evidence is information that can support an academic-state conclusion.

Possible evidence sources include:

- study-session outcomes
- completed practice
- assessment results
- task completion
- observations
- confirmed events
- backlog
- recency
- demonstrated independent performance

The model should avoid using a single weak signal as proof of mastery.

In particular:

```
hours studied ≠ mastery
task completed ≠ full understanding
confidence ≠ evidence
```

The state engine should combine relevant evidence.

---

## 18. Provenance

Persistent academic information should retain its source where practical.

Current source vocabulary differs slightly by entity because the source represents different semantics.

The broad provenance categories are:

- user
- assistant
- system
- imported
- university

Provenance is not merely metadata. It affects how much trust the system should place in a record.

A confirmed university-provided requirement and an assistant-generated inference should not automatically receive the same treatment.

---

## 19. Confirmation and Uncertainty

Information may be:

- proposed
- confirmed
- rejected

Confidence may additionally be recorded where useful.

The system should preserve uncertainty instead of forcing binary truth too early.

The assistant's workflow should be:

```
User statement
    ↓
Interpretation
    ↓
Entity match
    ↓
Confidence / ambiguity
    ↓
Propose or confirm
    ↓
Persist
```

High-impact ambiguous changes should require confirmation.

---

## 20. Ownership and Security

Every user-owned academic table should be scoped to the authenticated user.

The database currently uses:

- `user_id`
- row-level security
- composite ownership foreign keys

Composite ownership relationships prevent a record owned by one user from referencing a parent record belonging to another user.

This is an important invariant and should be preserved as new entities are added.

---

## 21. State vs Derived Decision

The system must distinguish between:

### Stored state

Examples:

- current course state
- current backlog
- task status
- assessment status

### Derived decisions

Examples:

- "This needs attention."
- "This task fits the current 30-minute block."
- "This is currently the highest-value next action."

Derived decisions should be recalculable.

The database should not permanently store a decision merely because the priority engine produced it once.

---

## 22. Priority Is Not a Domain Entity

Priority is a derived decision layer.

It is calculated from current domain state.

Conceptually:

```
Tasks
Assessments
Recurring Requirements
Course State
Events
Observations
Study Evidence
Timetable
Current Time / Availability
        ↓
Priority Engine
        ↓
Next Action
```

The same task can have different priority at different times.

Therefore, priority should not be treated as a permanent property of a course or task.

---

## 23. Availability

Availability is a future domain concept rather than a rigid timetable.

An available block can include:

- start
- end
- duration
- energy
- location
- constraints

The system uses availability to filter candidate actions.

Availability does not create an obligation to study.

It creates an opportunity for the priority engine to select an action.

---

## 24. Domain Invariants

The following invariants are foundational:

1. User-owned records belong to one authenticated user.
2. A course belongs to one academic period.
3. A task may optionally belong to a course.
4. An assessment belongs to a course.
5. A recurring requirement belongs to a course.
6. A course has one current state projection.
7. State history preserves previous projections.
8. Timetable entries describe plans, not proof of occurrence.
9. Events describe actual occurrences.
10. Assessments are not equivalent to tasks.
11. Recurring requirements are rules, not endlessly reused task records.
12. Study sessions are evidence, not proof of mastery.
13. Uncertain information must not silently become confirmed fact.
14. Derived priority must remain recalculable.
15. Historical records should not be silently destroyed when current state changes.
16. Cross-user parent references must be prevented.
17. The AI must not become the authoritative academic database.

---

## 25. Current Database Alignment

The current Supabase schema implements most of this model through:

- profiles
- academic_periods
- courses
- course_states
- tasks
- assessments
- academic_events
- observations
- recurring_requirements
- timetable_entries
- study_sessions
- course_state_history

The current schema should be treated as the **implementation baseline**, not automatically as the final domain specification.

The next reconciliation pass should explicitly review:

1. current confirmation defaults
2. enforcement of one current academic period
3. recurring requirement occurrence generation
4. event vocabulary
5. evidence representation
6. course-state derivation
7. availability representation
8. source/provenance consistency
9. missing constraints and lifecycle rules

No schema change should be made merely for cosmetic consistency. Each migration should correspond to a domain decision.

---

## 26. Relationship to Product Definition

`PRODUCT.md` answers:

> What is Academic Assistant and why does it exist?

This document answers:

> What concepts must exist for that product to work?

The next documents should define:

- `ACADEMIC_STATE.md` — how evidence becomes state
- `PRIORITY_ENGINE.md` — how state becomes next-action priority
- `ASSISTANT_RULES.md` — how the assistant interacts safely with the model
- `ROADMAP.md` — implementation sequence

Together these documents form the canonical product/domain specification.
