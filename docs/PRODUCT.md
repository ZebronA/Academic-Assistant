# Academic Assistant — Product Definition

## 1. Product

**Academic Assistant** is a persistent academic management and decision system with an assistant interface.

Its purpose is to maintain an accurate, evolving representation of a student's academic situation and use that state to determine the highest-value next action.

### Product description

> An adaptive academic management system that tracks courses, coursework, deadlines, assessments, academic state, and study tasks to determine the highest-value next action for a student.

The product is not primarily a timetable, a conventional to-do list, or an AI chatbot. Those are components or interfaces around the core system.

The core product is the **persistent academic state and decision system**.

---

## 2. Problem

A student's academic situation is constantly changing.

A timetable describes what is expected to happen, but real academic life includes:

- classes being cancelled or rescheduled
- lecturers arriving early or late
- sessions extending beyond their expected duration
- assignments being created, completed, or missed
- assessments approaching
- recurring online requirements expiring
- subjects becoming weaker through lack of practice
- backlogs accumulating
- actual study producing new evidence about understanding
- available study time changing throughout the day

A static timetable or simple task list does not adequately represent this changing state.

The student therefore needs a system that can answer:

1. What is my current academic situation?
2. What requires attention?
3. Why does it require attention?
4. What can I realistically do in the time available?
5. What is the highest-value next action?
6. What changed after I acted?

---

## 3. Core Concept

Academic Assistant operates as a continuous loop:

```
UNIVERSITY
    ↓
PLANS
    timetable / expected schedule
    ↓
ACTUAL REALITY
    classes / changes / occurrences
    ↓
TASKS / ASSESSMENTS / EVENTS
    ↓
ACADEMIC STATE
    ↓
PRIORITY ENGINE
    ↓
NEXT BEST ACTION
    ↓
STUDENT
    ↓
OUTCOME / EVIDENCE
    ↓
UPDATED STATE
    ↺
```

The system therefore treats academic management as a state-management and decision problem rather than simply a scheduling problem.

---

## 4. Fundamental Distinction: Timetable ≠ Reality

The timetable represents what was supposed to happen.

Events represent what actually happened.

For example:

- a class was cancelled
- a class was rescheduled
- a class started late
- a class ended late
- a study session was completed
- an assessment was missed
- an assignment was completed

The timetable remains the baseline plan. Events record deviations and actual occurrences.

This distinction allows the system to adapt without destroying the original schedule.

---

## 5. Four Academic Domains

Academic Assistant separates the academic world into four primary domains.

### 5.1 Plans

Plans describe what should happen.

Examples:

- timetable entries
- scheduled classes
- recurring academic requirements
- planned study opportunities

### 5.2 Events

Events describe what actually happened.

Examples:

- class attended
- class cancelled
- class rescheduled
- task completed
- study session completed
- assessment completed or missed
- observation recorded

### 5.3 Obligations

Obligations describe what must be done.

Examples:

- assignments
- quizzes
- CATs
- exams
- recurring weekly requirements
- administrative tasks

### 5.4 State

State describes the student's current academic condition.

Examples:

- course stability
- understanding
- backlog
- recency of practice
- recent evidence
- assessment pressure
- unresolved obligations

The core relationship is:

```
Plans
  +
Events
  +
Obligations
  ↓
Academic State
  ↓
Priority Engine
  ↓
Next Action
```

---

## 6. Source of Truth

The database is the persistent source of truth.

The AI is an interpretation, reasoning, and interaction layer.

The intended flow is:

```
Natural language
    ↓
Interpretation
    ↓
Proposed structured change
    ↓
Entity matching
    ↓
Confidence / ambiguity check
    ↓
Database mutation
    ↓
Event / evidence
    ↓
State recalculation
    ↓
Priority recalculation
```

The assistant must not silently convert uncertain statements into confirmed facts.

For example:

> "I think the CAT is next week."

must not automatically become a confirmed assessment deadline without sufficient confirmation.

