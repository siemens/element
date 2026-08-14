# Trace message

> **Note:** The trace message component is currently experimental and may undergo changes in future releases.

The **trace message** represents a meaningful step or phase in an AI activity trace. It communicates
whether an activity is running, completed, or failed and can reveal additional details on demand.

## Usage ---

Use trace messages to make multi-step AI activity transparent without exposing every internal event.
Show one message for each user-relevant step or phase and arrange related messages in execution order.

- Use a concise `label` that describes the activity.
- Set `state` to `running`, `completed`, or `failed` to communicate its current status.
- Set `icon` to customize the completed activity marker. It defaults to `element-record-filled`.
- Project optional details such as Markdown, metadata, or tool output into the component. Users can
  expand and collapse this content from the trace header.
- Use `expanded` to control the initial disclosure state or to synchronize it with application state.

Avoid using trace messages for low-level implementation details that do not help users understand the
AI's progress or result.

## Code ---

```html
<si-trace-message label="Searched the knowledge base" state="completed" icon="element-search">
  <p>Found 12 relevant documents in the product knowledge base.</p>
</si-trace-message>
```

<si-docs-component example="si-chat-messages/si-trace-message" height="700"></si-docs-component>

<si-docs-api component="SiTraceMessageComponent"></si-docs-api>

<si-docs-types></si-docs-types>
