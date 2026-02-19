---
description: Execute the tasks defined in PLAN.md.
---

1. **Load Plan**:
   - Read `.gsd/PLAN.md` and `.gsd/PROJECT_RULES.md`.

2. **Execute Loop**:
   - For each `<task>` in `PLAN.md` that is NOT done:
     1. **Context**: Read relevant files for this specific task.
     2. **Update State**: Update `.gsd/STATE.md` to "Executing task: [Task Name]".
     3. **Implement**: Perform the code changes.
     4. **Verify**: Run the verification command specified in the task (or equivalent).
     5. **Mark Done**:
        - Update `PLAN.md` to mark the task as completed (e.g., add `status="done"` or move to a `DONE` section).
        - (Optional) Create a git commit: `git commit -m "feat: [Task Name]"`
     6. **Check**: If the task failed verification, STOP and debug. Do not proceed to the next task.

3. **Completion**:
   - When all tasks are done, update `.gsd/STATE.md` to "Phase X Complete".
   - Ask user to run verification for the whole phase.
