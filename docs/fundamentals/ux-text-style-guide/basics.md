# Basics

The following sections contain advice we follow at Siemens to create our own products and includes common
writing errors to avoid when creating industrial products and experiences.

## Style

- Use as few words as possible
- Use simple, specific, clear, and informative wording
- Use the same words and grammatical forms, lengths, and styles repeatedly

## Tone and voice

- Use natural, conversational language and not robotic, funny, cool or clever
- Avoid to talk to the user directly on the UI
- Talk to users directly in formal contexts only (e.g., email bodies, app tour, …)
- Address users in second-person (you) and use first-person plural for the application (we) if direct communication is used
- Use gender-neutral language
- Use polite language
- Avoid 'please', 'sorry' and other forms of apology
- Use positive instead of negative framing
- Avoid using contractions in general

| Dos                                            | Don'ts                                                 |
|------------------------------------------------|--------------------------------------------------------|
| their, them, theirs, salesperson               | his, hers, him, salesman                               |
| Welcome to Building X                          | Hey there!                                             |
| Welcome Werner von Siemens                     | Hey there!                                             |
| X appears when detail view has selected events | X doesn't appear if detail view has no selected events |
| cannot, will not                               | can't, won't                                           |
| you will, we have                              | you'll, we've                                          |

## Length

- Use sentences only when necessary
- Use short words (3, 4, or 5 letters) instead of long words (8 or longer)
- Use short, scannable segments, not paragraphs
- Keep sentences under 25 words (average = 15 words)
- Keep titles under 65 characters (including spaces)
- Use info icons only when necessary: Icons cannot contain the same content as the UI

## Capitalization

- Capitalize the first letter of the first word in a title / sentence / tooltip / menu item / list item / button
- Do not use all-caps (e.g., `PLANNING` → `Planning`)
- Capitalize proper nouns, i.e. places, organizations, tools, languages, products and things according the [proper nouns](proper-nouns.md) chapter
- Capitalize named app functions and UI elements: Go to Settings, Allocate users in User management, Press OK

| Dos                                                        | Don'ts                                                     |
| -----------------------------------------------------------|------------------------------------------------------------|
| Go to Settings                                             | Go To Settings                                             |
| Press OK                                                   | Press Ok                                                   |
| Log in                                                     | LOG IN                                                     |
| For more information, see Siemens Industry Online Support. | For more information, see Siemens industry online support. |

## Common UX wording mistakes

The following table contains frequently discovered UX writing mistakes.

<!-- markdownlint-disable MD033 -->
| Dos                                                                       | Don'ts                  |
| --------------------------------------------------------------------------|-------------------------|
| time zone                                                                 | timezone                |
| log file                                                                  | logfile                 |
| log in (as an action)                                                     | login                   |
| login (as a noun)                                                         | log in                  |
| equipment                                                                 | equipments              |
| feedback                                                                  | feedbacks               |
| training                                                                  | trainings               |
| current<br>_Avoid misunderstandings with current (electricity)_           | actual                  |
| present<br>_If misunderstandings with current (electricity) are possible_ | actual                  |
| avoid "shall"                                                             | user shall manage users |
| Siemens has                                                               | Siemens have            |
| 34 million / 35 billion                                                   | 34 / 35                 |
| 34 million                                                                | 34 millions             |
<!-- markdownlint-enable MD033 -->
