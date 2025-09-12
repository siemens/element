# Notifications

Notifications inform users about important updates, system events, or required actions.

## Design ---

## Choosing the right format

Selecting the right notification component depends on urgency, persistence, and disruption level.

![Notifications components](images/notification-components.png)

**Transient notifications** disappear automatically and don’t require user action.
Best for quick updates that confirm actions without interruption.

- Use [toast (autoclose)](../components/status-notifications/toast-notification.md)
  for brief, low-priority updates that confirm an action or system event (e.g., “Email sent”).

**Persistent notifications** remain visible until the user acknowledges or resolves them.
Used for ongoing awareness or required action.

- Use notification icon in the [application header](../components/layout-navigation/application-header.md)
  to provide access to a notification panel or popover where users can view and manage updates.

- Use [toast (manual close)](../components/status-notifications/toast-notification.md) when an update needs attention but isn’t urgent,
  such as "Limited connectivity" or "Scheduled maintenance in 30 minutes"

- Use [inline notifications](../components/status-notifications/inline-notification.md)
  for messages tied to a specific location or system state, such as "Energy consumption exceeds expected levels"

- Use the [status bar](../components/status-notifications/status-bar.md) for constant visibility without disrupting the workflow.

- Use [modals](../components/layout-navigation/modals.md)
  for urgent decisions that require immediate attention and block further interaction.

### Handling multiple notifications

To prevent overwhelming users, limit the number of visible notifications. Consider:

- Set a maximum number of displayed notifications. Collapse older ones into a summary when exceeded.
- Use a summary message (e.g., “3 new notifications”) to redirect users to a notification management view.
- Determine the summary status based on severity, this could be the most recent or the highest-priority notification.

![Notifications overflow](images/notifications-overflow.png)

## Notification management

Toasts, inline messages, and other notifications can appear throughout the interface,
so a centralized view helps users review and manage them as needed.

The following examples show how to structure notifications, adapt based on the use case.

![Notifications management basic patterns](images/notification-management.png)

### Notification popover

The popover is accessed through the application header, providing quick,
non-intrusive access to recent notifications without disrupting the workflow.
Users can select a notification to be redirected to the relevant page, task, or item.

![Notifications popopver](images/notifications-popover.png)

> 1. Global actions (optional), 2. Search (optional), 3. Notification, 4. Footer (optional)

The popover supports various actions. The footer and header are reserved for global actions.
Additionally, it can include a search function for quick filtering.

![Notifications popopver variants](images/notifications-popover-variants.png)

- Allow users to manage notification preferences through a settings link.
- If applicable, include a “Show all” option to access a full-page view for older notifications.

### Notification panel

Uses the [side panel](../components/layout-navigation/side-panel.md) for managing or browsing a larger number of notifications while maintaining the current workflow.
It provides more space for detailed notifications and supports additional functionality, such as filtering, grouping, and actions on individual notifications.
Just like in the popover, users can select a notification to be redirected to the relevant page, task, or item.

- If a side panel is already open, the notifications panel will replace it to ensure only one panel is active at a time.
- The panel should remain open when navigating between pages, allowing users to keep track of their notifications without interruption.

![Notifications in side panel](images/notifications-side-panel.png)

> 1. Global actions (optional), 2. Search (optional), 3. Notification

#### Action placement

- If there is only one action, place it on the same row as the text.
- If there are multiple actions, place them below the text.
- If there are +3 actions or actions that cannot be represented with a meaningful icon, group them in a menu.

Use icon-only actions for universally recognized meanings (e.g., trash for delete). If an icon isn't self-explanatory, display its label
at least once to help users learn their meaning. If an action cannot be effectively represented with an icon, use text-based buttons.

![Notifications management basic patterns](images/notifications-side-panel-actions.png)

#### Groups

Notifications can be grouped by relevance, time, or any category to improve clarity:

- Use [tabs](../components/layout-navigation/tabs.md) for broad, mutually exclusive categories, helping users focus on one at a time.
- Use [accordions](../components/layout-navigation/accordion.md) for nested grouping within a category, allowing users to scan multiple groups without switching contexts.
- Use summary chips to provide a quick, at-a-glance overview of grouped notifications (e.g., "3 unread").

![Notifications management basic patterns](images/notifications-side-panel-groups.png)

If combining methods, consider use tabs for main categories, accordions for nested groups, and summary chips for quick overviews.
If many categories are available, consider using filter methods.

### Notification center

A notification center is a dedicated full-page view where users can review, filter, and manage all past and current notifications in one place.
It can work independently or alongside other notification patterns, such as popovers and side panels.

![Notifications center](images/notifications-notification-center.png)

## Code ---

### Examples

#### Notification Popover

<si-docs-component example="si-notification-item/si-notification-item-popover"></si-docs-component>

#### Notification Panel

<si-docs-component example="si-notification-item/si-notification-item-side-panel" height="500"></si-docs-component>

<si-docs-types></si-docs-types>
