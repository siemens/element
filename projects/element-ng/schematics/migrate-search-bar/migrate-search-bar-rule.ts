/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { dirname, join } from 'path/posix';
import ts from 'typescript';

import {
  DiscoveredSourceFile,
  discoverSourceFiles,
  getComponentTemplates
} from '../utils/index.js';
import {
  ComponentContext,
  GeneratedSearchField,
  migrateSearchBarTemplate,
  TemplateMigrationResult
} from './search-bar-template.js';
import { applyTextEdits, TextEdit } from './text-edits.js';

const SEARCH_BAR_MODULE_PATTERN = /^@(siemens|simpl)\/element-ng\/search-bar$/;
const ELEMENT_MODULE_PATTERN = /^@(siemens|simpl)\/element-ng\//;
const SEARCH_BAR_COMPONENT = 'SiSearchBarComponent';
const SEARCH_BAR_MODULE = 'SiSearchBarModule';
const INPUT_DIRECTIVE = 'SiSearchBarInputDirective';
const CORE_MODULE = '@angular/core';
const SIGNAL_FORMS_MODULE = '@angular/forms/signals';
const MAX_LINE_LENGTH = 100;

export interface MigrateSearchBarOptions {
  path?: string;
}

interface ComponentPlan {
  declaration: ts.ClassDeclaration;
  metadata: ts.ObjectLiteralExpression;
  standalone: boolean;
  needsDirective: boolean;
  fields: GeneratedSearchField[];
}

interface FilePlan {
  file: DiscoveredSourceFile;
  edits: TextEdit[];
  components: Map<ts.ClassDeclaration, ComponentPlan>;
  /** Metadata of NgModules that declare migrated components. */
  ngModules: ts.ObjectLiteralExpression[];
}

interface ImportRequest {
  moduleName: string;
  name: string;
  /** Whether the import is used in the constructor, where parameters and locals shadow it. */
  constructorScope?: boolean;
}

type ImportNames = (moduleName: string, name: string) => string;

export const migrateSearchBar = (options: MigrateSearchBarOptions): Rule => {
  return async (tree: Tree, context: SchematicContext) => {
    const files: DiscoveredSourceFile[] = [];
    for await (const file of discoverSourceFiles(tree, context, options.path ?? '/')) {
      files.push(file);
    }

    const templateUsages = new Map<string, number>();
    for (const { path: filePath, sourceFile } of files) {
      for (const template of getComponentTemplates(sourceFile)) {
        if (template.kind === 'external') {
          const templatePath = join(dirname(filePath), template.url);
          templateUsages.set(templatePath, (templateUsages.get(templatePath) ?? 0) + 1);
        }
      }
    }

    const warn = (message: string): void => context.logger.warn(message);
    const processedTemplates = new Map<string, TemplateMigrationResult>();
    const plans: FilePlan[] = [];
    let migrated = 0;
    let skipped = 0;

    for (const file of files) {
      const { path: filePath, sourceFile } = file;
      const plan: FilePlan = { file, edits: [], components: new Map(), ngModules: [] };
      plans.push(plan);

      for (const template of getComponentTemplates(sourceFile)) {
        const component = getComponentPlan(plan, template.component);
        if (!component) {
          continue;
        }

        let result: TemplateMigrationResult | undefined;
        if (template.kind === 'inline') {
          const start = template.node.getStart(sourceFile) + 1;
          const end = template.node.getEnd() - 1;
          result = migrateSearchBarTemplate({
            template: sourceFile.text.substring(start, end),
            location: offset => formatLocation(filePath, sourceFile.text, start + offset),
            warn,
            component: createComponentContext(component, file, false),
            quote: ts.isStringLiteral(template.node)
              ? (sourceFile.text[start - 1] as '"' | "'")
              : undefined
          });
          migrated += result.migrated;
          skipped += result.skipped;
          if (result.changed) {
            plan.edits.push({ start, end, text: result.content });
          }
        } else {
          const templatePath = join(dirname(filePath), template.url);
          result = processedTemplates.get(templatePath);
          if (!result && tree.exists(templatePath)) {
            const content = tree.readText(templatePath);
            const shared = (templateUsages.get(templatePath) ?? 0) > 1;
            result = migrateSearchBarTemplate({
              template: content,
              location: offset => formatLocation(templatePath, content, offset),
              warn,
              component: createComponentContext(component, file, shared)
            });
            processedTemplates.set(templatePath, result);
            migrated += result.migrated;
            skipped += result.skipped;
            if (result.changed) {
              tree.overwrite(templatePath, result.content);
            }
          }
        }

        if (result?.migrated) {
          component.needsDirective = true;
          // Fields are only generated for templates that belong to a single component.
          component.fields.push(...result.fields);
        }
      }
    }

    assignNgModules(plans, warn);
    for (const plan of plans) {
      applyFilePlan(tree, plan, warn);
    }

    if (migrated || skipped) {
      context.logger.info(
        `Migrated ${migrated} search bar(s) to a projected input.${
          skipped
            ? ` ${skipped} search bar(s) need a manual migration, see the warnings above.`
            : ''
        }`
      );
    } else {
      context.logger.info('No search bars with deprecated inputs or outputs were found.');
    }
    return tree;
  };
};

