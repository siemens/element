/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  ArrowFunction,
  AST,
  ASTWithSource,
  Attribute,
  BindingPipe,
  Block,
  Call,
  Chain,
  Element,
  EmptyExpr,
  HtmlParser,
  ImplicitReceiver,
  LetDeclaration,
  Lexer,
  LiteralMap,
  LiteralPrimitive,
  ParseLocation,
  Parser,
  ParseSourceFile,
  ParseSourceSpan,
  PrefixNot,
  PropertyRead,
  RecursiveVisitor,
  SafeCall,
  SafePropertyRead,
  ThisReceiver,
  visitAll
} from '@angular/compiler';

import { applyTextEdits, TextEdit } from './text-edits.js';

const SEARCH_BAR = 'si-search-bar';
const INPUT_DIRECTIVE_ATTRIBUTE = 'siSearchBarInput';
const DEFAULT_DEBOUNCE_TIME = 400;
const MAX_LINE_LENGTH = 100;
const DEPRECATED_INPUTS = ['placeholder', 'maxlength', 'readonly', 'disabled', 'value'];
const BEHAVIOR_INPUTS = ['debounceTime', 'prohibitedCharacters'];
const CLASSIC_FORM_INPUTS = [
  'ngModel',
  'formControl',
  'formControlName',
  'ngModelOptions',
  'name',
  'required',
  'minlength',
  'pattern',
  'email'
];
const MANUAL_MIGRATION_HINT =
  'Migrate it manually by projecting an `<input siSearchBarInput>` and binding a form field to it.';

/** Answers questions about the component class that owns a template. */
export interface ComponentContext {
  /** Explains why no class members can be generated for this component. */
  readonly generationBlocker?: string;
  /** Explains why `SiSearchBarInputDirective` cannot be added to the component imports. */
  readonly directiveImportBlocker?: string;
  /** Whether the class (including inherited members) declares a member with this name. */
  hasMember(name: string): boolean;
  /** The kind of value of a signal member, or `undefined` if the member is no signal. */
  signalValueKind(name: string): 'boolean' | 'number' | 'other' | undefined;
  /** Whether reading the member (or calling it, if `call` is set) always yields a string. */
  isNonNullableString(name: string, call: boolean): boolean;
}

export type SignalFormsFunction = 'debounce' | 'disabled' | 'maxLength' | 'pattern' | 'readonly';

export interface SignalFormsRule {
  fn: SignalFormsFunction;
  /** Arguments after the schema path. */
  args: string[];
}

/** Signal Forms field that replaces the `searchChange` output of one search bar. */
export interface GeneratedSearchField {
  /** Name of the model signal. Also used for the local variable in the effect. */
  termName: string;
  /** Name of the field tree that is bound to the projected input. */
  fieldName: string;
  /** TypeScript expression for the initial model value. */
  initialValue: string;
  rules: SignalFormsRule[];
  /** Statements of the former `searchChange` handler. The search term is `termName`. */
  statements: string[];
  /** Whether the single statement can be used as an arrow function expression body. */
  expressionBody: boolean;
  /** Whether the handler only runs for valid values. */
  validate: boolean;
}

export interface TemplateMigrationOptions {
  template: string;
  /** Converts an offset in the template into a `path:line:column` location. */
  location: (offset: number) => string;
  warn: (message: string) => void;
  component?: ComponentContext;
  /** Quote of the string literal that contains an inline template. Template literals have none. */
  quote?: '"' | "'";
}

export interface TemplateMigrationResult {
  content: string;
  changed: boolean;
  migrated: number;
  skipped: number;
  fields: GeneratedSearchField[];
}

type BindingKind =
  | 'attribute'
  | 'event'
  | 'i18n'
  | 'other'
  | 'property'
  | 'reference'
  | 'static'
  | 'structural'
  | 'twoWay';

interface TemplateAttribute {
  attribute: Attribute;
  kind: BindingKind;
  key: string;
  text: string;
  /** Position in the start tag. */
  order: number;
}

interface InputAttribute {
  text: string;
  kind: BindingKind;
  order: number;
  source?: TemplateAttribute;
}

interface SearchBarUsage {
  element: Element;
  ancestors: (Block | Element)[];
}

interface MigrationContext extends TemplateMigrationOptions {
  localNames: Set<string>;
  reservedNames: Set<string>;
  eol: string;
}

type FormKind = 'classic' | 'none' | 'signal';

type Outcome =
  | { kind: 'none' }
  | { kind: 'skip'; reason: string }
  | { kind: 'migrate'; edits: TextEdit[]; warnings: string[]; field?: GeneratedSearchField };

