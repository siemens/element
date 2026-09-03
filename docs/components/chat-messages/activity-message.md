# Activity message

> **Note:** The activity message component is currently experimental and may undergo changes in future releases.

The **activity message** represents a meaningful step or phase in an AI activity. It communicates
whether an activity is running, completed, or failed and can reveal additional details on demand.

## Usage ---

Use activity messages to make multi-step AI activity transparent without exposing every internal
event. Show one message for each user-relevant step or phase and arrange related messages in
execution order.

- Use a concise `label` that describes the activity.
- Set `state` to `running`, `completed`, or `failed` to communicate its current status.
- Set `icon` to customize the completed activity marker. It defaults to `element-record-filled`.
- Project optional details such as Markdown, metadata, or tool output into the component. Users can
  expand and collapse this content from the activity header.
- Use `expanded` to control the initial disclosure state or to synchronize it with application state.

Avoid using activity messages for low-level implementation details that do not help users understand
the AI's progress or result.

### Activity trace

Use `si-activity-trace` to group multiple related activity messages under a shared,
collapsible heading.

### Activity message

Use `si-activity-message` for an individual activity. It has a heading, an optional icon, and
collapsible content, and can communicate running and failed states. Content can be added directly or
organized into parts.

Activity messages can be used without a trace. They can also contain other activity messages
when a step has its own intermediate activities.

### Activity message part

Use `si-activity-message-part` to divide an activity into multiple titled parts,
such as input and output. Parts are optional and can be made collapsible independently.

When parts are used, provide at least two so that the subdivision adds meaningful structure.

## Code ---

<si-docs-component example="si-chat-messages/si-activity-message"></si-docs-component>

<si-docs-api component="SiActivityTraceComponent"></si-docs-api>

<si-docs-api component="SiActivityMessageComponent"></si-docs-api>

<si-docs-api component="SiActivityMessagePartComponent"></si-docs-api>
