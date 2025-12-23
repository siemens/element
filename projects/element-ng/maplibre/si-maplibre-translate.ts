/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { injectSiTranslateService } from '@siemens/element-translate-ng/translate';

export const defaultLocale = {
  'AttributionControl.ToggleAttribution': 'Toggle attribution',
  'AttributionControl.MapFeedback': 'Map feedback',
  'FullscreenControl.Enter': 'Enter fullscreen',
  'FullscreenControl.Exit': 'Exit fullscreen',
  'GeolocateControl.FindMyLocation': 'Find my location',
  'GeolocateControl.LocationNotAvailable': 'Location not available',
  'LogoControl.Title': 'MapLibre logo',
  'Map.Title': 'Map',
  'Marker.Title': 'Map marker',
  'NavigationControl.ResetBearing': 'Reset bearing to north',
  'NavigationControl.ZoomIn': 'Zoom in',
  'NavigationControl.ZoomOut': 'Zoom out',
  'Popup.Close': 'Close popup',
  'ScaleControl.Feet': 'ft',
  'ScaleControl.Meters': 'm',
  'ScaleControl.Kilometers': 'km',
  'ScaleControl.Miles': 'mi',
  'ScaleControl.NauticalMiles': 'nm',
  'GlobeControl.Enable': 'Enable globe',
  'GlobeControl.Disable': 'Disable globe',
  'TerrainControl.Enable': 'Enable terrain',
  'TerrainControl.Disable': 'Disable terrain',
  'CooperativeGesturesHandler.WindowsHelpText': 'Use Ctrl + scroll to zoom the map',
  'CooperativeGesturesHandler.MacHelpText': 'Use ⌘ + scroll to zoom the map',
  'CooperativeGesturesHandler.MobileHelpText': 'Use two fingers to move the map'
};

export const observeTranslations = (): Signal<Record<string, string>> => {
  const translateService = injectSiTranslateService();
  return toSignal(translateService.translateAsync(Object.keys(defaultLocale)), {
    initialValue: defaultLocale
  });
};
