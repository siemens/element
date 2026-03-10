# EventBus Service - Sequence Diagram

<div style="transform: scale(1.5); transform-origin: top left; width: 66%; margin-bottom: 200px;">

```mermaid
sequenceDiagram
    participant App1
    participant EB1 as EventBus1
    participant App2
    participant EB2 as EventBus2
    participant App3
    participant EB3 as EventBus3
    participant DOM

    Note over App1, EB1: Each app gets its own EventBus singleton
    App1->>EB1: inject EventBus
    App2->>EB2: inject EventBus
    App3->>EB3: inject EventBus

    Note over App2, App3: Subscribe to LANGUAGE_CHANGE

    App2->>EB2: subscribeEvent('LANGUAGE_CHANGE')
    activate EB2
    EB2->>DOM: fromEvent(window, 'LANGUAGE_CHANGE')
    EB2-->>App2: Observable<CustomEvent>
    deactivate EB2

    App3->>EB3: subscribeEvent('LANGUAGE_CHANGE')
    activate EB3
    EB3->>DOM: fromEvent(window, 'LANGUAGE_CHANGE')
    EB3-->>App3: Observable<CustomEvent>
    deactivate EB3

    Note over App1: App1 emits event

    App1->>EB1: emitEvent('LANGUAGE_CHANGE', 'de')
    activate EB1
    EB1->>DOM: dispatchEvent(CustomEvent)
    deactivate EB1

    Note over DOM: Event propagates

    DOM-->>EB2: callback triggered
    activate EB2
    EB2-->>App2: Observable emits 'de'
    deactivate EB2

    DOM-->>EB3: callback triggered
    activate EB3
    EB3-->>App3: Observable emits 'de'
    deactivate EB3

    Note over App2, App3: Both receive 'de' payload
```

</div>

## Flow Description

1. **Injection Phase**: Each application (App1, App2, App3) injects the `EventBus` service. Since they are separate apps, each receives its own singleton instance.

2. **Subscription Phase**:
   - App2 and App3 call `subscribeEvent('LANGUAGE_CHANGE')`
   - EventBus internally uses RxJS `fromEvent()` to listen for CustomEvents on the window
   - Returns an Observable to the subscribing app

3. **Emit Phase**:
   - App1 calls `emitEvent('LANGUAGE_CHANGE', 'de')`
   - EventBus dispatches a `CustomEvent` with the event name and payload

4. **Event Propagation**:
   - The CustomEvent triggers callbacks on all EventBus instances listening via `fromEvent`
   - Each EventBus emits the payload through its Observable
   - App2 and App3 both receive the `'de'` payload
