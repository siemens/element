/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import {
  Attribute,
  Block,
  Element,
  HtmlParser,
  RecursiveVisitor,
  visitAll
} from '@angular/compiler';
import { dirname, join } from 'path/posix';
import ts from 'typescript';

import { discoverSourceFiles, getInlineTemplates, getTemplateUrl } from '../utils/index.js';

const LEGACY_TABSET = 'si-tabset-legacy';
const TABSET = 'si-tabset';
const LEGACY_TAB = 'si-tab-legacy';
const TAB = 'si-tab';
const LEGACY_IMPORT_PATTERN = /^@(siemens|simpl)\/element-ng\/tabs-legacy$/;
const CURRENT_IMPORT_PATTERN = /^@(siemens|simpl)\/element-ng\/tabs$/;

interface MigrationOptions {
  path?: string;
}

interface TextEdit {
  start: number;
  end: number;
  text: string;
}

interface ImportSpecifierData {
  imported: string;
  local: string;
  typeOnly: boolean;
}

interface TemplateUses {
  tab: boolean;
  tabLink: boolean;
  tabset: boolean;
}

interface TemplateMigrationResult {
  content: string;
  changed: boolean;
  uses: TemplateUses;
}

interface TabUsage {
  element: Element;
  routerBased: boolean;
  relativeBlocks: Block[];
  structuralAncestor: boolean;
}

interface TabsetUsage {
  element: Element;
  blockDepth: number;
  elementDepth: number;
  tabs: TabUsage[];
}

interface TabPosition {
  tab: TabUsage;
  index: string;
}

class TabsCollector extends RecursiveVisitor {
  readonly legacyTabs: TabUsage[] = [];
  readonly tabsets: TabsetUsage[] = [];

  private readonly blocks: Block[] = [];
  private readonly elements: Element[] = [];
  private readonly tabsetStack: TabsetUsage[] = [];

  override visitBlock(block: Block, context: unknown): unknown {
    this.blocks.push(block);
    const result = super.visitBlock(block, context);
    this.blocks.pop();
    return result;
  }

  override visitElement(element: Element, context: unknown): unknown {
    const isLegacyTabset = element.name === LEGACY_TABSET;
    if (isLegacyTabset) {
      const tabset: TabsetUsage = {
        element,
        blockDepth: this.blocks.length,
        elementDepth: this.elements.length,
        tabs: []
      };
      this.tabsets.push(tabset);
      this.tabsetStack.push(tabset);
    }

    const legacyTabAttribute = getAttribute(element, LEGACY_TAB);
    const isLegacyTab = element.name === LEGACY_TAB || !!legacyTabAttribute;
    if (isLegacyTab) {
      const tabset = this.tabsetStack.at(-1);
      const relativeElements = tabset ? this.elements.slice(tabset.elementDepth) : this.elements;
      const tab: TabUsage = {
        element,
        routerBased: !!legacyTabAttribute,
        relativeBlocks: tabset ? this.blocks.slice(tabset.blockDepth) : [...this.blocks],
        structuralAncestor:
          hasStructuralTemplateAttribute(element) ||
          relativeElements.some(hasStructuralTemplateAttribute)
      };
      this.legacyTabs.push(tab);
      tabset?.tabs.push(tab);
    }

    this.elements.push(element);
    const result = super.visitElement(element, context);
    this.elements.pop();

    if (isLegacyTabset) {
      this.tabsetStack.pop();
    }
    return result;
  }
}

class TemplateEditor {
  readonly edits: TextEdit[] = [];
  private readonly insertions = new Map<number, string[]>();

  insert(position: number, text: string): void {
    const insertions = this.insertions.get(position) ?? [];
    insertions.push(text);
    this.insertions.set(position, insertions);
  }

  replace(start: number, end: number, text: string): void {
    this.edits.push({ start, end, text });
  }

  removeAttribute(attribute: Attribute): void {
    this.replace(attribute.sourceSpan.start.offset, attribute.sourceSpan.end.offset, '');
  }

