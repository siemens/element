/* eslint-disable headers/header-format, @typescript-eslint/explicit-function-return-type, tsdoc/syntax, @typescript-eslint/naming-convention, prefer-arrow/prefer-arrow-functions */
/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  ConsoleMessageId,
  Extractor,
  ExtractorConfig,
  ExtractorLogLevel,
  ExtractorMessage,
  ExtractorMessageId,
  IConfigFile
} from '@microsoft/api-extractor';
import { ReleaseTag } from '@microsoft/api-extractor-model';
import { AstDeclaration } from '@microsoft/api-extractor/lib/analyzer/AstDeclaration';
import { AstModule } from '@microsoft/api-extractor/lib/analyzer/AstModule';
import { ExportAnalyzer } from '@microsoft/api-extractor/lib/analyzer/ExportAnalyzer';
import { ApiItemMetadata } from '@microsoft/api-extractor/lib/collector/ApiItemMetadata';
import { Collector } from '@microsoft/api-extractor/lib/collector/Collector';
import fs from 'fs';
import os from 'os';
import path from 'path';
import ts, {
  ConstructorDeclaration,
  GetAccessorDeclaration, MethodDeclaration, PropertyDeclaration, SetAccessorDeclaration } from 'typescript';

import { resolveTypePackages } from './interop_module_mappings.js';

/**
 * Original definition of the `ExportAnalyzer#fetchAstModuleExportInfo` method.
 * We store the original function since we monkey-patch it later to account for
 * specified strip export patterns.
 * */
const _origFetchAstModuleExportInfo = ExportAnalyzer.prototype.fetchAstModuleExportInfo;

/**
 * Original definition of the `Collector#fetchApiItemMetadata` method.
 * We store the original function since we monkey-patch it later to mark
 * protected members as internal.
 * */
const _origFetchApiItemMetadata = Collector.prototype.fetchApiItemMetadata;

/**
 * Builds an API report for the given entry-point file and compares
 * it against a golden file.
 *
 * @param goldenFilePath Path to an API report file that is used as golden
 * @param indexFilePath Entry point file that is analyzed to build the API report.
 * @param stripExportPattern Regular Expression that can be used to filter out exports
 *   from the API report.
 * @param typePackageNames Package names for which types should be included in the analysis of the
 *   API-report entry-point. Packages are expected to exist within the external `npm` workspace.
 * @param packageJsonPath Optional path to a `package.json` file that contains the entry
 *   point. Note that the `package.json` is currently only used by `api-extractor` to determine
 *   the package name displayed within the API golden.
 * @param customPackageName A custom package name to be provided for the API report. This can be
 *   useful when the specified `package.json` is describing the whole package but the API report
 *   is scoped to a specific subpath/entry-point.
 */
