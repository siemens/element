# Chat input

The **chat input** is a text field for composing and submitting messages in conversational interfaces.
It supports both AI-assisted interactions and human-to-human chat.

## Usage ---

The chat input enables users to send messages or comments depending on context:

- User chat: Sends real-time messages in a conversation
- AI chat: Submits queries to a system for response
- Commenting: Adds contextual feedback or notes tied to a specific element

![chat input example](images/chat-input.png)

### When to use

- In any interface where users need to communicate or leave feedback.
- When freeform text input is required in chat, messaging, or commenting scenarios.

### Best practices

- Always autofocus the input prompt when the page or chat view is opened.
- Limit input width to 720px for legibility.
- Match placeholder text to context (e.g., “Ask anything”, “Type a message”, “Leave a comment”).
- Disable the send button when input is empty or invalid.
- Add the legal disclaimer when used for AI functions.

## Design ---

### Elements

![Chat input elements](images/chat-input-elements.png)

> 1. Placeholder text, 2. Container, 3. Send button, 4. Actions (optional), 5. Legal disclaimer (only for conversational AI)

### Interaction states

![Chat input interaction states](images/chat-input-states.png)

### Actions

When actions are available, they appear directly below the text area
It is recommended to display up to one action inline; any additional actions should be grouped into a menu.

![Chat input actions](images/chat-input-actions.png)

### Attachments

When supported, attachments appear within the input area as part of the composed message,
allowing users to review and remove them before sending.

If multiple attachments are added, they wrap and stack within the input field.

![Chat input attachments](images/chat-input-attachments.png)

### Overflow behavior

The input field automatically expands as the user types, up to a set maximum height.
Beyond that point, scrolling is enabled within the input.

### Follow-up prompts

Follow-up prompts are suggested next actions displayed as pill buttons above the chat input after an AI response.
They help users continue the conversation without having to formulate the next message from scratch.

- Prompts wrap to multiple lines when labels are long.
- Selecting a prompt inserts its text into the input field so the user can review or edit before sending.
- The prompt list is cleared when the user sends a message.

### Voice input

Voice input is optional. The microphone button appears before the send button.
During dictation, the text area remains visible and read-only so transcription updates do not
conflict with manual edits. Attachment and other contextual actions remain available.

- **Idle:** The microphone starts dictation. Sending follows the usual input rules.
- **Listening:** Guard startup immediately, including permission requests. Cancel replaces the microphone and send is disabled. Use "Starting voice input…" during startup, then "Listening…" while awaiting speech.
- **Recording:** Transcription appears in real time, and confirm replaces send. The whole draft uses the secondary text color until dictation ends and normal text styling returns.
- **Confirm:** Dictation stops and the transcript remains editable. Confirmation never sends a message.
- **Automatic completion:** When the recognition provider finishes, the consumer returns to idle and keeps the transcript editable for review, without sending.
- **Cancel:** Dictation stops and the consumer restores the draft from before dictation.

All controls use the existing tertiary ghost buttons, icon sizing, accent color, and spacing tokens.
No waveform is rendered in this version.

Focus moves to cancel while listening, then to confirm when recording begins, provided the user
has stayed on the text area or dictation controls. If the user navigates to a contextual action,
menu, or outside the input, automatic transitions preserve that focus. After dictation, focus
returns to the text area with the cursor at the end only if it remains on the dictation controls
or text area. Enter in the text area confirms during recording and never sends during dictation;
Escape cancels from anywhere within the input. Repeated Enter events are ignored, so holding
Enter cannot confirm and immediately send. Buttons also support their native Enter and Space activation.

## Code ---

<si-docs-component example="si-chat-messages/si-chat-input"></si-docs-component>

### Follow-up prompts

Pass a `string[]` to `followUpPrompts` to display suggested prompts above the input.
When the user clicks a prompt, `followUpPromptSelected` emits its text. Use the event to insert the
text into the input and clear the prompt list.
Clear the list (set to `[]`) on send and repopulate it after each AI response.