  allEdits(): TextEdit[] {
    return [
      ...this.edits,
      ...[...this.insertions].map(([position, insertions]) => ({
        start: position,
        end: position,
        text: insertions.join('')
      }))
    ];
  }
}

export const migrateTabsLegacy = (options: MigrationOptions): Rule => {
  return async (tree: Tree, context: SchematicContext) => {
    const processedTemplates = new Map<string, TemplateMigrationResult>();

    for await (const { path: filePath, sourceFile } of discoverSourceFiles(
      tree,
      context,
      options.path ?? '/'
    )) {
      const sourceContent = tree.readText(filePath);
      const sourceEdits: TextEdit[] = [];
      const uses: TemplateUses = { tab: false, tabLink: false, tabset: false };

      for (const template of getInlineTemplates(sourceFile)) {
        const start = template.getStart(sourceFile) + 1;
        const templateContent = sourceContent.substring(start, template.getEnd() - 1);
        const result = migrateTemplate(templateContent, filePath, context);
        mergeUses(uses, result.uses);
        if (result.changed) {
          sourceEdits.push({ start, end: template.getEnd() - 1, text: result.content });
        }
      }

      for (const templateUrl of getTemplateUrl(sourceFile)) {
        const templatePath = join(dirname(filePath), templateUrl);
        const templateBuffer = tree.read(templatePath);
        if (!templateBuffer) {
          continue;
        }

        const templateContent = templateBuffer.toString('utf-8');
        const result =
          processedTemplates.get(templatePath) ??
          migrateTemplate(templateContent, templatePath, context);
        mergeUses(uses, result.uses);
        if (result.changed && !processedTemplates.has(templatePath)) {
          tree.overwrite(templatePath, result.content);
        }
        processedTemplates.set(templatePath, result);
      }

      sourceEdits.push(...migrateImports(sourceFile, sourceContent, uses, filePath, context));
      if (sourceEdits.length) {
        tree.overwrite(filePath, applyTextEdits(sourceContent, sourceEdits));
      }
    }

    return tree;
  };
};

const migrateTemplate = (
  template: string,
  filePath: string,
  context: SchematicContext
): TemplateMigrationResult => {
  const parsed = new HtmlParser().parse(template, filePath, {
    tokenizeExpansionForms: true,
    tokenizeBlocks: true,
    preserveLineEndings: true
  });
  if (parsed.errors.length) {
    throw new SchematicsException(`Could not parse ${filePath}; legacy tabs were not migrated.`);
  }

  const collector = new TabsCollector();
  visitAll(collector, parsed.rootNodes);
  const editor = new TemplateEditor();
  const uses: TemplateUses = {
    tab: collector.legacyTabs.some(tab => !tab.routerBased),
    tabLink: collector.legacyTabs.some(tab => tab.routerBased),
    tabset: collector.tabsets.length > 0
  };

  for (const tabset of collector.tabsets) {
    renameElement(tabset.element, LEGACY_TABSET, TABSET, editor);
    migrateTabsetSelection(template, tabset, editor, filePath, context);
  }

  for (const tab of collector.legacyTabs) {
    if (tab.routerBased) {
      const selector = getAttribute(tab.element, LEGACY_TAB)!;
      editor.replace(
        selector.sourceSpan.start.offset,
        selector.sourceSpan.start.offset + LEGACY_TAB.length,
        TAB
      );
    } else {
      renameElement(tab.element, LEGACY_TAB, TAB, editor);
    }
    migrateHeading(tab.element, editor, filePath, context);
  }

  const edits = editor.allEdits();
  return {
    content: edits.length ? applyTextEdits(template, edits) : template,
    changed: edits.length > 0,
    uses
  };
};

