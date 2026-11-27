/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import {
  NgtscProgram,
  EntryType,
  MemberType,
  MemberTags,
  createCompilerHost,
  readConfiguration,
  type DirectiveMeta,
  type DocEntry,
  type ClassEntry,
  type ConstantEntry,
  type DecoratorEntry,
  type DirectiveEntry,
  type DocEntryWithSourceInfo,
  type FunctionDefinitionEntry,
  type MemberEntry,
  type NamespaceEntry,
  type PropertyEntry,
  type ParameterEntry
} from '@angular/compiler-cli';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import { compareText } from '../collation.ts';
import type { ExternalApi, ResolvedApiDocsConfig } from '../configuration.ts';
import type {
  ApiDocumentation,
  ApiEntry,
  ApiEntryPoint,
  ApiJsDocTag,
  ApiMember,
  ApiOrigin,
  ApiParameter,
  ApiSignature,
  ApiSource
} from './model.ts';

interface Project {
  directory: string;
  tsconfig: string;
  packageName: string;
  entryPoints: ApiEntryPoint[];
}

const slash = (value: string): string => value.split(path.sep).join('/');
const relative = (root: string, value: string): string => slash(path.relative(root, value));

function readJson(file: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(readFileSync(file, 'utf8'));
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`Expected an object in ${file}`);
  }
  return parsed as Record<string, unknown>;
}

function discoverProjects({ root, packages, project }: ResolvedApiDocsConfig): Project[] {
  if (!packages.length) throw new Error('No documentation packages configured.');
  const excluded = new Set(['node_modules', 'dist', ...project.skipEntryPoints]);
  return packages.map(directory => {
    const tsconfig = path.resolve(directory, project.tsconfig);
    if (!existsSync(tsconfig)) throw new Error(`Package tsconfig does not exist: ${tsconfig}`);
    if (!existsSync(path.join(directory, 'ng-package.json')))
      throw new Error(`Missing required ng-package.json in ${directory}`);
    const packageName = readJson(path.join(directory, 'package.json')).name;
    if (typeof packageName !== 'string' || !packageName.trim()) {
      throw new Error(`Missing package name in ${directory}/package.json`);
    }
    const entryPoints: ApiEntryPoint[] = [];
    const visit = (dir: string): void => {
      const configFile = path.join(dir, 'ng-package.json');
      if (existsSync(configFile)) {
        const lib = readJson(configFile).lib;
        const entryFile =
          lib && typeof lib === 'object' && 'entryFile' in lib ? lib.entryFile : undefined;
        if (typeof entryFile !== 'string' || !entryFile.trim()) {
          throw new Error(`Invalid lib.entryFile in ${configFile}`);
        }
        const source = path.resolve(dir, entryFile);
        if (!existsSync(source)) {
          throw new Error(`Package entrypoint does not exist: ${source}`);
        }
        const suffix = relative(directory, dir);
        entryPoints.push({
          packageName: suffix ? `${packageName}/${suffix}` : packageName,
          sourcePath: relative(root, source)
        });
      }
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory() && !excluded.has(entry.name) && !entry.name.startsWith('.')) {
          visit(path.join(dir, entry.name));
        }
      }
    };
    visit(directory);
    return {
      directory,
      tsconfig,
      packageName,
      entryPoints: entryPoints.sort((a, b) => compareText(a.packageName, b.packageName))
    };
  });
}

