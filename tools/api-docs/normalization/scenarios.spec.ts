/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
import { describe, expect, it } from 'vitest';

import type { ApiDocumentation, ApiEntry, ApiMember } from '../extraction/model.js';
import {
  documentation as d,
  entry,
  member,
  method,
  parameter,
  signature
} from '../fixtures/builders.js';
import { viewText } from '../fixtures/presentation-text.js';
import { fixtureConfig } from '../fixtures/test-setup.js';
import { prepareApiPresentation } from './index.js';
import type { PresentationView } from './model.js';

const config = fixtureConfig({
  links: {
    documentationUrls: {
      Promise:
        'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
      Storage: 'https://developer.mozilla.org/en-US/docs/Web/API/Storage',
      sessionStorage: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage',
      RouterLink: 'https://angular.dev/api/router/RouterLink',
      '@angular/forms#FormsModule': 'https://angular.dev/api/forms/FormsModule',
      '@angular/forms#ReactiveFormsModule': 'https://angular.dev/api/forms/ReactiveFormsModule'
    }
  }
});
const prepare = (data: ApiDocumentation, paths: Record<string, string> = {}) =>
  prepareApiPresentation(data, paths, config);
const api = (data: ApiDocumentation, ...names: string[]) =>
  names
    .map(name => viewText(prepare(data).symbols.find(symbol => symbol.name === name)!.api))
    .join('\n\n');
const snap = (value: unknown, name: string) =>
  expect(value).toMatchFileSnapshot(`__snapshots__/scenarios/${name}.txt`);
const names = (view: PresentationView) => view.groups.flatMap(g => g.rows.map(row => row.name));
const anchors = (data: ApiDocumentation) =>
  Object.entries(prepare(data).targets).map(([id, target]) => `${id} → ${target.anchor}`);
const ref = (e: ApiEntry, extra = {}) => ({
  ...{ id: e.id, name: e.name, packageName: e.packageName, source: e.source },
  ...extra
});
const bind = (name: string, input?: string, output?: string, extra: Partial<ApiMember> = {}) =>
  member(name, { inputAlias: input, outputAlias: output, ...extra });
const from = (name: string, packageName: string, hook: string, extra = {}): ApiMember =>
  member(hook, {
    kind: 'method',
    implementedFrom: {
      ...{ name, packageName },
      source: { packageName, filePath: 'f.d.ts', startLine: 1, endLine: 2 }
    },
    ...extra
  });
const defaultText = (view: PresentationView) => view.declaration.map(part => part.text).join('');