const migrateTabsetSelection = (
  template: string,
  tabset: TabsetUsage,
  editor: TemplateEditor,
  filePath: string,
  context: SchematicContext
): void => {
  const element = tabset.element;
  const selectionAttributes = element.attrs.filter(attribute =>
    ['selectedTabIndex', '[selectedTabIndex]', '[(selectedTabIndex)]'].includes(attribute.name)
  );
  const selection =
    selectionAttributes.find(attribute => attribute.name === '[(selectedTabIndex)]') ??
    selectionAttributes.find(attribute => attribute.name === '[selectedTabIndex]') ??
    selectionAttributes.find(attribute => attribute.name === 'selectedTabIndex');
  const selectedTabIndexChange = getAttribute(element, '(selectedTabIndexChange)');
  const deselect = getAttribute(element, '(deselect)');
  const closeHandlers = tabset.tabs
    .map(tab => getAttribute(tab.element, '(closeTriggered)'))
    .filter((attribute): attribute is Attribute => !!attribute);
  const selectDefault =
    getAttribute(element, '[selectDefaultTab]') ?? getAttribute(element, 'selectDefaultTab');
  if (deselect) {
    editor.removeAttribute(deselect);
    warnAt(
      context,
      filePath,
      deselect,
      '`deselect` cannot be migrated automatically. Replace its cancellation logic with `canDeactivate` on the affected tab.'
    );
  }
  for (const closeHandler of closeHandlers) {
    if (/\$event\b/.test(getAttributeValue(template, closeHandler))) {
      warnAt(
        context,
        filePath,
        closeHandler,
        '`closeTriggered` no longer emits the tab component. Update handlers that consume `$event`.'
      );
    }
  }
  if (selectionAttributes.length > 1) {
    warnAt(
      context,
      filePath,
      element,
      'Multiple `selectedTabIndex` bindings were found; the highest-precedence binding was migrated.'
    );
  }

  const positions = getTabPositions(tabset);
  const hasRouterTabs = tabset.tabs.some(tab => tab.routerBased);
  const needsPositionMapping = !!selection || !!selectedTabIndexChange;
  if (hasRouterTabs && needsPositionMapping) {
    warnAt(
      context,
      filePath,
      element,
      '`selectedTabIndex` cannot control router tabs. Their active state is derived from the Angular router.'
    );
  }

  if (needsPositionMapping && (!positions || hasRouterTabs)) {
    warnAt(
      context,
      filePath,
      element,
      '`selectedTabIndex` could not be distributed because runtime tab positions are ambiguous.'
    );
    return;
  }

  const selectionExpression = selection ? getAttributeValue(template, selection) : undefined;
  const numericSelection = selectionExpression ? parseInteger(selectionExpression) : undefined;
  const canMigrateSelection =
    selection?.name !== 'selectedTabIndex' || numericSelection !== undefined;
  if (canMigrateSelection) {
    selectionAttributes.forEach(attribute => editor.removeAttribute(attribute));
    if (selectedTabIndexChange) {
      editor.removeAttribute(selectedTabIndexChange);
    }
  }

  if (selectDefault) {
    editor.removeAttribute(selectDefault);
  }

  const isTwoWay = selection?.name === '[(selectedTabIndex)]';
  const outputExpression = selectedTabIndexChange
    ? getAttributeValue(template, selectedTabIndexChange)
    : undefined;

  if (positions) {
    if (selection?.name === 'selectedTabIndex' && numericSelection === undefined) {
      warnAt(
        context,
        filePath,
        selection,
        'A non-numeric unbound `selectedTabIndex` value cannot be migrated automatically.'
      );
    } else if (selectionExpression && numericSelection === undefined) {
      for (const position of positions) {
        addActiveAttribute(
          position.tab.element,
          `${parenthesizeExpression(selectionExpression)} === ${position.index}`,
          editor,
          filePath,
          context
        );
      }
    } else if (numericSelection !== undefined && numericSelection >= 0) {
      const selectedPosition = positions.find(position => position.index === `${numericSelection}`);
      if (selectedPosition) {
        addActiveAttribute(selectedPosition.tab.element, 'true', editor, filePath, context);
      } else if (positions.some(position => position.index === '$index')) {
        addActiveAttribute(
          positions[0].tab.element,
          `${numericSelection} === $index`,
          editor,
          filePath,
          context
        );
      } else {
        warnAt(
          context,
          filePath,
          selection!,
          `The selected tab index ${numericSelection} is outside the statically known tab range.`
        );
      }
    } else if (!selection) {
      migrateDefaultSelection(template, selectDefault, positions, editor, filePath, context);
    }

    if (canMigrateSelection && (isTwoWay || outputExpression !== undefined)) {
      const assignableSelection =
        !isTwoWay || !selectionExpression || isAssignableExpression(selectionExpression);
      if (!assignableSelection) {
        warnAt(
          context,
          filePath,
          selection!,
          'The two-way `selectedTabIndex` expression is not assignable; its update could not be migrated.'
        );
      }
      for (const position of positions) {
        const statements: string[] = [];
        if (isTwoWay && selectionExpression && assignableSelection) {
          statements.push(`$event && (${selectionExpression} = ${position.index})`);
        }
        if (outputExpression !== undefined) {
          const migratedOutput = outputExpression.replace(/\$event\b/g, position.index);
          statements.push(guardEventExpression(migratedOutput));
        }
        if (statements.length) {
          appendEventAttribute(position.tab.element, 'activeChange', statements.join('; '), editor);
        }
      }
    }
  }
};

