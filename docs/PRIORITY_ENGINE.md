# Academic Assistant — Priority Engine

## 1. Purpose

This document defines how Academic Assistant converts the current academic situation into an actionable next decision.

It answers:

> Given what is currently known, what action has the highest useful priority right now, and why?

The priority engine sits after academic state and before task selection.

~~~text
Academic Reality
      ↓
State + Obligations + Assessments + Plans + Availability
      ↓
Candidate Actions
      ↓
Priority Rules
      ↓
Best-Fit Action
      ↓
Student
      ↓
Outcome
      ↓
Updated Evidence
~~~

Priority is recalculated whenever material academic conditions change.

## 2. Priority Is a Decision, Not a Permanent Ranking

Academic Assistant must not permanently rank units as first, second, third, etc.

The correct decision depends on the current situation.

For example:

~~~text
Monday:
CILS quiz closes today
→ CILS work may dominate

Tuesday:
CILS complete
Programming practice is stale
→ Programming may become the useful action

Thursday:
Economics assignment due tomorrow
→ Economics assignment may dominate
~~~

The same unit can therefore move in and out of priority without the system declaring it permanently more or less important than another unit.

## 3. Candidate Actions

The priority engine operates on **actions**, not merely units.

A candidate action may be:

- complete a task
- start an assignment
- review for an assessment
- practice a technical skill
- resolve backlog
- complete a recurring requirement
- perform a short maintenance session
- attend a scheduled commitment
- record or confirm an important academic change
- prepare for an imminent academic gate

A unit becomes relevant through its candidate actions.

## 4. Priority Layers

The engine should evaluate candidate actions through several layers.

~~~text
1. Hard academic gates
2. Immediate assessment / deadline pressure
3. Unresolved backlog
4. Academic weakness
5. Maintenance / recency
6. Block and context fit
7. Strategic value
~~~

These layers are not a permanent numeric ranking.

They are decision factors.

A hard gate normally constrains the decision before ordinary maintenance work becomes relevant.

## 5. Hard Academic Gates

Hard gates are obligations where failure to act within a defined window has a disproportionate academic consequence.

Examples:

- weekly quiz closing today
- required online activity expiring
- assignment deadline
- confirmed assessment
- mandatory submission
- missed requirement that blocks a later requirement

The engine should first identify active gates.

### Gate principle

If an obligation has a confirmed deadline and missing it causes a meaningful academic consequence, it receives exceptional priority.

The system must know the consequence from confirmed information.

It must not invent consequences.

## 6. Gate Status

A candidate obligation can conceptually have:

- no active gate
- upcoming gate
- active gate
- imminent gate
- overdue gate
- completed gate

Exact time thresholds should be configurable rather than buried in UI code.

The engine should consider:

- deadline
- current time
- completion status
- confirmation status
- recurrence
- consequence
- preparation required

## 7. Immediate Deadline Pressure

After hard gates, the engine considers ordinary deadline pressure.

Examples:

~~~text
Assignment due tomorrow
CAT in three days
Exam next week
~~~

Deadline pressure increases as the available preparation window shrinks.

But deadline proximity alone is insufficient.

The engine should also consider:

- task size
- preparation required
- current understanding
- existing backlog
- available time
- assessment weight when confirmed

A small task due tomorrow may fit a short block.

A large assessment may require starting earlier.

## 8. Backlog

Backlog represents work that is already unresolved.

Backlog matters because it can:

- create immediate academic risk
- block later work
- consume future capacity
- indicate synchronization failure
- interact with upcoming assessments

The engine should distinguish:

~~~text
overdue unresolved work
~~~

from:

~~~text
future planned work
~~~

Backlog should normally receive more attention than ordinary future maintenance when the backlog has meaningful consequences.

## 9. Academic Weakness

Weak unit state increases the priority of suitable corrective actions.

However:

~~~text
weak unit
≠
always do this unit first
~~~

The engine must still consider:

- hard gates
- deadlines
- task fit
- current available block
- assessment timing
- whether the candidate action actually addresses the weakness

