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

Voice input is optional. Place a button with `siSpeechInput` in the `siChatInputEnd` slot
next to Submit. The directive also works outside chat input.

Click the button or press Enter or Space to start or stop recognition. Escape on the button
cancels the attempt and restores the previous draft. Stopping retains the final transcript;
it does not send a message unless the consumer opts in.

The consumer controls the icon, contextual actions, and chat state. The directive supplies
translated start/stop labels and the pressed state. It preserves button focus, including
when recognition finishes. Consumers can optionally project a provider-independent audio
waveform beside the button without adding waveform behavior to chat or speech input.

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

Import `SiSpeechInputDirective` from `@siemens/element-ng/speech-input` alongside the chat
and icon components. Recognition uses the browser's `SpeechRecognition` or
`webkitSpeechRecognition` implementation. The browser requests microphone permission on
the first start; unsupported browsers disable the button. Browser support and language
availability vary, and some implementations send audio to the browser vendor's service.
Assess privacy and consent requirements before enabling recognition.

The example uses the default browser adapter and requests microphone access when dictation
starts. The injectable `SI_SPEECH_INPUT_RECOGNITION` factory also supports other providers
and deterministic tests.
Place the button in the `siChatInputEnd` projection slot to keep it next to Submit.

```html
<si-chat-input [sending]="sending()" [(value)]="message" (send)="onSend($event)">
  <button
    #speech="siSpeechInput"
    siChatInputEnd
    siSpeechInput
    continuous
    type="button"
    class="btn btn-tertiary-ghost btn-icon"
    startLabel="APP.DICTATE"
    [disabled]="sending()"
    [silenceTimeout]="2000"
    [(value)]="message"
    (errorOccurred)="onSpeechError($event)"
    (listeningChange)="onListeningChange($event)"
    (transcript)="onTranscript($event)"
  >
    <si-icon [icon]="speech.listening() ? icons.elementStopFilled : icons.elementVoice" />
  </button>
</si-chat-input>
```

`value` is the complete draft, including text present before recognition began. Partial
results replace previous partial results rather than appending duplicates. `transcript`
emits only the current attempt's recognized text. Chat input resizes for external updates.
Do not edit or send the shared draft while recognition is active unless your application
defines how those edits should interact with recognition updates.

`listening()` includes both permission startup and the wait for final results.

#### Audio waveform

Import `SiVoiceWaveformComponent` from `@siemens/element-ng/chat-messages` and place it
before the speech button in the same `siChatInputEnd` slot:

```html
@if (speech.listening()) {
<si-voice-waveform siChatInputEnd [active]="capturing()" [level]="audioLevel()" />
}
```

The waveform is decorative (`aria-hidden="true"`) and occupies a fixed 120 by 16 pixel
viewport. Supply normalized audio levels from 0 to 1; zero represents silence, while
undefined uses simulated speech-like levels. Non-finite values become silence and values
outside the range are clamped. The example uses simulated levels, not microphone audio.

`active` controls sampling independently of the recognition attempt. Keep the waveform
mounted with `active` false while collecting final results to preserve its history, and
remove it when the attempt ends. A new mount starts at the silent baseline. The speech
directive's `listening()` includes permission startup and final-result collection; it
does not indicate that audio is currently being captured. Use your provider's capture
lifecycle for `capturing()`. Reduced motion and Element's disabled-animation policy stop
sampling and movement without discarding existing samples.

#### Standalone use

The same directive can update any signal-backed text field, without a chat component:

```html
<button siSpeechInput type="button" class="btn btn-tertiary-ghost btn-icon" [(value)]="message">
  <si-icon [icon]="icons.elementVoice" />
</button>
```

Repeated activation never creates concurrent attempts. `stop()` keeps final results;
`cancel()` restores the draft saved at startup. Disabling or destroying the directive
aborts recognition, clears timers, and invalidates late callbacks.

#### Permission denied

```html
<si-chat-input [(value)]="message" (send)="onSend($event)">
  <button
    siChatInputEnd
    siSpeechInput
    noPermissionHint
    type="button"
    class="btn btn-tertiary-ghost btn-icon"
    [(value)]="message"
    (errorOccurred)="onSpeechError($event)"
  >
    <si-icon [icon]="icons.elementVoice" />
  </button>
</si-chat-input>
```

`noPermissionHint` shows a focusable recovery popover for `not-allowed` and
`service-not-allowed` errors. After restoring microphone access in browser settings, the
user can retry without losing the draft. The application can disable dictation independently
of typing and sending. Other failures emit their Web Speech API error code and restore the draft.

<si-docs-api component="SiChatInputComponent"></si-docs-api>

<si-docs-api directive="SiSpeechInputDirective"></si-docs-api>

<si-docs-api component="SiVoiceWaveformComponent"></si-docs-api>

<si-docs-types></si-docs-types>