const migrateDefaultSelection = (
  template: string,
  selectDefault: Attribute | undefined,
  positions: TabPosition[],
  editor: TemplateEditor,
  filePath: string,
  context: SchematicContext
): void => {
  if (!positions.length) {
    return;
  }

  const existingActive = positions
    .map(position => findInput(position.tab.element, 'active'))
    .find((attribute): attribute is Attribute => !!attribute);
  if (existingActive) {
    warnAt(
      context,
      filePath,
      existingActive,
      'The existing `active` binding was preserved; review it against the migrated default selection.'
    );
    return;
  }

  if (!selectDefault) {
    const first = positions[0];
    addActiveAttribute(
      first.tab.element,
      first.index === '$index' ? '$first' : 'true',
      editor,
      filePath,
      context
    );
    return;
  }

  const value = getAttributeValue(template, selectDefault).trim();
  if (selectDefault.name === 'selectDefaultTab') {
    if (!value || value === 'true') {
      const first = positions[0];
      addActiveAttribute(
        first.tab.element,
        first.index === '$index' ? '$first' : 'true',
        editor,
        filePath,
        context
      );
    } else if (value !== 'false') {
      warnAt(
        context,
        filePath,
        selectDefault,
        'The unbound `selectDefaultTab` value is not a recognized boolean.'
      );
    }
    return;
  }

  if (value === 'false') {
    return;
  }
  const first = positions[0];
  if (value === 'true') {
    addActiveAttribute(
      first.tab.element,
      first.index === '$index' ? '$first' : 'true',
      editor,
      filePath,
      context
    );
  } else {
    warnAt(
      context,
      filePath,
      selectDefault,
      'A bound `selectDefaultTab` expression cannot be migrated automatically.'
    );
  }
};

const addActiveAttribute = (
  element: Element,
  value: string,
  editor: TemplateEditor,
  filePath: string,
  context: SchematicContext
): void => {
  const existing = findInput(element, 'active');
  if (existing) {
    warnAt(
      context,
      filePath,
      existing,
      'The existing `active` binding was preserved; review it against the migrated tab index state.'
    );
    return;
  }
  setAttribute(element, 'active', value, editor);
};

const getTabPositions = (tabset: TabsetUsage): TabPosition[] | undefined => {
  const componentTabs = tabset.tabs.filter(tab => !tab.routerBased);
  if (!componentTabs.length) {
    return [];
  }

  if (
    componentTabs.length === 1 &&
    componentTabs.length === tabset.tabs.length &&
    componentTabs[0].relativeBlocks.length === 1 &&
    componentTabs[0].relativeBlocks[0].name === 'for' &&
    !componentTabs[0].structuralAncestor
  ) {
    return [{ tab: componentTabs[0], index: '$index' }];
  }

  if (
    componentTabs.every(tab => !tab.relativeBlocks.length && !tab.structuralAncestor) &&
    componentTabs.length === tabset.tabs.length
  ) {
    return componentTabs.map((tab, index) => ({ tab, index: `${index}` }));
  }

  return undefined;
};

