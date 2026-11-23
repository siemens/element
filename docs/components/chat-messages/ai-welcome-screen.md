# AI welcome screen

The **AI welcome screen** is the first thing users see when they open an AI chat.
It introduces the AI and offers starting points, so users don't face an empty input without knowing what to ask.

## Usage ---

The AI welcome screen is shown before the first message in an [AI chat](ai-chat.md).
As soon as the user prompts a message, the welcome screen should disappear.

![AI welcome screen screen](images/ai-welcome-screen.png)

### When to use

- When starting a new conversation in an [AI chat](ai-chat.md), before any message is sent.
- To set expectations about what the AI can and can't do.
- To help users get started with relevant prompt suggestions.

### Best practices

- Show only relevant prompt suggestions that reflect common actions or the current context.
- Limit the number of suggestions, and use prompt categories when there are too many to scan.
- Write suggestions as complete prompts users can edit them or send as they are.

## Design ---

### Elements

![AI welcome screen elements](images/ai-welcome-screen-elements.png)

1. AI icon
1. Salutation: A brief, welcoming message that sets a conversational tone.
1. Prompt categories (optional): When suggestions exceed a manageable number, group them by topic or function using
   [summary chips](../../components/status-notifications/summary-chip.md)
1. Prompt suggestions (optional): Curated prompts or example questions that reflect common or relevant actions.
1. [Chat input](../../components/chat-messages/chat-input.md)

## Code ---

Use `si-ai-welcome-screen` to introduce the assistant before the first message. It accepts prompt
suggestions and can be slotted into [`si-chat-container`](chat-container.md). It is built into
[`si-ai-chat`](ai-chat.md#welcome-screen).

<si-docs-component example="si-chat-messages/si-ai-welcome-screen" height="600"></si-docs-component>

### Prompt suggestions

Prompt suggestions can be provided as either:

- A simple array of suggestions (no categories)
- A record mapping category labels to arrays of suggestions

When using a record, categories are automatically displayed as filter pills.

```typescript
// Simple array (no categories)
promptSuggestions = [
  { text: 'How do I optimize performance?' },
  { text: 'What are best practices?' }
];

// Record with categories
promptSuggestions = {
  'All prompts': [{ text: 'How do I optimize performance?' }, { text: 'What are best practices?' }],
  'Maintenance': [{ text: 'Schedule preventive maintenance' }, { text: 'Track equipment downtime' }]
};
```

<si-docs-api component="SiAiWelcomeScreenComponent"></si-docs-api>

<si-docs-types></si-docs-types>
