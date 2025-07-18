# Errors, warnings and notifications

## General rules for messaging

- Three parts of a message: 1. title 2. explanation 3. action
- Title: Name which information or problem may/will occur
- Explanation: Give a clear reason for the (potential) error and explain it’s consequences if the user ignores it
- Action: Add clear instructions telling the user what to do next to resolve the error
- Avoid 'Try again' and 'Contact administrator' if there is no good chance that this will solve the issue
- Do not blame the user
- Avoid using you and your only use passive voice as an exception
- Do not repeat your message in title and explanation
- Do not over communicate
- Use a polite and encouraging tone
- Keep it short
- If detailed information is required, consider using progressive disclosure button
- Provide specific names, locations and values of the objects involved
- Show urgency through wording, e.g. “immediately” only if there are serious consequences from ignoring messages

## Error messages

- An error message alerts user of a problem that exists and must be addressed
- Avoid using `error` or `warning`, as these words are superfluous in most cases

<!-- markdownlint-disable MD013 MD033 -->
| Dos                                                                                        | Don'ts                                                                                                                       |
|--------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| Form incomplete: Fill in all mandatory fields                                              | What did you do!?                                                                                                            |
| _(Input field validation)_ Invalid email address                                           | The email address you entered does not match the required format. Please enter your email address using the standard format. |
| Failed to delete device. Device still in use                                               | You have failed to delete the device.                                                                                        |
| Insufficient access rights: No access rights to delete {{fileName}}. Contact administrator | Permission error: To carry out this task, you need more permissions. Contact admin to change permissions.                    |
| Page not found: Check address                                                              | Error 404                                                                                                                    |
| _(Input field validation)_ Max. 255<br>_(Input field validation)_ Min. 0                   | Value out of range.                                                                                                          |
| No Internet connection: Check connection and try again                                     | System error: You’re offline. Check your connection and try again.                                                           |
| Failed to upload file: Check source file and try again                                     | File error: We cannot upload this file. Try uploading again.                                                                 |
| File not found: Check if file is moved                                                     | File not found.                                                                                                              |
| _(Skip title)_                                                                             | _(Title)_ Input error                                                                                                        |
| _(Input field validation)_ Max. 30 characters                                              | _(Explanation)_ Input error detected.                                                                                        |
| _(Skip action)_                                                                            | _(Action)_ Try again.                                                                                                        |
<!-- markdownlint-enable MD013 MD033 -->

## Warning messages

- A warning message alerts users of a condition that may cause a problem in the future

| Dos                                                    |
|--------------------------------------------------------|
| Title: Unsaved documents                               |
| Explanation: Save all documents before leaving the app |
| Action: Save all _(button)_                            |

## Notifications

- Notifications are informative and no actions are required from the user
- Avoid using `success`, `successful`, or `successfully`, as these words are superfluous in most cases
- Avoid using `information` as a title, as it does not provide an additional value to the user

| Dos                         | Don'ts                                    |
|-----------------------------|-------------------------------------------|
| Access point 2 connected    | Access point connection failed. Try again |
| Changes saved automatically | No rows to show                           |
| Email sent                  | Email sent successfully                   |