---

## 7. Provenance and Uncertainty

Persistent information should preserve where it came from where practical.

Possible sources include:

- `user`
- `assistant`
- `system`
- `imported`
- `university`

Information may also have a confirmation state:

- `proposed`
- `confirmed`
- `rejected`

The system should distinguish:

- confirmed structured facts
- confirmed user-provided events
- imported or university information
- proposed interpretations
- derived conclusions

The system must not silently turn a derived conclusion into a source fact.

---

## 8. Academic State

Academic state is a current projection of the student's situation.

Course state currently uses:

```
protected
stable
cooling
weak
critical
```

These states should increasingly be derived from evidence rather than treated as arbitrary permanent labels.

Relevant evidence can include:

- completed work
- missed work
- assessment results
- study sessions
- practice outcomes
- last practice
- last evidence of competence
- backlog
- observations
- upcoming obligations

### Evidence over hours

Time spent is not sufficient evidence of mastery.

Examples:

**Programming**

Evidence of progress is the ability to independently write, modify, and debug programs.

**Operating Systems**

Evidence of progress is the ability to explain concepts and answer unseen questions without relying on notes.

**Mathematics**

Evidence of progress is the ability to solve unfamiliar problems.

**Computer Applications**

Evidence of progress is the ability to perform required tasks independently.

The system should therefore record meaningful outcomes, not merely hours.

---

## 9. Current State vs History

Current state is a projection.

Historical state changes must remain available.

The system therefore maintains both:

- current course state
- course state history

A change in state should not erase the evidence of how or why the state changed.

---

## 10. Priority Engine

Priority is dynamic.

Academic Assistant must not maintain a permanent ranking such as:

```
1. Programming
2. Operating Systems
3. Mathematics
...
```

Instead, priority is recalculated from the current academic situation.

The conceptual priority framework considers:

1. weekly gates and expiring obligations
2. immediate marks and deadlines
3. weakness and backlog
4. protected maintenance
5. synchronization with academic reality
6. available time
7. energy
8. task/context fit

The exact weighting is an implementation concern and should remain deterministic before AI is introduced into the decision process.

The result is a **next-action decision**, not a permanent subject ranking.

---

## 11. Free Time Is an Opportunity

Academic Assistant should not impose a rigid study timetable.

Fixed commitments form the stable layer:

- university classes
- timetable commitments
- protected online requirements

The flexible layer is selected dynamically.

When a free block appears, the system should consider:

- duration
- energy
- location/context
- available resources
- task requirements
- academic priority

For example:

```
30-minute block
    ↓
find tasks that fit
    ↓
filter by current priority
    ↓
consider energy/context
    ↓
select next useful action
```

The goal is adaptive use of available time, not filling every free minute.

---

## 12. Tasks

Tasks are concrete actions that can be completed.

A task may contain:

- course
- title
- description
- task type
- status
- estimated duration
- due time
- completion time
- source
- recurring requirement relationship

Task types include:

- study
- practice
- assignment
- review
- admin
- other

Tasks should be concrete enough for the system to determine whether they fit a particular available block.

---

## 13. Assessments

Assessments represent academic evaluation points.

Examples:

- quizzes
- CATs
- exams
- assignments
- practical assessments

Assessments should carry relevant information such as:

- course
- type
- status
- start/due time
- weight
- notes

The system must not invent assessment dates, marks, or requirements.

---

## 14. Recurring Requirements

Some academic obligations repeat according to a rule.

Examples include weekly online quizzes.

The system should model the **requirement rule** separately from individual generated occurrences.

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

This prevents the system from treating a recurring academic requirement as one endlessly reused task.

---

## 15. Study Sessions

Study sessions are first-class evidence.

A study session can record:

- course
- task
- start time
- end time
- duration
- outcome
- notes
- source

A useful study record might look conceptually like:

```
Programming
45 minutes
4 problems attempted
3 solved independently
1 required assistance
```