class SearchBarCollector extends RecursiveVisitor {
  readonly searchBars: SearchBarUsage[] = [];
  readonly localNames = new Set<string>();
  private readonly ancestors: (Block | Element)[] = [];

  override visitElement(element: Element, context: unknown): unknown {
    element.attrs.forEach(attribute => this.collectAttributeNames(attribute));
    if (element.name === SEARCH_BAR) {
      this.searchBars.push({ element, ancestors: [...this.ancestors] });
    }

    this.ancestors.push(element);
    const result = super.visitElement(element, context);
    this.ancestors.pop();
    return result;
  }

  override visitBlock(block: Block, context: unknown): unknown {
    block.parameters.forEach((parameter, index) => {
      const expression = parameter.expression;
      const forItem = /^\s*([A-Za-z_$][\w$]*)\s+of\b/.exec(expression);
      if (block.name === 'for' && index === 0 && forItem) {
        this.localNames.add(forItem[1]);
      }
      const alias = /^\s*as\s+([A-Za-z_$][\w$]*)/.exec(expression);
      if (alias) {
        this.localNames.add(alias[1]);
      }
      const letDeclarations = /^\s*let\s+([\s\S]*)$/.exec(expression);
      for (const declaration of letDeclarations?.[1].split(',') ?? []) {
        const name = /^\s*([A-Za-z_$][\w$]*)/.exec(declaration);
        if (name) {
          this.localNames.add(name[1]);
        }
      }
    });

    this.ancestors.push(block);
    const result = super.visitBlock(block, context);
    this.ancestors.pop();
    return result;
  }

  override visitLetDeclaration(declaration: LetDeclaration, context: unknown): void {
    this.localNames.add(declaration.name);
    super.visitLetDeclaration(declaration, context);
  }

  private collectAttributeNames(attribute: Attribute): void {
    const { kind, key } = parseAttributeName(attribute.name);
    if (kind === 'reference') {
      this.localNames.add(key);
    } else if (attribute.name.startsWith('let-')) {
      this.localNames.add(attribute.name.substring(4));
    } else if (kind === 'structural') {
      for (const match of attribute.value.matchAll(/\b(?:let|as)\s+([A-Za-z_$][\w$]*)/g)) {
        this.localNames.add(match[1]);
      }
    }
  }
}

/**
 * Migrates all `si-search-bar` elements of a template from the deprecated inputs and outputs
 * to a content-projected `<input siSearchBarInput>`.
 */
export const migrateSearchBarTemplate = (
  options: TemplateMigrationOptions
): TemplateMigrationResult => {
  const result: TemplateMigrationResult = {
    content: options.template,
    changed: false,
    migrated: 0,
    skipped: 0,
    fields: []
  };
  if (!options.template.includes(SEARCH_BAR)) {
    return result;
  }

  const parsed = new HtmlParser().parse(options.template, 'template.html', {
    tokenizeExpansionForms: true,
    tokenizeBlocks: true,
    preserveLineEndings: true
  });
  if (parsed.errors.length) {
    options.warn(
      `${options.location(0)}: The template could not be parsed, so its search bars were not migrated.`
    );
    return result;
  }

  const collector = new SearchBarCollector();
  visitAll(collector, parsed.rootNodes);
  const context: MigrationContext = {
    ...options,
    localNames: collector.localNames,
    reservedNames: new Set(),
    eol: options.template.includes('\r\n') ? '\r\n' : '\n'
  };

  const edits: TextEdit[] = [];
  for (const usage of collector.searchBars) {
    const location = options.location(usage.element.startSourceSpan.start.offset);
    const outcome = migrateSearchBar(usage, context);
    if (outcome.kind === 'skip') {
      result.skipped++;
      options.warn(`${location}: Skipped si-search-bar. ${outcome.reason}`);
    } else if (outcome.kind === 'migrate') {
      result.migrated++;
      edits.push(...outcome.edits);
      outcome.warnings.forEach(warning => options.warn(`${location}: ${warning}`));
      if (outcome.field) {
        result.fields.push(outcome.field);
      }
    }
  }

  if (edits.length) {
    result.content = applyTextEdits(options.template, edits);
    result.changed = result.content !== options.template;
  }
  return result;
};

