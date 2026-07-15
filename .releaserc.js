import writerOpts from './tools/semantic-release/writer-opts.js';
import { commitTypes, releaseRules } from './tools/semantic-release/config.js';

const skipCommits = process.env.SKIP_COMMIT === 'true';

const pnpmPackageRoots = [
  undefined,
  'projects/element-ng',
  'dist/@siemens/element-ng',
  'projects/element-translate-ng',
  'dist/@siemens//element-translate-ng',
  'projects/live-preview',
  'dist/@siemens/live-preview',
  'projects/charts-ng',
  'dist/@siemens/charts-ng',
  'projects/native-charts-ng',
  'dist/@siemens/native-charts-ng',
  'projects/dashboards-ng',
  'dist/@siemens/dashboards-ng',
  'projects/maps-ng',
  'dist/@siemens/maps-ng',
  'projects/map-styles',
  'dist/@siemens/map-styles',
  'projects/element-theme',
  'projects/element-translate-cli',
  'projects/dashboards-demo',
  'projects/icon-viewer'
];

export default {
  branches: [
    {
      name: 'release/+([0-9])?(.{+([0-9]),x}).x',
      range: "${name.replace(/^release\\//g, '')}",
      channel: "${name.replace(/^release\\//g, '')}"
    },
    'main',
    {
      name: 'next',
      channel: 'next',
      prerelease: 'rc'
    }
  ],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular',
        releaseRules,
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE']
        },
        presetConfig: {
          types: commitTypes
        }
      }
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'angular',
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'NOTE', 'DEPRECATED']
        },
        writerOpts
      }
    ],
    ...(skipCommits ? [] : ['@semantic-release/changelog']),
    // All package.json where the version needs to be updated
    ...pnpmPackageRoots.map(pkgRoot => [
      '@semantic-release/npm',
      {
        pkgRoot: pkgRoot,
        npmPublish: false
      }
    ]),
    [
      '@semantic-release/exec',
      {
        verifyConditionsCmd: 'pnpm publish --recursive --no-git-checks --dry-run',
        publishCmd:
          'pnpm publish --recursive --no-git-checks ${nextRelease.channel ? "--tag " + nextRelease.channel : ""}'
      }
    ],
    ...(skipCommits
      ? []
      : [
          [
            '@semantic-release/git',
            {
              assets: ['CHANGELOG.md', 'package.json', 'pnpm-lock.yaml', 'projects/*/package.json'],
              message: 'chore(release): ${nextRelease.version}'
            }
          ]
        ]),
    [
      '@semantic-release/github',
      {
        successComment: false
      }
    ]
  ]
};