const getComponentPlan = (
  plan: FilePlan,
  declaration: ts.ClassDeclaration
): ComponentPlan | undefined => {
  let component = plan.components.get(declaration);
  if (!component) {
    const metadata = getDecoratorMetadata(declaration, 'Component');
    if (!metadata) {
      return undefined;
    }
    const standalone = getProperty(metadata, 'standalone')?.initializer;
    component = {
      declaration,
      metadata,
      standalone: standalone?.kind !== ts.SyntaxKind.FalseKeyword,
      needsDirective: false,
      fields: []
    };
    plan.components.set(declaration, component);
  }
  return component;
};

const createComponentContext = (
  component: ComponentPlan,
  file: DiscoveredSourceFile,
  shared: boolean
): ComponentContext => {
  const { declaration } = component;
  const checker = file.typeChecker;
  const compilerOptions = file.program.getCompilerOptions();
  // TypeScript 6, which Angular 22 requires, enables strict mode by default.
  const strictNullChecks = compilerOptions.strictNullChecks ?? compilerOptions.strict ?? true;
  const symbol = declaration.name ? checker.getSymbolAtLocation(declaration.name) : undefined;
  const instanceType = symbol ? checker.getDeclaredTypeOfSymbol(symbol) : undefined;
  const getMemberType = (name: string): ts.Type | undefined => {
    const property = instanceType?.getProperty(name);
    return property ? checker.getTypeOfSymbolAtLocation(property, declaration) : undefined;
  };
  const getCallType = (type: ts.Type | undefined): ts.Type | undefined => {
    const signatures = type?.getCallSignatures() ?? [];
    return signatures.length === 1 ? signatures[0].getReturnType() : undefined;
  };

  return {
    generationBlocker: shared
      ? 'its template is used by several components'
      : getGenerationBlocker(component, checker),
    directiveImportBlocker: getImportsBlocker(component),
    hasMember: name =>
      !!instanceType?.getProperty(name) ||
      declaration.members.some(member => member.name && getPropertyName(member.name) === name),
    signalValueKind: name => {
      const type = getMemberType(name);
      if (!type || !isSignalType(type, checker)) {
        return undefined;
      }
      const valueType = getCallType(type);
      return valueType ? getValueKind(valueType) : undefined;
    },
    isNonNullableString: (name, call) => {
      const memberType = getMemberType(name);
      const type = call ? getCallType(memberType) : memberType;
      return (
        strictNullChecks &&
        !!type &&
        getUnionTypes(type).every(part => part.flags & ts.TypeFlags.StringLike)
      );
    }
  };
};

const getImportsBlocker = (component: ComponentPlan): string | undefined => {
  const imports = getProperty(component.metadata, 'imports')?.initializer;
  return component.standalone && imports && !ts.isArrayLiteralExpression(imports)
    ? 'its `imports` property is not an array literal'
    : undefined;
};

const getGenerationBlocker = (
  component: ComponentPlan,
  checker: ts.TypeChecker
): string | undefined => {
  if (!component.standalone) {
    return 'it is declared in an NgModule';
  }
  const importsBlocker = getImportsBlocker(component);
  if (importsBlocker) {
    return importsBlocker;
  }
  if (
    !findConstructor(component.declaration) &&
    !canCallSuperWithoutArguments(component, checker)
  ) {
    return 'no constructor can be added because the base class constructor requires arguments';
  }
  return undefined;
};

