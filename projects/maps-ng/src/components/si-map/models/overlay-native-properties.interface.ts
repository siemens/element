/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import Control from 'ol/control/Control';
import Overlay from 'ol/Overlay';

export interface OverlayNativeProperties {
  /**
   * Layer for popup element, an element to be displayed over the map and attached to a single map location.
   */
  overlay?: Overlay;
  /**
   * List of controls to activate for map, additional controls like full screen, etc. can be added here
   * Defaults are zoom in and out
   */
  controls?: Control[];
}
