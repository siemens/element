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

<!-- markdownlint-disable MD033 -->
<div class="dos-and-donts" markdown>
<div class="dos" markdown>

#### Do's

- their, them, theirs, salesperson
- Welcome to Building X
- Welcome Werner von Siemens
- X appears when detail view has selected events
- cannot, will not
- you will, we have

</div>
<div class="donts" markdown>

#### Don'ts

- his, hers, him, salesman
- Hey there!
- Hey there!
- X doesn't appear if detail view has no selected events
- can't, won't
- you'll, we've

</div>
</div>
<!-- markdownlint-enable MD033 -->

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
| ---------------------------------------------------------- | ---------------------------------------------------------- |
| Go to Settings                                             | Go To Settings                                             |
| Press OK                                                   | Press Ok                                                   |
| Log in                                                     | LOG IN                                                     |
| For more information, see Siemens Industry Online Support. | For more information, see Siemens industry online support. |

## Common UX wording mistakes

The following table contains frequently discovered UX writing mistakes.

<!-- markdownlint-disable MD033 -->

| Dos                                                                       | Don'ts                  |
| ------------------------------------------------------------------------- | ----------------------- |
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
