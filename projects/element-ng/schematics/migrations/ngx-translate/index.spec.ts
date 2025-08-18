/**
 * Copyright (c) Siemens 2016 - 2025
 * SPDX-License-Identifier: MIT
 */

import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { addTestFiles, createTestApp } from '../../utils/index.js';

const buildRelativeFromFile = (relativePath: string): string =>
  path.join(path.dirname(fileURLToPath(import.meta.url)), relativePath);

const collectionPath = buildRelativeFromFile('../../collection.json');

describe('missing translate migration', () => {
  let runner: SchematicTestRunner;
  let appTree: Tree;
  const name = 'migrate-v47-to-v48';

  beforeEach(async () => {
    runner = new SchematicTestRunner(name, collectionPath);
    appTree = await createTestApp(runner, { style: 'scss' });
  });

  const checkMigration = async (
    original: Record<string, string>,
    expected: Record<string, string[]>
  ): Promise<void> => {
    addTestFiles(appTree, original);
    addTestFiles(appTree, {
      '/package.json': `{
         "dependencies": {
          "@simpl/element-ng": "48.9.0",
          "@simpl/element-translate-ng": "48.9.0",
          "@ngx-translate/core": "16.0.4"
        }
        }`
    });

    const tree = await runner.runSchematic(
      'migrate-v47-to-v48',
      { path: 'projects/app/src' },
      appTree
    );

    for (const [fileName, expectedContent] of Object.entries(expected)) {
      const actual = tree.readText(fileName);
      expect(actual).toEqual(expectedContent.join('\n'));
    }
  };

  it('should migrate missing translate provider for TranslateModule.forRoot(...)', async () => {
    const original = {
      'projects/app/src/app/app.config.ts': [
        `import { ApplicationConfig, importProvidersFrom } from '@angular/core';`,
        `import { HttpBackend } from '@angular/common/http';`,
        `import { TranslateLoader, TranslateModule } from '@ngx-translate/core';`,
        ``,
        `export const createTranslateLoader = (http: HttpBackend): MultiTranslateHttpLoader =>`,
        `  new MultiTranslateHttpLoader(http, ['./assets/i18n/']);`,
        ``,
        `export const appConfig: ApplicationConfig = {`,
        `  providers: [`,
        `    importProvidersFrom(`,
        `      TranslateModule.forRoot({`,
        `        loader: {`,
        `          provide: TranslateLoader,`,
        `          useFactory: createTranslateLoader,`,
        `          deps: [HttpBackend]`,
        `        }`,
        `      })`,
        `    )`,
        `  ]`,
        `};`
      ].join('\n')
    };

    const expected = {
      'projects/app/src/app/app.config.ts': [
        `import { ApplicationConfig, importProvidersFrom } from '@angular/core';`,
        `import { HttpBackend } from '@angular/common/http';`,
        `import { TranslateLoader, TranslateModule } from '@ngx-translate/core';`,
        `import { provideMissingTranslationHandlerForElement } from '@siemens/element-translate-ng/ngx-translate';`,
        ``,
        `export const createTranslateLoader = (http: HttpBackend): MultiTranslateHttpLoader =>`,
        `  new MultiTranslateHttpLoader(http, ['./assets/i18n/']);`,
        ``,
        `export const appConfig: ApplicationConfig = {`,
        `  providers: [`,
        `    importProvidersFrom(`,
        `      TranslateModule.forRoot({ loader: {`,
        `        provide: TranslateLoader,`,
        `        useFactory: createTranslateLoader,`,
        `        deps: [HttpBackend]`,
        `    }, missingTranslationHandler: provideMissingTranslationHandlerForElement() })`,
        `    )`,
        `  ]`,
        `};`
      ]
    };

    await checkMigration(original, expected);
  });

  it('should migrate missing translate provider for provideTranslateService(...)', async () => {
    const original = {
      'projects/app/src/app/app.config.ts': [
        `import { ApplicationConfig, importProvidersFrom } from '@angular/core';`,
        `import { HttpBackend } from '@angular/common/http';`,
        `import { TranslateLoader, provideTranslateService } from '@ngx-translate/core';`,
        ``,
        `export const createTranslateLoader = (http: HttpBackend): MultiTranslateHttpLoader =>`,
        `  new MultiTranslateHttpLoader(http, ['./assets/i18n/']);`,
        ``,
        `export const appConfig: ApplicationConfig = {`,
        `  providers: [`,
        `    provideTranslateService({`,
        `      loader: {`,
        `        provide: TranslateLoader,`,
        `        useFactory: createTranslateLoader,`,
        `        deps: [HttpBackend]`,
        `      }`,
        `    })`,
        `  ]`,
        `};`
      ].join('\n')
    };

    const expected = {
      'projects/app/src/app/app.config.ts': [
        `import { ApplicationConfig, importProvidersFrom } from '@angular/core';`,
        `import { HttpBackend } from '@angular/common/http';`,
        `import { TranslateLoader, provideTranslateService } from '@ngx-translate/core';`,
        `import { provideMissingTranslationHandlerForElement } from '@siemens/element-translate-ng/ngx-translate';`,
        ``,
        `export const createTranslateLoader = (http: HttpBackend): MultiTranslateHttpLoader =>`,
        `  new MultiTranslateHttpLoader(http, ['./assets/i18n/']);`,
        ``,
        `export const appConfig: ApplicationConfig = {`,
        `  providers: [`,
        `    provideTranslateService({ loader: {`,
        `        provide: TranslateLoader,`,
        `        useFactory: createTranslateLoader,`,
        `        deps: [HttpBackend]`,
        `    }, missingTranslationHandler: provideMissingTranslationHandlerForElement() })`,
        `  ]`,
        `};`
      ]
    };

    await checkMigration(original, expected);
  });

  it('should migrate missing translate provider for provideTranslateService() with no arguments', async () => {
    const original = {
      'projects/app/src/app/app.config.ts': [
        `import { ApplicationConfig } from '@angular/core';`,
        `import { provideTranslateService } from '@ngx-translate/core';`,
        ``,
        `export const appConfig: ApplicationConfig = {`,
        `  providers: [`,
        `    provideTranslateService()`,
        `  ]`,
        `};`
      ].join('\n')
    };

    const expected = {
      'projects/app/src/app/app.config.ts': [
        `import { ApplicationConfig } from '@angular/core';`,
        `import { provideTranslateService } from '@ngx-translate/core';`,
        `import { provideMissingTranslationHandlerForElement } from '@siemens/element-translate-ng/ngx-translate';`,
        ``,
        `export const appConfig: ApplicationConfig = {`,
        `  providers: [`,
        `    provideTranslateService({ missingTranslationHandler: provideMissingTranslationHandlerForElement() })`,
        `  ]`,
        `};`
      ]
    };

    await checkMigration(original, expected);
  });

  it('should not modify provideTranslateService() if missingTranslationHandler already exists', async () => {
    const original = {
      'projects/app/src/app/app.config.ts': [
        `import { ApplicationConfig } from '@angular/core';`,
        `import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';`,
        `import { provideMissingTranslationHandlerForElement } from '@siemens/element-translate-ng/ngx-translate';`,
        ``,
        `export const appConfig: ApplicationConfig = {`,
        `  providers: [`,
        `    provideTranslateService({`,
        `      missingTranslationHandler: provideMissingTranslationHandlerForElement(),`,
        `      loader: {`,
        `        provide: TranslateLoader`,
        `      }`,
        `    })`,
        `  ]`,
        `};`
      ].join('\n')
    };

    const expected = {
      'projects/app/src/app/app.config.ts': [
        `import { ApplicationConfig } from '@angular/core';`,
        `import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';`,
        `import { provideMissingTranslationHandlerForElement } from '@siemens/element-translate-ng/ngx-translate';`,
        ``,
        `export const appConfig: ApplicationConfig = {`,
        `  providers: [`,
        `    provideTranslateService({`,
        `      missingTranslationHandler: provideMissingTranslationHandlerForElement(),`,
        `      loader: {`,
        `        provide: TranslateLoader`,
        `      }`,
        `    })`,
        `  ]`,
        `};`
      ]
    };

    await checkMigration(original, expected);
  });

  it('should migrate TranslateModule.forRoot({}) with empty object literal', async () => {
    const original = {
      'projects/app/src/app/app.config.ts': [
        `import { ApplicationConfig, importProvidersFrom } from '@angular/core';`,
        `import { TranslateModule } from '@ngx-translate/core';`,
        ``,
        `export const appConfig: ApplicationConfig = {`,
        `  providers: [`,
        `    importProvidersFrom(`,
        `      TranslateModule.forRoot({})`,
        `    )`,
        `  ]`,
        `};`
      ].join('\n')
    };

    const expected = {
      'projects/app/src/app/app.config.ts': [
        `import { ApplicationConfig, importProvidersFrom } from '@angular/core';`,
        `import { TranslateModule } from '@ngx-translate/core';`,
        `import { provideMissingTranslationHandlerForElement } from '@siemens/element-translate-ng/ngx-translate';`,
        ``,
        `export const appConfig: ApplicationConfig = {`,
        `  providers: [`,
        `    importProvidersFrom(`,
        `      TranslateModule.forRoot({ missingTranslationHandler: provideMissingTranslationHandlerForElement() })`,
        `    )`,
        `  ]`,
        `};`
      ]
    };

    await checkMigration(original, expected);
  });

  it('should migrate existing missingTranslationHandler with useClass provider', async () => {
    const original = {
      'projects/app/src/app/app.config.ts': [
        `import { ApplicationConfig } from '@angular/core';`,
        `import { provideMissingTranslationHandler, provideTranslateService } from '@ngx-translate/core';`,
        `import { MyMissingTranslationHandler } from './my-handler';`,
        ``,
        `export const appConfig: ApplicationConfig = {`,
        `  providers: [`,
        `    provideTranslateService({`,
        `      missingTranslationHandler: provideMissingTranslationHandler(MyMissingTranslationHandler)`,
        `    })`,
        `  ]`,
        `};`
      ].join('\n')
    };

    const expected = {
      'projects/app/src/app/app.config.ts': [
        `import { ApplicationConfig } from '@angular/core';`,
        `import { provideMissingTranslationHandler, provideTranslateService } from '@ngx-translate/core';`,
        `import { provideMissingTranslationHandlerForElement } from '@siemens/element-translate-ng/ngx-translate';`,
        `import { MyMissingTranslationHandler } from './my-handler';`,
        ``,
        `export const appConfig: ApplicationConfig = {`,
        `  providers: [`,
        `    provideTranslateService({ missingTranslationHandler: provideMissingTranslationHandlerForElement(provideMissingTranslationHandler(MyMissingTranslationHandler)) })`,
        `  ]`,
        `};`
      ]
    };

    await checkMigration(original, expected);
  });

  it('should migrate existing missingTranslationHandler with useFactory provider', async () => {
    const original = {
      'projects/app/src/app/app.config.ts': [
        `import { ApplicationConfig } from '@angular/core';`,
        `import { provideTranslateService } from '@ngx-translate/core';`,
        `import { MyMissingTranslationHandler } from './my-handler';`,
        ``,
        `export const appConfig: ApplicationConfig = {`,
        `  providers: [`,
        `    provideTranslateService({`,
        `      missingTranslationHandler: { useClass: MyMissingTranslationHandler }`,
        `    })`,
        `  ]`,
        `};`
      ].join('\n')
    };

    const expected = {
      'projects/app/src/app/app.config.ts': [
        `import { ApplicationConfig } from '@angular/core';`,
        `import { provideTranslateService } from '@ngx-translate/core';`,
        `import { provideMissingTranslationHandlerForElement } from '@siemens/element-translate-ng/ngx-translate';`,
        `import { MyMissingTranslationHandler } from './my-handler';`,
        ``,
        `export const appConfig: ApplicationConfig = {`,
        `  providers: [`,
        `    provideTranslateService({ missingTranslationHandler: provideMissingTranslationHandlerForElement({ useClass: MyMissingTranslationHandler }) })`,
        `  ]`,
        `};`
      ]
    };

    await checkMigration(original, expected);
  });

  it('should migrate existing missingTranslationHandler with multiple properties', async () => {
    const original = {
      'projects/app/src/app/app.config.ts': [
        `import { ApplicationConfig } from '@angular/core';`,
        `import { provideMissingTranslationHandler, provideTranslateService, TranslateLoader } from '@ngx-translate/core';`,
        `import { MyMissingTranslationHandler } from './my-handler';`,
        ``,
        `export const appConfig: ApplicationConfig = {`,
        `  providers: [`,
        `    provideTranslateService({`,
        `      loader: {`,
        `        provide: TranslateLoader`,
        `      },`,
        `      missingTranslationHandler: provideMissingTranslationHandler(MyMissingTranslationHandler),`,
        `      defaultLanguage: 'en'`,
        `    })`,
        `  ]`,
        `};`
      ].join('\n')
    };

    const expected = {
      'projects/app/src/app/app.config.ts': [
        `import { ApplicationConfig } from '@angular/core';`,
        `import { provideMissingTranslationHandler, provideTranslateService, TranslateLoader } from '@ngx-translate/core';`,
        `import { provideMissingTranslationHandlerForElement } from '@siemens/element-translate-ng/ngx-translate';`,
        `import { MyMissingTranslationHandler } from './my-handler';`,
        ``,
        `export const appConfig: ApplicationConfig = {`,
        `  providers: [`,
        `    provideTranslateService({ loader: {`,
        `        provide: TranslateLoader`,
        `    },`,
        `    defaultLanguage: 'en', missingTranslationHandler: provideMissingTranslationHandlerForElement(provideMissingTranslationHandler(MyMissingTranslationHandler)) })`,
        `  ]`,
        `};`
      ]
    };

    await checkMigration(original, expected);
  });

  it('should migrate existing missingTranslationHandler in TranslateModule.forRoot()', async () => {
    const original = {
      'projects/app/src/app/app.config.ts': [
        `import { ApplicationConfig, importProvidersFrom } from '@angular/core';`,
        `import { TranslateModule, provideMissingTranslationHandler } from '@ngx-translate/core';`,
        `import { MyMissingTranslationHandler } from './my-handler';`,
        ``,
        `export const appConfig: ApplicationConfig = {`,
        `  providers: [`,
        `    importProvidersFrom(`,
        `      TranslateModule.forRoot({`,
        `        missingTranslationHandler: provideMissingTranslationHandler(MyMissingTranslationHandler)`,
        `      })`,
        `    )`,
        `  ]`,
        `};`
      ].join('\n')
    };

    const expected = {
      'projects/app/src/app/app.config.ts': [
        `import { ApplicationConfig, importProvidersFrom } from '@angular/core';`,
        `import { TranslateModule, provideMissingTranslationHandler } from '@ngx-translate/core';`,
        `import { provideMissingTranslationHandlerForElement } from '@siemens/element-translate-ng/ngx-translate';`,
        `import { MyMissingTranslationHandler } from './my-handler';`,
        ``,
        `export const appConfig: ApplicationConfig = {`,
        `  providers: [`,
        `    importProvidersFrom(`,
        `      TranslateModule.forRoot({ missingTranslationHandler: provideMissingTranslationHandlerForElement(provideMissingTranslationHandler(MyMissingTranslationHandler)) })`,
        `    )`,
        `  ]`,
        `};`
      ]
    };

    await checkMigration(original, expected);
  });
});