function sourceOf(node: ts.Node, root: string): ApiSource {
  const file = node.getSourceFile();
  const externalPath = slash(file.fileName).split('/node_modules/').at(-1);
  const external = slash(file.fileName).includes('/node_modules/') ? externalPath : undefined;
  const externalPackage = external
    ?.split('/')
    .slice(0, external.startsWith('@') ? 2 : 1)
    .join('/');
  const name =
    ts.isClassDeclaration(node) ||
    ts.isInterfaceDeclaration(node) ||
    ts.isTypeAliasDeclaration(node) ||
    ts.isEnumDeclaration(node) ||
    ts.isEnumMember(node) ||
    ts.isFunctionDeclaration(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isMethodSignature(node) ||
    ts.isPropertyDeclaration(node) ||
    ts.isPropertySignature(node) ||
    ts.isGetAccessor(node) ||
    ts.isSetAccessor(node) ||
    ts.isVariableDeclaration(node) ||
    ts.isParameter(node) ||
    ts.isExportSpecifier(node) ||
    ts.isModuleDeclaration(node)
      ? node.name
      : undefined;
  return {
    filePath: external ? `node_modules/${external}` : relative(root, file.fileName),
    // Legacy source links target the declaration name, not its decorators or JSDoc.
    startLine: file.getLineAndCharacterOfPosition((name ?? node).getStart()).line + 1,
    endLine: file.getLineAndCharacterOfPosition(node.getEnd()).line + 1,
    ...(externalPackage ? { packageName: externalPackage } : {})
  };
}

function hasModifier(node: ts.Node | undefined, kind: ts.SyntaxKind): boolean {
  return (
    !!node && ts.canHaveModifiers(node) && !!ts.getModifiers(node)?.some(mod => mod.kind === kind)
  );
}

function tagsOf(node: ts.Node | undefined): ApiJsDocTag[] {
  return node
    ? ts.getJSDocTags(node).map(tag => ({
        name: tag.tagName.text,
        comment: ts.getTextOfJSDocComment(tag.comment) ?? ''
      }))
    : [];
}

function isExcluded(node: ts.Node | undefined, name: string): boolean {
  return (
    name.startsWith('ɵ') ||
    name.startsWith('#') ||
    hasModifier(node, ts.SyntaxKind.PrivateKeyword) ||
    tagsOf(node).some(tag => tag.name === 'internal')
  );
}

function declarationOf(symbol: ts.Symbol, checker: ts.TypeChecker): ts.Declaration | undefined {
  const resolved = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
  return (
    resolved.declarations?.find(
      declaration =>
        ts.isFunctionLike(declaration) && 'body' in declaration && declaration.body !== undefined
    ) ??
    resolved.valueDeclaration ??
    resolved.declarations?.[0]
  );
}

interface ExportDescriptor {
  name: string;
  declaration?: ts.Declaration;
  facets: ts.Declaration[];
  alias?: ts.ExportSpecifier;
  typeOnly: boolean;
  compilerEntry?: DocEntry;
}

/** Resolve each export and its forwarding chain once per compiler program. */
function exportsOf(
  file: ts.SourceFile,
  checker: ts.TypeChecker,
  cache: Map<ts.SourceFile, Map<string, ExportDescriptor>>
): Map<string, ExportDescriptor> {
  const cached = cache.get(file);
  if (cached) return cached;
  const module = checker.getSymbolAtLocation(file);
  const result = new Map<string, ExportDescriptor>();
  for (const exported of module ? checker.getExportsOfModule(module) : []) {
    const declaration = declarationOf(exported, checker);
    const descriptor: ExportDescriptor = {
      name: exported.name,
      declaration,
      facets: declaration ? declarationFacets(declaration, checker) : [],
      typeOnly: false
    };
    let symbol: ts.Symbol | undefined = exported;
    let fallback: ts.ExportSpecifier | undefined;
    const seen = new Set<ts.Symbol>();
    while (symbol && !seen.has(symbol)) {
      seen.add(symbol);
      const declaration = symbol.declarations?.find(ts.isExportSpecifier);
      if (declaration) {
        fallback ??= declaration;
        if (declaration.propertyName && declaration.propertyName.text !== declaration.name.text) {
          descriptor.alias ??= declaration;
        }
      }
      descriptor.typeOnly ||=
        symbol.declarations?.some(
          declaration =>
            (ts.isExportSpecifier(declaration) &&
              (declaration.isTypeOnly || declaration.parent.parent.isTypeOnly)) ||
            (ts.isImportSpecifier(declaration) &&
              (declaration.isTypeOnly || declaration.parent.parent.isTypeOnly)) ||
            (ts.isImportClause(declaration) && declaration.isTypeOnly) ||
            (ts.isNamespaceImport(declaration) && declaration.parent.isTypeOnly)
        ) ?? false;
      symbol =
        symbol.flags & ts.SymbolFlags.Alias ? checker.getImmediateAliasedSymbol(symbol) : undefined;
    }
    descriptor.alias ??= fallback;
    result.set(exported.name, descriptor);
  }
  for (const statement of file.statements) {
    if (
      !ts.isExportDeclaration(statement) ||
      !statement.isTypeOnly ||
      statement.exportClause ||
      !statement.moduleSpecifier
    )
      continue;
    const target = checker.getSymbolAtLocation(statement.moduleSpecifier);
    for (const exported of target ? checker.getExportsOfModule(target) : []) {
      const descriptor = result.get(exported.name);
      if (descriptor) descriptor.typeOnly = true;
    }
  }
  cache.set(file, result);
  return result;
}

function declarationFacets(declaration: ts.Declaration, checker: ts.TypeChecker): ts.Declaration[] {
  const symbol =
    'name' in declaration && declaration.name
      ? checker.getSymbolAtLocation(declaration.name as ts.Node)
      : undefined;
  const variable = symbol?.declarations?.find(ts.isVariableDeclaration);
  const typeAlias = symbol?.declarations?.find(ts.isTypeAliasDeclaration);
  return variable && typeAlias ? [variable, typeAlias] : [declaration];
}

function aliasDocumentation(node: ts.ExportSpecifier): {
  description: string;
  jsdocTags: ApiJsDocTag[];
  rawComment?: string;
} {
  const statement = node.parent.parent;
  const owner = ts.getJSDocCommentsAndTags(node).some(ts.isJSDoc) ? node : statement;
  const comments = ts.getJSDocCommentsAndTags(owner).filter(ts.isJSDoc);
  return {
    description: comments
      .map(comment => ts.getTextOfJSDocComment(comment.comment) ?? '')
      .join('\n\n')
      .trim(),
    jsdocTags: tagsOf(owner),
    rawComment: rawCommentOf(owner)
  };
}

function addDeclarationVariants(
  entry: ApiEntry,
  descriptor: ExportDescriptor,
  context: Context
): void {
  const { facets, compilerEntry } = descriptor;
  const alias = entry.documentationOnly ? undefined : descriptor.alias;
  if (facets.length !== 2) return;
  entry.declarationVariants = facets.flatMap(declaration => {
    const kind = ts.isVariableDeclaration(declaration) ? EntryType.Constant : EntryType.TypeAlias;
    const variant = extractEntry(
      compilerEntry?.entryType === kind ? compilerEntry : undefined,
      declaration,
      entry.name,
      entry.packageName,
      entry.importPath,
      context,
      alias
    );
    if (!variant) return [];
    variant.id = `${entry.id}:${kind}`;
    variant.typeOnlyExport = entry.typeOnlyExport;
    variant.docsVisible = entry.docsVisible;
    variant.documentationOnly = entry.documentationOnly;
    return [variant];
  });
}

function compilerDocumentation(
  context: Context,
  fileName: string,
  privateModules: Set<string>
): ReturnType<NgtscProgram['getApiDocumentation']> {
  const cached = context.compilerDocumentation.get(fileName);
  if (cached) return cached;
  for (;;) {
    try {
      const documentation = context.program.getApiDocumentation(fileName, privateModules);
      context.compilerDocumentation.set(fileName, documentation);
      return documentation;
    } catch (error: unknown) {
      // Angular rejects its auxiliary imported-symbol map when libraries re-export the
      // same symbol (e.g. DOCUMENT in common/core). privateModules affects that map only,
      // not extracted declarations. Retry without either ambiguous module's map entries.
      const conflict =
        error instanceof Error
          ? /^Ambiguous symbol `[^`]+` exported by both (.+) & (.+)$/.exec(error.message)
          : null;
      if (!conflict || (privateModules.has(conflict[1]) && privateModules.has(conflict[2])))
        throw error;
      privateModules.add(conflict[1]);
      privateModules.add(conflict[2]);
    }
  }
}

/** Angular filters @internal exports before returning entries. Retain their source metadata. */
function exportedDocumentation(
  file: ts.SourceFile,
  privateModules: Set<string>,
  context: Context
): ExportDescriptor[] {
  const cached = context.exportedDocumentation.get(file);
  if (cached) return cached;
  const entries = compilerDocumentation(context, file.fileName, privateModules).entries;
  const descriptors = exportsOf(file, context.checker, context.exports);
  const documented = new Set(entries.map(entry => entry.name));
  const documentation = [
    ...entries.map(compilerEntry => ({
      ...(descriptors.get(compilerEntry.name) ?? {
        name: compilerEntry.name,
        facets: [],
        typeOnly: false
      }),
      compilerEntry
    })),
    ...[...descriptors.values()].filter(
      descriptor => descriptor.declaration && !documented.has(descriptor.name)
    )
  ];
  context.exportedDocumentation.set(file, documentation);
  return documentation;
}

/** Sources must compile successfully; share the checker and Angular analysis across entrypoints. */
export async function extractApiDocumentation(
  config: ResolvedApiDocsConfig
): Promise<ApiDocumentation> {
  const { root, externalApis } = config;
  const projects = discoverProjects(config);
  const entryPoints = projects.flatMap(project => project.entryPoints);
  // Override built-output path mappings (notably translate-ng) with exact source mappings.
  const sourceMappings = Object.fromEntries(
    entryPoints.map(entry => [entry.packageName, [path.resolve(root, entry.sourcePath)]])
  );
  const entries: ApiEntry[] = [];
  for (const project of projects) {
    const compilerConfig = readConfiguration(project.tsconfig);
    const rootNames = project.entryPoints.map(entry => path.resolve(root, entry.sourcePath));
    const options = {
      ...compilerConfig.options,
      paths: { ...compilerConfig.options.paths, ...sourceMappings },
      noEmit: true,
      skipLibCheck: true
    };
    const host = createCompilerHost({ options });
    host.getCurrentDirectory = () => root;
    const program = new NgtscProgram(rootNames, options, host);
    const checker = program.getTsProgram().getTypeChecker();
    const identities = new Map<ts.Declaration, Set<string>>();
    const exports = new Map<ts.SourceFile, Map<string, ExportDescriptor>>();
    for (const entryPoint of entryPoints) {
      const file = program.getTsProgram().getSourceFile(path.resolve(root, entryPoint.sourcePath));
      if (!file) continue;
      for (const { name, facets } of exportsOf(file, checker, exports).values()) {
        for (const facet of facets) {
          const ids = identities.get(facet) ?? new Set<string>();
          ids.add(`${entryPoint.packageName}#${name}`);
          identities.set(facet, ids);
        }
      }
    }
    const context: Context = {
      root,
      program,
      checker,
      identities,
      exports,
      project,
      relatedNodes: new Set(),
      originPackages: new Map(),
      importPaths: new Map(),
      packageImports: new Map(),
      compilerDocumentation: new Map(),
      exportedDocumentation: new Map(),
      sourceSignatures: new Map(),
      sourceDefaults: new Map()
    };
    const documentedDeclarations = new Map<ts.Declaration, Set<string>>();
    const markDocumented = (facets: ts.Declaration[], name: string): void => {
      for (const facet of facets) {
        const names = documentedDeclarations.get(facet) ?? new Set<string>();
        names.add(name);
        documentedDeclarations.set(facet, names);
      }
    };
    const privateModules = new Set(
      projects.flatMap(item =>
        config.project.skipEntryPoints.map(segment => `${item.packageName}/${segment}`)
      )
    );
    const projectImportPaths = new Set(project.entryPoints.map(entry => entry.packageName));
    for (const entryPoint of project.entryPoints) {
      const file = program.getTsProgram().getSourceFile(path.resolve(root, entryPoint.sourcePath))!;
      for (const descriptor of exportedDocumentation(file, privateModules, context)) {
        const { name, compilerEntry, declaration, alias, typeOnly } = descriptor;
        // Barrels re-exporting another entry point's API (e.g. a primary `export *` of every
        // secondary entry point) must not duplicate it. The owning entry point documents it.
        const owner = declaration && importPathOf(declaration, context);
        if (
          owner &&
          owner !== entryPoint.packageName &&
          projectImportPaths.has(owner) &&
          descriptor.facets.every(facet => identities.get(facet)?.has(`${owner}#${name}`))
        )
          continue;
        const entry = extractEntry(
          compilerEntry,
          declaration,
          name,
          project.packageName,
          entryPoint.packageName,
          context,
          alias
        );
        if (!entry) continue;
        markDocumented(descriptor.facets, name);
        entry.docsVisible = !entry.internal;
        entry.typeOnlyExport = typeOnly;
        addDeclarationVariants(entry, descriptor, context);
        entries.push(entry);
      }
    }
    for (const { file, importPath, name, declaration } of externalDeclarations(
      context,
      externalApis
    )) {
      if (
        documentedDeclarations.get(declaration)?.has(name) ||
        entries.some(
          entry =>
            entry.name === name &&
            entry.source.filePath === sourceOf(declaration, root).filePath &&
            entry.source.startLine === sourceOf(declaration, root).startLine
        )
      )
        continue;
      const documentation = exportedDocumentation(file, privateModules, context).find(
        entry => entry.name === name
      );
      const entry =
        documentation &&
        extractEntry(
          documentation.compilerEntry,
          declaration,
          name,
          project.packageName,
          importPath,
          context
        );
      if (!documentation || !entry)
        throw new Error(`Cannot extract external API: ${importPath}#${name}`);
      entry.documentationOnly = true;
      entry.docsVisible = true;
      entry.typeOnlyExport = documentation.typeOnly;
      addDeclarationVariants(entry, documentation, context);
      markDocumented(documentation.facets, name);
      entries.push(entry);
    }
    for (const declaration of context.relatedNodes) {
      if (documentedDeclarations.has(declaration)) continue;
      const name = declarationName(declaration);
      if (!name) continue;
      const compilerRaw = compilerDocumentation(
        context,
        declaration.getSourceFile().fileName,
        privateModules
      ).entries.find(raw => raw.name === name);
      const entry = extractEntry(
        compilerRaw,
        declaration,
        name,
        project.packageName,
        importPathOf(declaration, context),
        context
      );
      if (!entry) throw new Error(`Cannot extract related API: ${name}`);
      entry.id = relatedId(declaration, name, context);
      entry.documentationOnly = true;
      entry.related = true;
      entry.docsVisible = true;
      markDocumented(declarationFacets(declaration, checker), name);
      entries.push(entry);
    }
  }
  for (const { importPath, names } of externalApis) {
    for (const name of names) {
      if (!entries.some(entry => entry.name === name && entry.importPath === importPath)) {
        throw new Error(
          `External API is not available from public package exports: ${importPath}#${name}`
        );
      }
    }
  }
  return {
    schemaVersion: 1,
    entryPoints,
    entries: entries.sort((a, b) => compareText(a.id, b.id))
  };
}

interface Context {
  root: string;
  program: NgtscProgram;
  checker: ts.TypeChecker;
  identities: Map<ts.Declaration, Set<string>>;
  exports: Map<ts.SourceFile, Map<string, ExportDescriptor>>;
  project: Project;
  relatedNodes: Set<ts.Declaration>;
  originPackages: Map<string, string>;
  importPaths: Map<ts.SourceFile, Map<ts.Symbol, string>>;
  packageImports: Map<string, string | undefined>;
  compilerDocumentation: Map<string, ReturnType<NgtscProgram['getApiDocumentation']>>;
  exportedDocumentation: Map<ts.SourceFile, ExportDescriptor[]>;
  sourceSignatures: Map<ts.Node, ApiSignature[] | undefined>;
  sourceDefaults: Map<ts.Node, string | null>;
}