For example, if Programming is weak because independent coding is poor, reading another explanation may be less useful than a short practice task that produces direct evidence.

The selected action should address the actual state signal.

## 10. Maintenance and Cooling

Cooling units require attention before they become weak.

Maintenance actions may include:

- short practice
- retrieval
- problem solving
- explanation from memory
- practical repetition
- review of recently learned material

Maintenance should not become a universal hourly quota.

The engine should prefer the smallest useful action that meaningfully protects the unit when no stronger obligation dominates.

## 11. Free Time Is an Opportunity

Available time does not automatically become a study requirement.

Instead:

~~~text
Available Block
      ↓
Find actions that fit
      ↓
Select the most useful feasible action
~~~

This prevents the system from generating artificial work merely because the student has free time.

## 12. Block Fit

A candidate action should be evaluated against the available block.

Example:

~~~text
Available: 25 minutes

Task A: 90-minute assignment
Task B: 20-minute quiz review
Task C: 15-minute retrieval practice
~~~

The engine should recognize that Task A may require decomposition or another block.

Task B may be a direct fit.

Task C may be appropriate if it addresses a meaningful current need.

Duration is therefore part of decision quality.

## 13. Context Fit

A candidate action can also require a particular context.

Possible context constraints:

- campus
- home
- computer required
- internet required
- quiet environment
- physical lab/practical setting
- specific software
- specific materials

The engine should not recommend an action that cannot realistically be performed in the current context when a suitable alternative exists.

## 14. Energy Fit

Energy can affect action selection.

Examples:

### Higher-energy block

Suitable candidates may include:

- difficult programming problems
- mathematics problem sets
- unfamiliar technical practice
- demanding assignment work

### Lower-energy block

Suitable candidates may include:

- retrieval
- review
- organizing notes
- short quiz preparation
- administrative academic work

Energy should modify feasibility and usefulness, not become an excuse to avoid important work indefinitely.

## 15. Action Effectiveness

Priority should consider whether the action actually changes the academic state.

For example:

~~~text
Programming weak because independent practice is poor
~~~

A high-value action is likely:

~~~text
solve 3 unseen programming problems independently
~~~

rather than:

~~~text
read another programming explanation
~~~

The engine should prefer actions that generate useful evidence or resolve the underlying problem.

## 16. Strategic Value

When several candidates have similar urgency, the engine can consider strategic value.

Strategic value may come from:

- preventing future backlog
- preparing prerequisite knowledge
- protecting a recurring requirement
- producing strong evidence of understanding
- reducing uncertainty
- unlocking later work
- reducing a bottleneck

Strategic value should not override an imminent confirmed hard gate without a clear reason.

## 17. Candidate Feasibility

Before comparing actions, the engine should remove or defer candidates that cannot currently be executed.

Examples:

- required software unavailable
- necessary material unavailable
- task requires a two-hour block but only 20 minutes are available
- assessment preparation depends on missing information
- task is already completed
- task was cancelled
- prerequisite task remains unresolved

The engine should not recommend impossible actions merely because they have high theoretical priority.

## 18. Priority Decision Sequence

The conceptual decision sequence is:

~~~text
Current time
     ↓
Current academic period
     ↓
Confirmed plans / timetable
     ↓
Confirmed actual events
     ↓
Active obligations
     ↓
Assessments
     ↓
Unit states
     ↓
Available block
     ↓
Generate candidate actions
     ↓
Remove infeasible actions
     ↓
Identify hard gates
     ↓
Evaluate deadline pressure
     ↓
Evaluate backlog
     ↓
Evaluate weakness
     ↓
Evaluate maintenance
     ↓
Evaluate action effectiveness
     ↓
Evaluate block/context/energy fit
     ↓
Select next action
~~~

This is a decision process, not a permanent sorted list.

## 19. Priority Factors

The implementation can expose structured factors for each candidate.

Example:

~~~text
candidate:
    task = "Practice if/else problems"

