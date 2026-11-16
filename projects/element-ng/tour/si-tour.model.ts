/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { TranslatableString } from '@siemens/element-translate-ng/translate';

/** Common options for tour step and as default for tour step */
export interface TourStepCommonOptions {
  /** Whether Scroll the element into view. */
  scrollTo?: boolean | ScrollIntoViewOptions;
  /** Custom handler to perform scrolling. */
  scrollToHandler?: (element: HTMLElement) => void;
  /**
   * A function that returns a promise.
   * When the promise resolves, the step will be shown. E.g. use this to open
   * dialogs, etc.
   */
  beforeShowPromise?: () => Promise<any>;
  /**
   * A function that returns a promise.
   * When the promise resolves, the next step will be shown. This can be used
   * to 'clean up' action from `beforeShowPromise`.
   */
  beforeNextPromise?: () => Promise<any>;
}

/** Options for each tour step. */
export interface TourStep extends TourStepCommonOptions {
  /** Unique id for the step. Exposed in DOM as `data-step-id` */
  id?: string;
  /** Title to be displayed on the modal. */
  title: TranslatableString;
  /** Body text of the modal. */
  text?: TranslatableString;
  /** Optional image source to display. */
  imgSrc?: string;
  /** Alt text for a provided image. */
  imgAlt?: TranslatableString;
  /** CSS class applied to the image. */
  imgClass?: string;
  /**
   * Sets the image [object-fit](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit) CSS property.
   * @defaultValue 'scale-down'
   */
  imgObjectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  /** The element, the step should be attached to on the page. */
  attachTo?: {
    element: string | HTMLElement | (() => string | HTMLElement);
  };
}

/** Options for tour */
export interface TourOptions {
  /** Default options applied to all tour steps. */
  defaultStepOptions?: TourStepCommonOptions;
}
