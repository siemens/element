# UI State

> UI state, app state or domain data are big terms, and we do not want to implement our own state management.
> For client side state management we recommend Flux / Redux / NgRx based state management frameworks
> like [NgRx](https://ngrx.io).

To separate and define these terms we use the definitions from [Redux](https://redux.js.org/usage/structuring-reducers/basic-reducer-structure#basic-state-shape).

- *Domain* data: data that the application needs to show, use, or modify (such as "all of the Todos retrieved from the server")
- *App state*: data that is specific to the application's behavior (such as "Todo #5 is currently selected", or "there is a request in progress to fetch Todos")
- *UI state*: data that represents how the UI is currently displayed (such as "The EditTodo modal dialog is currently open")

However, we provide a lightweight UI state service to persist some UI states, which many users like to keep through reloading the web page.
The supported components are

- [Vertical Navigation](../components/layout-navigation/vertical-navigation.md)
- [Split](../components/layout-navigation/split.md)
- [Main-Detail Container](../components/layout-navigation/main-detail-container.md)

Expanded and split size states are persisted in e.g. the `localStorage` of the browser and re-applied on reload.

<si-docs-component editor="false" height="500">
  <si-docs-tab example="si-navbar-vertical/si-navbar-vertical" heading="Vertical Navigation"></si-docs-tab>
  <si-docs-tab example="si-split/si-split-mixed" heading="Split"></si-docs-tab>
  <si-docs-tab example="si-main-detail-container/si-main-detail-container" heading="Main-Detail"></si-docs-tab>
</si-docs-component>

## How to enable the UI state storage

The storing of UI State is disabled by default.
It requires two steps to enable it for a specific component.

1. Include `provideSiUiService` in your app configuration / `AppModule` to enable it in general:

    ```ts
    import { ApplicationConfig } from '@angular/core';
    import { provideSiUiState } from '@siemens/element-ng/common';
    
    const config: ApplicationConfig = {
      providers: [
        provideSiUiState()
      ]
    }
    ```

2. Set the `stateId` on supported components like the

   ```html
   <si-navigation-vertical stateId="navVertical" />
   ```

With those two changes, the expand/collapse state will now be saved.

## Using a custom storage

If enabled, the UI state is stored by default in the `localstorage`.
Applications can override this by implementing a custom store:

```ts
import { UIStateStorage } from '@siemens/element-ng/common';

@Injectable()
class MyUIStateStorage implements UIStateStorage {
  save(stateId: string, data: string): void | Promise<void> {
    // Save the for the provided stateId. Override any existing data for that ID.
    // Handle errors here. Otherwise the will just be retrhown.
  }

  load(stateId: string): string | undefined | null | Promise<string | undefined | null> {
    // Load the data by stateId. Return undefined or null if nothing was stored previously. 
    // Handle errors here. Otherwise the will just be retrhown.
  }
}
```

The custom storage needs to be configured on initialization of the `SiUIState`:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideSiUiState } from '@siemens/element-ng/common';
    
const config: ApplicationConfig = { 
  providers: [
    provideSiUiState({
      store: MyUIStateStorage
    })
  ]
}
```

<si-docs-type name="provideSiUiStateService"></si-docs-api>

<si-docs-types></si-docs-types>
