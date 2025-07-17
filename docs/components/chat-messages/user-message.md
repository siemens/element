# User message

The **user message** displays input submitted by the user in conversational interfaces.
It can appear in interactions with an AI assistant or in peer-to-peer conversations,
helping to maintain context and continuity within the chat.

## Usage ---

Displayed as a text bubble, the user message visually represents the user’s contribution to a conversation.
It may support contextual actions such as copy, edit, or delete.

![User message](images/user-message.png)

### When to use

- In chat interfaces where user input is shown as part of a dialogue.
- In conversation histories or transcripts.
- In AI chat functions.

## Design ---

## Elements

![Message user elements](images/user-message-elements.png)

> 1. Actions (optional), 2. Message bubble, 3. User message

### Actions

Actions are revealed on hover for desktop users, and on tap for mobile users where hover interactions aren’t supported.

![Message user actions](images/user-message-actions.png)

### Attachments

When attachments are included in a user message, they should appear above the message bubble.
Attachments are arranged horizontally and wrap to the next line when they exceed the available space.

For general attachment errors (e.g., file not supported), display an inline error message above the field,
following the AI pattern guidelines.

![User message attachments](images/user-message-attachments.png)

## Code ---

Angular component is coming soon.