const migrateSearchBar = (usage: SearchBarUsage, context: MigrationContext): Outcome => {
  const { element } = usage;
  const attributes: TemplateAttribute[] = element.attrs.map((attribute, order) => ({
    attribute,
    ...parseAttributeName(attribute.name),
    text: getSourceText(context.template, attribute),
    order
  }));
  const searchChange = attributes.find(
    attribute => attribute.kind === 'event' && attribute.key === 'searchChange'
  );
  const deprecatedInputs = attributes.filter(attribute => isInput(attribute, ...DEPRECATED_INPUTS));
  const prohibitedCharacters = findInput(attributes, 'prohibitedCharacters');
  const formKind: FormKind = attributes.some(attribute => isInput(attribute, 'formField'))
    ? 'signal'
    : attributes.some(
          attribute =>
            isInput(attribute, 'ngModel', 'formControlName', 'formControl') ||
            (attribute.kind === 'twoWay' && attribute.key === 'ngModel')
        )
      ? 'classic'
      : 'none';
  const hasTypeahead = attributes.some(attribute => isInput(attribute, 'siTypeahead'));
  const movable = attributes.filter(attribute =>
    isMovableAttribute(attribute, formKind, hasTypeahead)
  );
  const hasDeprecatedUsage =
    !!searchChange ||
    deprecatedInputs.length > 0 ||
    attributes.some(attribute => isInput(attribute, ...BEHAVIOR_INPUTS));

  const projectsInput = element.children.some(
    child =>
      child instanceof Element &&
      child.name === 'input' &&
      child.attrs.some(attribute => attribute.name === INPUT_DIRECTIVE_ATTRIBUTE)
  );
  if (projectsInput) {
    return hasDeprecatedUsage
      ? {
          kind: 'skip',
          reason:
            'It already projects an input with `siSearchBarInput`. Move its remaining deprecated inputs and outputs to that input manually.'
        }
      : { kind: 'none' };
  }
  if (!hasDeprecatedUsage && !movable.length) {
    return { kind: 'none' };
  }
  if (context.component?.directiveImportBlocker) {
    return {
      kind: 'skip',
      reason: `\`SiSearchBarInputDirective\` cannot be added to the component imports because ${context.component.directiveImportBlocker}. ${MANUAL_MIGRATION_HINT}`
    };
  }
  if (element.comments?.length || element.directives?.length) {
    return {
      kind: 'skip',
      reason: `Its start tag contains comments or selectorless directives. ${MANUAL_MIGRATION_HINT}`
    };
  }

  if (searchChange) {
    if (formKind !== 'none') {
      return {
        kind: 'skip',
        reason: `It uses \`(searchChange)\` together with a form binding. ${MANUAL_MIGRATION_HINT}`
      };
    }
    return migrateToSignalForm(usage, attributes, movable, searchChange, context);
  }

  if (
    formKind !== 'none' &&
    prohibitedCharacters &&
    getLiteral(prohibitedCharacters)?.value !== ''
  ) {
    return {
      kind: 'skip',
      reason: `It uses \`prohibitedCharacters\` together with a form binding. Add a pattern validator to the form control and ignore invalid values instead. ${MANUAL_MIGRATION_HINT}`
    };
  }
  if (formKind === 'signal') {
    // Signal Forms manage these properties of a form field input.
    const restricted = deprecatedInputs.filter(attribute => attribute.key !== 'placeholder');
    if (restricted.length) {
      const names = restricted.map(attribute => `\`${attribute.key}\``).join(', ');
      return {
        kind: 'skip',
        reason: `Signal Forms do not allow ${names} on an input with \`[formField]\`. Configure them in the form schema instead. ${MANUAL_MIGRATION_HINT}`
      };
    }
  }

  const inputAttributes: InputAttribute[] = [
    ...movable.map(toInputAttribute),
    ...deprecatedInputs.map(attribute => ({
      ...toInputAttribute(attribute),
      text: migrateDeprecatedInput(attribute, formKind, context)
    }))
  ];
  const warnings: string[] = [];
  if (formKind !== 'none') {
    const debounceTimeAttribute = findInput(attributes, 'debounceTime');
    const debounceTime = getDebounceTime(debounceTimeAttribute);
    if (debounceTime !== 0) {
      const duration = debounceTime ?? `\`${debounceTimeAttribute!.attribute.value.trim()}\``;
      warnings.push(
        `The search bar debounced form value changes by ${duration} ms. The projected input updates the form value immediately. Debounce the value changes in your code if needed.`
      );
    }
  }

  const consumed = attributes.filter(attribute => isInput(attribute, ...BEHAVIOR_INPUTS));
  return {
    kind: 'migrate',
    edits: renderMigration(element, attributes, inputAttributes, consumed, context),
    warnings
  };
};

