# Academic Assistant — Academic State Model

## 1. Purpose

This document defines how Academic Assistant represents and updates a student's current academic condition.

It answers:

> Given the academic information currently known, what is the condition of each course, what evidence supports that condition, and what should the system remain uncertain about?

The state model is the foundation for the priority engine.

~~~
Academic Records
      ↓
Evidence
      ↓
State Interpretation
      ↓
Current Course State
      ↓
Priority Engine
~~~

The state model must remain explainable, evidence-based, and recalculable.

## 2. What Academic State Means

Academic state is not a subjective label such as "I feel behind."

It is a structured representation of the student's current academic condition.

It combines signals such as:

- current obligations
- assessment pressure
- backlog
- recent practice
- evidence of understanding
- task completion
- study outcomes
- observations
- confirmed academic events
- recency
- unresolved uncertainty

The state engine should answer:

1. Is this course currently protected by an active academic gate?
2. Is required work being kept up with?
3. Is there unresolved backlog?
4. Is there recent evidence of competence?
5. Is understanding weakening or improving?
6. Is an assessment creating immediate pressure?
7. How confident is the system in its interpretation?

## 3. State Is a Projection, Not a Fact

The database may store a current state such as:

~~~
stable
~~~

but this value is a current projection derived from available evidence.

It is not an immutable fact about the student.

As new evidence arrives, the state can change.

Example:

~~~
Programming
    ↓
stable
    ↓
several weeks without practice
    ↓
cooling
    ↓
failed practice attempts / unresolved backlog
    ↓
weak
    ↓
successful independent practice
    ↓
stable
~~~

Historical state changes remain in course_state_history.

## 4. State Vocabulary

The current course-state vocabulary is:

- protected
- stable
- cooling
- weak
- critical

These labels describe current academic condition, not student ability or personal worth.

### 4.1 Protected

`protected` is retained as a current course-state value, but its meaning is broader than a single type of obligation.

Working interpretation:

> Protected indicates that an important academic condition or maintenance pattern should be deliberately preserved from being displaced or neglected.

Online or recurring requirements may be examples of situations where protection is useful. They are not the definition of `protected`.

Likewise, a deadline, assessment, timetable entry, or academic gate may create a reason to protect something without automatically making `protected` synonymous with that gate.

Protected does not necessarily mean the course is weak. It may coexist with healthy academic performance while indicating that some important condition or maintenance pattern should be deliberately preserved.

The exact evidence and transition rules for entering or leaving `protected` remain unresolved. Until those rules are deliberately defined, the state engine must not invent them or reduce `protected` to a particular implementation such as online-course protection.

### 4.2 Stable

A course is stable when:

- required work is substantially synchronized
- there is no significant unresolved backlog
- there is sufficient recent evidence for the course's learning mode
- there is no immediate academic gate creating exceptional pressure

Stable does not mean mastered.

It means the course is currently being maintained without a major warning signal.

### 4.3 Cooling

A course is cooling when its current evidence is becoming stale or maintenance is being neglected, but the situation has not yet become a substantial weakness.

Typical signals:

- practice recency is declining
- no recent evidence of competence
- the course is being repeatedly deferred
- maintenance has fallen below the expected floor
- an assessment is approaching without enough recent evidence

Cooling is a warning state.

### 4.4 Weak

A course is weak when there is meaningful evidence of an academic deficiency.

Examples:

- repeated unsuccessful practice
- inability to demonstrate required understanding
- significant unresolved backlog
- missed coursework
- assessment preparation gap
- persistent lack of evidence where evidence is needed

Weakness should be tied to observable evidence rather than simply low confidence.

### 4.5 Critical

A course is critical when an unresolved problem poses an immediate or severe academic risk.

Examples:

- a hard academic gate is imminently expiring and remains incomplete
- a major assessment is imminent with substantial unresolved preparation problems
- a significant required obligation has been missed
- multiple severe state signals coincide

Critical is intentionally reserved for situations requiring immediate intervention.

It should not become a routine synonym for "important."

## 5. Protected Is Different From Strong

A protected course may be academically healthy.

For example:

~~~
CILS
weekly quiz due soon
course understanding is fine
~~~

The course can be protected without being weak.

This distinction prevents the system from confusing urgency with academic deficiency.

## 6. Evidence Model

State should be based on evidence rather than intuition.

Relevant evidence categories include:

### 6.1 Obligation evidence

- pending assignment
- completed assignment
- missed assignment
- pending quiz
- completed quiz
- missed quiz
- recurring requirement status

### 6.2 Assessment evidence

- upcoming assessment
- assessment completed
- assessment missed
- assessment result when available
- assessment weight when confirmed

### 6.3 Practice evidence

- recent practice
- successful independent practice
- unsuccessful attempts
- repeated difficulty
- ability to complete required task

### 6.4 Study-session evidence

A study session can provide:

- duration
- work attempted
- outcome
- independence
- difficulty
- notes

The session itself is not mastery evidence. Its outcome may be.

### 6.5 Observation evidence

Observations can record:

- uncertainty
- difficulty
- lecturer information
- perceived understanding
- discovered gaps
- successful performance

Observations should preserve source and confirmation status.

### 6.6 Event evidence

Confirmed events can establish:

- class actually occurred
- class was cancelled
- class was rescheduled
- task was completed
- assessment was completed or missed

## 7. Evidence Strength

Not all evidence should have equal influence.

A useful conceptual hierarchy is:

~~~
Confirmed structured evidence
        ↓
Confirmed user evidence
        ↓
University/imported evidence
        ↓
Proposed observations
        ↓
Assistant interpretation
        ↓
Derived conclusion
~~~

This is not a universal numerical scoring system.

The implementation should preserve provenance and use it when determining how confidently a state conclusion can be made.

## 8. Understanding Evidence

Understanding should be evaluated according to the course's learning characteristics.

The system should not use one universal test.

### Programming

Useful evidence:

- writes code independently
- modifies code independently
- debugs independently
- solves unseen exercises

### Operating Systems

Useful evidence:

- explains concepts without notes
- connects concepts into a mental model
- answers unseen questions
- distinguishes related concepts correctly

### Mathematics

Useful evidence:

- solves unfamiliar problems
- chooses an appropriate method
- performs calculations correctly
- explains the reasoning where required

### Hardware

Useful evidence:

- identifies components
- explains component relationships
- explains system behavior
- performs relevant practical work

### Computer Applications

Useful evidence:

- performs required tasks independently
- reproduces procedures without step-by-step instruction

### Accounting

Useful evidence:

- understands the relevant procedure/concept
- performs required calculations/work correctly
- completes assigned work

### Economics

Useful evidence:

- explains concepts
- applies concepts to problems
- answers assessment-style questions

### Online Courses

Useful evidence includes:

- completing required learning material
- completing weekly requirements
- completing quizzes before their deadlines
- demonstrating retention where later assessments depend on prior material

These course-specific examples are initial evidence definitions, not permanent hard-coded rules.

## 9. Understanding Level

The current database contains an optional understanding level from 0–5.

This should be interpreted as a compact state indicator, not as a precise scientific measurement.

Conceptually:

~~~
0 = no reliable evidence of understanding
1 = very limited evidence
2 = emerging understanding
3 = functional understanding
4 = strong demonstrated understanding
5 = consistently strong independent performance
~~~

The system should avoid automatically assigning a high value merely because time was spent studying.

Where possible, understanding level should be supported by concrete evidence.

## 10. Backlog

Backlog represents unresolved academic work that should already have been addressed or completed.

Examples:

- missed assignment
- uncompleted required quiz
- missed coursework
- unresolved required practice
- accumulated material that is now affecting current work

Backlog is different from future workload.

~~~
Future assignment
    ≠
Backlog
~~~

Backlog should be attached to the relevant course/task/obligation whenever possible.

## 11. Recency

Recency measures how recently useful evidence was produced.

The system should distinguish:

~~~
last practiced
~~~

from:

~~~
last evidence of competence
~~~

A student may have practiced recently without producing convincing evidence of understanding.

Conversely, a student may have strong historical evidence but no recent practice.

Both matter.

## 12. Maintenance Floor

Courses should have a flexible maintenance floor rather than a rigid universal study quota.

The purpose of maintenance is to prevent important skills or concepts from becoming stale.

The maintenance floor may depend on:

- course type
- current understanding
- assessment proximity
- recent performance
- current backlog
- academic calendar

The initial conceptual reference was roughly:

- Programming: frequent meaningful practice
- Operating Systems: regular conceptual encounters
- Hardware: regular verification/practical work
- Mathematics: regular problem-solving practice

These are planning references, not permanent mandatory hour quotas.

## 13. Assessment Pressure

Assessment pressure is a state signal.

It increases when:

- an assessment is approaching
- the assessment is important
- required preparation is incomplete
- evidence of readiness is weak
- prerequisite work is unresolved

Assessment pressure should not automatically mean the course becomes weak.

For example:

~~~
Strong understanding
+
exam tomorrow
~~~

may produce high priority without producing weak academic state.

Again:

~~~
urgency ≠ weakness
~~~

## 14. State Signals

The state engine can conceptually evaluate:

~~~
Gate status
Backlog
Assessment pressure
Recency
Understanding evidence
Practice evidence
Completion
Missed obligations
Recent outcomes
Uncertainty
~~~

These signals should be combined through explicit rules.

The implementation should avoid an opaque single AI-generated score.

## 15. State Transition Examples

### Stable → Cooling

Possible causes:

- maintenance evidence becomes stale
- repeated deferral
- no recent meaningful practice
- assessment approaching without recent evidence

### Cooling → Stable

Possible causes:

- recent meaningful practice
- new independent evidence
- required work synchronized
- no significant assessment gap

### Cooling → Weak

Possible causes:

- repeated failed attempts
- unresolved backlog
- demonstrated conceptual gap
- persistent inability to perform required work

### Weak → Stable

Possible causes:

- successful targeted practice
- backlog resolved
- demonstrated understanding
- improved assessment evidence

### Weak → Critical

