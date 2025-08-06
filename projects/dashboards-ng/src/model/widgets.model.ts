/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { EventEmitter, InputSignal, OutputEmitterRef, TemplateRef } from '@angular/core';
import { AccentLineType, MenuItem as MenuItemLegacy } from '@spike-rabbit/element-ng/common';
import { ContentActionBarMainItem, ViewType } from '@spike-rabbit/element-ng/content-action-bar';
import { MenuItem } from '@spike-rabbit/element-ng/menu';
import { Subject } from 'rxjs';

/**
 * Widgets describe the entries within the widget catalog and holds all
 * default configuration and factory functionality to instantiate a widget
 * instance, represented as {@link WidgetConfig} objects.
 */
export interface Widget {
  /** A unique id of the widget. */
  id: string;
  /** An optional version string. */
  version?: string;
  /** The name of the widget that is presented in the widget catalog. */
  name: string;
  /** An optional description that is visible in the widget catalog. */
  description?: string;
  /** A CSS icon class that specifies the widget icon, displayed in the catalog. */
  iconClass?: string;
  /** The factory to instantiate a widget instance component that is added to the dashboard. */
  componentFactory: WidgetComponentFactory;
  /** Optional default values that can be set to widget instances. */
  defaults?: Pick<
    WidgetConfig,
    | 'width'
    | 'height'
    | 'minWidth'
    | 'minHeight'
    | 'heading'
    | 'expandable'
    | 'immutable'
    | 'image'
    | 'accentLine'
  >;
  /** Optional default payload object that is copied into every widget instance {@link WidgetConfig}. */
  payload?: any;
}

/** Factory type that is either a {@link WidgetComponentTypeFactory}, {@link FederatedModule} or {@link WebComponent}. */
export type WidgetComponentFactory = WidgetComponentTypeFactory | FederatedModule | WebComponent;

type CommonFactoryFields = {
  componentName: string;
  editorComponentName?: string;
  /**
   * CSS class that is added to the modal dialog when component editor dialog is shown.
   * Provides the option to change the size if the dialog.
   */
  editorModalClass?: string;
};

export type WidgetComponentTypeFactory = CommonFactoryFields & {
  factoryType?: 'default';
  moduleName: string;
  moduleLoader: (name: string) => Promise<any>;
  [index: string]: any;
};

export type FederatedModule = CommonFactoryFields &
  LoadRemoteModuleOptions & {
    factoryType: 'module-federation';
    [index: string]: any;
  };

export type WebComponent = CommonFactoryFields & {
  factoryType: 'web-component';
  url: string;
  [index: string]: any;
};

/**
 * ObjectFit configuration options for a widget image.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit}
 */
export type ObjectFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

/**
 * Image is used to configure an image to be displayed on a widget instance.
 */
export interface WidgetImage {
  /**
   * The image URL (See [<img>](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#src)).
   */
  src: string;
  /**
   * The HTMLImageElement property [alt](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/alt#usage_notes)
   * provides fallback (alternate) text to display when the image specified by the <img> element is not loaded.
   */
  alt: string;
  /**
   * Defines if an image is placed on top or start (left) of the card.
   */
  dir?: 'horizontal' | 'vertical';
  /**
   * Sets the image [object-fit](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit) CSS property.
   */
  objectFit?: ObjectFit;
  /**
   * Sets the image [object-position](https://developer.mozilla.org/en-US/docs/Web/CSS/object-position) CSS property.
   */
  objectPosition?: string;
}

/**
 * A {@link WidgetConfig} holds the configuration of a widget instance component that is visible on a dashboard.
 * It can be persisted and used to restore a dashboards state.
 */