const migrateHeading = (
  element: Element,
  editor: TemplateEditor,
  filePath: string,
  context: SchematicContext
): void => {
  const heading = findInput(element, 'heading');
  const iconAltText = findInput(element, 'iconAltText');
  if (iconAltText && !heading) {
    const value = iconAltText.valueSpan?.toString() ?? '';
    const replacement = iconAltText.name === 'iconAltText' ? 'heading' : '[heading]';
    editor.replace(
      iconAltText.sourceSpan.start.offset,
      iconAltText.sourceSpan.end.offset,
      value ? `${replacement}="${escapeAttributeValue(value)}"` : replacement
    );
  } else if (iconAltText) {
    editor.removeAttribute(iconAltText);
  } else if (!heading) {
    warnAt(
      context,
      filePath,
      element,
      'The migrated tab requires a `heading` input, but neither `heading` nor `iconAltText` was found.'
    );
  }
};

const setAttribute = (
  element: Element,
  name: string,
  value: string,
  editor: TemplateEditor
): void => {
  const existing = findInput(element, name);
  const escapedValue = escapeAttributeValue(value);
  if (!existing) {
    editor.insert(
      element.startSourceSpan.start.offset + 1 + element.name.length,
      ` [${name}]="${escapedValue}"`
    );
    return;
  }

  editor.replace(
    existing.sourceSpan.start.offset,
    existing.sourceSpan.end.offset,
    `[${name}]="${escapedValue}"`
  );
};

const appendEventAttribute = (
  element: Element,
  name: string,
  value: string,
  editor: TemplateEditor
): void => {
  const existing = getAttribute(element, `(${name})`);
  const combinedValue = existing?.valueSpan ? `${existing.valueSpan.toString()}; ${value}` : value;
  const escapedValue = escapeAttributeValue(combinedValue);
  if (existing) {
    editor.replace(
      existing.sourceSpan.start.offset,
      existing.sourceSpan.end.offset,
      `(${name})="${escapedValue}"`
    );
  } else {
    editor.insert(
      element.startSourceSpan.start.offset + 1 + element.name.length,
      ` (${name})="${escapedValue}"`
    );
  }
};

const renameElement = (
  element: Element,
  from: string,
  to: string,
  editor: TemplateEditor
): void => {
  editor.replace(
    element.startSourceSpan.start.offset + 1,
    element.startSourceSpan.start.offset + 1 + from.length,
    to
  );
  if (element.endSourceSpan && element.startSourceSpan.start !== element.endSourceSpan.start) {
    editor.replace(
      element.endSourceSpan.start.offset + 2,
      element.endSourceSpan.start.offset + 2 + from.length,
      to
    );
  }
};