export async function testApiGolden(
  indexFilePath: string,
  stripExportPattern: RegExp,
  typeNames: string[],
  packageJsonPath: string,
  customPackageName: string
): Promise<string | null> {
  const tempDir =
    process.env.TEST_TMPDIR ??
    (await fs.promises.mkdtemp(path.join(os.tmpdir(), 'api-golden-rule')));
  const rjsMode = process.env.RJS_MODE === 'true';

  let resolvedTypePackages: Awaited<ReturnType<typeof resolveTypePackages>> | null = null;
  if (!rjsMode) {
    resolvedTypePackages = await resolveTypePackages(typeNames);
  }

  const configObject: IConfigFile = {
    compiler: {
      overrideTsconfig: {
        // In interop/compat mode, the linker is not available and there is no `node_modules`
        // directory, so we need to manually wire up global types.
        files: [indexFilePath, ...(resolvedTypePackages?.typeFiles ?? [])],
        compilerOptions: {
          paths: resolvedTypePackages?.paths ?? {},
          types: rjsMode ? typeNames : [],
          lib: ['esnext', 'dom']
        }
      }
    },
    projectFolder: path.dirname(packageJsonPath),
    mainEntryPointFilePath: indexFilePath,
    dtsRollup: { enabled: false },
    docModel: { enabled: false },
    apiReport: {
      enabled: true,
      reportFolder: tempDir,
      reportTempFolder: tempDir,
      reportFileName: customPackageName.replace(/\//g, '_'),
      reportVariants: ['public']
    },
    tsdocMetadata: { enabled: false },
    newlineKind: 'lf',
    messages: {
      extractorMessageReporting: {
        // If an export does not have a release tag (like `@public`), API extractor maps
        // considers it still as `Public`. We hide the message for now given the Angular
        // repositories do not follow the TSDoc standard. https://tsdoc.org/.
        // TODO: Make this an error once TSDoc standard is followed in all projects.
        [ExtractorMessageId.MissingReleaseTag]: { logLevel: ExtractorLogLevel.None }
      }
    }
  };

  const packageNameSegments = customPackageName.split('/');
  const isScopedPackage = packageNameSegments[0][0] === '@' && packageNameSegments.length > 1;
  // API extractor allows one-slash when the package uses the scoped-package convention.
  const slashConversionStartIndex = isScopedPackage ? 1 : 0;
  const normalizedRest = packageNameSegments.slice(slashConversionStartIndex).join('_');
  const packageName = isScopedPackage
    ? `${packageNameSegments[0]}/${normalizedRest}`
    : normalizedRest;

  const extractorConfig = ExtractorConfig.prepare({
    configObject,
    // TODO: Remove workaround once https://github.com/microsoft/rushstack/issues/2774 is fixed.
    packageJson: { name: packageName },
    packageJsonFullPath: packageJsonPath,
    configObjectFullPath: undefined
  });

  // This patches the `ExportAnalyzer` of `api-extractor` so that we can filter out
  // exports that match a specified pattern. Ideally this would not be needed as the
  // TSDoc JSDoc annotations could be used to filter out exports from the API report,
  // but there are cases in Angular where exports cannot be `@internal` but at the same
  // time are denoted as unstable. Such exports are allowed to change frequently and should
  // not be captured in the API report (as this would be unnecessarily inconvenient).
  ExportAnalyzer.prototype.fetchAstModuleExportInfo = function (module: AstModule) {
    const info = _origFetchAstModuleExportInfo.apply(this, [module]);

    info.exportedLocalEntities.forEach((entity, exportName) => {
      if (stripExportPattern.test(exportName)) {
        info.exportedLocalEntities.delete(exportName);
      }
    });

    return info;
  };

  // This patches the `Collector` of `api-extractor` so that we can mark protected
  // members as internal. This prevents them from appearing in the API report.
  Collector.prototype.fetchApiItemMetadata = function (astDeclaration: AstDeclaration) {
    const metadata: ApiItemMetadata = _origFetchApiItemMetadata.apply(this, [astDeclaration]);

    const declaration = astDeclaration.declaration;
    if (
      ts.isPropertyDeclaration(declaration) ||
      ts.isMethodDeclaration(declaration) ||
      ts.isGetAccessorDeclaration(declaration) ||
      ts.isSetAccessorDeclaration(declaration) ||
      ts.isConstructorDeclaration(declaration)
    ) {
      const isProtected = (declaration as (PropertyDeclaration | MethodDeclaration | GetAccessorDeclaration | SetAccessorDeclaration | ConstructorDeclaration))
        .modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ProtectedKeyword) ?? false;
      if (isProtected) {
        return new ApiItemMetadata({
          effectiveReleaseTag: ReleaseTag.Internal,
          declaredReleaseTag: ReleaseTag.Internal,
          releaseTagSameAsParent: false,
          isOverride: metadata.isOverride,
          isSealed: metadata.isSealed,
          isVirtual: metadata.isVirtual,
          isEventProperty: metadata.isEventProperty,
          isPreapproved: metadata.isPreapproved
        });
      }
    }

    return metadata;
  };

  const reportTmpOutPath = path.join(
    tempDir,
    `${configObject.apiReport!.reportFileName!}.public.api.md`
  );
  const result = Extractor.invoke(extractorConfig, {
    localBuild: true,
    // Process messages from the API extractor (and modify log levels if needed).
    messageCallback: msg => processExtractorMessage(msg)
  });

  if (!result.succeeded) {
    return null;
  }
  const reportOut = await fs.promises.readFile(reportTmpOutPath, 'utf8');
  await fs.promises.rm(reportTmpOutPath);
  return reportOut;
}

/**
 * Process an API extractor message. Microsoft's API extractor allows developers to
 * handle messages before API extractor prints them. This allows us to adjust log level
 * for certain messages, or to fully prevent messages from being printed out.
 * */
async function processExtractorMessage(message: ExtractorMessage) {
  // If the golden does not match, we hide the error as API extractor prints
  // a warning asking the user to manually copy the new API report. We print
  // a custom warning below asking the developer to run the `.accept` Bazel target.
  // TODO: Simplify once https://github.com/microsoft/rushstack/issues/2773 is resolved.
  if (message.messageId === ConsoleMessageId.ApiReportNotCopied) {
    // Mark the message as handled so that API-extractor does not print it. We print
    // a message manually after extraction.
    message.handled = true;
    message.logLevel = ExtractorLogLevel.None;
  }

  // This prevents Analysis will use the bundled TypeScript version x.x.x
  if (message.messageId === ConsoleMessageId.Preamble) {
    message.logLevel = ExtractorLogLevel.None;
    message.handled = true;
  }
}

export default function (args: Parameters<typeof testApiGolden>) {
  return testApiGolden(...args);
}