/** Resolve configured external APIs through public modules loaded by the library compiler. */
function externalDeclarations(
  context: Context,
  externalApis: readonly ExternalApi[]
): { file: ts.SourceFile; importPath: string; name: string; declaration: ts.Declaration }[] {
  if (!externalApis.length) return [];
  const program = context.program.getTsProgram();
  const origin = path.resolve(context.root, context.project.entryPoints[0].sourcePath);
  const result: {
    file: ts.SourceFile;
    importPath: string;
    name: string;
    declaration: ts.Declaration;
  }[] = [];
  for (const { importPath, names } of externalApis) {
    const resolved = ts.resolveModuleName(
      importPath,
      origin,
      program.getCompilerOptions(),
      ts.sys
    ).resolvedModule;
    const file = resolved && program.getSourceFile(resolved.resolvedFileName);
    // Modules not loaded by this project are resolved by another project or fail the final check.
    if (!file || packageImportPath(file, context) !== importPath) continue;
    const descriptors = exportsOf(file, context.checker, context.exports);
    for (const name of names) {
      const declaration = descriptors.get(name)?.declaration;
      if (!declaration || isExcluded(declaration, name)) continue;
      result.push({ file, importPath, name, declaration });
      const identities = context.identities.get(declaration) ?? new Set<string>();
      identities.add(`${importPath}#${name}`);
      context.identities.set(declaration, identities);
    }
  }
  return result;
}

function declarationName(node: ts.Declaration): string | undefined {
  return 'name' in node && node.name && ts.isIdentifier(node.name as ts.Node)
    ? (node.name as ts.Identifier).text
    : undefined;
}

function importPathOf(node: ts.Node, context: Context): string {
  const source = node.getSourceFile().fileName;
  return (
    [...context.project.entryPoints]
      .sort((a, b) => b.sourcePath.length - a.sourcePath.length)
      .find(entry =>
        source.startsWith(path.dirname(path.resolve(context.root, entry.sourcePath)) + path.sep)
      )?.packageName ?? context.project.packageName
  );
}

function relatedId(node: ts.Node, name: string, context: Context): string {
  return `${importPathOf(node, context)}#${name}@${relative(context.root, node.getSourceFile().fileName)}`;
}

/** Collect members for structural types and enums not supplied by Angular. */
function sourceMembers(
  owner: ts.InterfaceDeclaration | ts.TypeAliasDeclaration | ts.EnumDeclaration,
  context: Context
): ApiMember[] {
  if (ts.isEnumDeclaration(owner))
    return owner.members
      .filter(member => !isExcluded(member, member.name.getText()))
      .map(member => {
        const value = context.checker.getConstantValue(member);
        const memberSymbol = context.checker.getSymbolAtLocation(member.name);
        return prepareMember(
          {
            ...sourceMember(member.name.getText(), owner, member, context, memberSymbol),
            kind: MemberType.EnumItem,
            type: typeof value
          },
          owner,
          member,
          context
        );
      });
  if (
    ts.isTypeAliasDeclaration(owner) &&
    !ts.isTypeLiteralNode(owner.type) &&
    !ts.isIntersectionTypeNode(owner.type)
  )
    return [];
  const symbols = context.checker.getTypeAtLocation(owner).getProperties();
  const members = symbols.flatMap<ApiMember>(symbol => {
    const declaration = declarationOf(symbol, context.checker);
    if (!declaration || isExcluded(declaration, symbol.name)) return [];
    const name =
      'name' in declaration &&
      declaration.name &&
      ts.isPrivateIdentifier(declaration.name as ts.Node)
        ? (declaration.name as ts.PrivateIdentifier).text
        : 'name' in declaration &&
            declaration.name &&
            ts.isComputedPropertyName(declaration.name as ts.Node)
          ? (declaration.name as ts.ComputedPropertyName).getText()
          : symbol.name;
    const member = prepareMember(
      {
        ...sourceMember(name, owner, declaration, context, symbol),
        type: context.checker.typeToString(
          context.checker.getTypeOfSymbolAtLocation(symbol, declaration),
          declaration,
          ts.TypeFormatFlags.NoTruncation
        )
      },
      owner,
      declaration,
      context
    );
    return [member];
  });
  return [...members, ...indexSignatureMembers(owner, context)];
}

/** Collect index signatures declared directly on a class, interface, or type alias. */
function indexSignatureMembers(
  owner: TypeOwner | ts.TypeAliasDeclaration,
  context: Context
): ApiMember[] {
  const { checker } = context;
  return checker.getIndexInfosOfType(checker.getTypeAtLocation(owner)).flatMap(index => {
    const node = index.declaration;
    if (!node || declaringOwner(node) !== owner || isExcluded(node, '')) return [];
    const parameter = node.parameters[0];
    const keyType = typeText(
      checker.typeToString(index.keyType, owner, ts.TypeFormatFlags.NoTruncation),
      node,
      context
    );
    const name = `[${parameter.name.getText()}: ${keyType}]`;
    return [
      {
        ...sourceMember(name, owner, node, context),
        kind: 'index_signature',
        type: typeText(
          checker.typeToString(index.type, owner, ts.TypeFormatFlags.NoTruncation),
          node,
          context
        ),
        description: descriptionOf(node),
        rawComment: rawCommentOf(node),
        readonly: index.isReadonly,
        inherited: false
      }
    ];
  });
}

/** Shared metadata for source-backed members. */
function sourceMember(
  name: string,
  owner: ts.Declaration,
  node: ts.Declaration | undefined,
  context: Context,
  symbol?: ts.Symbol
): Omit<ApiMember, 'type'> {
  return {
    name,
    kind: 'property',
    description: symbol
      ? ts.displayPartsToString(symbol.getDocumentationComment(context.checker))
      : '',
    jsdocTags: tagsOf(node),
    source: node ? sourceOf(node, context.root) : undefined,
    visibility: visibilityOf(node),
    readonly: hasModifier(node, ts.SyntaxKind.ReadonlyKeyword),
    ...referencesOf(node, context),
    ...memberProvenance(node, owner, name, context)
  };
}

function visibilityOf(node: ts.Node | undefined, protectedMember = false): ApiMember['visibility'] {
  return hasModifier(node, ts.SyntaxKind.PrivateKeyword) ||
    (!!node && 'name' in node && !!node.name && ts.isPrivateIdentifier(node.name as ts.Node))
    ? 'private'
    : protectedMember || hasModifier(node, ts.SyntaxKind.ProtectedKeyword)
      ? 'protected'
      : 'public';
}

function sourceKindOf(node: ts.Declaration): string | undefined {
  return ts.isTypeAliasDeclaration(node)
    ? EntryType.TypeAlias
    : ts.isInterfaceDeclaration(node)
      ? EntryType.Interface
      : ts.isEnumDeclaration(node)
        ? EntryType.Enum
        : ts.isVariableDeclaration(node)
          ? EntryType.Constant
          : undefined;
}

function sourceGenerics(node: ts.Declaration): string[] {
  return ts.isClassDeclaration(node) ||
    ts.isInterfaceDeclaration(node) ||
    ts.isTypeAliasDeclaration(node) ||
    ts.isFunctionLike(node)
    ? (node.typeParameters?.map(
        parameter =>
          `${parameter.name.text}${parameter.constraint ? ` extends ${parameter.constraint.getText()}` : ''}${parameter.default ? ` = ${parameter.default.getText()}` : ''}`
      ) ?? [])
    : [];
}

function sourceEntryType(node: ts.Declaration, context: Context): string | undefined {
  if (ts.isTypeAliasDeclaration(node)) return typeText(node.type.getText(), node, context);
  if (ts.isVariableDeclaration(node))
    return typeText(
      context.checker.typeToString(
        context.checker.getBaseTypeOfLiteralType(context.checker.getTypeAtLocation(node)),
        node,
        ts.TypeFormatFlags.NoTruncation
      ),
      node,
      context
    );
  return undefined;
}

/**
 * Source-only entries for what Angular never documents: related types reached through public
 * signatures and the second facet of a same-named constant/type pair.
 */
function sourceEntry(
  node: ts.Declaration,
  name: string,
  packageName: string,
  importPath: string,
  context: Context,
  alias?: ts.ExportSpecifier
): ApiEntry | undefined {
  const kind = sourceKindOf(node);
  if (!kind) {
    if (
      ts.isClassDeclaration(node) ||
      ts.isFunctionDeclaration(node) ||
      ts.isModuleDeclaration(node)
    )
      throw new Error(`Angular did not document the public export ${importPath}#${name}`);
    return undefined;
  }
  const entry = entryOf(
    name,
    kind,
    descriptionOf(node),
    tagsOf(node),
    node,
    packageName,
    importPath,
    context,
    alias
  );
  entry.type = sourceEntryType(node, context);
  if (ts.isVariableDeclaration(node)) {
    const initializer = initializerOf(node);
    if (initializer && ts.isFunctionLike(initializer)) entry.generics = sourceGenerics(initializer);
  } else if (
    ts.isInterfaceDeclaration(node) ||
    ts.isTypeAliasDeclaration(node) ||
    ts.isEnumDeclaration(node)
  ) {
    entry.members = sourceMembers(node, context);
    entry.generics = sourceGenerics(node);
  }
  return finishEntry(entry, node, context);
}

function entityNameText(name: ts.EntityName): string {
  return ts.isIdentifier(name) ? name.text : `${entityNameText(name.left)}.${name.right.text}`;
}

