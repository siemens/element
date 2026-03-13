# AI chat history

The chat history displays previous conversations between the user and the AI.

## Usage ---

Chat history helps users maintain context, revisit previous interactions, and continue
conversations across longer tasks.

This pattern is a combination of list item and the [side panel](../../components/layout-navigation/side-panel.md).

![AI chat](images/ai-chat.png)

### Best practices

- Refer to [conversational design](https://ix.siemens.io/docs/guidelines/conversational-design/getting-started) guidelines.
- Use auto-generated or user-defined titles for chat conversations,
  as they provide a stable reference for each conversation.
- A preview may replace the title when conversations are short-lived or primarily accessed in recent context.

## Design ---

### Elements

![AI chat history elements](images/chat-history-elements.png)

> 1\. Title, 2. Metadata (optional), 3. Actions (optional)

### Actions

Actions allow users to manage chat conversations (for example rename, move, archive, delete, or export).

- If a chat history item has only one action, display it directly and associate it clearly with the item.
- If there are multiple actions, group them in an overflow menu.

![AI chat history elements](images/chat-history-actions.png)

### Metadata

It is typically displayed as text-based informational attributes.
Icons may be added when they improve recognition.
[Badges](../../components/status-notifications/badges.md) can be used for explicit
states or applied labels that should stand out visually.

Each metadata element can be replaced by a [link](../../components/buttons-menus/links.md),
styled with `text-secondary`.

![AI chat history elements](images/chat-history-metadata.png)

If space remains insufficient due to a high number of metadata elements, consider prioritizing
the most relevant attributes and progressively removing secondary ones to preserve clarity.

![AI chat history elements](images/chat-history-metadata-overflow.png)

### Layouts

#### Full page layout

When the AI chat is integrated as a full page layout, 
the chat history is displayed in a collapsible side panel.

![AI chat in full page](images/ai-chat-full-page.png)

#### Side panel layout

If AI the AI chat is already handled in a side panel, chat history is accessed within the same panel.
Selecting a conversation replaces the current chat content inside that panel.
Only one panel should be active at a time.

![AI chat in side panel](images/ai-chat-side-panel.png)

#### Chat organization

Conversations may be organized into temporal sections (e.g., Today, Yesterday, Last 7 days, Last 30 days, Older).

Additional grouping methods can be used when further organization is needed.

- Use [tabs](../../components/layout-navigation/tabs.md) for broad, mutually exclusive
  categories to help users focus on one category at a time.
- Use [summary chips](../../components/status-notifications/summary-chip.md) to provide a
  quick overview of grouped conversations



If additional refinement is needed, consider using filters.

## Code ---

Use the chat container with the chat messages to build chat message interfaces.

The **si-chat-container** component is a wrapper component, it has slots for
[chat messages](../../components/chat-messages/chat-message.md) and a
[chat input](../../components/chat-messages/chat-input.md).

The slots are:

- default -> chat messages or initial screen (`si-welcome-screen`)
- `si-chat-input/siChatContainerInput (helper directive)` -> For the input (whether default or custom).
- `si-inline-notification` -> Slotted above the input for displaying the status.

<si-docs-component example="si-chat-messages/si-chat-container" height="600"></si-docs-component>

<si-docs-api component="SiChatContainerComponent"></si-docs-api>

### Initial Screen

When initially displaying a chat interface use the initial **si-welcome-screen** component that displays when there are no messages. It can be slotted into the **si-chat-container** component. It accepts prompt suggestions as an input.

<si-docs-component example="si-chat-messages/si-ai-welcome-screen" height="600"></si-docs-component>

<si-docs-api component="SiAiWelcomeScreenComponent"></si-docs-api>

<si-docs-types></si-docs-types>