const canCallSuperWithoutArguments = (
  component: ComponentPlan,
  checker: ts.TypeChecker
): boolean => {
  const heritage = component.declaration.heritageClauses?.find(
    clause => clause.token === ts.SyntaxKind.ExtendsKeyword
  );
  if (!heritage) {
    return true;
  }
  return checker
    .getTypeAtLocation(heritage.types[0].expression)
    .getConstructSignatures()
    .some(signature =>
      signature.getParameters().every(parameter => {
        const parameterDeclaration = parameter.valueDeclaration;
        return (
          !!parameterDeclaration &&
          ts.isParameter(parameterDeclaration) &&
          (!!parameterDeclaration.questionToken ||
            !!parameterDeclaration.initializer ||
            !!parameterDeclaration.dotDotDotToken)
        );
      })
    );
};

const isSignalType = (type: ts.Type, checker: ts.TypeChecker): boolean =>
  type.getProperties().some(property => /^__@SIGNAL@\d+$/.test(property.escapedName as string)) ||
  /^(Input|Model|Writable)?Signal(WithTransform)?</.test(checker.typeToString(type));

const getValueKind = (type: ts.Type): 'boolean' | 'number' | 'other' => {
  const parts = getUnionTypes(type);
  if (parts.every(part => part.flags & ts.TypeFlags.BooleanLike)) {
    return 'boolean';
  }
  if (
    parts.some(part => part.flags & ts.TypeFlags.NumberLike) &&
    parts.every(part => part.flags & (ts.TypeFlags.NumberLike | ts.TypeFlags.Undefined))
  ) {
    return 'number';
  }
  return 'other';
};

const getUnionTypes = (type: ts.Type): ts.Type[] => (type.isUnion() ? type.types : [type]);

/** Finds the NgModules that declare migrated components, which are not standalone. */
const assignNgModules = (plans: FilePlan[], warn: (message: string) => void): void => {
  const pending = new Map<string, { plan: FilePlan; component: ComponentPlan }>();
  for (const plan of plans) {
    for (const component of plan.components.values()) {
      if (component.needsDirective && !component.standalone && component.declaration.name) {
        pending.set(getClassKey(component.declaration), { plan, component });
      }
    }
  }
  if (!pending.size) {
    return;
  }

  for (const plan of plans) {
    const { sourceFile, typeChecker } = plan.file;
    for (const statement of sourceFile.statements) {
      const metadata = ts.isClassDeclaration(statement)
        ? getDecoratorMetadata(statement, 'NgModule')
        : undefined;
      const declarations = metadata && getProperty(metadata, 'declarations')?.initializer;
      if (!declarations || !ts.isArrayLiteralExpression(declarations)) {
        continue;
      }
      const declared = declarations.elements
        .filter(ts.isIdentifier)
        .map(identifier => resolveClassKey(identifier, typeChecker))
        .filter((key): key is string => !!key && pending.has(key));
      if (declared.length) {
        declared.forEach(key => pending.delete(key));
        plan.ngModules.push(metadata);
      }
    }
  }

  for (const { plan, component } of pending.values()) {
    warn(
      `${plan.file.path}: ${component.declaration.name!.text} is declared in an NgModule that was not found. Add ${INPUT_DIRECTIVE} to the imports of that NgModule.`
    );
  }
};

const getClassKey = (declaration: ts.ClassDeclaration): string =>
  `${declaration.getSourceFile().fileName}#${declaration.name?.text}`;

const resolveClassKey = (
  identifier: ts.Identifier,
  checker: ts.TypeChecker
): string | undefined => {
  let symbol = checker.getSymbolAtLocation(identifier);
  if (symbol && symbol.flags & ts.SymbolFlags.Alias) {
    symbol = checker.getAliasedSymbol(symbol);
  }
  const declaration = symbol?.declarations?.find(ts.isClassDeclaration);
  return declaration?.name ? getClassKey(declaration) : undefined;
};