export interface WidgetConfig {
  /** A unique id of a widget instance */
  id: string;
  /**
   * The id of the widget descriptor that was used to instantiate
   * the `WidgetConfig` and the widget instance component.
   */
  widgetId: string;
  /**
   * Optionally, the version widget description that was used to create the widget config.
   */
  version?: string;
  /**
   * Width of the grid item, where number represents how many columns it spans (default?: 1)
   */
  width?: number;
  /**
   * Height of the grid item, where number represents how many rows it takes. (default?: 1)
   */
  height?: number;
  /**
   * Grid item position on x axis of the grid (default?: 0)
   */
  x?: number;
  /**
   * Grid item position on y axis of the grid (default?: 0)
   */
  y?: number;
  /**
   * minimum width allowed during resize/creation (default?: undefined = un-constrained)
   */
  minWidth?: number;
  /**
   * maximum height allowed during resize/creation (default?: undefined = un-constrained)
   */
  minHeight?: number;
  /**
   * grid item header text.
   */
  heading?: string;
  /** Defines whether the widget instance component can be expanded and enlarged over the dashboard. */
  expandable?: boolean;
  /** A widget specific payload object. Placeholder to pass in additional configuration. */
  payload?: any;
  actionBarViewType?: ViewType;
  isNotRemovable?: boolean;
  immutable?: boolean;
  /**
   * Widget instance editor components can use this property to indicate an invalid configuration.
   * True if the config is invalid. False, undefined or null indicate a valid configuration.
   *
   * @deprecated Use the statusChanges emitter to notify about configuration status changes.
   */
  invalid?: boolean;
  /**
   * Optional configuration for an image to be displayed on the widget instance.
   */
  image?: WidgetImage;
  /**
   * Optional type of the accent line.
   */
  accentLine?: AccentLineType;
}

/**
 * Object is used to inform the editor hosting component about configuration
 * changes to configure (e.g. enable/disable) the control buttons accordingly.
 */
export interface WidgetConfigStatus {
  /**
   * Indicates that the configuration was changed. If true, canceling
   * the editor will first show a dialog to confirm the discard.
   */
  modified: boolean;

  /**
   * If true, save or add button will be disabled.
   */
  invalid: boolean;
}

/**
 * An editor component for a widget instance need to implement this interface.
 * After initializing the instance editor component, with widget configuration
 * is set. Optionally, the component can emit changes during editing to control
 * e.g. the dialog behavior like disabling the save button.
 */
export interface WidgetInstanceEditor {
  /**
   * The hosting component of the widget instance editor sets the configuration
   * after initialization. The editor component should use the configuration as
   * input and persist all relevant changes within the config. The hosting component
   * takes the config after adding of saving the widget instance and updates the
   * dashboard.
   */
  config:
    | WidgetConfig
    | Omit<WidgetConfig, 'id'>
    | InputSignal<WidgetConfig | Omit<WidgetConfig, 'id'>>;
  /**
   * Optionally, emit updated widget configuration using an event emitter.
   */
  configChange?:
    | Subject<WidgetConfig | Omit<WidgetConfig, 'id'>>
    | OutputEmitterRef<WidgetConfig | Omit<WidgetConfig, 'id'>>;

  /**
   * Optionally, inform the hosting component about widget configuration status changes.
   */
  statusChanges?:
    | Subject<Partial<WidgetConfigStatus>>
    | OutputEmitterRef<Partial<WidgetConfigStatus>>;
}

/**
 * State to control the behavior of a widget instance editor wizard.
 * The wizard state is used to control the behavior of the dialog buttons
 * provided by the catalog and editor components.
 */
export interface WidgetInstanceEditorWizardState {
  hasNext: boolean;
  hasPrevious: boolean;
  disableNext?: boolean;
}

/**
 * A widget instance editor component that shall support a multi-page
 * widget configuration can implement this interface. The wizard-like
 * page state {@link WidgetInstanceEditorWizardState} needs to be managed
 * by the editor itself and is used to control wizard dialog buttons
 * that are provided by the catalog and editor component.
 */
export interface WidgetInstanceEditorWizard extends WidgetInstanceEditor {
  /**
   * The current state of the multi-page widget instance editor. The state
   * is access after `#next()` or `#previous()` is invoked.
   */
  state: WidgetInstanceEditorWizardState;
  /**
   *  Emit changes as needed during the user interaction with the editor.
   */
  stateChange?:
    | Subject<WidgetInstanceEditorWizardState>
    | OutputEmitterRef<WidgetInstanceEditorWizardState>;
  /**
   *  Is invoked from the next button. Display next page as consequence.
   *  For web components, implementing `next()` requires adding an event listener
   *  for the `next` event on the element.
   */
  next(): void;
  /**
   * Is invoked from the previous button. Display previous page as consequence.
   * For web components, implementing `previous()` requires adding an event listener
   * for the `previous` event on the element.
   */
  previous(): void;
}

