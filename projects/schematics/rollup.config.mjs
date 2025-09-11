import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const sourceDir = dirname(fileURLToPath(import.meta.url));
export default {
  external: dependency =>
    !(
      dependency.startsWith('./') ||
      dependency.startsWith('../') ||
      dependency.startsWith(sourceDir)
    ),
  input: {
    'siemens-migration/index': `${sourceDir}/siemens-migration/index.ts`
  },
  plugins: [
    resolve(),
    typescript({
      tsconfig: join(sourceDir, 'tsconfig.rollup.json')
    })
  ],
  output: {
    dir: './dist/@siemens/element-ng/schematics',
    format: 'cjs',
    entryFileNames: '[name].cjs',
    exports: 'named'
  }
};