const applyFilePlan = (tree: Tree, plan: FilePlan, warn: (message: string) => void): void => {
  const { sourceFile, path: filePath } = plan.file;
  const searchBarImports = getNamedImports(sourceFile, SEARCH_BAR_MODULE_PATTERN);
  const hasEntry = (list: ts.ArrayLiteralExpression | undefined, name: string): boolean => {
    const local = searchBarImports.get(name);
    return !!local && !!list?.elements.some(item => ts.isIdentifier(item) && item.text === local);
  };
  const needsDirective = (metadata: ts.ObjectLiteralExpression): boolean => {
    const imports = getProperty(metadata, 'imports')?.initializer;
    const list = imports && ts.isArrayLiteralExpression(imports) ? imports : undefined;
    return !hasEntry(list, INPUT_DIRECTIVE) && !hasEntry(list, SEARCH_BAR_MODULE);
  };

  const components = [...plan.components.values()];
  const directiveTargets = [
    ...components
      .filter(component => component.needsDirective && component.standalone)
      .map(component => component.metadata),
    ...plan.ngModules
  ].filter(needsDirective);
  const fieldComponents = components.filter(component => component.fields.length);
  if (!directiveTargets.length && !fieldComponents.length) {
    if (plan.edits.length) {
      tree.overwrite(filePath, applyTextEdits(sourceFile.text, plan.edits));
    }
    return;
  }

  const searchBarModule =
    [...getModuleSpecifiers(sourceFile)].find(moduleName =>
      SEARCH_BAR_MODULE_PATTERN.test(moduleName)
    ) ??
    `@${
      [...getModuleSpecifiers(sourceFile)]
        .find(moduleName => ELEMENT_MODULE_PATTERN.test(moduleName))
        ?.match(ELEMENT_MODULE_PATTERN)?.[1] ?? 'siemens'
    }/element-ng/search-bar`;
  const requests: ImportRequest[] = [];
  if (directiveTargets.length) {
    requests.push({ moduleName: searchBarModule, name: INPUT_DIRECTIVE });
  }
  const fields = fieldComponents.flatMap(component => component.fields);
  if (fields.length) {
    requests.push(
      { moduleName: CORE_MODULE, name: 'signal' },
      ...['effect', 'untracked'].map(name => ({
        moduleName: CORE_MODULE,
        name,
        constructorScope: true
      })),
      ...[
        'form',
        'FormField',
        ...new Set(fields.flatMap(field => field.rules.map(rule => rule.fn)))
      ].map(name => ({ moduleName: SIGNAL_FORMS_MODULE, name }))
    );
  }

  const shadowedNames = new Set(
    fieldComponents.flatMap(component => [...getConstructorScopeNames(component.declaration)])
  );
  const imports = resolveImports(sourceFile, requests, shadowedNames);
  plan.edits.push(...imports.edits);

  for (const metadata of directiveTargets) {
    const items = [imports.names(searchBarModule, INPUT_DIRECTIVE)];
    const component = components.find(candidate => candidate.metadata === metadata);
    if (component?.fields.length) {
      items.push(imports.names(SIGNAL_FORMS_MODULE, 'FormField'));
    }
    const edit = addToImports(
      sourceFile,
      metadata,
      items,
      searchBarImports.get(SEARCH_BAR_COMPONENT)
    );
    if (edit) {
      plan.edits.push(edit);
    } else {
      warn(`${filePath}: Add ${items.join(' and ')} to the imports of the component or NgModule.`);
    }
  }
  for (const component of fieldComponents) {
    if (!directiveTargets.includes(component.metadata)) {
      const edit = addToImports(sourceFile, component.metadata, [
        imports.names(SIGNAL_FORMS_MODULE, 'FormField')
      ]);
      if (edit) {
        plan.edits.push(edit);
      }
    }
    plan.edits.push(...generateFields(sourceFile, component, imports.names));
  }

  tree.overwrite(filePath, applyTextEdits(sourceFile.text, plan.edits));
};

