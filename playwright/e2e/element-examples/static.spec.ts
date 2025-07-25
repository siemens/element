/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */
import { test } from '../../support/test-helpers';

test('badges/badges', ({ si }) => si.static());
test('buttons/buttons', ({ si }) => si.static());
test('buttons/segmented-button', ({ si }) => si.static());
test('colors/color-utils', ({ si }) => si.static());
test('custom-form-elements/checkbox', ({ si }) => si.static());
test('custom-form-elements/radio', ({ si }) => si.static());
test('custom-form-elements/select', ({ si }) => si.static());
test('datatable/bootstrap', ({ si }) => si.static());
test('datatable/datatable-footer', async ({ si }) => {
  test.setTimeout(60000);
  await si.static({ disabledA11yRules: ['scrollable-region-focusable'] });
});
test('elevation/elevation', ({ si }) => si.static());
test('icons/icons', ({ si }) => si.static());
test('input-fields/multi-line', ({ si }) => si.static());
test('input-fields/single-line', ({ si }) => si.static());
test('links/links', ({ si }) => si.static());
test('list-group/list-group', ({ si }) => si.static());
test('shapes/shapes', ({ si }) => si.static());
test('si-about/si-about-api', ({ si }) => si.static());
test('si-about/si-about-text-api', ({ si }) => si.static());
test('si-about/si-about-text', ({ si }) => si.static());
test('si-accordion/si-accordion', ({ si }) => si.static());
test('si-accordion/si-accordion-base-1', ({ si }) => si.static());
test('si-accordion/si-collapsible-panel-icons', ({ si }) => si.static());
test('si-accordion/si-collapsible-panel', ({ si }) => si.static());
test('si-avatar/si-avatar', ({ si }) => si.static());
test('si-circle-status/si-circle-status', ({ si }) => si.static());
test('si-connection-strength/si-connection-strength', ({ si }) => si.static());
test('si-content-action-bar/si-content-action-bar-states', ({ si }) => si.static());
test('si-content-action-bar/si-content-action-bar', ({ si }) => si.static());
test('si-copyright-notice/si-copyright-notice', ({ si }) => si.static());
test('si-card/bootstrap-card-grid', ({ si }) => si.static());
test('si-card/bootstrap-card-group', ({ si }) => si.static());
test('si-card/si-card-multiple', ({ si }) => si.static());
test('si-card/si-card-accent', ({ si }) => si.static());
test('si-card/si-card', ({ si }) => si.static());
test('si-dashboard/si-dashboard-card', ({ si }) => si.static());
test('si-dashboard/si-list-widget-body', ({ si }) => si.static({ delay: 2000 }));
test('si-dashboard/si-list-widget', ({ si }) => si.static({ delay: 2000 }));
test('si-dashboard/si-timeline-widget', ({ si }) => si.static({ delay: 2000 }));
test('si-dashboard/si-timeline-widget-body', ({ si }) => si.static({ delay: 2000 }));
test('si-dashboard/si-timeline-widget-css', ({ si }) => si.static());
test('si-dashboard/si-value-widget', ({ si }) => si.static());
test('si-datepicker/si-timepicker-limits', ({ si }) => si.static());
test('si-datepicker/si-timepicker', ({ si }) => si.static());
test('si-electron-titlebar/si-electron-titlebar', ({ si }) => si.static());
test('si-electron-titlebar/si-fixed-height-layout-side-panel', ({ si }) => si.static());
test('si-empty-state/si-empty-state', ({ si }) => si.static());
test('si-footer/si-footer', ({ si }) => si.static());
test('si-icon/si-icon-composite', ({ si }) => si.static());
test('si-icon/si-icon', ({ si }) => si.static());
test('si-icon/si-icon-next', ({ si }) => si.static({ skipAriaSnapshot: true }));
test('si-icon-status/si-icon-status', ({ si }) => si.static());
test('si-info-page/si-info-page', ({ si }) => si.static());
test('si-info-page/si-info-page-stacked-icon', ({ si }) => si.static());
test('si-info-page/si-info-page-illustration', ({ si }) => si.static());
test('si-inline-notification/si-inline-notification', ({ si }) => si.static());
test('si-landing-page/si-landing-page-custom', ({ si }) => si.static());
test('si-landing-page/si-landing-page', ({ si }) => si.static());
test('si-language-switcher/si-language-switcher', ({ si }) => si.static());
test('si-layouts/content-full-layout-fixed-height', ({ si }) => si.static());
test('si-layouts/content-tile-layout-full-scroll', ({ si }) => si.static());
test('si-loading-spinner/si-loading-spinner', ({ si }) => si.static({ maxDiffPixels: 31 }));
test('si-navbar-vertical/si-navbar-vertical-text', ({ si }) => si.static());
test('si-pagination/si-pagination', ({ si }) => si.static());
test('si-phone-number-input/si-phone-number-input', ({ si }) => si.static());
test('si-progressbar/si-progressbar-dynamic', ({ si }) => si.static());
test('si-result-details-list/si-result-details-list', ({ si }) => si.static({ maxDiffPixels: 30 }));
test('si-search-bar/si-search-bar-value', ({ si }) => si.static());
test('si-search-bar/si-search-bar', ({ si }) => si.static());
test('si-slider/si-slider', ({ si }) => si.static());
test('si-slider/si-slider-icon', ({ si }) => si.static());
test('si-sort-bar/si-sort-bar', ({ si }) => si.static());
test('si-split/si-split-hide-header', ({ si }) => si.static());
test('si-split/si-split-mixed', ({ si }) => si.static());
test('si-summary-chip/si-summary-chip', ({ si }) => si.static());
test('si-summary-widget/si-summary-widget', ({ si }) => si.static());
test('si-status-toggle/si-status-toggle', ({ si }) => si.static());
test('si-switch/si-switch', ({ si }) => si.static());
test('si-tree-view/si-tree-view', ({ si }) => si.static());
test('si-unauthorized-page/si-unauthorized-page-choice', ({ si }) => si.static());
test('si-unauthorized-page/si-unauthorized-page', ({ si }) => si.static());
test('si-wizard/si-wizard-cancel-button', ({ si }) => si.static());
test('si-wizard/si-wizard-dynamical', ({ si }) => si.static());
test('si-wizard/si-wizard', ({ si }) => si.static());
test('si-system-banner/si-system-banner', ({ si }) => si.static());
test('spacing/spacing', ({ si }) => si.static());
test('typography/bootstrap', ({ si }) => si.static());
test('typography/color-variants', ({ si }) => si.static());
test('typography/type-styles', ({ si }) => si.static());
test('typography/display-styles', ({ si }) => si.static());
test('typography/typography', ({ si }) => si.static());
