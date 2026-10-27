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
- **Confirm:** The consumer requests recognition to stop. If final results are pending, enter finishing before returning to idle for review. Confirmation never sends a message.
- **Finishing:** The draft remains read-only and uses the secondary text color while accepting final transcript updates. The status announces "Finishing dictation…". Confirm is disabled; Cancel and contextual actions remain available.
- **Automatic completion:** When the recognition provider finishes, the consumer returns to idle and keeps the transcript editable for review, without sending.
- **Cancel:** Dictation stops and the consumer restores the draft from before dictation.

All controls use the existing tertiary ghost buttons, icon sizing, accent color, and spacing tokens.
A waveform appears before cancel and confirm during dictation. It shows a silent baseline while
listening, scrolls from right to left while recording, and freezes while finishing. Silence uses
the disabled text color; other samples use the primary text color. The waveform is decorative:
the listening and finishing status and button labels provide accessible feedback without announcing every audio sample.
Reduced-motion preferences keep the waveform static.

Focus moves to cancel while listening, then to confirm when recording begins, provided the user
has stayed on the text area or dictation controls. If the user navigates to a contextual action,
menu, or outside the input, automatic transitions preserve that focus. When finishing begins,
focus moves from Confirm to Cancel, without taking focus from unrelated controls. After dictation, focus
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
result. Enable **Simulated audio levels** to demonstrate consumer-provided levels instead of the
built-in fallback. These levels are demonstration data, not microphone measurements. The switches
are disabled during dictation so the settings stay fixed for each attempt.

```html
<si-chat-input
  [voiceInput]="true"
  [voiceInputState]="voiceInputState()"
  [voiceInputLevel]="audioLevel()"
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
3. On `voiceInputConfirm`, set the state to `finishing` and request recognition to stop. Keep
   accepting final transcript updates through `value` without returning to `recording`. The draft
   stays read-only, Confirm is disabled, and Cancel remains available. Once final results have
   arrived and recognition has finished, set the state to `idle` for review, editing, further
   dictation, or sending. If finalization is synchronous, the consumer can return directly to idle.
4. On `voiceInputCancel`, stop recognition, restore the saved draft, then set the state to `idle`.
   Attachments are not cleared by dictation controls.
5. When the provider ends the recognition session naturally, use `finishing` if final results are
   pending. Apply the final result, release recognition resources, and set the state to `idle`,
   keeping the transcript for review. Do not send the message automatically. This transition does
   not require a `voiceInputConfirm` event.

Silence detection and automatic stopping belong to the speech recognition integration, not the
chat input. Providers may expose voice activity, end-of-utterance, silence timeout, or session-ended
events. A speech pause or end of an utterance does not necessarily end a continuous recognition
session. Follow the provider's lifecycle and your application's stopping policy, and keep dictation
active until final results have been collected and recognition has finished.

The events are requests: they do not change `voiceInputState` or `value` automatically. Keep
the state at `finishing` until asynchronous finalization completes. Cancel remains a consumer
request in this state: stop finalization, restore the saved draft, and return to idle. Cancellation, completion, and
destruction must invalidate the current attempt. Ignore both successful and failed callbacks
from invalidated attempts: they must not update state or restore an old draft over edits made
after cancellation or during a later attempt. Release any resources returned by a late startup
result, and release microphone resources when the view is destroyed.

On permission denial or recognition failure for the current attempt, stop recognition, restore
the draft protected by the startup lock, return to `idle`, and present an appropriate accessible
error message or notification. Do not defer the startup lock until permission is granted or
unconditionally restore a saved draft from a stale error handler. Only enable voice input when
your integration supports it. The microphone control is disabled during response generation.

Customize `startDictationLabel`, `cancelDictationLabel`, `confirmDictationLabel`, `listeningLabel`,
and `finishingLabel` with translatable strings. Listening and finishing are announced through the
status region without announcing every transcript update. Consumers can hide irrelevant custom
actions during dictation if needed.

### Browser voice input

<si-docs-component example="si-chat-messages/si-chat-voice-input-browser"></si-docs-component>

This interactive example uses the browser's Web Speech API for real dictation and the Web Audio
API for measured microphone levels. It has no speech SDK, API key, or application backend.
The integration belongs to the example, not the Element library. Applications can use their
own speech recognition provider with the same component inputs and outputs.

Microphone access requires HTTPS or localhost. Before enabling dictation, acknowledge that the
browser may send audio to its speech recognition service. Do not dictate sensitive information.
Recognition availability depends on the browser, language, network, and browser policies;
feature detection alone does not guarantee that its service is available. If the required APIs
are missing, the example keeps normal text input available without voice controls.

The example uses the browser language and requests interim results for one utterance at a time.
Recognition can end automatically after a pause; the exact stopping behavior is browser-dependent.
Confirm requests final results before unlocking the draft, while cancel restores the previous
draft immediately. Neither operation sends the message. Permission and recognition errors restore
the previous draft and display an accessible error. If confirmation times out, the current text
is retained for review.

Speech recognition does not expose audio levels. The example separately acquires a microphone
stream and measures its amplitude with an `AnalyserNode`, without playing or storing the audio.
It releases that stream and its audio context on confirmation, cancellation, completion, errors,
and destruction, and stops streams returned after a cancelled permission request.
The simulated example above remains available without microphone access or a recognition service.

### Waveform

`voiceInputLevel` accepts the latest normalized audio level: `0` means silence and `1` means maximum
volume. Derive it from your audio provider's volume or amplitude measurement, independently of the
transcript. Element samples the latest value every 60 ms; it does not queue provider updates.
Values outside this range are clamped, and non-finite values are treated as silence. Do not pass
raw PCM samples, decibels, or frequency arrays without converting them to the normalized range.

Omit `voiceInputLevel` (or pass `undefined`) when your provider does not expose audio levels.
The waveform then simulates alternating speech bursts and quiet periods while recording. This
animation indicates activity, not measured microphone volume. An explicit `0` shows real silence
and never enables the fallback. No audio-level data is required to stream transcripts through `value`.

The waveform has a fixed 120 by 16 px viewport, with 1 px bars and 2 px gaps. Each new sample enters
on the right every 60 ms, with a height between 2 and 16 px. Samples remain vertically centered.
Recording stops when the consumer changes `voiceInputState`; disabling the input also stops the
animation. During finishing, the waveform stays mounted with its last samples while final
transcript updates arrive. Returning to idle removes the waveform, and the next dictation starts
with silence.

For other voice controls, import `SiVoiceWaveformComponent` from `@siemens/element-ng/chat-messages`:

```html
<si-voice-waveform [active]="recording()" [level]="audioLevel()" />
```

`active` defaults to `false`. Setting it to `false` freezes the current samples; setting it to
`true` resumes sampling. The standalone waveform is hidden from assistive technology. Pair it with
an accessible recording status and labeled controls. Timers stop on destruction, while the user
prefers reduced motion, and when Element animations are disabled with `--element-animations-enabled: 0`
or an inherited `disable-animations` class when recording starts.
Both the chat input and standalone component remain independent of microphone
permissions, audio capture, and speech recognition libraries.

<si-docs-api component="SiChatInputComponent"></si-docs-api>

<si-docs-api component="SiVoiceWaveformComponent"></si-docs-api>

<si-docs-types></si-docs-types>