/** Resolve type references by compiler symbol identity, not unqualified name matching. */
function referencesOf(
  node: ts.Node | undefined,
  context: Context
): Required<Pick<ApiEntry, 'references' | 'typeReferences'>> {
  const references = new Set<string>();
  const candidates: { declaration: ts.Declaration; symbol: ts.Symbol; type: ts.Type }[] = [];
  if (!node) return { references: [], typeReferences: [] };
  visitTypes(node, context, type => {
    for (const symbol of [type.aliasSymbol, type.getSymbol()]) {
      if (!symbol) continue;
      for (const declaration of symbol.declarations ?? []) {
        const name = declarationName(declaration);
        if (
          !context.identities.has(declaration) &&
          name &&
          !declaration.getSourceFile().isDeclarationFile &&
          declaration.getSourceFile().fileName.startsWith(context.project.directory + path.sep) &&
          (ts.isInterfaceDeclaration(declaration) ||
            ts.isTypeAliasDeclaration(declaration) ||
            ts.isEnumDeclaration(declaration)) &&
          !isExcluded(declaration, name)
        ) {
          context.identities.set(declaration, new Set([relatedId(declaration, name, context)]));
          context.relatedNodes.add(declaration);
        }
        for (const identity of context.identities.get(declaration) ?? []) references.add(identity);
      }
      if (symbol.flags & ts.SymbolFlags.TypeParameter || /^(__|ɵ)/.test(symbol.name)) continue;
      const declaration = symbol.declarations?.find(
        declaration =>
          ts.isClassDeclaration(declaration) ||
          ts.isInterfaceDeclaration(declaration) ||
          ts.isTypeAliasDeclaration(declaration) ||
          ts.isEnumDeclaration(declaration)
      );
      if (
        declaration &&
        !context.program.getTsProgram().isSourceFileDefaultLibrary(declaration.getSourceFile())
      )
        candidates.push({ declaration, symbol, type });
    }
  });
  // Finish admission before resolving origins: a later type can establish an
  // identity used by an earlier candidate in the same graph.
  const origins = new Map<string, ApiOrigin>();
  for (const { declaration, symbol, type } of candidates) {
    const origin = declarationOrigin(declaration, symbol.name, type, node, context);
    const reference = context.checker.symbolToEntityName(
      symbol,
      ts.SymbolFlags.Type,
      node,
      undefined
    );
    if (reference) origin.referenceName = entityNameText(reference);
    origins.set(
      `${origin.name}:${origin.source.filePath}:${origin.source.startLine}:${origin.type}`,
      origin
    );
  }
  return {
    references: [...references].sort(),
    typeReferences: [...origins.values()].sort(
      (a, b) => compareText(a.name, b.name) || compareText(a.source.filePath, b.source.filePath)
    )
  };
}

/** Traverse signatures/type arguments, never the properties of external libraries. */
function visitTypes(node: ts.Node, context: Context, visitType: (type: ts.Type) => void): void {
  const seen = new Set<ts.Type>();
  const collect = (type: ts.Type): void => {
    if (seen.has(type)) return;
    seen.add(type);
    visitType(type);
    if (type.isUnionOrIntersection()) type.types.forEach(collect);
    type.aliasTypeArguments?.forEach(collect);
    if (
      type.flags & ts.TypeFlags.Object &&
      (type as ts.ObjectType).objectFlags & ts.ObjectFlags.Reference
    ) {
      context.checker.getTypeArguments(type as ts.TypeReference).forEach(collect);
    }
    for (const signature of type.getCallSignatures()) {
      collect(signature.getReturnType());
      for (const parameter of signature.parameters) {
        const declaration = parameter.valueDeclaration;
        if (declaration) collect(context.checker.getTypeOfSymbolAtLocation(parameter, declaration));
      }
    }
  };
  collect(context.checker.getTypeAtLocation(node));
  const visit = (child: ts.Node): void => {
    if (
      hasModifier(child, ts.SyntaxKind.PrivateKeyword) ||
      tagsOf(child).some(tag => tag.name === 'internal')
    )
      return;
    if (ts.isTypeNode(child)) collect(context.checker.getTypeFromTypeNode(child));
    // Method bodies are implementation details, not part of the public signature.
    if (!ts.isBlock(child)) ts.forEachChild(child, visit);
  };
  ts.forEachChild(node, visit);
}

function memberDeclaration(
  node: ts.Declaration | undefined,
  name: string,
  checker: ts.TypeChecker,
  isStatic = false,
  kind?: MemberEntry['memberType']
): ts.Declaration | undefined {
  if (!node) return undefined;
  if (ts.isEnumDeclaration(node))
    return node.members.find(member => member.name.getText() === name);
  if (name === 'constructor' && ts.isClassDeclaration(node)) return constructorOf(node);
  const type =
    isStatic && ts.isClassDeclaration(node) && node.name
      ? checker.getTypeAtLocation(node.name).getSymbol()
      : undefined;
  const staticType = type ? checker.getTypeOfSymbolAtLocation(type, node) : undefined;
  const symbol = (staticType ?? checker.getTypeAtLocation(node)).getProperty(name);
  const accessor = symbol?.declarations?.find(
    declaration =>
      (kind === MemberType.Getter && ts.isGetAccessor(declaration)) ||
      (kind === MemberType.Setter && ts.isSetAccessor(declaration))
  );
  if (accessor) return accessor;
  return symbol ? declarationOf(symbol, checker) : undefined;
}

/** Remove declaration-file namespace aliases only when they resolve to real imported exports. */
function typeText(value: string, node: ts.Node | undefined, context: Context): string {
  const namespaces = new Map<string, Set<string>>();
  for (const statement of node?.getSourceFile().statements ?? []) {
    if (!ts.isImportDeclaration(statement)) continue;
    const binding = statement.importClause?.namedBindings;
    if (!binding || !ts.isNamespaceImport(binding)) continue;
    const symbol = context.checker.getSymbolAtLocation(binding.name);
    if (!symbol) continue;
    const module =
      symbol.flags & ts.SymbolFlags.Alias ? context.checker.getAliasedSymbol(symbol) : symbol;
    namespaces.set(
      binding.name.text,
      new Set(context.checker.getExportsOfModule(module).map(item => item.name))
    );
  }
  return value
    .replace(/\bimport\(["'][^"']+["']\)\./g, '')
    .replace(/\b([\w$]+)\.([\w$]+)/g, (original: string, namespace: string, name: string) =>
      namespaces.get(namespace)?.has(name) ? name : original
    );
}

function rawCommentOf(node: ts.Node | undefined): string | undefined {
  const comments = node ? ts.getJSDocCommentsAndTags(node).filter(ts.isJSDoc) : [];
  return comments.length ? comments.map(comment => comment.getText()).join('\n') : undefined;
}

function descriptionOf(node: ts.Node): string {
  return ts
    .getJSDocCommentsAndTags(node)
    .filter(ts.isJSDoc)
    .map(comment => ts.getTextOfJSDocComment(comment.comment) ?? '')
    .join('\n\n')
    .trim();
}

function initializerOf(node: ts.Node | undefined): ts.Expression | undefined {
  return node &&
    (ts.isVariableDeclaration(node) ||
      ts.isPropertyDeclaration(node) ||
      ts.isParameter(node) ||
      ts.isEnumMember(node) ||
      ts.isBindingElement(node))
    ? node.initializer
    : undefined;
}

function angularInitializer(
  node: ts.Node | undefined,
  context: Pick<Context, 'checker'>
):
  | {
      call: ts.CallExpression;
      name: string;
      required: boolean;
    }
  | undefined {
  let expression = initializerOf(node);
  while (
    expression &&
    (ts.isParenthesizedExpression(expression) ||
      ts.isAsExpression(expression) ||
      ts.isSatisfiesExpression(expression))
  ) {
    expression = expression.expression;
  }
  if (!expression || !ts.isCallExpression(expression)) return undefined;
  const required =
    ts.isPropertyAccessExpression(expression.expression) &&
    expression.expression.name.text === 'required';
  const callee =
    required && ts.isPropertyAccessExpression(expression.expression)
      ? expression.expression.expression
      : expression.expression;
  const location = ts.isPropertyAccessExpression(callee) ? callee.name : callee;
  const symbol = context.checker.getSymbolAtLocation(location);
  const resolved =
    symbol && symbol.flags & ts.SymbolFlags.Alias
      ? context.checker.getAliasedSymbol(symbol)
      : symbol;
  const declaration = resolved ? declarationOf(resolved, context.checker) : undefined;
  if (
    !resolved ||
    !/^(input|model|signal|computed)$/.test(resolved.name) ||
    !declaration ||
    !slash(declaration.getSourceFile().fileName).includes('/@angular/core/')
  )
    return undefined;
  return { call: expression, name: resolved.name, required };
}

function initializerMetadata(
  node: ts.Declaration | undefined,
  context: Context,
  contextualType?: ts.Type,
  substitutions = new Map<string, string>()
): Pick<ApiMember, 'sourceDefaultValue' | 'signalReadType' | 'signalTransformType' | 'rawComment'> {
  const initializer = angularInitializer(node, context);
  const type = contextualType ?? (node ? context.checker.getTypeAtLocation(node) : undefined);
  const signalNames = new Set([
    'InputSignal',
    'InputSignalWithTransform',
    'ModelSignal',
    'Signal',
    'WritableSignal'
  ]);
  const signalType = [type?.aliasSymbol, type?.getSymbol()].some(
    symbol =>
      symbol &&
      signalNames.has(symbol.name) &&
      symbol.declarations?.some(declaration =>
        slash(declaration.getSourceFile().fileName).includes('/@angular/core/')
      )
  );
  const readSignature = initializer || signalType ? type?.getCallSignatures()[0] : undefined;
  const options = initializer?.call.arguments[initializer.required ? 0 : 1];
  const transform = options
    ? context.checker
        .getNonNullableType(context.checker.getTypeAtLocation(options))
        .getProperty('transform')
    : undefined;
  const transformSignature =
    transform && options
      ? context.checker
          .getNonNullableType(context.checker.getTypeOfSymbolAtLocation(transform, options))
          .getCallSignatures()[0]
      : undefined;
  return {
    sourceDefaultValue: sourceDefaultValue(node, context),
    signalReadType: readSignature
      ? typeText(
          context.checker.typeToString(
            readSignature.getReturnType(),
            node,
            ts.TypeFormatFlags.NoTruncation
          ),
          node,
          context
        )
      : undefined,
    signalTransformType: transformSignature
      ? substituteType(
          typeText(
            context.checker.typeToString(
              transformSignature.getReturnType(),
              node,
              ts.TypeFormatFlags.NoTruncation
            ),
            node,
            context
          ),
          substitutions
        )
      : undefined,
    rawComment: rawCommentOf(node)
  };
}