```html
<si-chat-input
  [followUpPrompts]="aiResponse?.followUpPrompts ?? []"
  (followUpPromptSelected)="onFollowUpSelected($event)"
  (send)="onSend($event)"
/>
```

### Voice input

<si-docs-component example="si-chat-messages/si-chat-voice-input"></si-docs-component>

Enable the controls with `voiceInput` and drive `voiceInputState` from your speech recognition
integration. Element does not access the microphone or depend on a speech-to-text library.
The example simulates asynchronous startup and partial transcription updates without requesting
microphone access. Startup is cancellable before the first transcript arrives. After the final
simulated result, dictation finishes automatically and the transcript remains editable for review.
Users can also confirm earlier to stop dictation and keep the partial transcript.
Switch off **Automatic completion** below the example to require user confirmation after the final
result. The switch is disabled during dictation so the completion mode stays fixed for each attempt.

```html
<si-chat-input
  [voiceInput]="true"
  [voiceInputState]="voiceInputState()"
  [(value)]="draft"
  (voiceInputStart)="startDictation()"
  (voiceInputConfirm)="confirmDictation()"
  (voiceInputCancel)="cancelDictation()"
  (send)="sendMessage($event)"
/>
```

The consumer owns the recognition lifecycle, state, and transcript:

1. On `voiceInputStart`, reject concurrent starts, save the current draft, and set the state to
   `listening` synchronously, before awaiting microphone permission or provider startup. This
   locks editing and sending while keeping cancellation available. Use `listeningLabel` to
   announce "Starting voice input…" during startup and "Listening…" once the provider is ready.
   Associate asynchronous startup and transcript callbacks with the current attempt.
2. When speech is detected, set the state to `recording`. Update `value` with each complete
   draft, including any existing text. Partial results can replace previous partial results;
   do not append the same interim words repeatedly. The text area resizes for external updates.
3. On `voiceInputConfirm`, stop recognition, apply any final result, then set the state to
   `idle`. The user can review, edit, dictate more, or send the message.
4. On `voiceInputCancel`, stop recognition, restore the saved draft, then set the state to `idle`.
   Attachments are not cleared by dictation controls.
5. When the provider ends the recognition session naturally, apply any final result, release
   recognition resources, and set the state to `idle`, keeping the transcript for review. Do not
   send the message automatically. This transition does not require a `voiceInputConfirm` event.

Silence detection and automatic stopping belong to the speech recognition integration, not the
chat input. Providers may expose voice activity, end-of-utterance, silence timeout, or session-ended
events. A speech pause or end of an utterance does not necessarily end a continuous recognition
session. Follow the provider's lifecycle and your application's stopping policy, and keep dictation
active until final results have been collected and recognition has finished.

The events are requests: they do not change `voiceInputState` or `value` automatically. Keep
the active state until asynchronous finalization completes. Cancellation, completion, and
destruction must invalidate the current attempt. Ignore both successful and failed callbacks
from invalidated attempts: they must not update state or restore an old draft over edits made
after cancellation or during a later attempt. Release any resources returned by a late startup
result, and release microphone resources when the view is destroyed.

On permission denial or recognition failure for the current attempt, stop recognition, restore
the draft protected by the startup lock, return to `idle`, and present an appropriate accessible
error message or notification. Do not defer the startup lock until permission is granted or
unconditionally restore a saved draft from a stale error handler. Only enable voice input when
your integration supports it. The microphone control is disabled during response generation.

Customize `startDictationLabel`, `cancelDictationLabel`, `confirmDictationLabel`, and
`listeningLabel` with translatable strings. The listening status is announced without announcing
every partial transcript. Consumers can hide irrelevant custom actions during dictation if needed.
Waveform rendering and audio-level inputs are intentionally deferred; no audio data is required by
the current interface.

<si-docs-api component="SiChatInputComponent"></si-docs-api>

<si-docs-types></si-docs-types>