const migrateToSignalForm = (
  usage: SearchBarUsage,
  attributes: TemplateAttribute[],
  movable: TemplateAttribute[],
  searchChange: TemplateAttribute,
  context: MigrationContext
): Outcome => {
  const skip = (reason: string): Outcome => ({
    kind: 'skip',
    reason: `${reason} ${MANUAL_MIGRATION_HINT}`
  });
  const component = context.component;
  if (!component || component.generationBlocker) {
    return skip(
      `Its \`(searchChange)\` output is replaced with a Signal Forms field in the component class, but ${
        component?.generationBlocker ?? 'the component class could not be determined'
      }.`
    );
  }

  const repeatedContext = getRepeatedContext(usage);
  if (repeatedContext) {
    return skip(
      `It is inside ${repeatedContext}, so one Signal Forms field cannot replace its \`(searchChange)\` output.`
    );
  }

  const conditionalContext = getConditionalContext(usage);
  if (conditionalContext) {
    return skip(
      `It is inside ${conditionalContext}, where its \`(searchChange)\` handler may depend on template type narrowing.`
    );
  }

  const rules: SignalFormsRule[] = [];
  const debounceTime = getDebounceTime(findInput(attributes, 'debounceTime'));
  if (debounceTime === undefined) {
    return skip('Its `debounceTime` is not a constant number.');
  }
  if (debounceTime > 0) {
    rules.push({ fn: 'debounce', args: [`${debounceTime}`] });
  }

  for (const name of ['disabled', 'readonly'] as const) {
    const attribute = findInput(attributes, name);
    const literal = attribute && getLiteral(attribute);
    if (!attribute || (literal && !booleanAttribute(literal.value))) {
      continue;
    }
    if (literal) {
      rules.push({ fn: name, args: [] });
      continue;
    }
    const signalRead = getSignalRead(attribute, context);
    if (!signalRead || (!signalRead.negated && signalRead.valueKind !== 'boolean')) {
      return skip(`Its \`${name}\` input is neither a constant nor a boolean signal.`);
    }
    rules.push({ fn: name, args: [`{ when: () => ${signalRead.expression} }`] });
  }

  const maxlength = findInput(attributes, 'maxlength');
  if (maxlength) {
    const literal = getLiteral(maxlength);
    const signalRead = literal ? undefined : getSignalRead(maxlength, context);
    if (literal) {
      const value = numberAttribute(literal.value);
      if (!Number.isNaN(value)) {
        rules.push({ fn: 'maxLength', args: [`${value}`] });
      }
    } else if (signalRead && !signalRead.negated && signalRead.valueKind === 'number') {
      rules.push({ fn: 'maxLength', args: [`() => ${signalRead.expression}`] });
    } else {
      return skip('Its `maxlength` input is neither a constant nor a number signal.');
    }
  }

  let validate = false;
  const prohibitedCharacters = findInput(attributes, 'prohibitedCharacters');
  if (prohibitedCharacters) {
    const literal = getLiteral(prohibitedCharacters);
    if (!literal || (literal.value != null && typeof literal.value !== 'string')) {
      return skip('Its `prohibitedCharacters` input is not a constant string.');
    }
    if (literal.value) {
      rules.push({
        fn: 'pattern',
        args: [createProhibitedCharactersPattern(literal.value as string)]
      });
      validate = true;
    }
  }

  let initialValue = `''`;
  const value = findInput(attributes, 'value');
  if (value) {
    const literal = getLiteral(value);
    if (!literal || (literal.value != null && typeof literal.value !== 'string')) {
      return skip('Its `value` input is not a constant string.');
    }
    initialValue = toStringLiteral((literal.value as string | null | undefined) ?? '');
  }

  const handler = convertAction(searchChange.attribute.value, context.localNames);
  if (typeof handler === 'string') {
    return skip(`Its \`(searchChange)\` handler ${handler}.`);
  }

  const { termName, fieldName } = reserveFieldNames(component, context);
  const field: GeneratedSearchField = {
    termName,
    fieldName,
    initialValue,
    rules,
    statements: handler.map(statement => statement.text.replaceAll(EVENT_PLACEHOLDER, termName)),
    expressionBody: handler.length === 1 && handler[0].isCall,
    validate
  };

  const placeholder = findInput(attributes, 'placeholder');
  const formField = `[formField]="${fieldName}"`;
  const inputAttributes: InputAttribute[] = [
    ...movable.map(toInputAttribute),
    ...(placeholder ? [toInputAttribute(placeholder)] : []),
    {
      kind: 'property',
      text: context.quote ? escapeQuote(formField, context.quote) : formField,
      order: Number.MAX_SAFE_INTEGER
    }
  ];
  const consumed = attributes.filter(
    attribute =>
      attribute === searchChange ||
      (attribute !== placeholder && isInput(attribute, ...BEHAVIOR_INPUTS, ...DEPRECATED_INPUTS))
  );

  return {
    kind: 'migrate',
    edits: renderMigration(usage.element, attributes, inputAttributes, consumed, context),
    warnings: [],
    field
  };
};