type TypeOwner = ts.ClassDeclaration | ts.InterfaceDeclaration;

function owningType(node: ts.Node | undefined): TypeOwner | undefined {
  let owner = node?.parent;
  while (owner && !ts.isClassDeclaration(owner) && !ts.isInterfaceDeclaration(owner))
    owner = owner.parent;
  return owner;
}

function declaringOwner(
  node: ts.Node | undefined
): TypeOwner | ts.TypeAliasDeclaration | undefined {
  let owner = node?.parent;
  while (
    owner &&
    !ts.isClassDeclaration(owner) &&
    !ts.isInterfaceDeclaration(owner) &&
    !ts.isTypeAliasDeclaration(owner)
  )
    owner = owner.parent;
  return owner;
}

function typeOwner(type: ts.Type): TypeOwner | undefined {
  return type
    .getSymbol()
    ?.declarations?.find(
      (declaration): declaration is TypeOwner =>
        ts.isClassDeclaration(declaration) || ts.isInterfaceDeclaration(declaration)
    );
}

function packageOf(node: ts.Node, context: Context): string {
  const source = sourceOf(node, context.root);
  if (source.packageName) return source.packageName;
  const file = node.getSourceFile().fileName;
  const cached = context.originPackages.get(file);
  if (cached) return cached;
  let directory = path.dirname(file);
  let packageName = context.project.packageName;
  while (directory !== context.root && path.dirname(directory) !== directory) {
    const manifest = path.join(directory, 'package.json');
    if (existsSync(manifest)) {
      const name = readJson(manifest).name;
      if (typeof name === 'string') packageName = name;
      break;
    }
    directory = path.dirname(directory);
  }
  context.originPackages.set(file, packageName);
  return packageName;
}

function resolvedSymbol(symbol: ts.Symbol, context: Context): ts.Symbol {
  return symbol.flags & ts.SymbolFlags.Alias ? context.checker.getAliasedSymbol(symbol) : symbol;
}

function semanticImportPath(
  symbol: ts.Symbol,
  location: ts.Node,
  context: Context
): string | undefined {
  const file = location.getSourceFile();
  let imports = context.importPaths.get(file);
  if (!imports) {
    imports = new Map();
    for (const statement of file.statements) {
      if (
        !ts.isImportDeclaration(statement) ||
        !ts.isStringLiteral(statement.moduleSpecifier) ||
        statement.moduleSpecifier.text.startsWith('.')
      )
        continue;
      const importPath = statement.moduleSpecifier.text;
      const clause = statement.importClause;
      const add = (name: ts.Node): void => {
        const imported = context.checker.getSymbolAtLocation(name);
        if (imported) imports?.set(resolvedSymbol(imported, context), importPath);
      };
      if (clause?.name) add(clause.name);
      const bindings = clause?.namedBindings;
      if (bindings && ts.isNamedImports(bindings))
        bindings.elements.forEach(binding => add(binding.name));
      if (bindings && ts.isNamespaceImport(bindings)) {
        const namespace = context.checker.getSymbolAtLocation(bindings.name);
        if (namespace) {
          for (const exported of context.checker.getExportsOfModule(
            resolvedSymbol(namespace, context)
          )) {
            imports.set(resolvedSymbol(exported, context), importPath);
          }
        }
      }
    }
    context.importPaths.set(file, imports);
  }
  return imports.get(resolvedSymbol(symbol, context));
}

function substituteType(value: string, substitutions: ReadonlyMap<string, string>): string {
  if (!substitutions.size) return value;
  const scanner = ts.createScanner(
    ts.ScriptTarget.Latest,
    false,
    ts.LanguageVariant.Standard,
    value
  );
  let result = '';
  let previous = 0;
  for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan()) {
    if (token !== ts.SyntaxKind.Identifier) continue;
    const replacement = substitutions.get(scanner.getTokenText());
    if (replacement === undefined) continue;
    result += value.slice(previous, scanner.getTokenPos()) + replacement;
    previous = scanner.getTextPos();
  }
  return result + value.slice(previous);
}

/** Recover public secondary modules when a declaration file is itself an exports.types target. */
function packageImportPath(node: ts.Node, context: Context): string | undefined {
  const file = node.getSourceFile().fileName;
  if (!sourceOf(node, context.root).packageName) return undefined;
  if (context.packageImports.has(file)) return context.packageImports.get(file);
  const matches = (value: unknown, target: string): boolean => {
    if (typeof value === 'string') return value === target;
    if (Array.isArray(value)) return value.some(item => matches(item, target));
    return (
      !!value &&
      typeof value === 'object' &&
      Object.values(value).some(item => matches(item, target))
    );
  };
  let directory = path.dirname(file);
  let importPath: string | undefined;
  while (path.dirname(directory) !== directory) {
    const manifest = path.join(directory, 'package.json');
    if (existsSync(manifest)) {
      const config = readJson(manifest);
      if (typeof config.name === 'string' && config.exports && typeof config.exports === 'object') {
        const target = './' + relative(directory, file);
        const exported = Object.entries(config.exports).find(
          ([name, value]) =>
            name.startsWith('.') &&
            !name.includes('*') &&
            !name.split('/').some(part => ['private', 'internal', 'testing'].includes(part)) &&
            matches(value, target)
        );
        if (exported) importPath = config.name + (exported[0] === '.' ? '' : exported[0].slice(1));
      }
      break;
    }
    directory = path.dirname(directory);
  }
  context.packageImports.set(file, importPath);
  return importPath;
}

function typeSubstitutions(type: ts.Type, context: Context): Map<string, string> {
  const owner = typeOwner(type);
  const arguments_ =
    type.flags & ts.TypeFlags.Object &&
    (type as ts.ObjectType).objectFlags & ts.ObjectFlags.Reference
      ? context.checker.getTypeArguments(type as ts.TypeReference)
      : [];
  return new Map(
    (owner?.typeParameters ?? []).flatMap((parameter, index) => {
      const argument = arguments_[index];
      return argument
        ? [
            [
              parameter.name.text,
              typeText(
                context.checker.typeToString(argument, owner, ts.TypeFormatFlags.NoTruncation),
                owner,
                context
              )
            ]
          ]
        : [];
    })
  );
}

function declarationOrigin(
  node: ts.Declaration,
  name: string,
  type: ts.Type,
  location: ts.Node,
  context: Context
): ApiOrigin {
  const preferredImportPath = importPathOf(node, context);
  const identities = [...(context.identities.get(node) ?? [])].sort();
  const id =
    identities.find(identity => identity === `${preferredImportPath}#${name}`) ??
    identities.find(identity => identity.endsWith(`#${name}`)) ??
    identities[0];
  const source = sourceOf(node, context.root);
  const symbol = type.aliasSymbol ?? type.getSymbol();
  return {
    name,
    packageName: packageOf(node, context),
    importPath:
      (symbol && semanticImportPath(symbol, location, context)) ||
      (id && !id.includes('@' + relative(context.root, node.getSourceFile().fileName))
        ? id.split('#')[0]
        : (packageImportPath(node, context) ?? source.packageName)),
    id,
    source,
    type: typeText(
      context.checker.typeToString(type, location, ts.TypeFormatFlags.NoTruncation),
      location,
      context
    )
  };
}

function originOf(
  owner: TypeOwner,
  type: ts.Type,
  context: Context,
  substitutions = new Map<string, string>()
): ApiOrigin {
  const origin = declarationOrigin(
    owner,
    owner.name?.text ?? type.getSymbol()?.name ?? '',
    type,
    owner,
    context
  );
  return { ...origin, type: substituteType(origin.type ?? '', substitutions) };
}

function baseTypes(type: ts.Type): readonly ts.BaseType[] {
  const bases = type.getBaseTypes();
  if (bases) return bases;
  return type.flags & ts.TypeFlags.Object &&
    (type as ts.ObjectType).objectFlags & ts.ObjectFlags.Reference
    ? ((type as ts.TypeReference).target.getBaseTypes() ?? [])
    : [];
}

function typeForOwner(
  type: ts.Type,
  owner: TypeOwner,
  context: Context,
  outer = new Map<string, string>(),
  seen = new Set<ts.Type>()
):
  | {
      type: ts.Type;
      substitutions: Map<string, string>;
      displaySubstitutions: Map<string, string>;
    }
  | undefined {
  if (seen.has(type)) return undefined;
  seen.add(type);
  const substitutions = new Map(outer);
  for (const [parameter, argument] of typeSubstitutions(type, context)) {
    substitutions.set(parameter, substituteType(argument, outer));
  }
  if (typeOwner(type) === owner) return { type, substitutions, displaySubstitutions: outer };
  for (const base of baseTypes(type)) {
    const found = typeForOwner(base, owner, context, substitutions, seen);
    if (found) return found;
  }
  return undefined;
}

