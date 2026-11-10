import angular from '@analogjs/vite-plugin-angular';
import { federation } from '@module-federation/vite';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

const { dependencies } = JSON.parse(readFileSync('package.json', 'utf-8'));

export default defineConfig({
  root: import.meta.dirname,
  base: './',
  server: { port: 4206, origin: 'http://localhost:4206' },
  preview: { port: 4206 },
  build: {
    outDir: '../../../dist/dashboards-demo-esm/mfe-vite',
    emptyOutDir: true,
    target: 'es2022',
    rollupOptions: { input: {} }
  },
  plugins: [
    federation({
      name: 'mfeVite',
      filename: 'remoteEntry.js',
      exposes: {
        './Download': './src/app/download.component.ts',
        './Upload': './src/app/upload.component.ts'
      },
      shared: Object.fromEntries(
        ['@angular/core', '@angular/common', 'rxjs'].map(pkg => [
          pkg,
          { singleton: true, requiredVersion: dependencies[pkg] }
        ])
      ),
      dts: false
    }),
    angular({ tsconfig: 'tsconfig.app.json' })
  ]
});