const generateFields = (
  sourceFile: ts.SourceFile,
  component: ComponentPlan,
  names: ImportNames
): TextEdit[] => {
  const { declaration, fields } = component;
  const text = sourceFile.text;
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const members = declaration.members;
  const memberIndent = members.length
    ? getIndentation(text, members[0].getStart(sourceFile))
    : `${getIndentation(text, declaration.getStart(sourceFile))}  `;
  const bodyIndent = `${memberIndent}  `;
  const core = (name: string): string => names(CORE_MODULE, name);
  const forms = (name: string): string => names(SIGNAL_FORMS_MODULE, name);

  const fieldLines = fields.flatMap(field => {
    const lines = [
      `protected readonly ${field.termName} = ${core('signal')}(${field.initialValue});`
    ];
    if (field.rules.length) {
      lines.push(
        `protected readonly ${field.fieldName} = ${forms('form')}(this.${field.termName}, path => {`,
        ...field.rules.map(rule => `  ${forms(rule.fn)}(${['path', ...rule.args].join(', ')});`),
        '});'
      );
    } else {
      lines.push(
        `protected readonly ${field.fieldName} = ${forms('form')}(this.${field.termName});`
      );
    }
    return lines.map(line => `${memberIndent}${line}`);
  });

  const constructor = findConstructor(declaration);
  const scopeNames = getConstructorScopeNames(declaration);
  const effects = fields.map(field => {
    let previous = `previous${field.termName[0].toUpperCase()}${field.termName.substring(1)}`;
    for (let index = 2; scopeNames.has(previous); index++) {
      previous = `${previous.replace(/\d+$/, '')}${index}`;
    }
    scopeNames.add(previous);
    const term = field.termName;
    const condition = `${term} !== ${previous}${field.validate ? ` && this.${field.fieldName}().valid()` : ''}`;
    const handler = field.expressionBody
      ? [`    ${core('untracked')}(() => ${field.statements[0]});`]
      : [
          `    ${core('untracked')}(() => {`,
          ...field.statements.map(statement => `      ${statement};`),
          '    });'
        ];
    return [
      `let ${previous} = this.${term}();`,
      `${core('effect')}(() => {`,
      `  const ${term} = this.${term}();`,
      `  if (${condition}) {`,
      `    ${previous} = ${term};`,
      ...handler,
      '  }',
      '});'
    ]
      .map(line => `${bodyIndent}${line}`)
      .join(eol);
  });
  const effectCode = effects.join(`${eol}${eol}`);

  const edits: TextEdit[] = [];
  const firstNonField = members.findIndex(
    member =>
      ts.isConstructorDeclaration(member) ||
      ts.isMethodDeclaration(member) ||
      ts.isGetAccessorDeclaration(member) ||
      ts.isSetAccessorDeclaration(member) ||
      ts.isClassStaticBlockDeclaration(member)
  );
  const precedingField = (firstNonField < 0 ? [...members] : members.slice(0, firstNonField))
    .filter(ts.isPropertyDeclaration)
    .at(-1);
  let fieldCode = fieldLines.join(eol);
  if (!constructor) {
    const superCall = declaration.heritageClauses?.some(
      clause => clause.token === ts.SyntaxKind.ExtendsKeyword
    )
      ? `${bodyIndent}super();${eol}`
      : '';
    fieldCode += `${eol}${eol}${memberIndent}constructor() {${eol}${superCall}${effectCode}${eol}${memberIndent}}`;
  }

  if (precedingField) {
    edits.push({
      start: precedingField.getEnd(),
      end: precedingField.getEnd(),
      text: `${eol}${fieldCode}`
    });
  } else {
    const suffix = members.length
      ? eol
      : `${eol}${getIndentation(text, declaration.getStart(sourceFile))}`;
    edits.push({ start: members.pos, end: members.pos, text: `${eol}${fieldCode}${suffix}` });
  }

  const body = constructor?.body;
  if (body) {
    const lastStatement = body.statements.at(-1);
    if (lastStatement) {
      edits.push({
        start: lastStatement.getEnd(),
        end: lastStatement.getEnd(),
        text: `${eol}${eol}${effectCode}`
      });
    } else {
      edits.push({
        start: body.getStart(sourceFile),
        end: body.getEnd(),
        text: `{${eol}${effectCode}${eol}${memberIndent}}`
      });
    }
  }
  return edits;
};

const findConstructor = (declaration: ts.ClassDeclaration): ts.ConstructorDeclaration | undefined =>
  declaration.members.find(
    (member): member is ts.ConstructorDeclaration =>
      ts.isConstructorDeclaration(member) && !!member.body
  );

/** Names declared in the scope of the constructor body, which shadow imports. */
const getConstructorScopeNames = (declaration: ts.ClassDeclaration): Set<string> => {
  const names = new Set<string>();
  const constructor = findConstructor(declaration);
  constructor?.parameters.forEach(parameter => collectBindingNames(parameter.name, names));
  for (const statement of constructor?.body?.statements ?? []) {
    if (ts.isVariableStatement(statement)) {
      statement.declarationList.declarations.forEach(variable =>
        collectBindingNames(variable.name, names)
      );
    } else if (
      (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) &&
      statement.name
    ) {
      names.add(statement.name.text);
    }
  }
  return names;
};

const collectBindingNames = (name: ts.BindingName, names: Set<string>): void => {
  if (ts.isIdentifier(name)) {
    names.add(name.text);
  } else {
    name.elements.forEach(element => {
      if (!ts.isOmittedExpression(element)) {
        collectBindingNames(element.name, names);
      }
    });
  }
};