function memberOrigin(
  type: ts.Type,
  name: string,
  context: Context,
  isStatic: boolean,
  substitutions = new Map<string, string>(),
  seen = new Set<ts.Type>()
): ApiOrigin | undefined {
  if (seen.has(type)) return undefined;
  seen.add(type);
  const owner = typeOwner(type);
  const symbol = type.getSymbol();
  const memberType =
    isStatic && owner && symbol ? context.checker.getTypeOfSymbolAtLocation(symbol, owner) : type;
  const property = memberType.getProperty(name);
  const declaration = property ? declarationOf(property, context.checker) : undefined;
  const declaringOwner = owningType(declaration);
  if (owner && declaringOwner === owner) return originOf(owner, type, context, substitutions);
  const inheritedSubstitutions = new Map(substitutions);
  for (const [parameter, argument] of typeSubstitutions(type, context)) {
    inheritedSubstitutions.set(parameter, substituteType(argument, substitutions));
  }
  for (const base of baseTypes(type)) {
    const found = memberOrigin(base, name, context, isStatic, inheritedSubstitutions, seen);
    if (found) return found;
  }
  return undefined;
}

function implementedOrigin(
  type: ts.Type,
  name: string,
  context: Context,
  outer = new Map<string, string>(),
  seen = new Set<ts.Type>()
): ApiOrigin | undefined {
  if (seen.has(type)) return undefined;
  seen.add(type);
  const owner = typeOwner(type);
  const substitutions = new Map(outer);
  for (const [parameter, argument] of typeSubstitutions(type, context)) {
    substitutions.set(parameter, substituteType(argument, outer));
  }
  for (const clause of owner?.heritageClauses ?? []) {
    if (clause.token !== ts.SyntaxKind.ImplementsKeyword) continue;
    for (const implemented of clause.types) {
      const found = memberOrigin(
        context.checker.getTypeAtLocation(implemented),
        name,
        context,
        false,
        substitutions
      );
      if (found) return found;
    }
  }
  for (const base of baseTypes(type)) {
    const found = implementedOrigin(base, name, context, substitutions, seen);
    if (found) return found;
  }
  return undefined;
}

function memberProvenance(
  node: ts.Declaration | undefined,
  owner: ts.Declaration | undefined,
  name: string,
  context: Context
): Pick<ApiMember, 'inheritedFrom' | 'implementedFrom'> {
  const declaringOwner = owningType(node);
  if (
    !owner ||
    !declaringOwner ||
    (!ts.isClassDeclaration(owner) && !ts.isInterfaceDeclaration(owner))
  )
    return {};
  const type = context.checker.getTypeAtLocation(owner);
  let inheritedFrom: ApiOrigin | undefined;
  for (const base of baseTypes(type)) {
    inheritedFrom = memberOrigin(
      base,
      name,
      context,
      hasModifier(node, ts.SyntaxKind.StaticKeyword)
    );
    if (inheritedFrom) break;
  }
  return {
    inheritedFrom,
    implementedFrom: implementedOrigin(type, name, context)
  };
}

function sourceDefaultValue(node: ts.Node | undefined, context: Context): string | null {
  if (!node) return null;
  const cached = context.sourceDefaults.get(node);
  if (cached !== undefined) return cached;
  const expression = initializerOf(node);
  const signal = expression ? angularInitializer(node, context) : undefined;
  const value =
    signal && signal.name !== 'computed'
      ? signal.required
        ? null
        : (signal.call.arguments[0]?.getText() ?? null)
      : (expression?.getText() ?? null);
  context.sourceDefaults.set(node, value);
  return value;
}

function parametersOf(
  raw: { params: ParameterEntry[] },
  node: ts.Node | undefined,
  context: Context
): ApiParameter[] {
  const declarations = node && ts.isFunctionLike(node) ? node.parameters : [];
  return raw.params.map(param => {
    const declaration = declarations.find(item => item.name.getText() === param.name);
    return {
      name: param.name,
      type: typeText(param.type, declaration ?? node, context),
      description: param.description,
      source: declaration ? sourceOf(declaration, context.root) : undefined,
      optional: param.isOptional,
      rest: param.isRestParam,
      sourceDefaultValue: sourceDefaultValue(declaration, context),
      jsdocTags: tagsOf(declaration),
      rawComment: rawCommentOf(declaration)
    };
  });
}

function signatureOf(
  raw: MemberEntry | DocEntry
): { params: ParameterEntry[]; returnType: string } | undefined {
  if (!('implementation' in raw || 'signatures' in raw)) return undefined;
  const callable = raw as Partial<FunctionDefinitionEntry>;
  return callable.implementation ?? callable.signatures?.[0];
}

function sourceSignature(
  node: ts.Node | undefined,
  context: Context,
  resolvedSignature?: ts.Signature
): ApiSignature | undefined {
  if (!node || !ts.isFunctionLike(node) || ts.isGetAccessor(node) || ts.isSetAccessor(node))
    return undefined;
  const signature = resolvedSignature ?? context.checker.getSignatureFromDeclaration(node)!;
  return {
    returnType: typeText(
      context.checker.typeToString(
        signature.getReturnType(),
        node,
        ts.TypeFormatFlags.NoTruncation
      ),
      node,
      context
    ),
    parameters: node.parameters.map((parameter, index) => {
      const symbol = context.checker.getSymbolAtLocation(parameter.name);
      return {
        name: parameter.name.getText(),
        type: typeText(
          context.checker.typeToString(
            signature.parameters[index]
              ? context.checker.getTypeOfSymbolAtLocation(signature.parameters[index], parameter)
              : context.checker.getTypeAtLocation(parameter),
            parameter,
            ts.TypeFormatFlags.NoTruncation
          ),
          parameter,
          context
        ),
        description: symbol
          ? ts.displayPartsToString(symbol.getDocumentationComment(context.checker))
          : '',
        source: sourceOf(parameter, context.root),
        optional: !!parameter.questionToken || !!parameter.initializer,
        rest: !!parameter.dotDotDotToken,
        sourceDefaultValue: sourceDefaultValue(parameter, context),
        jsdocTags: tagsOf(parameter),
        rawComment: rawCommentOf(parameter)
      };
    }),
    generics: node.typeParameters?.map(parameter => parameter.getText()) ?? [],
    // The checker can concatenate every implemented overload's prose. Keep
    // declaration-local text here and inherit from a matching signature later.
    description: descriptionOf(node),
    jsdocTags: tagsOf(node),
    source: sourceOf(node, context.root),
    rawComment: rawCommentOf(node),
    implementation: 'body' in node && node.body !== undefined
  };
}

function sourceSignatures(node: ts.Node | undefined, context: Context): ApiSignature[] | undefined {
  // Accessors and function-valued properties expose value types, not methods.
  // In particular, a callback initializer may be narrower than its declared type.
  if (
    !node ||
    ts.isGetAccessor(node) ||
    ts.isSetAccessor(node) ||
    ts.isPropertyDeclaration(node) ||
    ts.isPropertySignature(node)
  )
    return undefined;
  if (context.sourceSignatures.has(node)) return context.sourceSignatures.get(node);
  const expression = initializerOf(node);
  const callable = ts.isFunctionLike(node)
    ? node
    : expression && ts.isFunctionLike(expression)
      ? expression
      : undefined;
  if (!callable) {
    context.sourceSignatures.set(node, undefined);
    return undefined;
  }
  const name = 'name' in callable ? callable.name : undefined;
  const symbol = name ? context.checker.getSymbolAtLocation(name) : undefined;
  const declarations =
    ts.isConstructorDeclaration(callable) && ts.isClassDeclaration(callable.parent)
      ? callable.parent.members.filter(ts.isConstructorDeclaration)
      : (symbol?.declarations ?? []).filter(
          (declaration): declaration is ts.SignatureDeclaration =>
            ts.isFunctionLike(declaration) && declaration.kind === callable.kind
        );
  const signatures = (declarations.length ? declarations : [callable]).map(declaration =>
    sourceSignature(declaration, context)!
  );
  context.sourceSignatures.set(node, signatures);
  return signatures;
}

function constructorOf(node: ts.ClassDeclaration): ts.ConstructorDeclaration | undefined {
  const declarations = node.members.filter(ts.isConstructorDeclaration);
  return declarations.find(declaration => declaration.body !== undefined) ?? declarations[0];
}

function instantiateSignatures(
  signatures: ApiSignature[] | undefined,
  substitutions: ReadonlyMap<string, string>
): ApiSignature[] | undefined {
  return signatures?.map(signature => {
    const applicable = new Map(substitutions);
    for (const generic of signature.generics) {
      const name = /^(?:const\s+)?([\w$]+)/.exec(generic)?.[1];
      if (name) applicable.delete(name);
    }
    return {
      ...signature,
      returnType: substituteType(signature.returnType, applicable),
      parameters: signature.parameters.map(parameter => ({
        ...parameter,
        type: substituteType(parameter.type, applicable)
      }))
    };
  });
}

/**
 * Angular documents only constructors declared in the class itself. Every other class gets a
 * parameterless constructor, deliberately not resolving inherited signatures; a declared
 * constructor that Angular omits (private or internal) stays hidden.
 */
function implicitConstructor(node: ts.ClassDeclaration, context: Context): ApiMember | undefined {
  if (constructorOf(node)) return undefined;
  const source = sourceOf(node, context.root);
  const returnType = typeText(
    context.checker.typeToString(
      context.checker.getTypeAtLocation(node),
      node,
      ts.TypeFormatFlags.NoTruncation
    ),
    node,
    context
  );
  return {
    name: 'constructor',
    kind: 'constructor',
    type: '',
    description: '',
    jsdocTags: [],
    optional: false,
    readonly: false,
    static: false,
    visibility: 'public',
    inherited: false,
    source,
    signatures: [
      { parameters: [], returnType, generics: [], description: '', jsdocTags: [], source }
    ],
    references: [],
    typeReferences: [],
    sourceDefaultValue: null
  };
}

