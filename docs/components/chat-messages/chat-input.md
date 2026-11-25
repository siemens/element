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

Voice input lets users dictate messages using an optional button next to the send button.

- Click the button to start or stop dictation.
- Recognized text is inserted into the input field for review before sending.
- An optional waveform indicates active recording.

## Code ---

### Usage

```ts
import { SiChatInputComponent } from '@siemens/element-ng/chat-messages';
import {
  SiVoiceInputDirective,
  SiVoiceWaveformComponent
} from '@siemens/element-ng/voice-input';

@Component({
  imports: [SiChatInputComponent, SiVoiceInputDirective, SiVoiceWaveformComponent, ...]
})
```

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

Add a button with `siVoiceInput` to the `siChatInputEnd` slot.
It uses the browser's
[`SpeechRecognition`](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) or
[`webkitSpeechRecognition`](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API)
API with the browser's default language, or a BCP 47 tag via `lang`.
Provide `SI_VOICE_INPUT_RECOGNITION` to use a custom provider.
Place `si-voice-waveform` in `siChatInputEnd` beside the button to show audio activity while
recording.

<si-docs-component example="si-chat-messages/si-chat-voice-input" height="400"></si-docs-component>

### Measured microphone levels

Pair `siVoiceInput` and `si-voice-waveform` with the Web Audio API to drive the waveform from
live microphone volume.

<si-docs-component example="si-chat-messages/si-chat-voice-input-browser" height="220"></si-docs-component>

<si-docs-api component="SiChatInputComponent"></si-docs-api>

<si-docs-api directive="SiVoiceInputDirective"></si-docs-api>

<si-docs-api component="SiVoiceWaveformComponent"></si-docs-api>

<si-docs-types></si-docs-types>