const migrateImports = (
  sourceFile: ts.SourceFile,
  sourceContent: string,
  uses: TemplateUses,
  filePath: string,
  context: SchematicContext
): TextEdit[] => {
  const relevantImports: ts.ImportDeclaration[] = [];
  const currentImports = new Map<string, ImportSpecifierData[]>();
  const legacyImports = new Map<string, ImportSpecifierData[]>();
  const identifierReplacements = new Map<string, string>();
  const splitIdentifierReplacements = new Map<string, string[]>();
  const legacyModuleLocals = new Set<string>();
  let firstLegacyCurrentModule: string | undefined;
  let hasLegacyImport = false;

  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      !CURRENT_IMPORT_PATTERN.test(statement.moduleSpecifier.text) ||
      !statement.importClause?.namedBindings ||
      !ts.isNamedImports(statement.importClause.namedBindings)
    ) {
      continue;
    }

    relevantImports.push(statement);
    appendImportSpecifiers(
      currentImports,
      statement.moduleSpecifier.text,
      statement.importClause.namedBindings.elements.map(toImportSpecifierData)
    );
  }

  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      !statement.importClause?.namedBindings ||
      !ts.isNamedImports(statement.importClause.namedBindings)
    ) {
      continue;
    }

    const moduleName = statement.moduleSpecifier.text;
    if (!LEGACY_IMPORT_PATTERN.test(moduleName)) {
      continue;
    }

    relevantImports.push(statement);
    const specifiers = statement.importClause.namedBindings.elements.map(toImportSpecifierData);
    hasLegacyImport = true;
    const currentModule = moduleName.replace(/tabs-legacy$/, 'tabs');
    firstLegacyCurrentModule ??= currentModule;
    for (const specifier of specifiers) {
      if (specifier.imported === 'SiTabLegacyComponent') {
        const targets = uses.tabLink
          ? uses.tab
            ? ['SiTabComponent', 'SiTabLinkComponent']
            : ['SiTabLinkComponent']
          : ['SiTabComponent'];
        if (targets.length === 1) {
          const preferredLocal =
            specifier.local === specifier.imported ? targets[0] : specifier.local;
          const local = ensureImport(
            currentImports,
            currentModule,
            targets[0],
            preferredLocal,
            specifier.typeOnly
          );
          if (specifier.local !== local) {
            identifierReplacements.set(specifier.local, local);
          }
        } else {
          const locals = targets.map(target =>
            ensureImport(currentImports, currentModule, target, target, specifier.typeOnly)
          );
          splitIdentifierReplacements.set(specifier.local, locals);
        }
      } else if (specifier.imported === 'SiTabsetLegacyComponent') {
        const preferredLocal =
          specifier.local === specifier.imported ? 'SiTabsetComponent' : specifier.local;
        const local = ensureImport(
          currentImports,
          currentModule,
          'SiTabsetComponent',
          preferredLocal,
          specifier.typeOnly
        );
        if (specifier.local !== local) {
          identifierReplacements.set(specifier.local, local);
        }
      } else if (specifier.imported === 'SiTabsLegacyModule') {
        legacyModuleLocals.add(specifier.local);
      } else {
        appendImportSpecifiers(legacyImports, moduleName, [specifier]);
        if (specifier.imported === 'SiTabDeselectionEvent') {
          context.logger.warn(
            `${filePath}: SiTabDeselectionEvent has no direct replacement. Convert the handler to a canDeactivate guard.`
          );
        }
      }
    }
  }

  if (!hasLegacyImport) {
    return [];
  }

  const defaultCurrentModule =
    [...currentImports.keys()][0] ??
    firstLegacyCurrentModule ??
    [...legacyImports.keys()][0]?.replace(/tabs-legacy$/, 'tabs') ??
    '@siemens/element-ng/tabs';
  if (uses.tab) {
    ensureImport(currentImports, defaultCurrentModule, 'SiTabComponent');
  }
  if (uses.tabset) {
    ensureImport(currentImports, defaultCurrentModule, 'SiTabsetComponent');
  }
  if (uses.tabLink) {
    ensureImport(currentImports, defaultCurrentModule, 'SiTabLinkComponent');
  }

  const moduleReplacementImports =
    uses.tab || uses.tabLink || uses.tabset
      ? [
          ...(uses.tab ? ['SiTabComponent'] : []),
          ...(uses.tabLink ? ['SiTabLinkComponent'] : []),
          ...(uses.tabset ? ['SiTabsetComponent'] : [])
        ]
      : ['SiTabComponent', 'SiTabsetComponent'];
  const moduleReplacementNames = legacyModuleLocals.size
    ? moduleReplacementImports.map(name => ensureImport(currentImports, defaultCurrentModule, name))
    : [];
  const moduleReplacement = moduleReplacementNames.join(', ');

  const edits: TextEdit[] = [];
  const unsupportedModuleLocals = new Set<string>();
  const unsupportedSplitLocals = new Set<string>();
  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node)) {
      return;
    }
    if (ts.isIdentifier(node)) {
      const replacement = identifierReplacements.get(node.text);
      if (replacement) {
        edits.push({ start: node.getStart(sourceFile), end: node.getEnd(), text: replacement });
        return;
      }
      const splitReplacement = splitIdentifierReplacements.get(node.text);
      if (splitReplacement) {
        edits.push({
          start: node.getStart(sourceFile),
          end: node.getEnd(),
          text: ts.isArrayLiteralExpression(node.parent)
            ? splitReplacement.join(', ')
            : splitReplacement[0]
        });
        if (!ts.isArrayLiteralExpression(node.parent)) {
          unsupportedSplitLocals.add(node.text);
        }
        return;
      }
      if (legacyModuleLocals.has(node.text)) {
        if (ts.isArrayLiteralExpression(node.parent)) {
          edits.push({
            start: node.getStart(sourceFile),
            end: node.getEnd(),
            text: moduleReplacement
          });
        } else {
          unsupportedModuleLocals.add(node.text);
        }
        return;
      }
    }
    ts.forEachChild(node, visit);
  };
  sourceFile.forEachChild(visit);

  if (unsupportedModuleLocals.size) {
    for (const local of unsupportedModuleLocals) {
      appendImportSpecifiers(legacyImports, defaultCurrentModule.replace(/tabs$/, 'tabs-legacy'), [
        { imported: 'SiTabsLegacyModule', local, typeOnly: false }
      ]);
    }
    context.logger.warn(
      `${filePath}: SiTabsLegacyModule is used outside an Angular imports array and requires manual migration.`
    );
  }
  if (unsupportedSplitLocals.size) {
    context.logger.warn(
      `${filePath}: A legacy tab component is used outside an Angular imports array while the template uses both content and router tabs. The reference was migrated to SiTabComponent and requires review.`
    );
  }

  const replacement = [...renderImports(currentImports), ...renderImports(legacyImports)].join(
    '\n'
  );
  const [firstImport, ...remainingImports] = relevantImports;
  edits.push({
    start: firstImport.getStart(sourceFile),
    end: firstImport.getEnd(),
    text: replacement
  });
  for (const importDeclaration of remainingImports) {
    edits.push({
      start: importDeclaration.getStart(sourceFile),
      end: importDeclaration.getEnd(),
      text: ''
    });
  }

  return edits.filter(edit => sourceContent.substring(edit.start, edit.end) !== edit.text);
};