function normalizeMember(
  raw: MemberEntry | DocEntry,
  owner: ts.Declaration | undefined,
  context: Context
): ApiMember {
  const memberTags = 'memberTags' in raw ? raw.memberTags : [];
  const node = memberDeclaration(
    owner,
    raw.name,
    context.checker,
    memberTags.some(tag => tag === 'static'),
    'memberType' in raw ? raw.memberType : undefined
  );
  const signature = signatureOf(raw);
  const binding = raw as Partial<PropertyEntry>;
  const isDefault = (tag: ApiJsDocTag): boolean =>
    ['default', 'defaultvalue'].includes(tag.name.toLowerCase());
  // Angular escapes @default as template syntax before extracting JSDoc tags.
  const jsdocTags = raw.jsdocTags.some(isDefault)
    ? raw.jsdocTags
    : [...raw.jsdocTags, ...tagsOf(node).filter(isDefault)];
  const seed: ApiMember = {
    name: raw.name,
    kind: 'memberType' in raw ? raw.memberType : raw.entryType,
    type:
      'type' in raw ? (raw as PropertyEntry | ConstantEntry).type : (signature?.returnType ?? ''),
    description: raw.description,
    jsdocTags,
    optional: memberTags.includes(MemberTags.Optional),
    readonly: memberTags.includes(MemberTags.Readonly),
    static: memberTags.includes(MemberTags.Static),
    visibility: memberTags.includes(MemberTags.Protected) ? 'protected' : 'public',
    inherited: memberTags.includes(MemberTags.Inherited),
    inputAlias: binding.inputAlias,
    outputAlias: binding.outputAlias,
    required: binding.isRequiredInput
  };
  if (signature)
    seed.signatures = [
      {
        parameters: parametersOf(signature, node, context),
        returnType: signature.returnType,
        generics: [],
        description: '',
        jsdocTags: [],
        source: node ? sourceOf(node, context.root) : { filePath: '', startLine: 0, endLine: 0 }
      }
    ];
  return prepareMember(seed, owner, node, context);
}

/** Enrich normalized source/compiler members without constructing compiler-shaped records. */
function prepareMember(
  seed: ApiMember,
  owner: ts.Declaration | undefined,
  node: ts.Declaration | undefined,
  context: Context
): ApiMember {
  const accessor = node && (ts.isGetAccessor(node) || ts.isSetAccessor(node)) ? node : undefined;
  const accessorSymbol = accessor ? context.checker.getSymbolAtLocation(accessor.name) : undefined;
  const signature = seed.signatures?.[0] ?? sourceSignature(node, context);
  const isMethod = !!node && (ts.isMethodDeclaration(node) || ts.isMethodSignature(node));
  const declaringOwner = owningType(node);
  const ownerType = owner ? context.checker.getTypeAtLocation(owner) : undefined;
  const property = ownerType?.getProperty(seed.name);
  const contextualType =
    property && owner ? context.checker.getTypeOfSymbolAtLocation(property, owner) : undefined;
  const substitutions =
    declaringOwner && ownerType
      ? (typeForOwner(ownerType, declaringOwner, context)?.substitutions ??
        new Map<string, string>())
      : new Map<string, string>();
  const signatureSubstitutions = new Map(substitutions);
  if (node && ts.isFunctionLike(node)) {
    for (const parameter of node.typeParameters ?? [])
      signatureSubstitutions.delete(parameter.name.text);
  }
  const signatures = sourceSignatures(node, context);
  const parameters = !signatures
    ? signature?.parameters.map(parameter => ({
        ...parameter,
        type: substituteType(parameter.type, signatureSubstitutions)
      }))
    : undefined;
  const inheritedProperty = contextualType && declaringOwner !== owner && !isMethod;
  const valueType = accessor ? context.checker.getTypeAtLocation(accessor.name) : undefined;
  const normalizedType = inheritedProperty
    ? typeText(
        context.checker.typeToString(contextualType, owner, ts.TypeFormatFlags.NoTruncation),
        owner,
        context
      )
    : substituteType(
        typeText(
          valueType
            ? context.checker.typeToString(valueType, node, ts.TypeFormatFlags.NoTruncation)
            : isMethod && signature
              ? signature.returnType
              : seed.type,
          node,
          context
        ),
        isMethod ? signatureSubstitutions : substitutions
      );
  const member: ApiMember = {
    ...seed,
    kind: seed.name === 'constructor' ? 'constructor' : isMethod ? 'method' : seed.kind,
    type: normalizedType,
    source: node ? sourceOf(node, context.root) : undefined,
    optional: !!seed.optional || (!!node && 'questionToken' in node && !!node.questionToken),
    readonly: accessor
      ? ts.isGetAccessor(accessor) && !accessorSymbol?.declarations?.some(ts.isSetAccessor)
      : !!seed.readonly || hasModifier(node, ts.SyntaxKind.ReadonlyKeyword),
    static: !!seed.static || hasModifier(node, ts.SyntaxKind.StaticKeyword),
    visibility: visibilityOf(node, seed.visibility === 'protected'),
    explicitPublic: hasModifier(node, ts.SyntaxKind.PublicKeyword) || undefined,
    inherited: !!seed.inherited,
    // Some inherited standard-library members have compiler signatures but no
    // recoverable source declaration. Prepare those compiler parameters here;
    // presentation consumes only complete signature records.
    signatures: accessor
      ? undefined
      : instantiateSignatures(
          signatures ??
            (signature && parameters
              ? [{ ...signature, parameters, returnType: normalizedType }]
              : undefined),
          substitutions
        ),
    ...(seed.references && seed.typeReferences
      ? { references: seed.references, typeReferences: seed.typeReferences }
      : referencesOf(node, context)),
    ...initializerMetadata(node, context, contextualType, substitutions),
    ...memberProvenance(node, owner, seed.name, context)
  };
  return inheritMemberDescriptions(member, owner, node, context);
}

/** Fill documentation gaps only; declarations, types and authored implementation prose stay intact. */
function inheritMemberDescriptions(
  member: ApiMember,
  owner: ts.Declaration | undefined,
  node: ts.Declaration | undefined,
  context: Context
): ApiMember {
  if (
    !owner ||
    (!ts.isClassDeclaration(owner) && !ts.isInterfaceDeclaration(owner)) ||
    member.static ||
    member.kind === 'constructor'
  )
    return member;
  const seen = new Set<ts.Type>();
  const visit = (type: ts.Type, outer = new Map<string, string>()): void => {
    if (seen.has(type)) return;
    seen.add(type);
    const declaration = typeOwner(type);
    const substitutions = new Map(outer);
    for (const [parameter, argument] of typeSubstitutions(type, context))
      substitutions.set(parameter, substituteType(argument, outer));
    const symbol = type.getProperty(member.name);
    const inherited = symbol ? declarationOf(symbol, context.checker) : undefined;
    if (inherited && inherited !== node) {
      member.description ||= descriptionOf(inherited);
      const signatures = instantiateSignatures(sourceSignatures(inherited, context), substitutions);
      member.signatures = member.signatures?.map(signature => {
        const match =
          signatures?.find(
            candidate =>
              candidate.parameters.length === signature.parameters.length &&
              candidate.parameters.every(
                (parameter, index) => parameter.type === signature.parameters[index].type
              )
          ) ?? (signatures?.length === 1 ? signatures[0] : undefined);
        if (!match) return signature;
        return {
          ...signature,
          description: signature.description || match.description,
          parameters: signature.parameters.map((parameter, index) => ({
            ...parameter,
            description: parameter.description || match.parameters[index]?.description || ''
          }))
        };
      });
    }
    for (const clause of declaration?.heritageClauses ?? [])
      for (const base of clause.types)
        visit(context.checker.getTypeAtLocation(base), substitutions);
  };
  visit(context.checker.getTypeAtLocation(owner));
  return member;
}

function directiveMetadata(
  node: ts.Declaration | undefined,
  context: Context
): DirectiveMeta | undefined {
  if (!node || !ts.isClassDeclaration(node) || !node.name) return undefined;
  const meta = context.program.compiler.getMeta(node);
  return meta && 'inputs' in meta ? meta : undefined;
}

interface BindingMember {
  member: ApiMember;
  forwarded: boolean;
}

/** Includes inherited and recursively forwarded bindings, but never unexposed host APIs. */
function bindingMembers(
  node: ts.Declaration,
  context: Context,
  ancestors = new Set<ts.Declaration>()
): BindingMember[] {
  if (ancestors.has(node)) return [];
  const seen = new Set(ancestors).add(node);
  const meta = directiveMetadata(node, context);
  if (!meta) return [];
  const members: BindingMember[] =
    meta.baseClass && meta.baseClass !== 'dynamic'
      ? bindingMembers(meta.baseClass.node, context, seen).map(({ member, forwarded }) => ({
          member: {
            ...member,
            inherited: true
          },
          forwarded
        }))
      : [];
  for (const name of new Set([
    ...meta.inputs.classPropertyNames,
    ...meta.outputs.classPropertyNames
  ])) {
    const declaration = memberDeclaration(node, name, context.checker);
    if (isExcluded(declaration, name)) continue;
    const symbol = context.checker.getTypeAtLocation(node).getProperty(name);
    const input = meta.inputs.getByClassPropertyName(name);
    const output = meta.outputs.getByClassPropertyName(name);
    const member: ApiMember = {
      ...sourceMember(name, node, declaration, context, symbol),
      type: typeText(
        declaration
          ? context.checker.typeToString(
              context.checker.getTypeAtLocation(declaration),
              declaration,
              ts.TypeFormatFlags.NoTruncation
            )
          : '',
        declaration,
        context
      ),
      inputAlias: input?.bindingPropertyName,
      required: input?.required,
      outputAlias: output?.bindingPropertyName,
      ...initializerMetadata(declaration, context)
    };
    const existing = members.findIndex(item => item.member.name === name);
    if (existing < 0) members.push({ member, forwarded: false });
    else members[existing] = { member, forwarded: false };
  }
  for (const host of meta.hostDirectives ?? []) {
    if (!('node' in host.directive)) continue;
    const hostBindings = bindingMembers(host.directive.node, context, seen);
    for (const [direction, exposed] of [
      ['input', host.inputs],
      ['output', host.outputs]
    ] as const) {
      for (const [original, alias] of Object.entries(exposed ?? {})) {
        const binding = hostBindings.find(
          ({ member }) =>
            (direction === 'input' ? member.inputAlias : member.outputAlias) === original
        );
        if (!binding) continue;
        // Keep the host class's own binding if it declares an input/output under the same name.
        if (
          members.some(
            ({ member, forwarded }) =>
              !forwarded &&
              (direction === 'input' ? member.inputAlias : member.outputAlias) === alias
          )
        )
          continue;
        members.push({
          member: {
            ...binding.member,
            name: alias,
            inputAlias: direction === 'input' ? alias : undefined,
            required: direction === 'input' ? binding.member.required : undefined,
            outputAlias: direction === 'output' ? alias : undefined
          },
          forwarded: true
        });
      }
    }
  }
  return members;
}