const reserveFieldNames = (
  component: ComponentContext,
  context: MigrationContext
): { termName: string; fieldName: string } => {
  const isTaken = (name: string): boolean =>
    component.hasMember(name) || context.localNames.has(name) || context.reservedNames.has(name);
  for (let index = 1; ; index++) {
    const suffix = index === 1 ? '' : `${index}`;
    const termName = `searchTerm${suffix}`;
    const fieldName = `searchField${suffix}`;
    if (!isTaken(termName) && !isTaken(fieldName)) {
      context.reservedNames.add(termName);
      context.reservedNames.add(fieldName);
      return { termName, fieldName };
    }
  }
};

const isInput = (attribute: TemplateAttribute, ...keys: string[]): boolean =>
  (attribute.kind === 'static' || attribute.kind === 'property') && keys.includes(attribute.key);

const findInput = (attributes: TemplateAttribute[], key: string): TemplateAttribute | undefined =>
  attributes.find(attribute => isInput(attribute, key));

const toInputAttribute = (attribute: TemplateAttribute): InputAttribute => ({
  text: attribute.text,
  kind: attribute.kind,
  order: attribute.order,
  source: attribute
});

const isMovableAttribute = (
  attribute: TemplateAttribute,
  formKind: FormKind,
  hasTypeahead: boolean
): boolean => {
  const { kind, key } = attribute;
  if (kind === 'reference') {
    const exportName = attribute.attribute.value;
    return (
      (formKind === 'classic' && exportName === 'ngModel') ||
      (hasTypeahead && exportName === 'si-typeahead')
    );
  }
  if ((kind === 'static' || kind === 'attribute') && key.startsWith('aria-')) {
    return key !== 'aria-hidden';
  }
  if (
    (kind === 'static' || kind === 'property' || kind === 'event') &&
    (key === 'siTypeahead' || key.startsWith('typeahead'))
  ) {
    return true;
  }
  if (formKind === 'signal') {
    return kind === 'property' && key === 'formField';
  }
  if (formKind === 'classic') {
    return (
      ((kind === 'static' || kind === 'property' || kind === 'twoWay') &&
        CLASSIC_FORM_INPUTS.includes(key)) ||
      (kind === 'event' && key === 'ngModelChange')
    );
  }
  return false;
};

const migrateDeprecatedInput = (
  attribute: TemplateAttribute,
  formKind: FormKind,
  context: MigrationContext
): string => {
  const { key, kind, text } = attribute;
  const { keySpan, valueSpan, sourceSpan } = attribute.attribute;
  if (kind !== 'property' || !keySpan || !valueSpan) {
    return text;
  }
  if (key === 'maxlength' && formKind !== 'classic') {
    // `maxlength` is no DOM property, so only an attribute binding compiles on a native input.
    return `[attr.maxlength]${context.template.substring(keySpan.end.offset, sourceSpan.end.offset)}`;
  }
  if (key === 'value' && needsEmptyStringFallback(attribute, context)) {
    // The search bar displayed `null` and `undefined` as an empty input.
    const name = context.template.substring(sourceSpan.start.offset, keySpan.end.offset);
    const closingQuote = context.template[valueSpan.end.offset];
    const quote = closingQuote === "'" || closingQuote === '"' ? closingQuote : '"';
    const emptyString = quote === '"' ? "''" : '""';
    const expression = context.template.substring(valueSpan.start.offset, valueSpan.end.offset);
    const parsed = parseBinding(attribute.attribute.value);
    const isSimple =
      parsed instanceof PropertyRead ||
      parsed instanceof SafePropertyRead ||
      parsed instanceof Call;
    const fallback = ` ?? ${context.quote ? escapeQuote(emptyString, context.quote) : emptyString}`;
    return `${name}=${quote}${isSimple ? expression : `(${expression})`}${fallback}${quote}`;
  }
  return text;
};

const needsEmptyStringFallback = (
  attribute: TemplateAttribute,
  context: MigrationContext
): boolean => {
  const parsed = parseBinding(attribute.attribute.value);
  if (parsed instanceof LiteralPrimitive) {
    return parsed.value == null;
  }
  const memberAccess = getMemberAccess(parsed, context);
  return !(
    memberAccess && context.component?.isNonNullableString(memberAccess.name, memberAccess.call)
  );
};

