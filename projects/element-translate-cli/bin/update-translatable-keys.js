#!/usr/bin/env node

import { spawn } from 'child_process';
import * as fs from 'fs';
import { dirname } from 'path';

import { XMLParser } from 'fast-xml-parser';

const configFile = process.argv[2] || './element-translate.conf.json';
const toolConfig = JSON.parse(fs.readFileSync(configFile));

console.log('Running localize-extract');
const args = ['-s', toolConfig.files, '-f', 'xlf2', '-o', 'messages.xlf'];
const extract = spawn('localize-extract', args, {
  stdio: ['ignore', 'ignore', 'inherit'],
  shell: true
});
extract.on('error', error => console.log(`error: ${error.message}`));

extract.on('close', () => {
  processMessages();
  generateFiles();
  fs.rmSync('messages.xlf');
});

function prepareConfigs() {
  for (const config of toolConfig.configs) {
    config.keys = new Set();
    config.translations = {};
  }
}

function getConfigs(notes) {
  if (!Array.isArray(notes)) {
    notes = [notes];
  }
  const configs = [];
  for (const note of notes) {
    if (note['@_category'] !== 'location') {
      continue;
    }
    const location = note['#text'];

    for (const config of toolConfig.configs) {
      if (location?.startsWith(config.locationPrefix)) {
        configs.push(config);
      }
    }
  }
  return configs;
}

function processMessages() {
  console.log('Completed running localize-extract');
  console.log('Generating translation keys');

  const parser = new XMLParser({ ignoreAttributes: false });
  const messages = parser.parse(fs.readFileSync('./messages.xlf').toString('utf-8'));

  prepareConfigs();

  for (const unit of messages.xliff.file.unit) {
    const key = unit['@_id'];
    const value = unit.segment.source.toString(); // can be number

    // ignore some bogus output
    if (key.match(/^\d+$/)) {
      continue;
    }

    const configs = getConfigs(unit.notes.note);
    for (const config of configs) {
      config.keys.add(key);
      config.translations[key] = value;
    }
  }
}

function generateFiles() {
  for (const config of toolConfig.configs) {
    // only update if there are keys found, i.e. don't overwrite when not all libs are build
    if (!config.keys.size) {
      console.log(`Skipping ${config.name} since no keys found`);
      continue;
    }

    const keys = Array.from(config.keys);
    keys.sort();

    // for objects, keys are iterated in order they're added, so...
    const tmp = config.translations;
    config.translations = {};
    for (const key of keys) {
      config.translations[key] = tmp[key];
    }

    const interfaceLine = keys.map(key => `  '${key}'?: string;`);
    const interfaceFull = `/* eslint-disable */

// Auto-generated file. Run 'yarn update-translatable-keys' to update.

export interface ${config.keysInterfaceName} {
${interfaceLine.join('\n')}
}
`;

    fs.mkdirSync(dirname(config.keysFile), { recursive: true });
    fs.writeFileSync(config.keysFile, interfaceFull);

    fs.mkdirSync(dirname(config.messagesFile), { recursive: true });
    fs.writeFileSync(config.messagesFile, JSON.stringify(config.translations, null, 2));

    console.log(`Completed generating code for ${config.name}:`);
    console.log(` - ${config.keysFile}`);
    console.log(` - ${config.messagesFile}`);
  }

  console.log('Completed generating translation keys');
}