This is more useful for state estimation than simply:

```
Programming
45 minutes studied
```

---

## 16. Reminders

Reminders should surface information that materially affects the student's next decision.

Potential reminder categories include:

- upcoming class
- changed/rescheduled class
- online weekly requirement
- quiz deadline
- assignment
- CAT/exam
- missed coursework
- backlog
- neglected subject
- previously promised task

Reminders should be action-specific rather than a stream of generic notifications.

Push notifications are a later implementation layer and should not be considered implemented until an actual notification mechanism exists.

---

## 17. Assistant Role

The assistant can:

- explain current academic state
- interpret natural-language updates
- propose structured changes
- suggest concrete tasks
- identify potential neglect
- explain why an action has priority
- generate reminders
- help record observations
- help update academic reality
- perform low-risk derived operations when rules permit

The assistant must not:

- invent deadlines
- invent grades
- invent course requirements
- silently confirm uncertain information
- declare mastery from study hours alone
- overwrite historical evidence
- treat conversation memory as the authoritative academic database

---

## 18. Dashboard

The dashboard should answer the student's immediate questions rather than merely display database tables.

A conceptual dashboard is:

```
Academic Assistant
Wednesday, 30 September

NEEDS ATTENTION
- CILS quiz
- Economics assignment

ACADEMIC MAINTENANCE
- Programming
- Operating Systems

TODAY
- Classes
- Available blocks

WHAT SHOULD I DO NEXT?
Complete CILS review — 30 min

[START]
```

The actual dashboard must be generated from database state.

Semester-specific information should be data, not hard-coded UI logic.

---

## 19. Product Principles

### Adaptive

The system responds to what actually happens.

### Persistent

Academic state survives beyond a single conversation.

### Evidence-based

State should be grounded in observable academic evidence.

### Deadline-aware

Hard academic gates and deadlines must be respected.

### State-aware

The system considers weakness, backlog, recency, and demonstrated competence.

### Action-oriented

The system should produce concrete next actions, not only summaries.

### Flexible

The system should work with different schedules, courses, semesters, and academic structures.

### Non-destructive

Historical academic information should not disappear simply because the current state changes.

### Transparent

The assistant should be able to explain why a task or obligation matters.

### Deterministic before intelligent

Core state and priority rules should be understandable and testable before AI is allowed to influence them.

---

## 20. V0 Scope

The first useful version should establish:

- user profile
- academic periods
- courses
- timetable
- tasks
- assessments
- recurring requirements
- academic events
- observations
- study sessions
- course state
- state history
- deterministic priority
- next useful action
- basic dashboard

The first version does **not** need:

- a sophisticated conversational AI
- push notifications
- advanced prediction
- automatic mastery detection
- complex calendar synchronization
- unrestricted autonomous database mutation

The foundation should work without AI.

---

## 21. Architecture Direction

The planned technical architecture is:

```
Next.js
    ↓
Application / Domain Logic
    ↓
Supabase
    ↓
PostgreSQL
```

AI should sit as an interaction and reasoning layer around the deterministic academic system, not replace the domain model.

The frontend should consume domain state rather than independently recreating academic logic.

---

## 22. Development Strategy

Implementation should proceed in this order:

1. Establish development foundation
2. Reconcile database schema with the canonical domain model
3. Document the product and domain rules
4. Implement deterministic academic state logic
5. Implement deterministic priority / next-action logic
6. Build the dashboard
7. Add assistant interaction
8. Add reminders and notifications
9. Expand integrations and automation

The system should not begin with a large UI and attempt to infer the domain model afterward.

---

## 23. Definition of Success

Academic Assistant is successful when a student can enter the system and reliably answer:

> **What matters right now, why does it matter, and what exactly should I do next?**

The answer should be based on persistent academic state, current obligations, actual events, evidence, available time, and task fit.

The long-term goal is an academic command center that continuously converts a changing academic situation into an understandable and actionable next decision.
