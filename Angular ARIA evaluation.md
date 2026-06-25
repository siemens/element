## Angular ARIA evaluation:

# Accordian

- We control the structure of the heading elements
- if users are allowed to directly use aria/accordian they need to structure it themselves
- using in existing component internally can reduce lot of self handling of aria attributes and toggling logics
- also dynamic id generations not needed as it is handled by angular in that case
- might need little bit attention while supporting hcollapse service

# Tabs

- Larger API surface
- No built in logics to handle visibility of active tabs
- Only controls aria attributes
- API doesn't easily map with our si-tabs api

# Autocomplete

- Combination of combobox and listbox
- can extend our autocomplete directive with aria apis
- can reduce lot of manual aria attribute handling as well as keyboard manager
- cva is not treated as editable input so requires a small workaround for supporting typeahead on si-search-bar (key events gets prevented interanlly in case of cva)
- combobox api doesn't have readonly support (as per w3c select tags do not have concept of readonly)

# Listbox

- same as @angular/cdk/listbox
- some additional feature support e.g follow mode selecition
- usage @ column selection dialog, date-range-filter, widget-catalog

# Menu / Menubar

- same as @angular/cdk/menu
- additionally consumer needs to manually handle overlay logic

# Grid

- should be used internally for navigating in 2 dimensional elements
- launchpad, datepicker, color picker ngx-datatable (in upstream)

# Tree

- Our existing tree using flat array and custom structural directive
  this would make it difficult to use aria tree internally on our tree
- Would be more better if we implement another tree based on aria/tree