/**
 * Event type used when a widget config is changed from within
 * a widget instance. For example, a widget instance component
 * may assign and change the primary actions. It needs to publish the
 * change so that the UI in the hosting dashboard card can be updated.
 */
export type WidgetConfigEvent = {
  /** Primary actions that are visible in normal view mode. */
  primaryActions?: (MenuItemLegacy | ContentActionBarMainItem)[];
  /** Secondary (collapsed) actions that are visible in normal view mode. */
  secondaryActions?: (MenuItemLegacy | MenuItem)[];
  /** Primary actions that are visible in editable dashboard mode. */
  primaryEditActions?: (MenuItemLegacy | ContentActionBarMainItem)[];
  /** Secondary (collapsed) actions that are visible in editable dashboard mode. */
  secondaryEditActions?: (MenuItemLegacy | MenuItem)[];
};

/**
 * Every widget component implementation needs to implement the {@link WidgetInstance}
 * interface. It provides the interface between the component implementation and the
 * dashboard.
 */
export interface WidgetInstance {
  /** The WidgetConfig is set after instantiating the widget component. */
  config: WidgetConfig | InputSignal<WidgetConfig>;

  /**
   * The dashboard will set the editable property to `true`, if the dashboard
   * enters the editable mode. The attribute is used to inform every
   * widget instance.
   */
  editable?: boolean;

  /** Primary actions that are visible in normal view mode. */
  primaryActions?: (MenuItemLegacy | ContentActionBarMainItem)[];
  /** Secondary (collapsed) actions that are visible in normal view mode. */
  secondaryActions?: (MenuItemLegacy | MenuItem)[];
  /** Primary actions that are visible in editable dashboard mode. */
  primaryEditActions?: (MenuItemLegacy | ContentActionBarMainItem)[];
  /** Secondary (collapsed) actions that are visible in editable dashboard mode. */
  secondaryEditActions?: (MenuItemLegacy | MenuItem)[];

  /** {@link WidgetInstance} component implementations should emit change
   * events after changing the instance configuration like the actions.
   */
  configChange?: EventEmitter<WidgetConfigEvent>;
  /**
   * An optional footer template that is added into the dashboard card's footer.
   */
  footer?: TemplateRef<unknown>;
}

/**
 * Type to define the position of a widget instance, consisting of
 * the instance id and x, y, width and height.
 */
export type WidgetPositionConfig = Pick<WidgetConfig, 'id' | 'x' | 'y' | 'width' | 'height'>;

/**
 * Function creates a new {@link WidgetConfig} without id from a {@link Widget} and
 * copies all default values into the {@link WidgetConfig}.
 * @param widget - The source to create the new {@link WidgetConfig} from.
 * @returns The created {@link WidgetConfig} without id.
 */
export const createWidgetConfig = (widget: Widget): Omit<WidgetConfig, 'id'> => {
  const widgetConfig: Omit<WidgetConfig, 'id'> = {
    heading: widget.name,
    widgetId: widget.id,
    version: widget.version,
    minWidth: 3,
    ...widget.defaults,
    payload: { ...widget.payload }
  };
  return widgetConfig;
};

/**
 * The Remote Module definition is based on `@angular-architects`.
 * We take it over into this file to prevent adding a hard dependency.
 */
export type LoadRemoteModuleOptions =
  | LoadRemoteModuleScriptOptions
  | LoadRemoteModuleEsmOptions
  | LoadRemoteModuleManifestOptions;

export type LoadRemoteModuleScriptOptions = {
  type?: 'script';
  remoteEntry?: string;
  remoteName: string;
  exposedModule: string;
};

export type LoadRemoteModuleEsmOptions = {
  type: 'module';
  remoteEntry: string;
  exposedModule: string;
};

export type LoadRemoteModuleManifestOptions = {
  type: 'manifest';
  remoteName: string;
  exposedModule: string;
};