const getMemberAccess = (
  ast: AST | undefined,
  context: MigrationContext
): { name: string; call: boolean } | undefined => {
  const call = ast instanceof Call && ast.args.length === 0;
  const read = ast instanceof Call ? (call ? ast.receiver : undefined) : ast;
  if (
    read instanceof PropertyRead &&
    !read.name.startsWith('$') &&
    (read.receiver instanceof ThisReceiver ||
      (read.receiver instanceof ImplicitReceiver && !context.localNames.has(read.name)))
  ) {
    return { name: read.name, call };
  }
  return undefined;
};

const getSignalRead = (
  attribute: TemplateAttribute,
  context: MigrationContext
):
  | { expression: string; negated: boolean; valueKind: 'boolean' | 'number' | 'other' }
  | undefined => {
  if (attribute.kind !== 'property') {
    return undefined;
  }
  let ast = parseBinding(attribute.attribute.value);
  const negated = ast instanceof PrefixNot;
  if (ast instanceof PrefixNot) {
    ast = ast.expression;
  }
  const memberAccess = getMemberAccess(ast, context);
  const valueKind = memberAccess?.call
    ? context.component?.signalValueKind(memberAccess.name)
    : undefined;
  return memberAccess && valueKind
    ? { expression: `${negated ? '!' : ''}this.${memberAccess.name}()`, negated, valueKind }
    : undefined;
};

const getRepeatedContext = (usage: SearchBarUsage): string | undefined => {
  for (const node of [...usage.ancestors, usage.element]) {
    if (node instanceof Block) {
      if (node.name === 'for') {
        return 'a `@for` block';
      }
    } else if (node.name === 'ng-template') {
      return 'an `<ng-template>`';
    } else {
      const structural = node.attrs.find(
        attribute => attribute.name.startsWith('*') && attribute.name !== '*ngIf'
      );
      if (structural) {
        return `an element with \`${structural.name}\``;
      }
    }
  }
  return undefined;
};

const getConditionalContext = (usage: SearchBarUsage): string | undefined => {
  for (const node of [...usage.ancestors, usage.element]) {
    if (node instanceof Block) {
      if (['if', 'else if', 'else', 'switch', 'case', 'default'].includes(node.name)) {
        return `a \`@${node.name}\` block`;
      }
    } else if (node.attrs.some(attribute => attribute.name === '*ngIf')) {
      return 'an element with `*ngIf`';
    }
  }
  return undefined;
};

const renderMigration = (
  element: Element,
  attributes: TemplateAttribute[],
  inputAttributes: InputAttribute[],
  consumed: TemplateAttribute[],
  context: MigrationContext
): TextEdit[] => {
  // i18n metadata moves together with the static attribute that it translates.
  const movedStaticAttributes = new Set(
    inputAttributes
      .filter(attribute => attribute.source?.kind === 'static')
      .map(attribute => attribute.source!.key)
  );
  const allInputAttributes = [
    ...inputAttributes,
    ...attributes
      .filter(attribute => attribute.kind === 'i18n' && movedStaticAttributes.has(attribute.key))
      .map(toInputAttribute)
  ];
  const moved = new Set(allInputAttributes.map(attribute => attribute.source));
  const hostAttributes = attributes.filter(
    attribute => !moved.has(attribute) && !consumed.includes(attribute)
  );

  const { template, eol } = context;
  const multiline = !context.quote;
  const start = element.startSourceSpan.start.offset;
  const indent = getIndentation(template, start);
  const inputIndent = `${indent}  `;
  const hostTag = renderStartTag(
    SEARCH_BAR,
    hostAttributes.map(attribute => attribute.text),
    indent,
    '>',
    multiline,
    eol
  );
  const inputTag = renderStartTag(
    'input',
    sortInputAttributes([
      { kind: 'static', text: INPUT_DIRECTIVE_ATTRIBUTE, order: -1 },
      ...allInputAttributes
    ]),
    inputIndent,
    '/>',
    multiline,
    eol
  );
  const separator = multiline ? `${eol}${inputIndent}` : '';
  const closingTag = multiline ? `${eol}${indent}</${SEARCH_BAR}>` : `</${SEARCH_BAR}>`;

  const endTag = element.isSelfClosing ? null : element.endSourceSpan;
  const content = endTag
    ? template.substring(element.startSourceSpan.end.offset, endTag.start.offset)
    : '';
  if (endTag && content.trim()) {
    return [
      { start, end: element.startSourceSpan.end.offset, text: `${hostTag}${separator}${inputTag}` }
    ];
  }
  return [
    {
      start,
      end: endTag?.end.offset ?? element.startSourceSpan.end.offset,
      text: `${hostTag}${separator}${inputTag}${closingTag}`
    }
  ];
};

