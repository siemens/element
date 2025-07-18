# Best practices

## Transitional text to show something is happening

- Use -ing verbs and ellipses (…)
- Do not use informal, transitional wording
- Confirmation messages: Use the same verb as the transitional text

| Dos                                 | Don'ts                               |
|-------------------------------------|--------------------------------------|
| Updating user roles...              | Getting ready...                     |
| Submitting log files...             | Getting ready...                     |
| Saving project... > Project saved   | Saving project... > Project uploaded |
| Training models... > Models trained | Training models... > Training done   |

## Empty-state

- Empty-state wording tells the user the empty space is intentional and should be there, i.e. not an error
- Use the [Empty state component](../../components/status-notifications/empty-state.md) with three parts of a message: 1. title 2. explanation 3. action
- Use wording to move the user forward
- Use wording to help users understand the function of the empty state
- Do not over communicate
- Use wording to show users how to resolve the empty state, e.g. with an action, click, etc.

<!-- markdownlint-disable MD033 -->
| Dos                                                                                                        | Don'ts             |
|------------------------------------------------------------------------------------------------------------|--------------------|
| _(Title)_ No users<br>_(Explanation)_ Add users to current site<br>_(Action)_ Add users                    | No allocated users |
| _(Title)_ Nothing to display<br>_(Explanation)_ Select a project to see users<br>_(Action)_ Select project | No rows to show    |
| _(Title)_ No projects<br>_(Explanation)_ Create a project to use the app<br>_(Action)_ Create project      | No projects saved  |
<!-- markdownlint-enable MD033 -->
