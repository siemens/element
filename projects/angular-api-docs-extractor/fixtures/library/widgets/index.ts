import {
  booleanAttribute,
  Component,
  Directive,
  inject,
  Injectable,
  input,
  output,
  Service
} from '@angular/core';

import type { MenuItem } from '../menu';
import type { MenuItem as MenuItemLegacy } from '../public-api';

/** Default text for an untitled widget. */
export const DEFAULT_WIDGET_TITLE: string = 'Untitled';

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface WidgetBrand {}

/** Branded string label used to verify built-in string index signatures are omitted. */
export type WidgetLabel = string & WidgetBrand;

/** Array alias used to verify built-in array index signatures are omitted. */
export type WidgetLabels = WidgetLabel[];

/** Map with an explicitly declared index signature. */
export interface WidgetMap {
  [key: string]: WidgetLabel;
}

/** Interface extending WidgetMap to verify inherited index signatures are omitted. */
export interface ExtendedWidgetMap extends WidgetMap {
  title: WidgetLabel;
}

/** Event data emitted when a widget changes. */
export class WidgetChangeEvent {
  constructor(
    /** Configuration associated with the change. */
    public options: ExtendedWidgetMap
  ) {}
}

/** Intersection alias to verify inherited index signatures from other types are omitted. */
export type WidgetMapAlias = WidgetMap & {
  active: boolean;
};

/** Host directive providing shared widget bindings. */
@Directive({ selector: '[fixtureWidgetHost]' })
export class WidgetHostDirective {
  /**
   * Readonly state from the host directive.
   *
   * @defaultValue false
   */
  readonly readonly = input(false, { transform: booleanAttribute });

  /**
   * Accent color from the host directive.
   *
   * @defaultValue 'neutral'
   */
  readonly color = input('neutral');

  /** Emits when the host directive toggles open state. */
  readonly openChange = output<boolean>();
}

/**
 * Displays a widget with a heading.
 *
 * **Important:** Provide a **short `heading`**.
 *
 * @remarks Use the theme to style the heading:
 *
 * ```scss
 * @use 'widget-theme';
 * .heading {
 *   @include widget-theme.heading;
 * }
 * ```
 *
 * @example
 * ```html
 * <fixture-widget heading="Hello" />
 * ```
 */
@Component({
  selector: 'fixture-widget',
  template: '',
  hostDirectives: [
    {
      directive: WidgetHostDirective,
      inputs: ['readonly', 'color'],
      outputs: ['openChange']
    }
  ]
})
export class WidgetComponent {
  private readonly host = inject(WidgetHostDirective);

  /**
   * Heading displayed above the widget.
   * @see https://example.com/widget#heading
   */
  readonly title = input.required<string>({ alias: 'heading' });

  /**
   * Heading to display when no title is available.
   * @defaultValue DEFAULT_WIDGET_TITLE
   */
  readonly fallbackTitle = input(DEFAULT_WIDGET_TITLE);

  /** Actions accepting both legacy and current menu items. */
  readonly menuItems = input<(MenuItemLegacy | MenuItem)[]>([]);

  /** Emits the event data when the widget changes. */
  readonly changed = output<WidgetChangeEvent>();

  /** Re-exposed readonly property. */
  readonly readonly = this.host.readonly;

  /** Re-exposed openChange property. */
  readonly openChange = this.host.openChange;

  /**
   * Component-specific color input overriding the host directive docs.
   *
   * @defaultValue 'primary'
   */
  readonly color = input('primary');

  /** @internal */
  internalState = false;

  /** Refreshes the widget display. */
  refresh(): void {}

  /** Updates private display state. */
  protected updateDisplay(): void {}
}

/** Supplies the default widget title. */
@Service()
export class WidgetTitleService {}

/** Supplies widget settings when explicitly provided. */
@Service({ autoProvided: false })
export class WidgetSettingsService {}

/** Stores widget state across the application. */
@Injectable({ providedIn: 'root' })
export class WidgetStateService {}
