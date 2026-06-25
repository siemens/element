# Angular ARIA (`@angular/aria`) — Evaluation & Strategy

Evaluated Angular's new headless accessibility package, `@angular/aria`, to answer two questions:

1. **Can we ship _pure-CSS_ components on top of it** — i.e. expose the ARIA primitives to consumers and provide only Element styles, for our **existing** components and **without losing features**?
2. **Where can we use it _internally_** to simplify our own code?

---

## 1. Background & Objectives

Element already uses `@angular/cdk` extensively for behavior primitives (overlays, a11y, drag-drop, listbox, menu, etc.). With Angular shipping the new headless `@angular/aria` package, assessment was done to find whether it fits our offering on two fronts:

| Objective                      | Question asked                                                                                                                                                       |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Consumer-facing (CSS-only)** | Can we expose ARIA primitives and ship _only styles_ for our existing components, so consumers compose the markup themselves — **without compromising any feature**? |
| **Internal simplification**    | Can we use it inside our components to reduce hand-written ARIA/keyboard/ID-management code?                                                                         |
| **CDK overlap**                | For patterns we already cover with CDK, is there a net benefit to switching?                                                                                         |

---

## 2. What is `@angular/aria`?

A set of **headless, signal-based directives** that implement the [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) patterns. They manage **roles, ARIA attributes, focus, roving tabindex, and keyboard interaction** — but ship **no styles and no visual structure**.

**Modules available in 22.0.1:**

`accordion` · `combobox` · `grid` · `listbox` · `menu` · `tabs` · `toolbar` · `tree`

**Key characteristics:**

- **Headless** — behavior + accessibility only; you provide markup and CSS.
- **Reactivity-first** — inputs/outputs are `input()`, `output()`, `model()` signals.
- **Composable** — applied as directives / `hostDirectives` onto your own elements.
- **`softDisabled` vs hard-disabled** — a soft-disabled item stays focusable (and discoverable by screen readers) but is not actionable; hard-disabled removes it from focus order.
- **Peer dependency on `@angular/cdk`** — it sits alongside, not instead of, CDK. Some patterns (menu, listbox) overlap directly with existing CDK directives.

> **Mental model:** `@angular/cdk` gives us _building blocks_ (overlay, focus trap, a11y utils). `@angular/aria` gives us _complete interaction patterns_ wired for accessibility, minus the styling.

---

## 3. Evaluation at a Glance

| Pattern            | `@angular/aria` module | How we build it today                      | Internal adoption value | Recommendation                                  |
| ------------------ | ---------------------- | ------------------------------------------ | ----------------------- | ----------------------------------------------- |
| **Accordion**      | `accordion`            | Custom component + services                | 🟢 **High**             | **Adopt internally** (POC done)                 |
| **Autocomplete**   | `combobox` + `listbox` | Custom directive                           | 🟢 **High**             | **Adopt internally** (POC done)                 |
| **Grid (2-D nav)** | `grid`                 | Ad-hoc per component                       | 🟡 Medium–High          | Adopt internally for 2-D keyboard nav           |
| **Tabs**           | `tabs`                 | Custom `si-tabs`                           | ⚪ Low                  | Keep `si-tabs`; Requires to change our tabs api |
| **Listbox**        | `listbox`              | `@angular/cdk/listbox`                     | ⚪ Low                  | Keep CDK (parity, low gain)                     |
| **Menu / Menubar** | `menu`                 | `@angular/cdk/menu`                        | ⚪ Low                  | Keep CDK (overlay already handled)              |
| **Tree**           | `tree`                 | Custom (flat array + structural directive) | ⚪ Low (today)          | Only for a _new_ tree; don't retrofit           |

Legend: 🟢 strong · 🟡 moderate · ⚪ minimal

---

## 4. Strategic Findings

### Finding 1 — "Pure-CSS components" is not a realistic consumer offering

Our components own far more than ARIA semantics: structural decisions (e.g. **which heading level** wraps an accordion trigger), companion services (e.g. **horizontal-collapse**), animations, scroll-position restoration, full-height layout, and CVA/forms integration. ARIA primitives deliberately cover none of this.

To expose primitives + ship only CSS, consumers would have to **reconstruct that markup and behavior themselves**, which either **regresses features** or **moves complexity to the consumer** — both violate the "no compromise on features" constraint.

### Finding 2 — Internal adoption removes meaningful amounts of code

Where we replaced hand-rolled logic with `@angular/aria`, we deleted ARIA-attribute host bindings, manual keyboard handlers, roving-tabindex bookkeeping, and **dynamic ID generation** in some cases (Angular now wires the relationships). This is concretely visible in POCs. The benefit is **correctness + less maintenance**, not new end-user features.

### Finding 3 — Where CDK already covers it, the gain is marginal

For **menu** and **listbox**, we already lean on `@angular/cdk`, so we're _not_ managing much code today. `@angular/aria` would also require us to **own overlay/positioning ourselves** for menus (CDK provides this). Net: **low priority**.

### Finding 4 — Reactivity-first API

The primitives are **signal-based** (`input()`/`output()`/`model()`). This is a strong fit for Element's signal-first approach.