const renderImports = (imports: Map<string, ImportSpecifierData[]>): string[] => {
  return [...imports]
    .filter(([, specifiers]) => specifiers.length)
    .map(([moduleName, specifiers]) => {
      const unique = deduplicateSpecifiers(specifiers);
      const rendered = unique
        .map(specifier => {
          const typePrefix = specifier.typeOnly ? 'type ' : '';
          const alias = specifier.imported === specifier.local ? '' : ` as ${specifier.local}`;
          return `${typePrefix}${specifier.imported}${alias}`;
        })
        .join(', ');
      return `import { ${rendered} } from '${moduleName}';`;
    });
};

const toImportSpecifierData = (specifier: ts.ImportSpecifier): ImportSpecifierData => ({
  imported: specifier.propertyName?.text ?? specifier.name.text,
  local: specifier.name.text,
  typeOnly: specifier.isTypeOnly
});

const appendImportSpecifiers = (
  imports: Map<string, ImportSpecifierData[]>,
  moduleName: string,
  specifiers: ImportSpecifierData[]
): void => {
  imports.set(moduleName, [...(imports.get(moduleName) ?? []), ...specifiers]);
};

const ensureImport = (
  imports: Map<string, ImportSpecifierData[]>,
  moduleName: string,
  imported: string,
  preferredLocal = imported,
  typeOnly = false
): string => {
  for (const specifiers of imports.values()) {
    const existing = specifiers.find(specifier => specifier.imported === imported);
    if (existing) {
      return existing.local;
    }
  }
  appendImportSpecifiers(imports, moduleName, [{ imported, local: preferredLocal, typeOnly }]);
  return preferredLocal;
};

