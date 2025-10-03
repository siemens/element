import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        'siemens-migration/index': resolve(__dirname, 'siemens-migration/index.ts')
      },
      formats: ['cjs'],
      fileName: (_format, entryName) => `${entryName}.cjs`
    },
    outDir: resolve(__dirname, '../../dist/@siemens/element-ng/schematics'),
    rollupOptions: {
      external: id => {
        // External dependencies that shouldn't be bundled
        return !(
          id.startsWith('./') ||
          id.startsWith('../') ||
          id.startsWith(__dirname) ||
          id.startsWith('\0') // Vite virtual modules
        );
      },
      output: {
        exports: 'named'
      }
    },
    target: 'node16',
    minify: false,
    sourcemap: true
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['projects/schematics/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
    setupFiles: [],
    testTimeout: 10000,
    root: '.'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './')
    }
  },
  esbuild: {
    target: 'node16'
  }
});
