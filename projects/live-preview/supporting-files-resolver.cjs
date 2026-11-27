/**
 * Copyright (c) Siemens 2016 - 2026
 * SPDX-License-Identifier: MIT
 */
'use strict';

const fs = require('fs');
const path = require('path');

const toPosix = p => p.replace(/\\/g, '/');

const collectSupportingFiles = ({ root, entryFiles }) => {
  const rootAbs = toPosix(path.resolve(root)).replace(/\/$/, '');
  const supportingFiles = {};

  for (const file of entryFiles.map(f => toPosix(path.resolve(f))).sort()) {
    if (!file.endsWith('.ts') || !file.startsWith(`${rootAbs}/`)) {
      continue;
    }

    const dir = path.posix.dirname(file);
    const found = new Set();

    for (const [, spec] of fs
      .readFileSync(file, 'utf8')
      .matchAll(/\bfrom\s+['"](\.\/[^'"]+)['"]/g)) {
      const dep = toPosix(path.resolve(dir, spec.endsWith('.ts') ? spec : `${spec}.ts`));
      if (dep === file || !dep.startsWith(`${dir}/`) || !fs.existsSync(dep)) {
        continue;
      }

      found.add(path.posix.relative(rootAbs, dep));

      for (const [, tpl] of fs
        .readFileSync(dep, 'utf8')
        .matchAll(/\btemplateUrl\s*:\s*['"]([^'"]+)['"]/g)) {
        const html = toPosix(path.resolve(path.posix.dirname(dep), tpl));
        if (html.endsWith('.html') && html.startsWith(`${dir}/`) && fs.existsSync(html)) {
          found.add(path.posix.relative(rootAbs, html));
        }
      }
    }

    if (found.size) {
      supportingFiles[path.posix.relative(rootAbs, file).replace(/\.ts$/, '')] = [...found];
    }
  }

  return supportingFiles;
};

exports.collectSupportingFiles = collectSupportingFiles;
