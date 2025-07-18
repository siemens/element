# Frequent app functions

## Common actions

Many applications share common actions and associated icons. For example for actions triggered by buttons, action links or menu entries.

<!-- markdownlint-disable MD013 MD033 -->
| Action    | Icon                                          | Description             |
| ----------|-----------------------------------------------|-------------------------|
| Create    | <i class="icon-large element-plus"></i>       | Creates a new object or entity, which gets persisted on completion. For example, create a new user account. Use `Duplicate` when a user wants to start using an existing similar object. |
| Add       | <i class="icon-large element-plus"></i>       | Adds or assigns an existing object to a group or selection. For example, adding a user to a group. |
| Delete    | <i class="icon-large element-delete"></i>     | Deletes an object permanently. If needed, warn users before deletion. For example, remove a user from a group. |
| Remove    | <i class="icon-large element-delete"></i>     | Removes or un-assigns an object from a group or a selection. |
| Edit      | <i class="icon-large element-edit"></i>       | Opens an object's edit mode, enabling changes to be made. This triggers a state change in the current context or directs the user to a different screen or modal to change data or values. Edit mode can be exited using `Save` or `Cancel`. |
| Save      | <i class="icon-large element-save"></i>       | Persists changed data permanently. Mainly used for application entities like saving the user name change. Use `Apply` to confirm a view or filter change. |
| Apply     | <i class="icon-large element-state-tick"></i> | Applies changes or changed setting temporary. |
| Cancel    | <i class="icon-large element-cancel"></i>     | Stops current action and returns to previous context. Warn users about potential data loss if significant unsaved changes exist. Use a [Secondary or Tertiary button](../../components/buttons-menus/buttons.md) to cancel actions. |
| Copy      | <i class="icon-large element-copy"></i>       | Copies the selected objects to a temporary memory, e.g., clipboard. The object can be be `pasted` later. |
| Paste     | <i class="icon-large element-paste"></i>      | Inserts the data from the temporary memory (e.g., clipboard) to a form or other component. |
| Duplicate | <i class="icon-large element-copy"></i>       | Creates new identical instances. The duplicate must have a different name. Use the following naming conventions: `Copy of {{originalName}}` as the default name and `Copy {{count}} of {{originalName}}` for any existing default name. |
| Clear     | <i class="icon-large element-cancel"></i>     | Removes data from fields, deselects options or resets controls. E.g. [see Search Bar](../../components/sorting-filtering/search-bar.md). |
| Reset     | <i class="icon-large element-undo"></i>       | Reverts values back to default or previous state. |
| Refresh   | <i class="icon-large element-refresh"></i>    | Reloads a view of an object, list, or data set. |
| Close     | <i class="icon-large element-cancel"></i>     | Exits the current context (without saving) ([see Modals](../../components/layout-navigation/modals.md)). |
<!-- markdownlint-enable MD013 MD033 -->

### Best practices for actions

- Assign the most important or likely action to the [primary button](../../components/buttons-menus/buttons.md), but use only one per screen
- Use secondary or tertiary buttons for other actions based on their significance
- Define the representation or hide the action, if the user does not have the required permissions (e.g. disable button)
- Inform user about financial or legal restrictions and implications (e.g. binding offers, fees, …)
- Show a [Progress Indication](../../components/progress-indication/progress-bar.md) matching to the use case and expected duration
- Provide bulk actions if many objects are possible in a specific context

### Restoring behavior of items

- Be clear on deleting, removing, creating and adding
- Create goes hand in hand with Delete, it usually means it cannot be restored
- Add goes hand in hand with Remove, it usually means it can be restored
- Do not use Delete and Remove as synonym

| Dos                                                    | Don'ts                             |
|--------------------------------------------------------|------------------------------------|
| Create a chart and delete a chart                      | Create a chart and remove it       |
| Add a sensor to a chart and remove a sensor from chart | Add a sensor and delete the sensor |

## Overview

| Dos       |
|-----------|
| Dashboard |
| Overview  |
| Cockpit   |
| Home      |

| Don'ts        |
|---------------|
| Console       |
| Dash          |
| Control panel |

## Analytics

| Dos               |
|-------------------|
| Analysis          |
| Analysis          |
| Anomaly detection |

| Don'ts      |
|-------------|
| Assessment  |
| Examination |

## Detail view

| Dos            | Don'ts    |
|----------------|-----------|
| Details        | Facts     |
| Details        | Specifics |
| Device details |           |

### Device properties

| Dos                |
|--------------------|
| Product name       |
| Tag                |
| Manufacturer       |
| Type               |
| State              |
| Article number     |
| Serial number      |
| Installation date  |
| HW version         |
| FW version         |
| SW version         |

## Upload

| Dos                               | Don'ts                       |
|-----------------------------------|------------------------------|
| Drag a file here or select a file | Drag and drop here or browse |
| Drag files here or select files   |                              |

## Comments

| Dos                        | Don'ts          |
|----------------------------|-----------------|
| Write comment              | Write a comment |
| Write comment and approve  |                 |
| Write comment and reject   |                 |
| Write your comments here   |                 |

## Grid and list actions

| Dos             | Don'ts                     |
|-----------------|----------------------------|
| Group           |                            |
| Sort            |                            |
| Filter          |                            |
| Edit columns    |                            |
| Search by XY    |                            |

## Notifications

| Dos                    | Don'ts             |
|-------------------------|--------------------|
| Events                  | Error              |
| Notifications           | Issue              |
| Anomalies               | Problem            |
| Notify me when X occurs |                    |