---

## 5. Detailed Component Assessment

### 5.1 Accordion — 🟢 Adopt internally

- Using it **internally** removes a lot of self-managed ARIA attributes and expand/collapse toggling logic.
- **Dynamic ID generation is no longer needed** — Angular wires trigger↔panel relationships.
- ⚠️ Needs care to keep the **horizontal-collapse (`hcollapse`) service** behavior working.

### 5.2 Autocomplete — 🟢 Adopt internally (with one workaround)

- It's a **combobox + listbox** combination; we can extend our existing autocomplete directive with the ARIA primitives.
- Removes a lot of **manual ARIA attribute handling** and our custom **keyboard manager**.
- ⚠️ A **CVA is not treated as an editable input**, so typeahead on `si-search-bar` needs a small workaround (key events are prevented internally in the CVA case).
- ⚠️ The combobox API has **no `readonly` support** (per W3C, `select` has no readonly concept) — confirm this doesn't regress any current behavior.

### 5.3 Grid — 🟡 Adopt internally for 2-D navigation

- Best used **internally** to standardize **two-dimensional keyboard navigation**.
- Candidate hosts: **launchpad**, **datepicker**, **colorpicker** and **ngx-datatable** (upstream).
- Good consolidation opportunity for keyboard-nav code currently re-implemented per component.

### 5.4 Tabs — 🟡 Keep `si-tabs`;

- Provides **no built-in logic for active-tab content visibility** — it only manages ARIA attributes.
- The API **does not map cleanly onto our `si-tabs` API**.
- **Recommendation:** keep `si-tabs`;

### 5.5 Listbox — ⚪ Keep CDK

- Functionally **equivalent to `@angular/cdk/listbox`**, which we already use.
- Adds some extra capabilities (e.g. **follow-mode selection**).
- Current internal usages: **column-selection dialog**, **date-range-filter**, **widget-catalog**.
- **Low gain** to switch; revisit only if a feature like follow-mode selection is specifically needed.

### 5.6 Menu / Menubar — ⚪ Keep CDK

- Equivalent to `@angular/cdk/menu`, which we already use.
- With `@angular/aria`, the **consumer must handle overlay/positioning manually** — CDK gives us this for free.
- Since we already manage little code here, **migration is low-value**.

### 5.7 Tree — ⚪ Only for a future tree

- Our tree uses a **flat array + a custom structural directive**, which makes retrofitting `@angular/aria/tree` onto the existing implementation difficult.
- **Recommendation:** if/when we build a **new** tree, base it on `@angular/aria/tree`; do not retrofit the current one.

### 5.8 Toolbar

- Available in the package; no current 1:1 mapping with Element component.

---

## 6. Recommendations & Proposed Strategy

### Phased adoption

| Phase                                  | Focus                                                                                                     | Rationale                                                 |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **Phase 1 — Land the proven wins**     | Finalize **Accordion** and **Autocomplete** on `@angular/aria` (incl. `hcollapse`, CVA/readonly handling) | POCs already validate the gain; low risk, clearest payoff |
| **Phase 2 — Consolidate keyboard nav** | Use **`grid`** for 2-D navigation (launchpad, datepicker)                                                 | Removes duplicated keyboard-nav code                      |
| **Phase 3 — Opportunistic**            | Base any **new tree** on `aria/tree`                                                                      | Value only when we're already changing those areas        |
| **Defer**                              | **Menu**, **Listbox** (stay on CDK); **Toolbar** (evaluate later)                                         | Low/uncertain gain today                                  |

---

## 8. Risks & Open Questions

- **CVA / forms integration** — combobox isn't treated as an editable input when used on CVA; small workaround is possible to support.
- **`readonly` semantics** — combobox lacks `readonly` as they are meant for selection
  and as per web specification standard readonly pattern is not valid on select;
- **Package maturity & churn** — `@angular/aria` is new; track API stability across Angular releases before deep investment.
- **Overlay** — Aria package don't handle overlays so CDK needs to be used for
  overlay handling.

---

**Conclusions:**

- ❌ **Pure-CSS, consumer-facing alternatives.** Most Element components own structure, behavior, services, and animations that ARIA primitives intentionally do not cover. Exposing the primitives directly would force feature regressions and shift composition burden onto consumers.
- ✅ **Internal adoption is the real win.** Used inside our components, `@angular/aria` removes large amounts of hand-written ARIA wiring, keyboard handling, dynamic ID generation, and roving-tabindex logic — improving correctness and reducing maintenance.
- ➖ **For patterns we already build on `@angular/cdk` (menu, listbox), switching to `@angular/aria` is low-gain** — CDK already handles the heavy lifting (e.g. overlays), so a migration buys little today.
- 🔑 **Strategic differentiator:** `@angular/aria` is **reactivity-first** (signal `input()`/`output()`, `model()`), which aligns with Element's signal-based direction.

**Recommended direction:** Adopt `@angular/aria` **internally and incrementally**, starting with components where POCs already prove the gain (Accordion, Autocomplete). Do **not** position it as a consumer-facing "bring-your-own-markup + our CSS" offering.