/** Orders attributes like the `@angular-eslint/template/attributes-order` rule does. */
const sortInputAttributes = (attributes: InputAttribute[]): string[] => {
  const rank: Record<BindingKind, number> = {
    structural: 0,
    reference: 1,
    static: 2,
    i18n: 2,
    other: 2,
    attribute: 3,
    property: 3,
    twoWay: 4,
    event: 5
  };
  return [...attributes]
    .sort((left, right) => rank[left.kind] - rank[right.kind] || left.order - right.order)
    .map(attribute => attribute.text);
};

const renderStartTag = (
  name: string,
  attributes: string[],
  indent: string,
  closing: '/>' | '>',
  multiline: boolean,
  eol: string
): string => {
  const inline = `<${name}${attributes.map(attribute => ` ${attribute}`).join('')}${
    closing === '/>' ? ' />' : '>'
  }`;
  if (
    !multiline ||
    (indent.length + inline.length <= MAX_LINE_LENGTH &&
      !attributes.some(attribute => attribute.includes('\n')))
  ) {
    return inline;
  }
  return `<${name}${attributes
    .map(attribute => `${eol}${indent}  ${attribute}`)
    .join('')}${eol}${indent}${closing}`;
};

const getIndentation = (template: string, offset: number): string => {
  const lineStart = template.lastIndexOf('\n', offset - 1) + 1;
  return /^[ \t]*/.exec(template.substring(lineStart, offset))![0];
};

const getSourceText = (template: string, attribute: Attribute): string =>
  template.substring(attribute.sourceSpan.start.offset, attribute.sourceSpan.end.offset);

const parseAttributeName = (name: string): { kind: BindingKind; key: string } => {
  if (name.startsWith('[(') && name.endsWith(')]')) {
    return { kind: 'twoWay', key: name.slice(2, -2) };
  }
  if (name.startsWith('bindon-')) {
    return { kind: 'twoWay', key: name.substring(7) };
  }
  const property =
    name.startsWith('[') && name.endsWith(']')
      ? name.slice(1, -1)
      : name.startsWith('bind-')
        ? name.substring(5)
        : undefined;
  if (property !== undefined) {
    if (property.startsWith('attr.')) {
      return { kind: 'attribute', key: property.substring(5) };
    }
    return /^(class|style)\.|^@/.test(property)
      ? { kind: 'other', key: property }
      : { kind: 'property', key: property };
  }
  if (name.startsWith('(') && name.endsWith(')')) {
    return { kind: 'event', key: name.slice(1, -1) };
  }
  if (name.startsWith('on-')) {
    return { kind: 'event', key: name.substring(3) };
  }
  if (name.startsWith('#')) {
    return { kind: 'reference', key: name.substring(1) };
  }
  if (name.startsWith('ref-')) {
    return { kind: 'reference', key: name.substring(4) };
  }
  if (name.startsWith('*')) {
    return { kind: 'structural', key: name.substring(1) };
  }
  if (name.startsWith('i18n-')) {
    return { kind: 'i18n', key: name.substring(5) };
  }
  if (name === 'i18n' || name.startsWith('let-') || name.startsWith('@')) {
    return { kind: 'other', key: name };
  }
  return { kind: 'static', key: name };
};

/** Returns the effective debounce time, or `undefined` if it is not constant. */
const getDebounceTime = (attribute: TemplateAttribute | undefined): number | undefined => {
  if (!attribute) {
    return DEFAULT_DEBOUNCE_TIME;
  }
  const literal = getLiteral(attribute);
  if (!literal) {
    return undefined;
  }
  // The search bar only debounced positive times.
  const debounceTime = numberAttribute(literal.value);
  return debounceTime > 0 ? debounceTime : 0;
};

/** Returns the constant value of a static attribute or of a binding to a literal. */
const getLiteral = (attribute: TemplateAttribute): { value: unknown } | undefined => {
  if (attribute.kind === 'static') {
    return /\{\{[\s\S]*\}\}/.test(attribute.attribute.value)
      ? undefined
      : { value: attribute.attribute.value };
  }
  const parsed = parseBinding(attribute.attribute.value);
  return parsed instanceof LiteralPrimitive ? { value: parsed.value } : undefined;
};

