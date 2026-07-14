import writerOpts from './tools/semantic-release/writer-opts.js';
import { commitTypes, releaseRules } from './tools/semantic-release/config.js';

const skipCommits = process.env.SKIP_COMMIT === 'true';

const pnpmPackageRoots = [
  '',
  'projects/element-ng',
  'dist/@spike-rabbit/element-ng',
  'projects/element-translate-ng',
  'dist/@spike-rabbit//element-translate-ng',
  'projects/live-preview',
  'dist/@spike-rabbit/live-preview',
  'projects/charts-ng',
  'dist/@spike-rabbit/charts-ng',
  'projects/native-charts-ng',
  'dist/@spike-rabbit/native-charts-ng',
  'projects/dashboards-ng',
  'dist/@spike-rabbit/dashboards-ng',
  'projects/maps-ng',
  'dist/@spike-rabbit/maps-ng',
  'projects/map-styles',
  'dist/@spike-rabbit/map-styles',
  'projects/element-theme',
  'projects/element-translate-cli'
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
    // Packages to be pushed
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
        publishCmd: 'pnpm publish --recursive --no-git-checks --registry=https://npmjs.org'
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
