import writerOpts from './tools/semantic-release/writer-opts.js';
import { commitTypes, releaseRules } from './tools/semantic-release/config.js';

const skipCommits = process.env.SKIP_COMMIT === 'true';

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
    [
      '@anolilab/semantic-release-pnpm',
      {
        pkgRoot: 'dist/@siemens/element-ng'
      }
    ],
    [
      '@anolilab/semantic-release-pnpm',
      {
        pkgRoot: 'dist/@siemens/element-translate-ng'
      }
    ],
    [
      '@anolilab/semantic-release-pnpm',
      {
        pkgRoot: 'dist/@siemens/live-preview'
      }
    ],
    [
      '@anolilab/semantic-release-pnpm',
      {
        pkgRoot: 'dist/@siemens/charts-ng'
      }
    ],
    [
      '@anolilab/semantic-release-pnpm',
      {
        pkgRoot: 'dist/@siemens/native-charts-ng'
      }
    ],
    [
      '@anolilab/semantic-release-pnpm',
      {
        pkgRoot: 'dist/@siemens/dashboards-ng'
      }
    ],
    [
      '@anolilab/semantic-release-pnpm',
      {
        pkgRoot: 'dist/@siemens/maps-ng'
      }
    ],
    [
      '@anolilab/semantic-release-pnpm',
      {
        pkgRoot: 'projects/element-theme'
      }
    ],
    [
      '@anolilab/semantic-release-pnpm',
      {
        pkgRoot: 'projects/element-translate-cli'
      }
    ],
    // Only update remaining package.json that are not directly published
    [
      '@anolilab/semantic-release-pnpm',
      {
        pkgRoot: 'projects/element-ng',
        npmPublish: false
      }
    ],
    [
      '@anolilab/semantic-release-pnpm',
      {
        pkgRoot: 'projects/element-translate-ng',
        npmPublish: false
      }
    ],
    [
      '@anolilab/semantic-release-pnpm',
      {
        pkgRoot: 'projects/live-preview',
        npmPublish: false
      }
    ],
    [
      '@anolilab/semantic-release-pnpm',
      {
        pkgRoot: 'projects/charts-ng',
        npmPublish: false
      }
    ],
    [
      '@anolilab/semantic-release-pnpm',
      {
        pkgRoot: 'projects/native-charts-ng',
        npmPublish: false
      }
    ],
    [
      '@anolilab/semantic-release-pnpm',
      {
        pkgRoot: 'projects/dashboards-ng',
        npmPublish: false
      }
    ],
    [
      '@anolilab/semantic-release-pnpm',
      {
        pkgRoot: 'projects/maps-ng',
        npmPublish: false
      }
    ],
    [
      '@anolilab/semantic-release-pnpm',
      {
        pkgRoot: 'projects/dashboards-demo',
        npmPublish: false
      }
    ],
    // Root package.json only needs version update
    [
      '@anolilab/semantic-release-pnpm',
      {
        npmPublish: false
      }
    ],
    // Resolve workspace:* references in dist package.json files to the
    // concrete release version so that pnpm publish succeeds.
    // Must run after all version-bump prepare steps above.
    './tools/semantic-release/resolve-workspace-deps.js',
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
