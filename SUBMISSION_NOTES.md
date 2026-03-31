# Submission Notes

## What I would test next

- Query parameter validation for pagination edge cases (`page=0`, negative values, non-numeric input).
- Additional validator edge cases for `dueDate`, `status`, and `priority` in both create and update routes.
- More `PATCH /tasks/:id/assign` scenarios, such as duplicate names with whitespace normalization and assigning after task completion.

## What surprised me

- Pagination logic had an off-by-one style offset bug that only became obvious once route and service tests both asserted page-one behavior.
- The service layer previously used partial status matching, which is risky for enum-like fields.

## Questions before production

- Should assignment be reassignable (for example, by admins), or should 409 remain strict forever once assigned?
- Should the API enforce stricter query validation and return 400 for invalid pagination values?
- Should task status terms be standardized across all docs and responses (`todo/in_progress/done` vs other naming variants)?