/** Names that are declared in the module scope, so new imports must not use them. */
const getModuleScopeNames = (sourceFile: ts.SourceFile): Set<string> => {
  const names = new Set<string>();
  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement)) {
      const clause = statement.importClause;
      if (clause?.name) {
        names.add(clause.name.text);
      }
      const bindings = clause?.namedBindings;
      if (bindings && ts.isNamespaceImport(bindings)) {
        names.add(bindings.name.text);
      } else if (bindings) {
        bindings.elements.forEach(element => names.add(element.name.text));
      }
    } else if (ts.isVariableStatement(statement)) {
      statement.declarationList.declarations.forEach(variable =>
        collectBindingNames(variable.name, names)
      );
    } else if (
      (ts.isClassDeclaration(statement) ||
        ts.isFunctionDeclaration(statement) ||
        ts.isEnumDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement) ||
        ts.isTypeAliasDeclaration(statement) ||
        ts.isImportEqualsDeclaration(statement)) &&
      statement.name
    ) {
      names.add(statement.name.text);
    }
  }
  return names;
};

const getModuleSpecifiers = (sourceFile: ts.SourceFile): Set<string> =>
  new Set(
    sourceFile.statements
      .filter(ts.isImportDeclaration)
      .map(statement => statement.moduleSpecifier)
      .filter(ts.isStringLiteral)
      .map(moduleSpecifier => moduleSpecifier.text)
  );

/** Maps imported names of value imports from matching modules to their local names. */
const getNamedImports = (sourceFile: ts.SourceFile, pattern: RegExp): Map<string, string> => {
  const imports = new Map<string, string>();
  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      !pattern.test(statement.moduleSpecifier.text)
    ) {
      continue;
    }
    const clause = statement.importClause;
    const bindings = clause?.namedBindings;
    if (!clause || clause.isTypeOnly || !bindings || !ts.isNamedImports(bindings)) {
      continue;
    }
    for (const element of bindings.elements) {
      if (!element.isTypeOnly) {
        imports.set((element.propertyName ?? element.name).text, element.name.text);
      }
    }
  }
  return imports;
};

/** Resolves the local names of the requested imports and adds missing imports. */
const resolveImports = (
  sourceFile: ts.SourceFile,
  requests: ImportRequest[],
  shadowedNames: Set<string>
): { names: ImportNames; edits: TextEdit[] } => {
  const key = (moduleName: string, name: string): string => `${moduleName}\u0000${name}`;
  const locals = new Map<string, string>();
  const boundNames = getModuleScopeNames(sourceFile);
  const additions = new Map<string, { name: string; local: string }[]>();

  for (const { moduleName, name, constructorScope } of requests) {
    if (locals.has(key(moduleName, name))) {
      continue;
    }
    const isShadowed = (local: string): boolean => !!constructorScope && shadowedNames.has(local);
    const existing = getNamedImports(sourceFile, new RegExp(`^${escapeRegExp(moduleName)}$`)).get(
      name
    );
    if (existing && !isShadowed(existing)) {
      locals.set(key(moduleName, name), existing);
      continue;
    }

    const prefix =
      moduleName === CORE_MODULE ? 'ng' : moduleName === SIGNAL_FORMS_MODULE ? 'signalForms' : 'si';
    const alias = `${prefix}${name[0].toUpperCase()}${name.substring(1)}`;
    let local = name;
    for (let index = 1; boundNames.has(local) || isShadowed(local); index++) {
      local = index === 1 ? alias : `${alias}${index}`;
    }
    boundNames.add(local);
    locals.set(key(moduleName, name), local);
    additions.set(moduleName, [...(additions.get(moduleName) ?? []), { name, local }]);
  }

  const edits: TextEdit[] = [];
  for (const [moduleName, unsorted] of additions) {
    const specifiers = [...unsorted].sort((left, right) =>
      left.name.toLowerCase().localeCompare(right.name.toLowerCase())
    );
    const texts = specifiers.map(({ name, local }) =>
      name === local ? name : `${name} as ${local}`
    );
    const declaration = sourceFile.statements.find(
      (statement): statement is ts.ImportDeclaration =>
        ts.isImportDeclaration(statement) &&
        ts.isStringLiteral(statement.moduleSpecifier) &&
        statement.moduleSpecifier.text === moduleName &&
        !statement.importClause?.isTypeOnly &&
        !!statement.importClause?.namedBindings &&
        ts.isNamedImports(statement.importClause.namedBindings)
    );
    if (declaration) {
      const bindings = declaration.importClause!.namedBindings as ts.NamedImports;
      edits.push(
        insertListItems(
          sourceFile,
          bindings,
          bindings.elements,
          element => (element.propertyName ?? element.name).text,
          texts.map((text, index) => ({ text, key: specifiers[index].name })),
          '{}'
        )
      );
    } else {
      edits.push(insertImportDeclaration(sourceFile, moduleName, texts));
    }
  }

  return {
    names: (moduleName, name) => locals.get(key(moduleName, name)) ?? name,
    edits
  };
};