describe('normalization scenarios', () => {
  it('orders and groups members, bindings, protected members and imports', async () => {
    const modal = entry('ModalRef', {
      kind: 'class',
      members: [
        member('shown'),
        member('active', { kind: 'setter' }),
        member('size', { kind: 'getter', readonly: true }),
        member('constructor', { kind: 'constructor', type: '' })
      ]
    });
    const bindings = entry('Bindings', {
      kind: 'component',
      members: [
        bind('value', 'value', 'valueChange', {
          type: 'Model<string>',
          readonly: true,
          required: true
        }),
        member('plain', { readonly: true }),
        bind('query', 'query', 'queryChange', { type: 'Model<string>', visibility: 'protected' }),
        member('detail', { visibility: 'protected' }),
        member('getter', { inputAlias: 'g', signatures: [signature({ returnType: 'string' })] })
      ]
    });
    const semantic = entry('Semantic', { kind: 'undecorated_class', angularKind: 'directive' });
    semantic.members = [bind('value', 'in', 'inChange')];
    const typeOnly = entry('TypeOnly', { kind: 'undecorated_class', typeOnlyExport: true });
    const data = d(modal, bindings, semantic, typeOnly, entry('Docs', { documentationOnly: true }));
    const imports = prepare(data).symbols.map(symbol => symbol.importStatement?.slice(0, 12));
    const shown = api(data, 'ModalRef', 'Bindings', 'Semantic');
    await snap(imports.join('\n') + '\n\n' + shown, 'grouping');
  });

  it('filters Angular lifecycle, CVA, validator and compiler helpers from the API only', async () => {
    const inheritedFrom = { name: 'Base', packageName: '@test/library', source: entry('B').source };
    const members = [
      from('OnInit', '@angular/core', 'ngOnInit'),
      from('ControlValueAccessor', '@angular/forms', 'writeValue'),
      from('Validator', '@angular/forms', 'validate'),
      from('Hook', '@test/contracts', 'customHook'),
      ...['ngAcceptInputType_a', 'ngTemplateContextGuard', 'ngTemplateGuard_a'].map(name =>
        member(name, { kind: 'method', static: true })
      ),
      member('internalMethod', { kind: 'method', jsdocTags: [{ name: 'internal', comment: '' }] }),
      method('refresh', undefined, { inherited: true }),
      from('ControlValueAccessor', '@angular/forms', 'registerOnTouched', {
        inherited: true,
        inheritedFrom
      })
    ];
    const [component, injectable] = (['component', 'injectable'] as const).map(
      kind => prepare(d(entry('W', { kind, members }))).symbols[0]
    );
    const views = [component.api, injectable.api, component.type].map(view => names(view));
    await snap(views.join(' | '), 'lifecycle');
  });

  it('selects members by alias, qualified name and ambiguity', async () => {
    const owner = entry('Owner', {
      kind: 'component',
      members: [
        bind('value', 'current', 'currentChange', { type: 'Model<number>' }),
        member('plain'),
        member("'SI.LOGO'"),
        member('hidden', { visibility: 'private' })
      ],
      typeMembers: [member('SI.LOGO', { type: 'number', description: 'Source.' })]
    });
    const path = '@test/library/secondary';
    const { memberIndex, members } = prepare(
      d(owner, { ...owner, id: path + '#Owner', importPath: path })
    );
    const kind = (key: string) =>
      memberIndex[key].map(i => viewText(members[i].view).match(/## (\w+)/)![1]);
    const keys = Object.keys(memberIndex).filter(key => !key.startsWith('@test/library#'));
    await snap(keys.map(key => `${key}: ${kind(key)}`).join('\n'), 'member-index');
  });

  it('builds readable, unique anchors independent of order and other packages', async () => {
    const run = method('run', [{ parameters: [parameter('a')] }, { parameters: [parameter('a')] }]);
    const plain = ['value', 'scheme$', "'quoted'"].map(name => member(name));
    const owner = entry('Owner', { members: [...plain, member('value', { static: true }), run] });
    const description = '{@link constructor} {@link Owner.scheme$}';
    const data = d(owner, entry('constructor'), entry('__proto__', { description }));
    await snap(anchors(data).join('\n'), 'anchors');
    expect(prepare(data).index.__proto__).toEqual(['@test/library#__proto__']);
    expect(api(data, '__proto__')).toContain('[constructor → #@test/library#constructor]');
    const [before, reversed] = [structuredClone(data), [...data.entries].reverse()];
    expect(prepare({ ...data, entries: reversed }).targets).toEqual(prepare(data).targets);
    expect(anchors(d(owner))).toEqual(anchors(data).filter(line => line.includes('#Owner')));
    expect(data).toEqual(before);
  });

  it.each([
    ['short', 'DEFAULT_COUNT', 'DEFAULT_COUNT'],
    ['120-char boundary', 'x'.repeat(120), 'x'.repeat(120)],
    ['121 chars', 'x'.repeat(121), '...'],
    ['multiline', 'computed(() => {\n  return rows();\n})', '...'],
    ['CRLF', '{\r\n  value: true\r\n}', '...']
  ])('abbreviates source defaults: %s', (_name, sourceDefaultValue, expected) => {
    const owner = entry('Defaulted', {
      ...{ kind: 'constant', type: 'unknown', sourceDefaultValue },
      members: [member('value', { sourceDefaultValue })],
      signatures: [signature({ parameters: [parameter('v', { sourceDefaultValue })] })]
    });
    const symbol = prepare(d(owner)).symbols[0];
    for (const view of [symbol.api, symbol.type]) {
      expect(defaultText(view)).toBe('unknown = ' + expected);
      expect(view.groups[0].rows[0].default).toBe(expected);
      expect(view.signatures[0].parameters[0].default).toBe(expected);
    }
  });

  it.each(['default', 'defaultValue'])('prefers documented @%s over source and defaultref', tag => {
    const long = '{\n  value: "' + 'x'.repeat(121) + '"\n}';
    const fenced = (code: string) => ({ name: tag, comment: '```ts\n' + code + '\n```' });
    const ref = { name: 'defaultref', comment: 'Other.value' };
    const jsdocTags = [fenced('t(`x`)'), ref];
    const owner = entry('Documented', {
      ...{ kind: 'constant', type: 'unknown', sourceDefaultValue: 'computed(() => {\n  x();\n})' },
      jsdocTags: [fenced(long), ref],
      members: [member('value', { sourceDefaultValue: 'null', jsdocTags })]
    });
    const symbol = prepare(d(owner)).symbols[0];
    expect(defaultText(symbol.api)).toBe('unknown = ' + long);
    expect(symbol.api.groups[0].rows[0].default).toBe('t(`x`)');
  });

  it('unwraps wrapper-function defaults of configured display types', () => {
    const wrapped = 't(() => $localize`:@@KEY:Label`)';
    const owner = entry('Labels', {
      kind: 'class',
      members: [
        member('documented', {
          type: 'TranslatableString',
          jsdocTags: [{ name: 'defaultValue', comment: '```\n' + wrapped + '\n```' }]
        }),
        member('source', { type: 'TranslatableString', sourceDefaultValue: wrapped }),
        member('signal', {
          type: 'InputSignal<TranslatableString>',
          signalReadType: 'TranslatableString',
          sourceDefaultValue: wrapped
        }),
        member('multiline', {
          type: 'TranslatableString',
          sourceDefaultValue: 't(\n  () => $localize`:@@KEY:Label`\n)'
        }),
        member('other', { type: 'string', sourceDefaultValue: wrapped }),
        member('withParameter', {
          type: 'TranslatableString',
          sourceDefaultValue: 't(value => value)'
        }),
        method('format', [
          {
            parameters: [
              parameter('label', { type: 'TranslatableString', sourceDefaultValue: wrapped })
            ]
          }
        ])
      ]
    });
    const defaults = (unwrapWrapperFunctionTypes?: string[]) => {
      const { api } = prepareApiPresentation(
        d(owner),
        {},
        fixtureConfig({ defaultValues: { unwrapWrapperFunctionTypes } })
      ).symbols[0];
      const rows = api.groups.flatMap(group => group.rows);
      return Object.fromEntries(
        rows.map(row => [row.name, row.signatures[0]?.parameters[0]?.default ?? row.default])
      );
    };

    expect(defaults(['TranslatableString'])).toEqual({
      documented: '$localize`:@@KEY:Label`',
      source: '$localize`:@@KEY:Label`',
      signal: '$localize`:@@KEY:Label`',
      multiline: '$localize`:@@KEY:Label`',
      other: wrapped,
      withParameter: 't(value => value)',
      format: '$localize`:@@KEY:Label`'
    });
    expect(defaults()).toMatchObject({ documented: wrapped, source: wrapped, format: wrapped });
  });

  it('formats prose and resolves links of every form', async () => {
    const description = [
      '<STRONG>Bold</STRONG> <em><b>nested</b></em> <u>u</u> <sub>s</sub>',
      '`<i>input</i>` ![Diagram](images/d.svg) ![Ref][pic] ![](images/e.svg)',
      '```html\n<i>select</i>\n```',
      '<script>alert(1)</script> <img src=x onerror=alert(1)> <i onclick="a()">text</i>',
      '- One `code`\n- Two',
      '{@link javascript:alert(1) JS} [MD](javascript:alert) ![Img](data:image/svg+xml,x)',
      '[pic]: https://example.com/d.png'
    ].join('\n\n');
    const members = [member('value', { description: 'Type <i>input</i>, <small>small</small>.' })];
    await snap(api(d(entry('Owner', { description, members })), 'Owner'), 'prose-formatting');
    const links = [
      '{@link Other} {@link Owner.value label} [full][API] [collapsed][] [shortcut]',
      '[hidden](Hidden) [secret](Owner.secret) [guide](guide.md) [anchor](#missing)',
      '{@link Missing text} [missing](Owner.missing)',
      '{@link Promise} [storage](Storage) {@link sessionStorage} {@link RouterLink}',
      '{@link @angular/forms#FormsModule} [forms](@angular/forms#ReactiveFormsModule)',
      '[api]: Owner.value\n[collapsed]: https://example.com/c\n[shortcut]: guide.md\n[api]: https://x.test/ignored'
    ].join('\n\n');
    const secret = member('secret', { visibility: 'private' });
    const owner = entry('Owner', { description: links, members: [member('value'), secret] });
    const hidden = (name: string) => entry(name, { internal: true });
    await snap(api(d(hidden('Hidden'), entry('Other'), owner), 'Owner'), 'prose-links');
    expect(api(d(hidden('RouterLink'), owner), 'Owner')).toContain('RouterLink\n');
  });

  it.each<[string, (text: string) => Partial<ApiMember>]>([
    ['raw comments', text => ({ rawComment: '/**\n * ' + text + '\n */' })],
    ['extracted descriptions', text => ({ description: text })]
  ])('renders inline tags from %s', (_name, comment) => {
    const text =
      '{@label FIRST} Before {@link Other | *other*} after {@label SECOND} `{@label CODE}`.';
    const owner = entry('Owner', { members: [member('value', comment(text))] });
    expect(api(d(entry('Other'), owner), 'Owner')).toContain(
      'Before [*other* → #@test/library#Other] after  `{@label CODE}`.'
    );
  });

  it('resolves method and peer-parameter prose within the owning overload', async () => {
    const search = (description = '') => parameter('searchValue', { description });
    const replace = method(
      'replace',
      [
        { parameters: [search()], description: 'Search {@link searchValue}.' },
        {
          parameters: [
            search('With {@link replaceValue}.'),
            parameter('replaceValue', { description: 'With {@link searchValue}.' })
          ]
        },
        { parameters: [parameter('implementationOnly')], implementation: true }
      ],
      { description: 'Replace {@link searchValue}.' }
    );
    const other = method('other', [{}], { description: '{@link searchValue}' });
    const locale = entry('Locale', { members: [replace, other] });
    await snap(viewText(prepare(d(locale)).symbols[0].type), 'prose-parameters');
  });

  it('links types by context and skips shadowed, inferred, hidden and unknown names', async () => {
    const [value, hidden] = [entry('Value'), entry('Hidden', { internal: true })];
    const one = entry('Dup', { id: '@one#Dup', importPath: '@one' });
    const two = entry('Dup', { id: '@two#Dup', importPath: '@two' });
    const infer = 'typeof ns.Value | import("p").Value | (Value extends infer I ? I : never)';
    const data = d(
      ...[value, hidden, entry('T'), entry('Base'), entry('Contract'), one, two],
      entry('Generic', { generics: ['T extends Value = Value'], typeReferences: [ref(value)] }),
      entry('Types', { type: infer + ' | Unknown', typeReferences: [ref(value)] }),
      entry('Shadow', {
        ...{ kind: 'undecorated_class', generics: ['T'], type: 'T | Hidden' },
        typeReferences: [ref(hidden)],
        extends: ['Base<Value[]>'],
        implements: ['Contract<T>']
      }),
      entry('Ctx', { type: '{ Dup: 1; f: (Dup: 2) => Dup }', typeReferences: [ref(two)] })
    );
    await snap(api(data, 'Generic', 'Types', 'Shadow', 'Ctx'), 'type-linking');
    expect(prepare(data).symbols.map(symbol => symbol.name)).not.toContain('Hidden');
    expect(prepare(data).index.Dup).toEqual([one.id, two.id]);
    expect(prepare(d({ ...hidden, docsVisible: true })).symbols).toHaveLength(1);
  });

  it('prefers original names and contextual imports across reexports', async () => {
    const src = { filePath: 'shared.ts', startLine: 7, endLine: 10 };
    const root = entry('Value', { id: '@pkg#Value', importPath: '@pkg', source: src });
    const secondary = { ...root, id: '@pkg/secondary#Value', importPath: '@pkg/secondary' };
    const old = { ...secondary, name: 'OldValue', id: '@pkg/secondary#OldValue', aliasOf: 'Value' };
    const other = { ...root, id: '@other#Value', importPath: '@other', packageName: '@other' };
    const owner = (importPath: string, refs: ApiEntry[] = [root, secondary, old]) =>
      entry('Owner', {
        importPath,
        description: '{@link Value}',
        typeReferences: refs.map(value => ref(value, { name: 'Value' }))
      });
    const a = entry('Value', { source: { ...src, filePath: 'a.ts' } });
    const b = { ...a, id: '@test/library/secondary#Value', source: { ...src, filePath: 'b.ts' } };
    const link = (...entries: ApiEntry[]) => api(d(...entries), 'Owner');
    await snap(
      [
        link(root, secondary, old, owner('@pkg/secondary')),
        link(root, secondary, old, other, owner('@different')),
        link(a, b, owner('@test/library', [a, b]))
      ].join('\n'),
      'reexports'
    );
  });

  it('routes Angular origins to public docs and rejects private paths', async () => {
    const angular = (name: string, pkg: string, file: string, importPath?: string) => ({
      ...{ name, packageName: pkg, importPath },
      source: {
        packageName: pkg,
        filePath: `node_modules/${pkg}/${file}`,
        startLine: 1,
        endLine: 1
      }
    });
    const typeReferences = [
      angular('TemplateRef', '@angular/core', 'types/core.d.ts'),
      angular('OverlayRef', '@angular/cdk', 'types/_overlay-module-chunk.d.ts'),
      angular('MatButton', '@angular/material', 'button/index.d.ts', '@angular/material/button'),
      angular('ɵPrivate', '@angular/core', 'types/core.d.ts')
    ];
    const type = 'TemplateRef<unknown> | OverlayRef | MatButton | ɵPrivate';
    const result = prepare(d(entry('Owner', { type, typeReferences })));
    await snap(viewText(result.symbols[0].api), 'angular-origins');
    expect(JSON.stringify(result)).not.toContain('core.d.ts');
  });

  it('computes ordered cyclic closures without prose, protected or implementation-only links', async () => {
    const generics = ['T extends Constraint = Default'];
    const call = signature({ parameters: [parameter('v', { type: 'Param' })], returnType: 'Ret' });
    const data = d(
      entry('Root', {
        ...{ kind: 'component', extends: ['Base'] },
        members: [
          bind('options', 'options', undefined, { type: 'Options', inherited: true }),
          bind('branch', 'branch', undefined, { type: 'Branch' })
        ]
      }),
      entry('Base', {
        kind: 'directive',
        members: [member('detail', { type: 'Detail', visibility: 'protected' })]
      }),
      entry('Branch', { members: [member('cycle', { type: 'Root' })] }),
      entry('Alias', {
        ...{ kind: 'type_alias', type: 'Arm', generics, description: 'See {@link ProseOnly}.' },
        signatures: [call]
      }),
      ...'Options Detail Arm Default Param Ret ProseOnly Deep'.split(' ').map(name => entry(name)),
      entry('Constraint', { members: [member('deep', { type: 'Deep' })] })
    );
    const related = (paths = {}) =>
      prepare(data, paths)
        .symbols.map(({ name, api, type: t, explicitPublicApi: e }) =>
          [name, api.relatedTypeIds, t.relatedTypeIds, e?.relatedTypeIds ?? '-'].join(' | ')
        )
        .join('\n')
        .replaceAll('@test/library#', '');
    await snap(related({ '@test/library#Base': 'api/Base.md' }), 'closure');
    expect(related()).toContain('Root | Options,Branch,Base,Detail');
    const { members: m, memberIndex: i, symbols } = prepare(data);
    expect(m[i['Root.branch'][0]].view.relatedTypeIds).toEqual(symbols[0].api.relatedTypeIds);
  });
});