factors:
    hard_gate = false
    deadline_pressure = low
    backlog = false
    course_state = cooling
    maintenance_need = high
    action_effectiveness = high
    duration_fit = true
    context_fit = true
    energy_fit = true
~~~

This makes the decision explainable.

The UI can then say:

> Recommended because Programming is cooling, this task produces direct practice evidence, and it fits the available 45-minute block.

## 20. Avoiding a Single Opaque Score

The first implementation should not reduce everything to:

~~~text
priority = 87.4
~~~

without explanation.

A numerical score may eventually be useful internally for tie-breaking, but the engine must preserve interpretable factors.

The system should be able to answer:

1. Why was this selected?
2. What alternatives were considered?
3. What constraint made another action less suitable?
4. What evidence caused the decision?
5. What would change the decision?

## 21. Tie-Breaking

If two actions are similarly appropriate, use transparent tie-breakers.

Possible order:

1. action with a confirmed earlier gate
2. action that prevents a meaningful consequence
3. action that addresses a stronger academic weakness
4. action that unlocks dependent work
5. action with better block fit
6. action producing stronger evidence
7. action requiring less setup
8. action with greater strategic value

This is a tie-breaking framework, not a permanent ranking of units.

## 22. No Permanent Unit Priority

The engine must never encode rules such as:

~~~text
Programming always first
Mathematics always second
Operating Systems always third
~~~

Unit characteristics can affect action selection, but the current academic situation determines the actual decision.

The engine should therefore calculate:

~~~text
current candidate actions
~~~

rather than:

~~~text
global unit ranking
~~~

## 23. Timetable and Actual Reality

Timetable entries establish expected commitments.

Events establish what actually happened.

If a class is:

- cancelled
- rescheduled
- extended
- delayed
- unexpectedly added

the priority engine should use the confirmed actual event state when deciding what can happen next.

Example:

~~~text
Expected:
10:00–12:00 class

Actual:
class extended to 13:00
~~~

The student's remaining available block changes.

The engine should recalculate instead of blindly following the original plan.

## 24. Disruption Handling

When the day changes, the engine should not simply append missed planned tasks.

It should:

1. update actual reality
2. recalculate remaining availability
3. identify obligations that still matter
4. re-evaluate candidate actions
5. select the next feasible action

The system should adapt rather than demand compensation through exhaustion.

## 25. Daily Boot

The dashboard's daily decision can use a Daily Boot process:

~~~text
1. Load current academic period
2. Load today's timetable
3. Load confirmed changes/events
4. Identify active online requirements
5. Identify upcoming deadlines
6. Load current unit states
7. Load unresolved backlog
8. Determine available blocks
9. Generate candidate actions
10. Select current next action
~~~

Daily Boot is a recalculation point, not a permanent daily schedule.

## 26. Recalculation Triggers

Priority should be recalculated after material changes such as:

- task completed
- task created
- assessment added/changed
- assessment completed
- deadline changed
- recurring requirement occurrence created
- quiz completed
- class cancelled
- class rescheduled
- class extended
- study session completed
- unit state changes
- availability changes
- current time crosses an important deadline threshold

The system should avoid unnecessary recalculation for irrelevant changes.

## 27. Next Action Contract

The priority engine should return a structured decision conceptually similar to:

~~~text
NextAction
    candidate_id
    action_type
    unit_id
    reason
    supporting_factors
    estimated_minutes
    deadline
    confidence
    generated_at
~~~

This is a derived result.

It should not become permanent academic truth.

When the underlying situation changes, the result can change.

## 28. Example: Weekly Online Gate

Suppose:

~~~text
CILS weekly quiz
deadline: today
status: incomplete

Programming:
cooling
no immediate deadline

Available:
45 minutes
~~~

The engine should first recognize the CILS gate.

A suitable action may therefore be:

~~~text
Complete CILS quiz preparation
~~~

The important point is not that CILS is permanently more important than Programming.

The point is that the confirmed expiring obligation changes the current decision.

## 29. Example: Weak Technical Unit

Suppose:

~~~text
Programming:
weak

No imminent assessment.

Available:
60 minutes

Candidate A:
read notes for 60 minutes

Candidate B:
solve 3 unseen problems
~~~

If the recorded weakness is inability to independently write and debug code, Candidate B provides more direct evidence against the identified weakness.

The engine should therefore prefer actions based on fit to the actual state problem, not simply generic study activity.

## 30. Example: Assignment vs Maintenance

Suppose:

~~~text
Economics assignment:
due tomorrow

Mathematics:
stable, maintenance becoming stale

Available:
45 minutes
~~~

The assignment may have greater current urgency.

After the assignment is completed, the decision should be recalculated rather than assuming Economics remains the next priority.

## 31. Relationship to State

The priority engine consumes state.

It does not rewrite state merely because an action was selected.

The loop is:

~~~text
State
 ↓
Priority
 ↓
Action
 ↓
Outcome
 ↓
Evidence
 ↓
State recalculation
 ↓
Priority recalculation
~~~

This separation prevents the priority engine from becoming another hidden state engine.

## 32. Relationship to Assistant

The assistant may explain the priority decision in natural language.

For example:

> You have 45 minutes. CILS has a confirmed quiz deadline today, while Programming is cooling but has no immediate gate. Use this block to finish the CILS preparation first. We can reassess Programming afterward.

The assistant must not fabricate a deadline or consequence.

The structured priority engine remains authoritative for the decision.

## 33. What the Priority Engine Must Not Do

It must not:

- permanently rank units
- invent deadlines
- invent assessment weights
- invent academic consequences
- recommend impossible actions
- treat free time as mandatory study time
- equate hours with academic value
- blindly follow the timetable after reality changes
- use an unexplained AI-generated priority score as authority
- ignore a confirmed hard gate because another unit is generally "more important"
- force every unit into equal study time
- compensate for disruptions by demanding exhaustion
- select actions that do not address the identified problem merely because they are easy

## 34. Initial Deterministic Implementation

The first implementation should use explicit candidate evaluation.

Conceptually:

~~~text
for each candidate action:
    determine feasibility
    determine gate status
    determine deadline pressure
    determine backlog relevance
    determine unit-state relevance
    determine action effectiveness
    determine block/context/energy fit
    determine strategic value

remove infeasible candidates

select the candidate satisfying the strongest current constraints
and providing the best useful fit
~~~

The implementation should produce structured reasons alongside the result.

A later numerical scoring layer may be introduced only after the rule-based model has been tested with real academic situations.

## 35. Priority Explainability

Every recommendation should be explainable through current data.

A useful explanation has this shape:

~~~text
WHAT:
    Complete Economics assignment

WHY NOW:
    due tomorrow

WHY THIS:
    it is incomplete and fits the current block

WHY NOT OTHER:
    Programming maintenance is important but has no
    immediate gate and can be reassessed after this block
~~~

The exact wording belongs to the assistant layer; the facts come from the priority engine.

## 36. Failure-Safe Behavior

When information is incomplete or uncertain:

- do not invent missing values
- lower confidence in the recommendation
- ask for confirmation when necessary
- prefer confirmed obligations
- avoid high-impact autonomous changes
- surface uncertainty when it materially affects the decision

If two candidates cannot be meaningfully distinguished, the system may present both rather than manufacture false precision.

## 37. Future Extensions

Potential future capabilities include:

- richer availability modelling
- energy-aware action selection
- context-aware task matching
- prerequisite/dependency graphs
- assessment-result feedback
- learned estimates of task duration
- personalized maintenance thresholds
- historical effectiveness of action types
- calendar integration
- notification timing

These should extend the deterministic core rather than replace it with an opaque model.

## 38. Canonical Principle

The priority engine should continuously answer:

~~~text
What matters now?
        +
What can actually be done now?
        +
What action addresses the real academic need?
        ↓
What should happen next?
~~~

The answer must be grounded in persistent academic state, confirmed obligations, actual reality, and the current opportunity to act.