/** Angular's raw docs do not include inherited binding metadata or host forwarding. */
function addBindings(entry: ApiEntry, node: ts.Declaration | undefined, context: Context): void {
  for (const { member: binding, forwarded } of node ? bindingMembers(node, context) : []) {
    if (forwarded) {
      // Host-directive bindings own the binding's docs and defaults, even when the host class
      // re-exposes the directive's signal or emitter as a plain property.
      const isSameSlot = (member: ApiMember): boolean =>
        member.name === binding.name &&
        !member.static &&
        (binding.inputAlias !== undefined
          ? member.outputAlias === undefined
          : member.inputAlias === undefined);
      let replaced = false;
      entry.members = entry.members.filter(member => {
        if (!isSameSlot(member)) return true;
        if (replaced) return false;
        replaced = true;
        return true;
      });
      const index = entry.members.findIndex(isSameSlot);
      if (index >= 0) entry.members[index] = binding;
      else entry.members.push(binding);
      continue;
    }
    const matches = entry.members.filter(member => member.name === binding.name);
    if (matches.length) {
      // Retain compiler-normalized types, tags and descriptions for actual class members.
      for (const existing of matches) {
        if (binding.inputAlias !== undefined) {
          existing.inputAlias = binding.inputAlias;
          existing.required = binding.required;
          if (binding.signalTransformType !== undefined)
            existing.signalTransformType ??= binding.signalTransformType;
        }
        if (binding.outputAlias !== undefined) existing.outputAlias = binding.outputAlias;
      }
    } else entry.members.push(binding);
  }
}

function decoratorOption(args: readonly ts.Expression[] | undefined, name: string) {
  const options = args?.[0];
  if (!options || !ts.isObjectLiteralExpression(options)) return undefined;
  const property = options.properties.findLast(
    (property): property is ts.PropertyAssignment =>
      ts.isPropertyAssignment(property) &&
      (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) &&
      property.name.text === name
  );
  return property?.initializer;
}

function angularClassMetadataOf(
  node: ts.Declaration | undefined,
  kind: string,
  context: Context
): Pick<ApiEntry, 'angularKind' | 'providedInRoot'> {
  if (['component', 'directive', 'pipe', 'ng_module'].includes(kind)) {
    return { angularKind: kind as NonNullable<ApiEntry['angularKind']> };
  }
  if (!node || !ts.isClassDeclaration(node)) return {};
  const kinds = new Map<string, NonNullable<ApiEntry['angularKind']>>([
    ['Component', 'component'],
    ['Directive', 'directive'],
    ['Injectable', 'injectable'],
    ['Service', 'injectable'],
    ['Pipe', 'pipe'],
    ['NgModule', 'ng_module']
  ]);
  for (const decorator of ts.getDecorators(node) ?? []) {
    const call = ts.isCallExpression(decorator.expression) ? decorator.expression : undefined;
    const expression = call?.expression ?? decorator.expression;
    const symbol = context.checker.getSymbolAtLocation(
      ts.isPropertyAccessExpression(expression) ? expression.name : expression
    );
    const resolved = symbol ? resolvedSymbol(symbol, context) : undefined;
    if (
      resolved &&
      resolved.declarations?.some(declaration =>
        slash(declaration.getSourceFile().fileName).includes('/@angular/core/')
      )
    ) {
      const angularKind = kinds.get(resolved.name);
      if (!angularKind) continue;
      if (resolved.name === 'Service') {
        const autoProvided = decoratorOption(call?.arguments, 'autoProvided');
        return {
          angularKind,
          providedInRoot: autoProvided?.kind !== ts.SyntaxKind.FalseKeyword
        };
      }
      if (resolved.name === 'Injectable') {
        const scope = decoratorOption(call?.arguments, 'providedIn');
        return {
          angularKind,
          providedInRoot: !!scope && ts.isStringLiteral(scope) && scope.text === 'root'
        };
      }
      return { angularKind };
    }
  }
  return node.members.some(member => member.name?.getText() === 'ɵprov')
    ? { angularKind: 'injectable' }
    : {};
}

function extractEntry(
  raw: DocEntry | undefined,
  node: ts.Declaration | undefined,
  name: string,
  packageName: string,
  importPath: string,
  context: Context,
  aliasDeclaration?: ts.ExportSpecifier
): ApiEntry | undefined {
  if (!raw)
    return node
      ? sourceEntry(node, name, packageName, importPath, context, aliasDeclaration)
      : undefined;
  const entry = entryOf(
    name,
    raw.entryType,
    raw.description,
    raw.jsdocTags,
    node,
    packageName,
    importPath,
    context,
    aliasDeclaration
  );
  if (!node && 'source' in raw) entry.source = (raw as DocEntryWithSourceInfo).source;
  if ('members' in raw)
    entry.members = ((raw as ClassEntry | NamespaceEntry | DecoratorEntry).members ?? [])
      .filter(
        member => !isExcluded(memberDeclaration(node, member.name, context.checker), member.name)
      )
      .map(member => normalizeMember(member, node, context));
  if (
    node &&
    (ts.isClassDeclaration(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isTypeAliasDeclaration(node))
  ) {
    for (const member of indexSignatureMembers(node, context)) {
      if (!entry.members.some(existing => existing.name === member.name))
        entry.members.push(member);
    }
  }
  const signature = signatureOf(raw);
  if ('type' in raw) entry.type = typeText((raw as ConstantEntry).type, node, context);
  else if (signature) entry.type = typeText(signature.returnType, node, context);
  if ('selector' in raw) entry.selector = (raw as DirectiveEntry).selector;
  if ('exportAs' in raw) entry.exportAs = (raw as DirectiveEntry).exportAs;
  if ('generics' in raw) {
    entry.generics = (raw as ClassEntry).generics.map(
      generic =>
        `${generic.name}${generic.constraint ? ` extends ${generic.constraint}` : ''}${generic.default ? ` = ${generic.default}` : ''}`
    );
  }
  return finishEntry(entry, node, context);
}

function entryOf(
  name: string,
  kind: string,
  documentation: string,
  tags: ApiJsDocTag[],
  node: ts.Declaration | undefined,
  packageName: string,
  importPath: string,
  context: Context,
  aliasDeclaration?: ts.ExportSpecifier
): ApiEntry {
  const originalName = node ? declarationName(node) : undefined;
  const isAlias = !!originalName && originalName !== name;
  const aliasDocs = isAlias && aliasDeclaration ? aliasDocumentation(aliasDeclaration) : undefined;
  const description = isAlias ? (aliasDocs?.description ?? '') : documentation;
  const jsdocTags = isAlias ? (aliasDocs?.jsdocTags ?? []) : tags;
  const source = node ? sourceOf(node, context.root) : { filePath: '', startLine: 0, endLine: 0 };
  const references = referencesOf(node, context);
  return {
    id: `${importPath}#${name}`,
    name,
    packageName,
    importPath,
    kind,
    internal: jsdocTags.some(tag => tag.name === 'internal') || name.startsWith('ɵ'),
    exportAlias: isAlias ? true : undefined,
    aliasOf: isAlias ? originalName : undefined,
    explicitType: node && ts.isVariableDeclaration(node) ? !!node.type : undefined,
    ...angularClassMetadataOf(node, kind, context),
    description,
    jsdocTags,
    rawComment: isAlias ? aliasDocs?.rawComment : rawCommentOf(node),
    source: isAlias && aliasDeclaration ? sourceOf(aliasDeclaration, context.root) : source,
    members: [],
    signatures: sourceSignatures(node, context),
    sourceDefaultValue: sourceDefaultValue(node, context),
    references: references.references.filter(id => !node || !context.identities.get(node)?.has(id)),
    typeReferences: references.typeReferences
  };
}

function finishEntry(
  entry: ApiEntry,
  node: ts.Declaration | undefined,
  context: Context
): ApiEntry {
  if (node && ts.isClassDeclaration(node)) {
    if (!entry.members.some(member => member.name === 'constructor')) {
      const constructor = implicitConstructor(node, context);
      if (constructor) entry.members.unshift(constructor);
    }
  }
  addBindings(entry, node, context);
  if (node && (ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node))) {
    for (const clause of node.heritageClauses ?? []) {
      const kind = clause.token === ts.SyntaxKind.ExtendsKeyword ? 'extends' : 'implements';
      entry[kind] = clause.types.map(type => typeText(type.getText(), type, context));
    }
  }
  const typeReferences = new Map<string, ApiOrigin>();
  for (const origin of [
    ...(entry.typeReferences ?? []),
    ...entry.members.flatMap(member => member.typeReferences ?? [])
  ]) {
    typeReferences.set(
      `${origin.name}:${origin.source.filePath}:${origin.source.startLine}:${origin.type}`,
      origin
    );
  }
  entry.typeReferences = [...typeReferences.values()];
  return entry;
}
