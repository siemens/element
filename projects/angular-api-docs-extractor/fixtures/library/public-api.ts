/** Configuration for a widget. */
export interface WidgetOptions {
  /** Whether to show the widget. */
  visible: boolean;
}

/** Legacy action shown in a widget menu. */
export interface MenuItem {
  /** Text displayed for the action. */
  label: string;

  /** Optional callback or named action. */
  action?: ((param: string) => void | undefined) | string;
}
