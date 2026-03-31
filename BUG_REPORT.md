# Bug Report

## 1) Pagination skips first page items

- Location: `task-api/src/services/taskService.js` (`getPaginated`)
- Expected behavior:
  - `GET /tasks?page=1&limit=2` should return the first two tasks.
- Actual behavior:
  - It returns items starting from the third record.
- How discovered:
  - Failing tests in `task-api/tests/taskService.test.js` and `task-api/tests/tasks.routes.test.js`.
- Why it happens:
  - Offset is calculated as `page * limit` instead of `(page - 1) * limit`.
- Fix approach:
  - Update offset calculation to `const offset = (page - 1) * limit`.

## 2) Status filtering uses partial match

- Location: `task-api/src/services/taskService.js` (`getByStatus`)
- Expected behavior:
  - Filter should use exact status matching (`todo`, `in_progress`, `done`).
- Actual behavior:
  - Uses `includes`, so partial values can match (for example, querying `progress` matches `in_progress`).
- How discovered:
  - Code inspection while writing status filter tests.
- Why it happens:
  - Implementation uses `t.status.includes(status)`.
- Fix approach:
  - Replace with strict equality (`t.status === status`).

## 3) Completing a task overwrites priority

- Location: `task-api/src/services/taskService.js` (`completeTask`)
- Expected behavior:
  - Completing a task should mark status and completion timestamp, while preserving unrelated fields.
- Actual behavior:
  - Priority is forcibly changed to `medium`.
- How discovered:
  - Code inspection while reviewing completion behavior.
- Why it happens:
  - `completeTask` hardcodes `priority: 'medium'`.
- Fix approach:
  - Remove forced priority assignment in completion update.