/** Same as `booleanAttribute` of `@angular/core`. */
const booleanAttribute = (value: unknown): boolean =>
  typeof value === 'boolean' ? value : value != null && value !== 'false';

/** Same as `numberAttribute` of `@angular/core`. */
const numberAttribute = (value: unknown): number =>
  !Number.isNaN(Number.parseFloat(value as string)) && !Number.isNaN(Number(value))
    ? Number(value)
    : Number.NaN;

const createProhibitedCharactersPattern = (characters: string): string => {
  const unique = [...new Set(characters)];
  const unicode = unique.some(character => character.codePointAt(0)! > 0xffff);
  const escaped = unique
    .map(character => {
      if ('\\]^-[/'.includes(character)) {
        return `\\${character}`;
      }
      const code = character.codePointAt(0)!;
      return code < 0x20 || code === 0x7f || code === 0x2028 || code === 0x2029
        ? `\\u${code.toString(16).padStart(4, '0')}`
        : character;
    })
    .join('');
  return `/^[^${escaped}]*$/${unicode ? 'u' : ''}`;
};

const toStringLiteral = (value: string): string =>
  `'${value
    .replaceAll('\\', '\\\\')
    .replaceAll("'", "\\'")
    .replaceAll('\n', '\\n')
    .replaceAll('\r', '\\r')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029')}'`;

const escapeQuote = (text: string, quote: '"' | "'"): string =>
  text.replaceAll(quote, `\\${quote}`);

const expressionParser = new Parser(new Lexer());

const createSourceSpan = (source: string): ParseSourceSpan => {
  const file = new ParseSourceFile(source, 'expression');
  return new ParseSourceSpan(
    new ParseLocation(file, 0, 0, 0),
    new ParseLocation(file, source.length, 0, source.length)
  );
};

const unwrap = (ast: AST): AST => (ast instanceof ASTWithSource ? unwrap(ast.ast) : ast);

const parseBinding = (source: string): AST | undefined => {
  const result = expressionParser.parseBinding(source, createSourceSpan(source), 0);
  return result.errors.length ? undefined : unwrap(result.ast);
};

const EVENT_PLACEHOLDER = '\u0000event\u0000';

/**
 * Converts an event binding into statements for the component class by prefixing component
 * members with `this.`. `$event` is replaced with a placeholder.
 * Returns a description of the problem if the conversion is not possible.
 */
const convertAction = (
  source: string,
  localNames: ReadonlySet<string>
): { text: string; isCall: boolean }[] | string => {
  const result = expressionParser.parseAction(source, createSourceSpan(source), 0);
  if (result.errors.length) {
    return 'could not be parsed';
  }

  const edits: TextEdit[] = [];
  let problem: string | undefined;
  const visit = (node: unknown): void => {
    if (problem || !(node instanceof AST)) {
      return;
    }
    if (node instanceof ArrowFunction) {
      problem = 'uses an arrow function';
    } else if (node instanceof BindingPipe) {
      problem = 'uses a pipe';
    } else if (
      node instanceof LiteralMap &&
      node.keys.some(key => key.kind === 'property' && key.isShorthandInitialized)
    ) {
      problem = 'uses a shorthand object property';
    } else if (
      (node instanceof PropertyRead || node instanceof SafePropertyRead) &&
      node.receiver instanceof ImplicitReceiver &&
      !(node.receiver instanceof ThisReceiver)
    ) {
      if (node.name === '$event') {
        edits.push({ start: node.nameSpan.start, end: node.nameSpan.end, text: EVENT_PLACEHOLDER });
      } else if (node.name.startsWith('$')) {
        problem = `uses \`${node.name}\``;
      } else if (localNames.has(node.name)) {
        problem = `uses the template variable \`${node.name}\``;
      } else {
        edits.push({ start: node.nameSpan.start, end: node.nameSpan.start, text: 'this.' });
      }
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        value.forEach(visit);
      } else {
        visit(value);
      }
    }
  };
  const ast = unwrap(result.ast);
  visit(ast);
  if (problem) {
    return problem;
  }

  const statements = (ast instanceof Chain ? ast.expressions : [ast])
    .filter(statement => !(statement instanceof EmptyExpr))
    .map(statement => {
      const { start, end } = statement.sourceSpan;
      const statementEdits = edits
        .filter(edit => edit.start >= start && edit.end <= end)
        .map(edit => ({ ...edit, start: edit.start - start, end: edit.end - start }));
      return {
        text: applyTextEdits(source.substring(start, end), statementEdits).trim(),
        isCall: statement instanceof Call || statement instanceof SafeCall
      };
    });
  return statements.length ? statements : 'is empty';
};