const insertImportDeclaration = (
  sourceFile: ts.SourceFile,
  moduleName: string,
  specifiers: string[]
): TextEdit => {
  const eol = sourceFile.text.includes('\r\n') ? '\r\n' : '\n';
  const single = `import { ${specifiers.join(', ')} } from '${moduleName}';`;
  const text =
    single.length <= MAX_LINE_LENGTH
      ? single
      : `import {${eol}${specifiers.map(specifier => `  ${specifier}`).join(`,${eol}`)}${eol}} from '${moduleName}';`;
  const imports = sourceFile.statements.filter(ts.isImportDeclaration);
  const packageImports = imports.filter(
    statement =>
      ts.isStringLiteral(statement.moduleSpecifier) &&
      !statement.moduleSpecifier.text.startsWith('.')
  );
  const previous = packageImports
    .filter(statement => (statement.moduleSpecifier as ts.StringLiteral).text < moduleName)
    .at(-1);
  if (previous) {
    return { start: previous.getEnd(), end: previous.getEnd(), text: `${eol}${text}` };
  }
  const next = packageImports[0] ?? imports[0] ?? sourceFile.statements[0];
  if (!next) {
    return { start: sourceFile.text.length, end: sourceFile.text.length, text: `${text}${eol}` };
  }
  const separator = packageImports.length ? eol : `${eol}${eol}`;
  const start = next.getStart(sourceFile);
  return { start, end: start, text: `${text}${separator}` };
};

/**
 * Adds names to the `imports` of a component or NgModule.
 * Returns `undefined` if the imports are no array literal.
 */
const addToImports = (
  sourceFile: ts.SourceFile,
  metadata: ts.ObjectLiteralExpression,
  names: string[],
  anchor?: string
): TextEdit | undefined => {
  const property = getProperty(metadata, 'imports');
  if (!property) {
    return addProperty(sourceFile, metadata, `imports: [${names.join(', ')}]`);
  }
  if (!ts.isArrayLiteralExpression(property.initializer)) {
    return undefined;
  }
  const list = property.initializer;
  const existing = new Set(list.elements.map(element => element.getText(sourceFile)));
  let previous = anchor && existing.has(anchor) ? anchor : undefined;
  const items = names
    .filter(name => !existing.has(name))
    .map(name => {
      const item = { text: name, key: name, after: previous };
      previous = name;
      return item;
    });
  return items.length
    ? insertListItems(
        sourceFile,
        list,
        list.elements,
        element => element.getText(sourceFile),
        items,
        '[]'
      )
    : { start: list.getStart(sourceFile), end: list.getStart(sourceFile), text: '' };
};

const addProperty = (
  sourceFile: ts.SourceFile,
  object: ts.ObjectLiteralExpression,
  property: string
): TextEdit => {
  const text = sourceFile.text;
  const properties = object.properties;
  const multiline = text.substring(object.getStart(sourceFile), object.getEnd()).includes('\n');
  if (!properties.length) {
    return { start: object.getStart(sourceFile), end: object.getEnd(), text: `{ ${property} }` };
  }
  const indent = getIndentation(text, properties[0].getStart(sourceFile));
  const selector = properties.find(candidate => getPropertyName(candidate.name) === 'selector');
  if (selector) {
    return {
      start: selector.getEnd(),
      end: selector.getEnd(),
      text: multiline ? `,\n${indent}${property}` : `, ${property}`
    };
  }
  const start = properties[0].getStart(sourceFile);
  return { start, end: start, text: multiline ? `${property},\n${indent}` : `${property}, ` };
};

/**
 * Inserts items into a comma-separated list, such as an array literal or named imports.
 * Sorted lists stay sorted. Otherwise, items are inserted after their anchor or appended.
 */
