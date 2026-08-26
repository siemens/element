---
name: element
description: Manages Siemens Element Angular components and projects — selecting, adding, searching, fixing, debugging, styling, theming, migrating, and composing accessible UI. Provides version-matched project context, component APIs, design guidance, documentation, and usage examples. Use this skill whenever a task involves developing an Angular frontend, Siemens Element, an Element component, or any @siemens/element-ng, @siemens/dashboards-ng, @siemens/charts-ng, @siemens/maps-ng, @siemens/element-translate-ng, @siemens/element-theme, or @siemens/element-icons package, even when the user does not explicitly ask for this skill.
license: MIT
metadata:
  author: Copyright (c) Siemens 2016 - 2026
  version: '1.0'
---

# Siemens Element

Siemens Element is the Smart Infrastructure design system implementation of the Siemens Design Language for Angular. It provides reusable UI components, dashboards, charts, maps, icons, themes, localization support, design foundations, interaction patterns, human-interface guidance, examples, and API documentation for building consistent, accessible Siemens applications.

Use this skill for tasks involving Siemens Element components and projects, including:

- Finding the right component or library for a requirement
- Adding and configuring components
- Fixing compilation, runtime, interaction, layout, and accessibility problems
- Debugging component behavior and package integration
- Styling and theming Element applications
- Composing components into maintainable user interfaces
- Finding version-appropriate documentation and usage examples

## Supported packages

- `@siemens/element-ng`
- `@siemens/dashboards-ng`
- `@siemens/charts-ng`
- `@siemens/maps-ng`
- `@siemens/element-translate-ng`
- `@siemens/element-theme`
- `@siemens/element-icons`

## Workflow

1. By default, fetch `https://element.siemens.io/llms.txt` and use it as the canonical table of contents.
2. When matching an existing project's version matters, find the installed Element version in `package.json` or the package manager lockfile. Fetch `https://element.siemens.io/versions.json` and select the entry whose title matches the installed major version (for example, `47.x`). Build `https://element.siemens.io/<version>/llms.txt` from its `version` value, or fall back to `https://element.siemens.io/llms.txt` when that value is empty or no entry matches. Check each supported package separately if their major versions differ.
3. Inspect the relevant project code and follow only the index links needed to verify its public APIs and examples. Resolve relative links against the returned `llms.txt` URL.
4. Import Element Angular symbols from their documented secondary entry point (for example `@siemens/element-ng/application-header`).
5. For icons, use the versioned **Icons** documentation and icon overview to verify that the icon exists; never invent an icon name. Import the verified SVG constant from `@siemens/element-icons` and register it with `addIcons` from `@siemens/element-ng/icon`.
6. For theme setup, inspect the existing global styles and follow the selected version's **Get started** and **Theming** documentation. For a Siemens application, add and configure `@simpl/brand` when required by that version's documentation.
7. Do not infer undocumented behavior, replace published documentation with raw repository files, or mix documentation versions without identifying the mismatch.
8. For upgrades or migrations, follow the relevant **Update guide** linked from the selected `llms.txt`.
