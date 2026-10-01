# Phase 2 — Application and Domain Layer

The application layer is the boundary between the interface and the academic domain.

UI / Assistant -> application commands -> domain validation -> persistence -> evidence/events -> state -> priority

## MVP commands

- createTask
- completeTask
- createAssessment
- completeAssessment
- createObservation
- recordStudySession
- recordAcademicEvent
- createRecurringRequirement

The commands validate input before delegating persistence.

## Boundary

The application layer does not calculate academic state or priority. Those are the next phases.

Persistence is represented by the AcademicRepository port, keeping Supabase-specific code outside the domain/application contract.

## MVP safety rules

- Required identifiers and text are validated.
- Dates are validated before persistence.
- Assessment weights are constrained to 0–100.
- Study sessions cannot end before they start.
- Event and observation confirmation is explicit.
- Study duration can be derived from timestamps.
- Commands do not invent academic facts.
- Commands do not calculate course state.
- Commands do not calculate priority.