const insertListItems = <T extends ts.Node>(
  sourceFile: ts.SourceFile,
  container: ts.Node,
  elements: ts.NodeArray<T>,
  getKey: (element: T) => string,
  items: { text: string; key: string; after?: string }[],
  brackets: '[]' | '{}'
): TextEdit => {
  const text = sourceFile.text;
  const start = container.getStart(sourceFile);
  const end = container.getEnd();
  const entries = elements.map(element => ({
    text: element.getText(sourceFile),
    key: getKey(element)
  }));
  const compare = (left: string, right: string): number =>
    left.toLowerCase().localeCompare(right.toLowerCase());
  const sorted = entries.every(
    (entry, index) => index === 0 || compare(entries[index - 1].key, entry.key) <= 0
  );

  const result = [...entries];
  for (const item of items) {
    let index = result.length;
    if (sorted && entries.length > 1) {
      const next = result.findIndex(entry => compare(entry.key, item.key) > 0);
      index = next < 0 ? result.length : next;
    } else if (item.after) {
      const anchor = result.findIndex(entry => entry.key === item.after);
      index = anchor < 0 ? result.length : anchor + 1;
    }
    result.splice(index, 0, item);
  }

  const [open, close] = brackets;
  const containerText = text.substring(start, end);
  if (/\/[/*]/.test(containerText.substring(1, containerText.length - 1))) {
    // Keep comments by appending the items instead of rewriting the list.
    const last = elements.at(-1);
    const insertion = items.map(item => item.text).join(', ');
    return last
      ? { start: last.getEnd(), end: last.getEnd(), text: `, ${insertion}` }
      : { start: start + 1, end: start + 1, text: insertion };
  }

  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const lineIndent = getIndentation(text, start);
  const trailingComma = elements.hasTrailingComma ? ',' : '';
  const renderMultiline = (itemIndent: string, closingIndent: string): string =>
    `${open}${eol}${result.map(entry => `${itemIndent}${entry.text}`).join(`,${eol}`)}${trailingComma}${eol}${closingIndent}${close}`;

  if (containerText.includes('\n') && elements.length) {
    return {
      start,
      end,
      text: renderMultiline(
        getIndentation(text, elements[0].getStart(sourceFile)),
        getIndentation(text, end - 1)
      )
    };
  }
  const inner = result.map(entry => entry.text).join(', ');
  const single = brackets === '{}' ? `{ ${inner} }` : `[${inner}]`;
  const lineStart = text.lastIndexOf('\n', start - 1) + 1;
  const lineEnd = text.indexOf('\n', end);
  const lineLength =
    start - lineStart + single.length + ((lineEnd < 0 ? text.length : lineEnd) - end);
  // Only wrap lists that start their own line, such as `imports: [` or `import {`.
  const ownLine = /^\s*(?:import\s+(?:type\s+)?|[\w$]+\s*:\s*)$/.test(
    text.substring(lineStart, start)
  );
  return {
    start,
    end,
    text:
      lineLength > MAX_LINE_LENGTH && ownLine
        ? renderMultiline(`${lineIndent}  `, lineIndent)
        : single
  };
};

const getDecoratorMetadata = (
  declaration: ts.ClassDeclaration,
  decoratorName: string
): ts.ObjectLiteralExpression | undefined => {
  for (const decorator of ts.getDecorators(declaration) ?? []) {
    const call = decorator.expression;
    if (
      ts.isCallExpression(call) &&
      ts.isIdentifier(call.expression) &&
      call.expression.text === decoratorName
    ) {
      const metadata = call.arguments[0];
      return metadata && ts.isObjectLiteralExpression(metadata) ? metadata : undefined;
    }
  }
  return undefined;
};

const getProperty = (
  object: ts.ObjectLiteralExpression,
  name: string
): ts.PropertyAssignment | undefined =>
  object.properties.find(
    (property): property is ts.PropertyAssignment =>
      ts.isPropertyAssignment(property) && getPropertyName(property.name) === name
  );

const getPropertyName = (name: ts.PropertyName | undefined): string | undefined =>
  name && (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isPrivateIdentifier(name))
    ? name.text
    : undefined;

const getIndentation = (text: string, offset: number): string => {
  const lineStart = text.lastIndexOf('\n', offset - 1) + 1;
  return /^[ \t]*/.exec(text.substring(lineStart, offset))![0];
};

const formatLocation = (path: string, content: string, offset: number): string => {
  const before = content.substring(0, offset);
  const line = before.split('\n').length;
  const column = offset - before.lastIndexOf('\n');
  return `${path}:${line}:${column}`;
};

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
