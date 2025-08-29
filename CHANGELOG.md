# [48.0.0](https://github.com/siemens/element/compare/v47.8.0...v48.0.0) (2025-08-26)


### Features

* **angular:** update to Angular 20 ([cf9d3d5](https://github.com/siemens/element/commit/cf9d3d548f5cab5b05bfb1597ca50e1e6f702a89))
* **card:** add support for sub-heading to cards ([183dcab](https://github.com/siemens/element/commit/183dcab9e03aebdcb32a39d9fd2511445b26794d))
* **charts/gauge:** support custom value formatter ([5ea6af2](https://github.com/siemens/element/commit/5ea6af26c09fdb0753c2dfb39e134414d78362bd))
* **copyright-notice:** use the company-name provided by the theme ([fe2fe9f](https://github.com/siemens/element/commit/fe2fe9f0bcf8bb460e9c926c779078999ded48f6))
* **dashboard-toolbar:** add title attribute to edit button ([14afc3c](https://github.com/siemens/element/commit/14afc3cecd758a1ce186f342ccac18920592b982))
* **element-theme:** update to new version of siemens brand package ([59d92a1](https://github.com/siemens/element/commit/59d92a16a7965c4767053fa68ccc1abd9e0e97f1))
* **element-translation-ng:** add `t`-function to locally override $localize ([b2916f4](https://github.com/siemens/element/commit/b2916f4e214fbd7a67c6e2d41e13ba8fc0f2bf86)), closes [#436](https://github.com/siemens/element/issues/436)
* **filtered-search:** align with theme updates ([72f2227](https://github.com/siemens/element/commit/72f22278bdb96a07b36adff7874bf224357c1c97))
* **form:** drop form-item legacy mode ([5d83257](https://github.com/siemens/element/commit/5d83257ac919dc8d62b85e3acd2f0a98c158f3b7))
* **form:** allow overriding of errormessage IDs on custom form controls ([3afbc5a](https://github.com/siemens/element/commit/3afbc5aa27a303b6d37628ff12d2a4488451a69c))
* **form:** support context help button in form-items ([6bd0863](https://github.com/siemens/element/commit/6bd0863a1628018db0a3858b6c3ca74ecf7e69c8)), closes [#511](https://github.com/siemens/element/issues/511)
* **form:** improve visual appearance of long and multiline checkbox and radio labels ([32a18ce](https://github.com/siemens/element/commit/32a18ce9204e16de60736166711b674cbed59fb0))
* **header-dropdown:** remove automatic filled icon when the dropdown is open ([d259942](https://github.com/siemens/element/commit/d25994213e295dbe56c160e82f294e753f5319ef))
* **help-button:** introduce a help button component ([29ff865](https://github.com/siemens/element/commit/29ff865d3a00fac34f27d786e3e897874f4bb4a0))
* **icon:** replace current `si-icon` with `si-icon-next` ([cb06a07](https://github.com/siemens/element/commit/cb06a0793c256cb56c4b945059778e6890792db5))
* **landing-page:** add landing page feature components ([26e0066](https://github.com/siemens/element/commit/26e0066c7ad85def573244434d37a9cf2b1a882d))
* **launchpad:** support `routerLink` for launchpad apps ([bf78c1f](https://github.com/siemens/element/commit/bf78c1f0d444a7bbd7da7e60526f4c8208087703))
* **list-details:** support usage with the Angular router ([4731e77](https://github.com/siemens/element/commit/4731e7717c748eeced6691b886c7ee7acf192eba))
* **maps-ng:** open source maps-ng ([0d70b10](https://github.com/siemens/element/commit/0d70b108cf32167c37d56152c9c81a2e5e512a50))
* **micro-charts:** add micro bar chart ([89e779f](https://github.com/siemens/element/commit/89e779f7603289e465b60f7dbcb22f530e58beb7))
* **micro-charts:** add micro donut chart ([5e29b58](https://github.com/siemens/element/commit/5e29b5867e3a63ea0aa9cb50f04dbc41bb48555d))
* **micro-charts:** add micro line chart ([e7c8429](https://github.com/siemens/element/commit/e7c84298eac5e59a3f73887899e9dbfe630703ce))
* **micro-charts:** add micro progress chart ([e9333dc](https://github.com/siemens/element/commit/e9333dc3107df200ba18422d565b914f5eea3aad))
* **popover:** replace current `siPopover` with `siPopoverNext` ([b96e46f](https://github.com/siemens/element/commit/b96e46fb477f8c054c3ede2b68449c2f30bb4234))
* **search-bar:** align with theme updates ([709aa53](https://github.com/siemens/element/commit/709aa5353e04c895759ba7d4e3e1fef68ac9484c))
* **switch:** align switch label padding with checkboxes ([13cf2f4](https://github.com/siemens/element/commit/13cf2f48e179e90e42336c3dae9ea43bbb1b1c94))
* **tabs:** align with UX specs ([e3280c6](https://github.com/siemens/element/commit/e3280c65807c207a055ce4887d1c817e78f646ca))
* **tabs:** replace current `si-tabs` with `si-tabs-next` ([6fbba15](https://github.com/siemens/element/commit/6fbba150230164cfbd7634d1ac154f98f099fa48))
* **theme:** update critical status colors to use data-orchid palette ([f5e2b3b](https://github.com/siemens/element/commit/f5e2b3b9d496a08d2ed45c11dfece99f8d35fcd7))
* **toast-notification:** support pausing of toast-notification ([eac9bc3](https://github.com/siemens/element/commit/eac9bc3e5b89ddef6f79302a634f1b99e5e87dc4))
* **tooltip:** support template context with tooltip template ([6bfc714](https://github.com/siemens/element/commit/6bfc71415aca6eba7e30184774f0fa00da51a00d))
* **tree-view:** remove `SiTreeViewComponent.disableFilledIcons` input ([97b5aef](https://github.com/siemens/element/commit/97b5aef9f68c4ade7e84a6e046587137eaabbc5b))
* **typography:** update typography definitions to latest Figma ones ([779058e](https://github.com/siemens/element/commit/779058ee3fa5bb69c5db0b581f73a28a716e0833))
* **wizard:** switch to footer navigation as default ([2f07b9c](https://github.com/siemens/element/commit/2f07b9cf534103f59e8a0bff8f37852297772199))


### Bug Fixes

* **accordion:** don't switch to cursor pointer in case of disabled panel ([bebdc16](https://github.com/siemens/element/commit/bebdc164f5bddb4409164e4ac795dd1ec16b01e2))
* **badge:** align default text with design specs ([d96cf0b](https://github.com/siemens/element/commit/d96cf0be24bfd4bd6d713bcc2137b7dadd059175)), closes [#425](https://github.com/siemens/element/issues/425)
* **charts:** title and legend overlap on theme change ([5daabb5](https://github.com/siemens/element/commit/5daabb51460413deb852687710286404f23c645c))
* **circle-status:** correct spacing in aria label generation ([ac59ea3](https://github.com/siemens/element/commit/ac59ea309362906f446ce92b92044cd60ac1d139))
* **datatable:** keep focused row in view when using keyboard ([e0f3af7](https://github.com/siemens/element/commit/e0f3af765c311f2a36512c8cc729decb013524e8))
* **datatable:** prevent overlapping last row on footer ([9a0a9e8](https://github.com/siemens/element/commit/9a0a9e8490b8a21c6fd68bb2b34ababc938bce7c))
* **date-range-filter:** allow empty reference point ([2f7748e](https://github.com/siemens/element/commit/2f7748e4d21aa5e08a79c66fd9e9579e843d0dcc))
* **date-range-filter:** stop automatic advanced mode toggle in input mode ([6337d0a](https://github.com/siemens/element/commit/6337d0a8418cd2c23acf07722321003f60bea86d))
* **form:** ensure default width of si-form-fieldset labels is 16% in horizontal layout ([0f16342](https://github.com/siemens/element/commit/0f16342cf7acdc0d8f1a39217924afb584e54682))
* **formly:** link error messages to custom controls ([1dfb9ee](https://github.com/siemens/element/commit/1dfb9eed4737631388cc1e83e94312f1fa56f71a))
* **formly:** link error messages to input ([11c1b61](https://github.com/siemens/element/commit/11c1b6172e792a474f85738066ee29a58930c9ca))
* **help-button:** don't change color on hover when disabled ([5df4d9f](https://github.com/siemens/element/commit/5df4d9f2ce3261a20ef413db8123a628b88346c1))
* **live-preview:** change initialization order to fix locale change loop ([acf2190](https://github.com/siemens/element/commit/acf21904d3aa16b18097a98aad6948cfb1b8ea52)), closes [#451](https://github.com/siemens/element/issues/451)
* **maps:** use new fonts, fallback to sans-serif ([6b17274](https://github.com/siemens/element/commit/6b17274b980b049c923bb0a2c5b7d917c6045986))
* **navbar-vertical:** support flexible drop down positioning ([24acde0](https://github.com/siemens/element/commit/24acde01a21ac53ba29fbc49b1e48567b6f505b7))
* **search-bar:** do not emit `searchChange` during initialisation ([e2be687](https://github.com/siemens/element/commit/e2be687430c94cf03def060721782c21e775b3bc))
* **select:** announce readonly flag in screen-reader ([ed049b1](https://github.com/siemens/element/commit/ed049b1e519f847b42bb281b91aaa95d4bfd9f3d))
* **status-toggle:** use correct cursor for disabled state ([6cde8c0](https://github.com/siemens/element/commit/6cde8c0ee0886bb1f22df38bd63ccf3da30bb39a))
* **tabs-next:** ensure that the active tab is focussed by default ([2b787fb](https://github.com/siemens/element/commit/2b787fb173e617479c008b856ace989b1676ef14))
* **threshold:** input is not focused after adding step ([6cc6765](https://github.com/siemens/element/commit/6cc6765a99e46c63db13b13b70d6223d67aead00))
* **utilities:** apply correct style for `rounded-end` utility ([295fc49](https://github.com/siemens/element/commit/295fc49568c98092a13ae10e715dded0b0c16860))


### NOTES

* **header-dropdown:** The `si-header-dropdown-item` no longer shows a filled icon when the dropdown is open.
* **theme:** The colors for the "critical" status have changed. If this
  change is not desired, the old colors can be restored using this snippet in the
  application's main `styles.scss`:
  
  ```scss
  @use '@siemens/element-theme/src/theme/base-colors';
  
  // load theme here as usual
  @use '@siemens/element-theme/src/theme';
  @use '@siemens/element-ng/element-ng';
  
  // add overrides
  :root {
    --element-base-critical: #{base-colors.$color-red-100};
    --element-status-critical: #{base-colors.$color-red-900};
    --element-text-critical: #{base-colors.$color-red-700};
  }
  
  :root.app--dark {
    --element-base-critical: #{base-colors.$color-red-900};
    --element-status-critical: #{base-colors.$color-red-700};
    --element-text-critical: #{base-colors.$color-red-100};
  }
  ```


### BREAKING CHANGES

* **accordion:** Removed `SiAccordionComponent.colorVariant` input without any replacement.
* **action-modal:** Removed `AlertDialogResult`, `EditDiscardDialogResult`, `ConfirmationDialogResult` and `DeleteConfirmationDialogResult` as const objects. Use them only as type.
* **angular:** Angular 20+ is required.
  Follow the Angular update guide to update your app: <https://angular.dev/update-guide?v=19.0-20.0>
* **charts-ng:** The `@siemens/charts-ng` package now requires ECharts version 6.0.0 or higher. Please update your dependencies accordingly. For details on ECharts 6, see: https://github.com/apache/echarts/releases/tag/6.0.0
* **collapsible-panel:** Removed `SiCollapsiblePanelComponent.toggle` output use `SiCollapsiblePanelComponent.panelToggle` instead.
* **dashboards-ng:** gridstack.js v12 is required. To migrate to v12,
  update the package and drop the inclusion of `gridstack-extra.css`
  in `angular.json`
* **datepicker:** Removed `SiDatepickerOverlayComponent.isFocused` and `SiDatepickerOverlayDirective.isFocused` without any replacement.
* **datepicker:** Removed `SiDatepickerOverlayDirective.toggleOverlay` method. Use `SiDatepickerOverlayDirective.showOverlay` or `SiDatepickerOverlayDirective.closeOverlay` methods instead.
* **datepicker:** Removed `SiDateInputDirective.dateInputDebounceTime`, `SiDateRangeComponent .debounceTime` and `SiDatepickerDirective.triggeringInput` inputs without any replacement as they had no effect.
* **element-theme:** The `make-theme` SCSS mixin no longer prefixes
  variables with `element-` hence custom build-time OEM themes have
  to be adapted accordingly, see:
  https://element.siemens.io/architecture/theming/#build-time-custom-theme.
* **filtered-search:** Removed following deprecated inputs:

  - `SiFilteredSearchComponent.showIcon` without any replacement.
  - `SiFilteredSearchComponent.selectedCriteriaIndex`. Instead of preselecting the most relevant option, sort the options by relevance.
  - `SiFilteredSearchComponent.noMatchingCriteriaText` without any replacement.
  - `SiFilteredSearchComponent.submitText`. Use `SiFilteredSearchComponent.submitButtonLabel` instead.
  - `SiFilteredSearchComponent.items`. Use `SiFilteredSearchComponent.itemCountText` instead.
* **form:** Removed deprecated `SiFormContainerComponent.getValidationErrors` method.
  
  Use the built-in mechanism of the `si-form-item` to show validation errors.
  See: https://element.siemens.io/components/forms-inputs/forms/#error-messages* **action-modal:** Removed deprecated methods:
  
  - `SiActionDialogService.showAlertDialog`
  - `SiActionDialogService.showConfirmationDialog`
  - `SiActionDialogService.showEditDiscardDialog`
  - `SiActionDialogService.showDeleteConfirmationDialog`
  
  Use `SiActionDialogService.showActionDialog` instead.
* **form:** Removed `SiFormItemComponent.inputId` and `SiFormItemComponent.readonly` inputs without any replacement.
* **form:** Removed `siFormItemControl` directive.
  
  Replace this directive with either the class form-control or form-check-input:
  
  ```
  <!-- Before -->
  <input type="checkbox" siFormItemControl>
  <input siFormItemControl>
  
  <!-- After -->
  <input type="checkbox" class="form-check-input">
  <input class="form-control">
  ```
* **form:** Checkboxes and radio inputs (`<input type="checkbox">` or `<input type="radio">`) must now be wrapped in a `.form-check` container.
  
  Additionally, when using Bootstrap’s grid system (bs-grid), each `.form-check` must be placed
  inside a `.col-*` element and cannot be a direct child of a `.row`.
  This change is necessary to ensure proper alignment and spacing, especially for long or multiline
  labels.
  
  Before:
  
  ```html
  <input type="checkbox" class="form-check-input">
  <label class="form-check-label">Label</label>
  ```
  
  After:
  
  ```html
  <div class="form-check">
    <input type="checkbox" class="form-check-input">
    <label class="form-check-label">Label</label>
  </div>
  ```
* **form:** Using multiple form-controls within a single si-form-item is no longer supported.
  Use si-form-fieldset to group multiple si-form-item components.

  Before:

  ```html
  <si-form-item label="Group label">
    <div class="form-check">
      <input type="checkbox" id="check-1" class="form-check-input" [formControl]="check1" />
      <label for="check-1">Label 1</label>
    </div>
    <div class="form-check">
      <input type="checkbox" id="check-2" class="form-check-input" [formControl]="check2" />
      <label for="check-2">Label 2</label>
    </div>
  </si-form-item>
  ```

  After:
  
  ```html
  <si-form-fieldset label="Group label">
    <si-form-item label="Label 1">
      <input type="checkbox" class="form-check-input" [formControl]="check1" />
    </si-form-item>
    <si-form-item label="Label 2">
      <input type="checkbox" class="form-check-input" [formControl]="check2" />
    </si-form-item>
  </si-form-fieldset>
  ```
* **icon:** The `si-icon` component has been completely re-implemented
  including breaking changes in the API. The main motivation of this change is
  support for SVG icons and to ensure a similar behavior compared to the direct
  use via CSS classes, making icon usage more interchangeable.
  
  We recommend adjusting your code to the new `si-icon`. Alternatively, you may
  use `si-icon-legacy` to preserve the previous behavior.
  
  The most notable changes are:
  - Dropped all inputs other than the `icon` input. Use CSS classes instead.
  - Dropped the default size along with the `size` input. Use CSS class `icon`
    to apply the default size via CSS or use any other
    [text size](https://element.siemens.io/fundamentals/typography/#type-styles-classes) class.
  - The content of this component is hidden in the a11y tree. If needed, set
    proper labels e.g. `aria-label="Close"`.
  - Dropped support for stacked icons via inputs. Use HTML and the `icon-stack`
    class to construct layered icons.

  Single colored icons can be converted as follows:
  
  ```html
  <!-- before -->
  <si-icon icon="element-user" color="text-danger" />
  <!-- after -->
  <si-icon icon="element-user" class="icon text-danger" />
  ```

  **Important:** Previously, the class icon was automatically applied. Unless not needed,
  it must now be applied manually.
  The icon class sets a fixed size of 1.5rem.
  
  Stacked (composite) icons need to be constructed using HTML.

  ```html
  <!-- before -->
  <si-icon
    icon="element-alarm-background-filled"
    color="status-danger"
    stackedIcon="element-alarm-tick"
    stackedColor="text-secondary"
    size="display-2"
  />

  <!-- after -->
  <span class="icon icon-stack">
    <si-icon class="si-display-lg status-danger" icon="element-alarm-background-filled" />
    <si-icon class="si-display-lg text-secondary" icon="element-alarm-tick" />
  </span>
  ```

  For status icons, the new `si-status-icon` component simplifies usage even more:

  ```html
  <!-- before -->
  <si-icon
  icon="element-circle-filled"
  color="status-danger"
  stackedIcon="element-state-exclamation-mark"
  stackedColor="status-danger-contrast"
  size="display-2"
  />

  <!-- after -->
  <si-status-icon class="si-display-lg" status="danger" />
  ```
* **maps-ng:** The `@siemens/maps-ng` package now requires ol-mapbox-style version 13.1.0 or higher. Please update your dependencies accordingly. For details on ol-mapbox-style 13, see: https://github.com/openlayers/ol-mapbox-style/releases/tag/v13.0.0
* **navbar-vertical:** Removed `SiNavbarVerticalComponent.autoCollapseDelay` input without any replacement.
* **popover:** The `siPopover` directive has been completely re-implemented,
  including breaking changes in the API.
  The main highlight is a complete accessibility support and
  unified interaction.

  The most notable changes are:
  - the triggers opening or closing a popover can no longer be modified
  - instead of having two `shown`/`hidden` events there is one `visibilityChange` event
  - all inputs and outputs are prefixed with `siPopover` to avoid name conflicts
  - a popover always receives the focus on open

  The new popover was already available as a preview via `siPopoverNext` in v47 and is now fully
  replacing the old popover with v48. If you are already using `siPopoverNext`, you can do a simple
  search & replace removing the `next` suffix.

  The "old" popover is still available with via the legacy entrypoint
  `@siemens/element-ng/popover-legacy`.
  Classes and selectors were renamed accordingly:
  - `siPopover` --> `siPopoverLegacy`
  - `SiPopoverDirective` --> `SiPopoverLegacyDirective`
  - `SiPopoverModule` --> `SiPopoverLegacyModule`

  Usually, the migration to new popover is simple.

  If the `trigger` or `outsideClick` was modified, please read the
  [popover documentation](https://element.siemens.io/components/status-notifications/popover/)
  on how to properly use a popover.

  In all other cases, it is sufficient to replace `shown` / `hidden` events with `visibilityChange`
  and prefix all input / outputs with `siPopover`.
* **result-details-list:** Removed `ResultDetailStepState` as object. Use `ResultDetailStepState` as type with direct string values.
* **search-bar:** `SiSearchBarComponent.searchChange` is not emitted during initialisation with `value` input
* **split:** Removed unused `SiSplitPartComponent.headerStatusColor` and `SiSplitPartComponent.headerStatusIconClass` inputs without any replacement.
* **tabs:** The `si-tabs` component has been completely re-implemented
  including breaking changes in the API. The main highlights are enhanced
  accessibility, improved responsive behavior, and Angular router support.
  
  The most notable changes are:
  - replacing the `selectedIndex` with an `active` input in the `si-tab`
  - dropping `iconAltText` in favor of enforcing `heading`
  - if an icon is provided, the heading is always visually hidden
  - no tab is selected by default
  - dropping `deselect` and `selectedTabIndexChange` in favor of using `activeChange` on the `si-tab`
  
  The new tabs were already available as a preview via `si-tabs-next` in v47 and are now fully
  replacing the old tabs with v48. If you are already using `si-tabs-next`, you can do a simple
  search & replace removing the `-next` suffix.
  
  The "old" tabs are still available via legacy entrypoint `@siemens/element-ng/tabs-legacy`.
  Classes and selectors were renamed accordingly:
  - `si-tabset` --> `si-tabset-legacy`
  - `SiTabsetComponent` --> `SiTabsetLegacyComponent`
  - `si-tab` --> `si-tab-legacy`
  - `SiTabComponent` --> `SiTabLegacyComponent`
  - `SiTabModule` --> `SiTabLegacyModule`
  
  When migrating to the new tabs, we recommend checking whether using the
  [router based approach](https://element.siemens.io/components/layout-navigation/tabs/#tabs-with-angular-router)
  is applicable.
  
  Otherwise, code needs to be changed to use the new `active` input
  and renaming `iconAltText` to `heading`:

  ```html
  <!-- before -->
  <si-tabset selectedTabIndex="0" (selectedTabIndexChange)="changedTab($event)">
    <si-tab iconAltText="Favorites" icon="element-favorite">...</si-tab>
  </si-tabset>

  <!-- after -->
  <si-tabset>
    <si-tab heading="Favorites" icon="element-favorite" [active]="true" (activeChange)="changedTab($event)">...</si-tab>
  </si-tabset>
  ```

  Please note, the implementation of `changedTab` must also be adjusted.
* **tree-view:** Removed `SiTreeViewComponent.disableFilledIcons` input.

  Tree items no longer show a filled icon on selection.
* **tree-view:** Removed `SiTreeViewComponent.trackByFunction` input which had no effect.
* **typeahead:** Removed `SiTypeaheadDirective.typeaheadOnMultiselectClose` and `SiTypeaheadDirective.typeaheadClosed` output. Use `SiTypeaheadDirective.typeaheadOpenChange` instead.
* **wizard:** The `si-wizard` now has the navigation buttons by default in the footer.

  To restore the old behavior set `SiWizardComponent.inlineNavigation` to `true`:

  ```
  <si-wizard inlineNavigation>
     ...
  </si-wizard>
  ```
* **wizard:** Removed `SiWizardComponent.hasNavigation` input and `SiWizardComponent.cancel` output. Use `SiWizardComponent.hideNavigation` and  `SiWizardComponent.wizardCancel` respectively instead.


### DEPRECATIONS

* **charts/gauge:** Input `labelFormatter` should no longer be used to format the value. Use `valueFormatter` instead.
* **datepicker:** `SiDatepickerComponent.calenderWeekLabel` input is deprecated. Use `SiDatepickerComponent.calendarWeekLabel` instead.
* **element-theme:** All `.si-*` typography utility classes were adapted to match the
  new typography system. Replace the following matches with their new
  counterparts:

  - Instead of `.si-h1-black`, use `.si-h1-bold` instead.
  - Instead of `.si-title-1-bold`, use `.si-h4-bold` instead.
  - Instead of `.si-title-1`, use `.si-h4` instead.
  - Instead of `.si-title-2-bold`, use `.si-h5-bold` instead.
  - Instead of `.si-title-2`, use `.si-h5` instead.
  - Instead of `.si-body-1`, use `.si-body-lg` instead.
  - Instead of `.si-body-2`, use `.si-body` instead.
  - Instead of `.si-display-1`, use `.si-display-xl` instead.
  - Instead of `.si-display-2`, use `.si-display-lg` instead.
  - Instead of `.si-display-3`, use `.si-display-bold` instead.
  - Instead of `.si-display-4`, use `.si-display` instead.
* **element-theme:** All `$si-font-size-*`, `$si-line-height-*`, and `$si-font-weight-*`
  variables were adapted to match the new typography system. Replace the following
  matches with their new counterparts:

  - Instead of `$si-*-h1-black`, use `$si-*-h1-bold` instead.
  - Instead of `$si-*-title-1-bold`, use `$si-*-h4-bold` instead.
  - Instead of `$si-*-title-1`, use `$si-*-h4` instead.
  - Instead of `$si-*-title-2-bold`, use `$si-*-h5-bold` instead.
  - Instead of `$si-*-title-2`, use `$si-*-h5` instead.
  - Instead of `$si-*-body-1`, use `$si-*-body-lg` instead.
  - Instead of `$si-*-body-2`, use `$si-*-body` instead.
  - Instead of `$si-*-caption-1`, use `$si-*-caption` instead.
  - Instead of `$si-*-display-1`, use `$si-*-display-xl` instead.
  - Instead of `$si-*-display-2`, use `$si-*-display-lg` instead.
  - Instead of `$si-*-display-3`, use `$si-*-display-bold` instead.
  - Instead of `$si-*-display-4`, use `$si-*-display` instead.
* **status-counter:** The component `si-icon-status` has been renamed to
  `si-status-counter`. The class name changes from `SiIconStatusComponent`
  to `SiStatusCounterComponent`. The old names still work and will
  be removed in future release.

  To migrate to the new names, change imports from `SiIconStatusComponent`
  or `SiIconStatusModule` to `SiStatusCounterComponent` and replace
  `si-icon-status` with `si-status-counter` in all templates.


# [47.8.0](https://github.com/siemens/element/compare/v47.7.0...v47.8.0) (2025-07-22)


### Features

* **dashboard:** add dashboard ([c4288e4](https://github.com/siemens/element/commit/c4288e412f34682d988a00c087a37a15a89a0a85))
* **dashboards-ng:** add dashboards-ng components ([8c5398c](https://github.com/siemens/element/commit/8c5398c2ec4435d959c57bd3c0489eaa9e1801c8))
* **patterns:** add drag drop patterns ([3ebd6be](https://github.com/siemens/element/commit/3ebd6be46c4e25c72e3ab437d7173253997c832a))
* **themes:** add experimental new tokens for AI patterns ([4719ee2](https://github.com/siemens/element/commit/4719ee27084dcd49f56f1e686c41a3ab5f3e7db1))


### Bug Fixes

* **charts:** empty series name in tooltip ([ad1be3d](https://github.com/siemens/element/commit/ad1be3d34e2ab17303e6004f657210df37a9ec06))
* **datatable:** align group header to match row styles ([00af856](https://github.com/siemens/element/commit/00af8561d2a7968b2663ef1058d906e75a7824b3))
* **photo-upload:** remove padding from the sides when a rounded mask is applied ([6ad9894](https://github.com/siemens/element/commit/6ad9894d457a4a54a7dede1293d792fabd018bcb))
* **select:** match selected item icon size with figma specs ([087bfcb](https://github.com/siemens/element/commit/087bfcbc50d9f6412a06fd4d5fb7e60406acb351))
* **theme:** add missing `base-4` to utility CSS classes ([2407b1c](https://github.com/siemens/element/commit/2407b1c596e4378a2b5405efc6f178fe3a948781))
* **wizard:** update disabled styles to match with figma ([7de558e](https://github.com/siemens/element/commit/7de558e357545c7d67a486ac8af7c6e38ec6727e))

# [47.7.0](https://github.com/siemens/element/compare/v47.6.0...v47.7.0) (2025-07-14)


### Features

* **about:** add about ([86b562a](https://github.com/siemens/element/commit/86b562ae0a7a72536186c5b3412d138c6f9d931e))
* **content-action-bar:** support checkbox items ([9cc6a5f](https://github.com/siemens/element/commit/9cc6a5f1432d412835c23e6f4009252fb09ae10a))
* **landing-page:** add landing page component ([76731fc](https://github.com/siemens/element/commit/76731fcb5c4839041394b67e1ee1e9703821b1c5))
* **translate:** use provider function to create service instances ([b76324c](https://github.com/siemens/element/commit/b76324c12172cb1fa097ab30398b817e82f17a03))


### Bug Fixes

* **translate:** prevent missing $localize errors ([2098eb1](https://github.com/siemens/element/commit/2098eb153214bd034bae588b3278a455814e4f8a))

# [47.6.0](https://github.com/siemens/element/compare/v47.5.0...v47.6.0) (2025-07-08)


### Features

* **breadcrumb-router:** add breadcrumb router component and resolver service ([7a23ea8](https://github.com/siemens/element/commit/7a23ea875b9397eb217bd6f593782ce085b6399a))
* **charts:** add si chart ([76d3e8a](https://github.com/siemens/element/commit/76d3e8a850bb9268ee8d768637dc9fb8cbf8fa36))
* **date-range-filter:** improve layout for smaller screens ([07e2ef8](https://github.com/siemens/element/commit/07e2ef8f7e8c39d007dff36a8cc7fa6d820001ce))
* **main-detail-container:** add main-detail-container ([7171549](https://github.com/siemens/element/commit/717154994a00efcd8c5bb4a16468927a49d7216d))
* **navbar-vertical:** add navbar-vertical ([ade96f8](https://github.com/siemens/element/commit/ade96f8438131bce957f761bb87b5e3ed00e886a))
* **resize-observer:** add emitInitial input to control initial resize emit ([f512259](https://github.com/siemens/element/commit/f512259134f64a2d20a2b692ac5a61edf8fa2592))
* **theme:** add a .text-link class for link in text ([ea7f7a4](https://github.com/siemens/element/commit/ea7f7a4238085949172188b6dff8493b94849e03))
* **theme:** introduce base-4, updated base colors ([0712c41](https://github.com/siemens/element/commit/0712c41c1b0360c60d975a1fc9c1fa9cae54ae80))
* **threshold:** add threshold component with customizable thresholds and validation ([c395815](https://github.com/siemens/element/commit/c39581568dd03878c1debff4a163c3b1dc0551fb))
* **tour:** add tour ([3c4b151](https://github.com/siemens/element/commit/3c4b151fb460bfc3b9a314404b6a1b500a84e114))


### Bug Fixes

* **formly:** add support for placeholder for select ([830608e](https://github.com/siemens/element/commit/830608e45cd4c92547d9e18caaf0021fe31a2068))
* **tabs-next:** calculate scroll container width correctly on load ([b93396d](https://github.com/siemens/element/commit/b93396d9a2476bd5f6d03959b4f257bd24fdf84c))
* **tabs-next:** drop only showing fully visible tabs in responsive mode ([0eb49f6](https://github.com/siemens/element/commit/0eb49f67f7b2dfc7412814ed515b27c575a40923))

# [47.5.0](https://github.com/siemens/element/compare/v47.4.0...v47.5.0) (2025-06-26)


### Features

* **angular:** add support for Angular 20 ([ca6275f](https://github.com/siemens/element/commit/ca6275fcd0799b950f886ed03eee0b542175cc6c))
* **datatable:** add datatable config and interaction ([4134ac1](https://github.com/siemens/element/commit/4134ac1bd04c007a7cab7102b7bffbcc9a35a594))
* **datatable:** support @siemens/datatable 23 ([bd19350](https://github.com/siemens/element/commit/bd193502fc7c2e663fa4b31f3b0bafb0638cc60e))
* **element:** add list-details component ([6b8503b](https://github.com/siemens/element/commit/6b8503bb8e8530a6f11cf862bbf73368dd3da86d))
* **filtered-search:** add filtered search ([766db4b](https://github.com/siemens/element/commit/766db4be88e58830f79b572150c5c91456258e4b))
* **form:** add form examples ([8d217f6](https://github.com/siemens/element/commit/8d217f6593060b88b832e14b6c59a37ca2058fc4))
* **formly:** add formly wrappers and components ([6c4f12f](https://github.com/siemens/element/commit/6c4f12f0cfa74b18299b16666a757b610e66a78b))
* **loading-spinner:** ensure compatibility to Angular CDK 20 ([c236c30](https://github.com/siemens/element/commit/c236c304b3f9696ec0b16fd0b6fa0549d14c772a))
* **modal:** ensure compatibility to Angular CDK 20 ([67382c5](https://github.com/siemens/element/commit/67382c57218ab128188f8e02634f1d68ae0b9570))
* **native-charts:** add native charts ([ec19393](https://github.com/siemens/element/commit/ec193931db2d924d82b3ffff9c1a5bd23ee5fe4c))
* **password-strength:** add option to allow whitespaces ([b18c232](https://github.com/siemens/element/commit/b18c2323d2c68a296c491c49ee118fecde8372d7))
* **password-strength:** allow setting minRequiredPolicies ([776b47c](https://github.com/siemens/element/commit/776b47c99159180e14ed2b65b51dcf51e5c2facd))
* **phone-number:** add phone number ([66589d2](https://github.com/siemens/element/commit/66589d2fc4bed8f1a42c375411817a0d848cd409))
* **result-details-list:** add result details list ([f4842f5](https://github.com/siemens/element/commit/f4842f509859007d6b8c2ac91a99e789495369ee))
* **shadow-root:** add shadow-root ([5e0d1cb](https://github.com/siemens/element/commit/5e0d1cbe297b11d305b3824638ae6e2fc5c977fd))
* **side-panel:** add side-panel ([78a75a0](https://github.com/siemens/element/commit/78a75a01e4e448d64b67c688dfeb8d15cfe70d02))
* **status-bar:** add status bar ([8328095](https://github.com/siemens/element/commit/83280955ca18c0fc286ed09528a1a1076ad835a9))
* **tabs-next:** add si-tabs-next ([a1e87ee](https://github.com/siemens/element/commit/a1e87ee8e0006056d15d6279ef45877e1a6cfbb6))
* **tree-view:** add tree view component ([203edbd](https://github.com/siemens/element/commit/203edbdb1fc6fe8c2dbc689a24cdcfba430e15af))


### Bug Fixes

* **status-icon:** add aria label for status icons ([b202fd7](https://github.com/siemens/element/commit/b202fd76eb8dc67908fb8538ea5ab551ae0cd1b7))
* **wizard:** improve vertical wizard button positioning on small screens ([fa6f486](https://github.com/siemens/element/commit/fa6f4868b92e8a687ccdadce0963470297f5deef))

# [47.4.0](https://github.com/siemens/element/compare/v47.3.0...v47.4.0) (2025-06-20)


### Features

* add photo upload component with cropping functionality ([40c1491](https://github.com/siemens/element/commit/40c149129ff8b0fd04222a94c5b542311d05d657))
* **badge:** introduce critical badge ([8a1f9c0](https://github.com/siemens/element/commit/8a1f9c0f92bcdb0d1256dcbf92b757df74e3350d))
* **breadcrumb:** add breadcrumb component ([a8b3a90](https://github.com/siemens/element/commit/a8b3a9055eda88346795f1034ebaaa7f895f7db9))
* **card:** add card component ([bf05edb](https://github.com/siemens/element/commit/bf05edbbe1c2bfeb87af06bd92da5590b3c8be7e))
* **card:** introduce critical accent ([69cf124](https://github.com/siemens/element/commit/69cf1247a2fbfd2e406213817d744f9a71ccc4cb))
* **circle-status:** add circle status component ([5448a6f](https://github.com/siemens/element/commit/5448a6f9b255e17ed014ee383b41b88067419e3d))
* **column-selection-dialog:** add column selection dialog ([85bb1fc](https://github.com/siemens/element/commit/85bb1fcebea5466dabcb2dd3d1b52b40bbb60710))
* **common:** move caution and critical to the base status types ([e7eed49](https://github.com/siemens/element/commit/e7eed492fb4a7355792624c5ebb1791b0afa6246))
* **date-range-filter:** add date range filter component ([798dcd0](https://github.com/siemens/element/commit/798dcd0953012027f5bef5ddfda82091c8b880b3))
* **datepicker:** add datepicker components and directives ([928b5cc](https://github.com/siemens/element/commit/928b5ccf55ad7ba194e8536a626d0dab8051a865))
* **electron-titlebar:** add electron titlebar component ([1f53bb5](https://github.com/siemens/element/commit/1f53bb5f1718ebd1f317907007adaba8580a41ca))
* **file-uploader:** add file uploader ([afea528](https://github.com/siemens/element/commit/afea528219b9a3b02d0b562bb2d0988f6cf28baf))
* **filter-bar:** add filter bar ([55b2c14](https://github.com/siemens/element/commit/55b2c14875380fc6a127fc243f492e6b22a60513))
* **info-page:** add info page component ([89aeb11](https://github.com/siemens/element/commit/89aeb11458798c0af9da8865df6d1babbcedfb49))
* **inline-notification:** introduce critical notification ([c741a52](https://github.com/siemens/element/commit/c741a5208f92f77eae87bbfb5644d131194581d2))
* **ip-input:** implement IPv4 and IPv6 input directives with validation and masking ([fc94b0d](https://github.com/siemens/element/commit/fc94b0d1e6e6887b59c24d61fa754f638c44d2c9))
* **localization:** add localization service and related components ([609f67c](https://github.com/siemens/element/commit/609f67c42cc5c0259e09e105c331bc395c1cc5c7))
* **search-bar:** add search bar ([ca68d76](https://github.com/siemens/element/commit/ca68d768ae58dbb6260155723ca6ea7127c2fe4a))
* **slider:** add slider ([7d07906](https://github.com/siemens/element/commit/7d079068b63c5695b3356edb4202aa2dd3f9b886))
* **sort-bar:** add sort bar component with sorting functionality and documentation ([9fc833d](https://github.com/siemens/element/commit/9fc833de670261191b217e943d3df552762fbd26))
* **split:** add split ([b78f847](https://github.com/siemens/element/commit/b78f847799ad28abaf296d6aa1e2a202c0b20b57))
* **status-toggle:** add status toggle ([c60fc38](https://github.com/siemens/element/commit/c60fc38d632361c846f30d40e7fede8dcefff843))
* **system-banner:** add system banner ([fefc1ee](https://github.com/siemens/element/commit/fefc1ee3ce6baedfd79ce8a9aacde1ef89728835))
* **tabs:** add tabs component ([bbd73d5](https://github.com/siemens/element/commit/bbd73d576e528d714cf41f6a7a23f798679f5a4c))
* **theme:** introduce text-critical token ([11ef127](https://github.com/siemens/element/commit/11ef127ceac43cc3b32aee89a4037f66bc911267))
* **unauthorized-page:** add unauthorized page component ([96ce204](https://github.com/siemens/element/commit/96ce204ec8f656d05a63d307d8ab42109b10a4c9))

# [47.3.0](https://github.com/siemens/element/compare/v47.2.0...v47.3.0) (2025-06-10)


### Features

* **autocomplete:** add autocomplete directives and module ([a478cd6](https://github.com/siemens/element/commit/a478cd61ef3c456f722afd23d8da6fdcefccbab0))
* **badges:** badges with icons and emphasis ([175b375](https://github.com/siemens/element/commit/175b375cd3b30fcb92e2cbc6d2e2782f0c42ba0a))
* **content-action-bar:** add content action bar component ([06de114](https://github.com/siemens/element/commit/06de114e51f8a5605044bb220d59463e6a19a058))
* **forms:** add si-form ([d771de6](https://github.com/siemens/element/commit/d771de6c973e10693ad7b2dcb0f742e3ae4f4083))
* **icon-status:** add icon status component with styling and examples ([e2cdd3f](https://github.com/siemens/element/commit/e2cdd3f47baf6a3982f748af9c8616754bec1ecf))
* **input:** add radio, checkbox,switch input type and textarea ([2df0b9d](https://github.com/siemens/element/commit/2df0b9d511e4b9ae4cd2503c91a9de10a3abc2a1))
* **language-switcher:** add language switcher component ([032b8c2](https://github.com/siemens/element/commit/032b8c22fd7d891819ffa19a999bd57aa19725f2))
* **launchpad:** add tokens for application icon color/background ([d31db92](https://github.com/siemens/element/commit/d31db9247db4415580cd37b31cf090f296fc2482))
* **number-input:** add number input ([bcadbe7](https://github.com/siemens/element/commit/bcadbe7d939debd3b460c963a3d8115187660b59))
* **password-strength:** add password strength component with validation and UI integration ([19a38fb](https://github.com/siemens/element/commit/19a38fb505f33627e3a13166a214172999ab8d7a))
* **pills-input:** add pills Input component ([af0486d](https://github.com/siemens/element/commit/af0486dd0019028aa65053f905808d586dbecaee))
* **popover-next:** add si-popover-next component with directives and templates ([291ca35](https://github.com/siemens/element/commit/291ca359d6e25f6aafd1938058f6afbee6233f88))
* **popover:** add popover component ([87312d3](https://github.com/siemens/element/commit/87312d3b1613713516eaac9ec9c5e71342bb0509))
* **progress-bar:** add progress bar component with dynamic functionality ([b6c5405](https://github.com/siemens/element/commit/b6c5405619cb27f273dc01749fcec6f4995d3f19))
* **progress-bar:** add progress bar component with dynamic functionality ([12051f8](https://github.com/siemens/element/commit/12051f828f2361b0338f02c350f8912049f26ad6))
* **select:** add select component with multi-select and filtering capabilities ([c1a1837](https://github.com/siemens/element/commit/c1a1837cebae31831258e72f4f989a56ab8ff0a1))
* **select:** add support for stacked icons ([9c6f052](https://github.com/siemens/element/commit/9c6f05289341f83061fe9155c94fb8741f39334b))
* **summary-widget:** add summary widget ([44a540c](https://github.com/siemens/element/commit/44a540cbe32255e926c4a2aa16db7076311abe87))
* **theme:** introduce base-critical token and class ([a7692e7](https://github.com/siemens/element/commit/a7692e7c5165cdf3af13bdebd686c670dee408c5))
* **toast-notification:** add toast notification component and service ([70f23b5](https://github.com/siemens/element/commit/70f23b5aa3828cdcd9d01513d9cd5d6b5e0e9d69))
* **typeahead:** add typeahead directive and components ([754a60e](https://github.com/siemens/element/commit/754a60ea0f3c06d5e9fcbd75fd641b72dd4d6bf0))
* **wizard:** add wizard component with dynamic steps and navigation ([944c13b](https://github.com/siemens/element/commit/944c13b32ec6798a5a7cb5c9384a4da8f115350c))


### Bug Fixes

* **live-previewer:** make initialization more reliable ([3219d17](https://github.com/siemens/element/commit/3219d1701901c13eb19bf8a39c4ed047767b6f6a))
* **live-preview:** fix recompile on template change in viewer ([af70347](https://github.com/siemens/element/commit/af703477470c9142cfb959b802fd3fb191bb205a))
* **tsdoc:** add default ref ([ef9377d](https://github.com/siemens/element/commit/ef9377d056dc06ad4075ab7688b59ba4cc5d3335))

# [47.2.0](https://github.com/siemens/element/compare/v47.1.0...v47.2.0) (2025-05-28)


### Features

* **accordion:** add accordion ([6115492](https://github.com/siemens/element/commit/61154926a2f389336bbb8761a2195300a035871d))
* **action-modal:** add action modal service and components ([ac54c88](https://github.com/siemens/element/commit/ac54c88a7b962403ada2007579aaa008213be9ec))
* **auto-collapsable-list:** add auto-collapsable list components and directives ([95c27fe](https://github.com/siemens/element/commit/95c27fe604f419faa7f9eeb7f6115ead6163a1d9))
* **color-picker:** add color picker ([1811d08](https://github.com/siemens/element/commit/1811d086d68f3fde73cd6a88cdf6e2023e15b1e0))
* **connection-strength:** add connection strength ([50b746e](https://github.com/siemens/element/commit/50b746ed5aab808b2106d5eeac637200f485e08c))
* **copyright-notice:** introduce copyright notice ([c053f5f](https://github.com/siemens/element/commit/c053f5fe767d9b9ed11f747825029c83db79133a))
* **empty-state:** add empty state ([7b382af](https://github.com/siemens/element/commit/7b382af636d9fb7e84df8ef96be728883442ba45))
* **footer:** add footer component ([4b14465](https://github.com/siemens/element/commit/4b14465f1f911d952ed5c0217910574ae1d26222))
* **inline-notification:** add inline notification ([592c7b9](https://github.com/siemens/element/commit/592c7b9cb04e5b3a608bdb5dc1322520f8a6ab3f))
* **loading-spinner:** add loading spinner component ([ec94faa](https://github.com/siemens/element/commit/ec94faabe2d754dcea0185d29283daba8aaef2af))
* **menu:** add menu component ([27020af](https://github.com/siemens/element/commit/27020af0dedccf68118164a2b86ee343bf565363))
* **modal:** add modal component ([2c05627](https://github.com/siemens/element/commit/2c056275832d54fd9ee483859f9987c831becd7d))
* **pagination:** add pagination component ([6cadaba](https://github.com/siemens/element/commit/6cadabad1018baf830b3bc63301b65b39c31e1d9))
* **password-toggle:** add password toggle component ([6f9b405](https://github.com/siemens/element/commit/6f9b4057ea1823c13b817153b2cff5921350e9a8))
* **summary-chip:** add summary chip ([7f6d187](https://github.com/siemens/element/commit/7f6d187c539a041a7358616ca211d0ca335e3141))
* **tooltip:** add tooltip component ([151809b](https://github.com/siemens/element/commit/151809bf3c48167b92cb5654890586173e77883c))


### Bug Fixes

* **examples:** update navbar examples to use element prefix ([92b0ee7](https://github.com/siemens/element/commit/92b0ee7e1dc0c52a4febe80b12e4720efb461b6b))
* **live-preview:** automatic dark/light theme for overview ([31d0376](https://github.com/siemens/element/commit/31d0376ac5f90d3a5dc2c34928890427d2ed9f01))

# [47.1.0](https://github.com/siemens/element/compare/v47.0.0...v47.1.0) (2025-05-21)


### Bug Fixes

* **application-header:** announce logo text in Safari / VoiceOver ([71d02a7](https://github.com/siemens/element/commit/71d02a70f322ca9e3f00b9e2f8c8cddbdd87af3b))
* **datatable:** respect content 100% width ([c0fa7fc](https://github.com/siemens/element/commit/c0fa7fc7d9e40e6a5b42dec727c208fa62c1b697))
* **live-preview:** accept legacy component loader import ([452cd56](https://github.com/siemens/element/commit/452cd5644607b9319024590e3992250bc35315d1))
* **theme:** fix card spacing for focus outline ([ec3d92f](https://github.com/siemens/element/commit/ec3d92f9fc8393a6ca2ba126894e7a9f74c1116f))


### Features

* **element-translation-ng:** move key extraction CLI into a separate package ([3c5cd72](https://github.com/siemens/element/commit/3c5cd72be1fb23fc245ee60e2e110b5d340221b5))
* **icon:** introduce status icon ([5ce6727](https://github.com/siemens/element/commit/5ce67276ee0ca42c9056ce466bf80f256e4c3df3))
* **icon:** support stacking in template with si-icon ([87d2a02](https://github.com/siemens/element/commit/87d2a022d349188bbe78d766e1a640c1a8c48c05))
* **navbar:** add legacy navbar primary ([a62fe11](https://github.com/siemens/element/commit/a62fe1192b43304aaa58ac3513176303fed4e347))
* **typography:** add title bold styles ([34c16ff](https://github.com/siemens/element/commit/34c16ffc53128242d2108ded36cbb1e1cfca4a9b))

# [47.0.0](https://github.com/siemens/element/compare/v46.0.0...v47.0.0) (2025-05-19)


### Build System

* harmonize package versions to 47.0.0 ([6b088b5](https://github.com/siemens/element/commit/6b088b5700793acb420b2142f661d10c2e825a39))


### BREAKING CHANGES

* Set the correct version in every package.