const deduplicateSpecifiers = (specifiers: ImportSpecifierData[]): ImportSpecifierData[] => {
  const seen = new Set<string>();
  return specifiers.filter(specifier => {
    const key = `${specifier.typeOnly}:${specifier.imported}:${specifier.local}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const getAttribute = (element: Element, name: string): Attribute | undefined =>
  element.attrs.find(attribute => attribute.name === name);

const findInput = (element: Element, name: string): Attribute | undefined =>
  element.attrs.find(attribute =>
    [name, `[${name}]`, `bind-${name}`, `[(${name})]`].includes(attribute.name)
  );

const getAttributeValue = (template: string, attribute: Attribute): string =>
  attribute.valueSpan
    ? template.substring(attribute.valueSpan.start.offset, attribute.valueSpan.end.offset)
    : '';

const parseInteger = (value: string): number | undefined => {
  const normalized = value.trim();
  return /^-?\d+$/.test(normalized) ? Number.parseInt(normalized, 10) : undefined;
};

const parenthesizeExpression = (expression: string): string => {
  const normalized = expression.trim();
  return /^[A-Za-z_$][\w$]*(?:(?:\.|\?\.)[A-Za-z_$][\w$]*|\(\))*$/.test(normalized)
    ? normalized
    : `(${normalized})`;
};

const isAssignableExpression = (expression: string): boolean =>
  /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\[[^\]]+\])*$/.test(expression.trim());

const hasStructuralTemplateAttribute = (element: Element): boolean =>
  element.name === 'ng-template' ||
  element.attrs.some(attribute =>
    [
      '*ngFor',
      '*ngIf',
      '*ngSwitchCase',
      '*ngSwitchDefault',
      '[ngForOf]',
      '[ngSwitch]',
      'ngFor'
    ].includes(attribute.name)
  );

const escapeAttributeValue = (value: string): string => value.replaceAll('"', '&quot;');

const guardEventExpression = (value: string): string =>
  splitStatements(value)
    .map(statement => `$event && (${statement})`)
    .join('; ');

const splitStatements = (value: string): string[] => {
  const statements: string[] = [];
  let start = 0;
  let depth = 0;
  let quote: string | undefined;
  let escaped = false;

  for (let index = 0; index < value.length; index++) {
    const character = value[index];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === quote) {
        quote = undefined;
      }
      continue;
    }
    if (character === "'" || character === '"' || character === '`') {
      quote = character;
    } else if (character === '(' || character === '[' || character === '{') {
      depth++;
    } else if (character === ')' || character === ']' || character === '}') {
      depth--;
    } else if (character === ';' && depth === 0) {
      const statement = value.substring(start, index).trim();
      if (statement) {
        statements.push(statement);
      }
      start = index + 1;
    }
  }

  const statement = value.substring(start).trim();
  if (statement) {
    statements.push(statement);
  }
  return statements;
};

const mergeUses = (target: TemplateUses, source: TemplateUses): void => {
  target.tab ||= source.tab;
  target.tabLink ||= source.tabLink;
  target.tabset ||= source.tabset;
};

const warnAt = (
  context: SchematicContext,
  filePath: string,
  node: Attribute | Element,
  message: string
): void => {
  const location = node.sourceSpan.start;
  context.logger.warn(`${filePath}:${location.line + 1}:${location.col + 1}: ${message}`);
};

const applyTextEdits = (content: string, edits: TextEdit[]): string => {
  const ordered = [...edits].sort(
    (left, right) => right.start - left.start || right.end - left.end
  );
  let result = content;
  let previousStart = content.length + 1;
  for (const edit of ordered) {
    if (edit.end > previousStart) {
      throw new Error(`Overlapping migration edits at offsets ${edit.start}-${edit.end}.`);
    }
    result = result.substring(0, edit.start) + edit.text + result.substring(edit.end);
    previousStart = edit.start;
  }
  return result;
};