Possible causes:

- weak course plus imminent major assessment
- severe unresolved obligation
- multiple simultaneous severe signals

### Critical → Weak

Possible causes:

- immediate gate handled
- urgent backlog reduced
- assessment preparation materially improved

The exact transition rules must be implemented explicitly rather than left to the assistant's judgment.

## 16. Protected State Transitions

`protected` remains part of the current five-state vocabulary, but no transition rules are established yet.

The reviewed product discussion does not define what causes a course to enter or leave `protected`. It also does not establish that `protected` is equivalent to a gate, online requirement, deadline, timetable commitment, or maintenance condition.

Therefore the state engine must leave this concept unresolved until the domain is deliberately specified. Any future transition rules should be explicit, deterministic, evidence-based, and explainable.

The relationship between `protected` and the other course-state values is also unresolved. Because the current database stores one `state` value, we should not assume that `protected` is a second independent dimension without a deliberate schema decision.

## 17. State Calculation

The conceptual state calculation is:

~~~
Current academic records
        ↓
Collect relevant evidence
        ↓
Filter by confirmation / provenance
        ↓
Evaluate obligation status
        ↓
Evaluate assessment pressure
        ↓
Evaluate backlog
        ↓
Evaluate recency
        ↓
Evaluate learning evidence
        ↓
Apply explicit state rules
        ↓
Current state projection
        ↓
Record meaningful state change
~~~

The calculation should be deterministic and testable.

AI may help collect or interpret evidence, but it should not be the final hidden state calculator.

## 18. State Change and History

A new history record should be created when the current state meaningfully changes.

For example:

~~~
stable → cooling
~~~

should create a history record.

Repeated recalculation that produces the same state should not generate endless duplicate history entries.

The history record should preserve:

- resulting state
- supporting reason
- relevant understanding level
- backlog status when applicable
- source
- time
- metadata/evidence references where available

## 19. Explainability

Every meaningful state should be explainable.

For example:

> Programming is cooling because there has been no recent independent practice evidence and the last successful practice is becoming stale.

Or:

> Economics is weak because an assignment remains incomplete and recent practice has not demonstrated the required application of the concepts.

The system should prefer concrete evidence over vague statements.

Bad:

> "Programming seems weak."

Better:

> "Programming is currently cooling because no independent practice evidence has been recorded recently."

## 20. What the State Engine Must Not Do

The state engine must not:

- declare mastery from hours alone
- invent missing assessment dates
- infer grades that were not recorded
- treat an assistant guess as confirmed fact
- permanently label a student based on one weak signal
- erase historical state
- confuse urgency with weakness
- confuse protected obligations with poor understanding
- treat lack of recorded evidence as proof of lack of ability
- silently fabricate evidence
- use an opaque AI score as the authoritative state

Absence of evidence should be distinguished from evidence of failure.

## 21. Initial Implementation Strategy

The first implementation should use explicit deterministic rules.

A useful first version can calculate separate signals:

~~~
gate_status
backlog_status
assessment_pressure
practice_recency
evidence_recency
understanding_signal
completion_signal
~~~

Then apply transparent rules to derive the current state.

This is preferable to beginning with a weighted machine-learning or LLM score.

The initial rules should be easy to inspect and modify.

## 22. Open Domain Decisions Before Schema Finalization

The following issues remain intentionally unresolved.

### A. Protected semantics

What concrete evidence and transition rules should determine `protected`?

The current model intentionally retains `protected` in the course-state vocabulary while leaving its exact semantics open for deliberate refinement. A future design may separate:

~~~
academic_condition
~~~

from:

~~~
protection / gate status
~~~

if actual implementation demonstrates that one state value cannot represent both concepts cleanly.

This is not yet a decision to remove `protected`, and online-course protection is not its definition.

### B. Recency thresholds

Exact time thresholds should be defined by course characteristics and academic context rather than arbitrary universal values.

### C. Evidence references

The system may eventually need explicit links from state calculations to the evidence records that caused them.

### D. Assessment results

Assessment results are not yet represented as a dedicated evidence/result entity in the current schema.

### E. Availability

The current database does not yet have a dedicated availability model.

### F. Course learning characteristics

Course type is currently broad. A richer learning/assessment profile may eventually be necessary.

These are design questions, not implementation bugs. They should be resolved deliberately.

## 23. Relationship to Priority

The state model provides the condition.

The priority engine determines what to do about that condition.

For example:

~~~
Course state:
weak

Assessment:
in 3 days

Backlog:
1 assignment

Available block:
45 minutes
~~~

The state model should expose those facts.

The priority engine then decides which actionable task should be selected.

Therefore:

~~~
STATE ≠ PRIORITY
~~~

State describes the situation.

Priority determines the next decision.

## 24. Canonical Principle

Academic Assistant should continuously move from:

~~~
What do we know?
        ↓
What evidence supports it?
        ↓
What is the current state?
        ↓
What remains uncertain?
        ↓
What decision follows?
~~~

The state engine is successful when its conclusions can be traced back to persistent academic evidence and recalculated when that evidence changes.
