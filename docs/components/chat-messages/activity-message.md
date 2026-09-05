# Activity message

> **Note:** The activity message component is currently experimental and may undergo changes in future releases.

The **activity message** represents a meaningful step or phase in an AI activity. It communicates
whether an activity is running, completed, or failed and can reveal additional details on demand.

## Usage ---

Use activity messages to make multi-step AI activity transparent without exposing every internal
event. Show one message for each user-relevant step or phase and arrange related messages in
execution order.

- Use a concise `heading` that describes the activity.
- Set `state` to `running` or `failed`; omit it for a completed activity.
- Set `icon` to customize the completed activity marker. It defaults to `element-record-filled`.
- Project optional details such as Markdown, metadata, or tool output into the component. Users can
  expand and collapse this content from the activity header.
- Use `expanded` to control the initial disclosure state or to synchronize it with application state.

Avoid using activity messages for low-level implementation details that do not help users understand
the AI's progress or result. Always provide activity message content so the disclosure control
reveals useful details.

Choose icons based on the activity:

- Reasoning: `element-self-learning`
- Retrieval: `element-search`
- Computation: `element-function`
- Generation: `element-generate`
- System action: `element-settings`
- Workflow: `element-maintenance`
- Read: `element-document`
- Summary: `element-checked`
- Generic: use the default icon

### Activity trace

Use `si-activity-trace` to group multiple related activity messages under a shared,
collapsible heading.

### Activity message

Use `si-activity-message` for an individual activity. It has a heading, an optional icon, and
collapsible content, and can communicate running and failed states. Content can be added directly or
organized into parts.

Activity messages can be used without a trace. Nesting activity messages is optional and should be
reserved for niche, advanced cases where a step has meaningful intermediate activities.

### Activity message part

Use `si-activity-message-part` only when an activity needs multiple titled parts. Parts are optional
and can be made collapsible independently. Use either one input and one output part, or one part per
input and one combined output part. If an input is short and fits on one line, use only the part
heading, omit its content, and keep the part non-collapsible.

## Code ---

<si-docs-component example="si-chat-messages/si-activity-message"></si-docs-component>

<si-docs-api component="SiActivityTraceComponent"></si-docs-api>

<si-docs-api component="SiActivityMessageComponent"></si-docs-api>

<si-docs-api component="SiActivityMessagePartComponent"></si-docs-api>
