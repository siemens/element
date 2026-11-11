// javascript.require consumes the Promise for the repository's Composer module.
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export default import(
  pathToFileURL(resolve(process.cwd(), 'node_modules/@simpl/docs-composer/dist/index.js')).href
);
