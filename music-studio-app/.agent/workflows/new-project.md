---
description: Initialize a new GSD project by defining the spec and roadmap.
---

1. **Review Context**:
   - Read `.gsd/PROJECT_RULES.md` to understand the rules.
   - Read `.gsd/SPEC.md` (template) and `.gsd/ROADMAP.md` (template).

2. **Define Specification**:
   - Ask the user for the high-level goal of the project if not already known.
   - Update `.gsd/SPEC.md` with:
     - **Goal**: Clear, concise objective.
     - **Core Features**: List of must-have features.
     - **Implementation Details**: Tech stack choices, constraints.
     - Change status to `FINALIZED` only when the user approves.

3. **Create Roadmap**:
   - Based on the Spec, break the project down into Phases in `.gsd/ROADMAP.md`.
   - Each Phase should have a clear goal and a list of high-level tasks.

4. **Initialize State**:
   - Update `.gsd/STATE.md` with the current context ("Starting Project") and the first step (e.g., "Planning Phase 1").

5. **Commit**:
   - (Optional) Git commit the initial GSD setup.
