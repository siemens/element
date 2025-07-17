# AI message

The **AI message** component displays the AI system’s response to a user’s input.

## Usage ---

The AI message component visually distinguishes automated responses from user input.
It supports optional actions or other content relevant to the user.

![AI message](images/ai-message.png)

### When to use

- Displaying AI-generated content in chat interfaces
- Providing system-driven assistance or explanations
- Offering structured follow-up steps after user input
- Surfacing links to related documents or knowledge sources

### Best practices

- Allow user interaction (feedback, retry, copy) when appropriate.
- Always place the AI message directly in the background. Do not wrap it in an additional container.
- Constrain the AI message to a maximum width of 720px for readability.

## Design ---

### Elements

![AI message elements](images/ai-message-elements.png)

> 1. AI icon, 2. AI message, 3. Actions (optional)

### Actions

When actions are present, they’re always positioned below the text area.
Is possible to display up to 4 actions inline; any additional actions will be collapsed into a menu.

![AI message actions](images/ai-message-actions.png)

### Responsive behavior

For breakpoints sm (≥576px):

- AI icon is placed above the AI reply text.
- All actions are positioned above the AI reply text.
- All actions collapse under a menu.

![AI message responsive](images/message-ai-responsive.png)

## Code ---

Angular component is coming soon.
