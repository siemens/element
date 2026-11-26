import path from 'path';
import { globIterate } from 'glob';

import { collectSupportingFiles } from './supporting-files-resolver.cjs';

const livePreviewComponentLoader = {
  name: 'live-preview-component-loader',
  setup: build => {
    build.onResolve({ filter: /(@siemens|@simpl)\/live-preview\/component-loader.*/ }, args => {
      const [data] = args.path.split('!');
      const url = new URL('fake:' + data);
      const root = url.searchParams.get('root');
      const examples = url.searchParams.get('examples');
      const webcomponents = url.searchParams.get('webcomponents');
      const rel = url.searchParams.get('rel');

      if (!root) {
        throw 'config error: need to pass "root" (path)';
      }

      return {
        namespace: 'live-preview-component-loader',
        path: args.path,
        pluginData: { root, webcomponents: webcomponents === 'true', examples, rel: rel === 'true' }
      };
    });

    build.onLoad(
      {
        filter: /(@siemens|@simpl)\/live-preview\/component-loader.*/,
        namespace: 'live-preview-component-loader'
      },
      async ({ pluginData: { root, webcomponents, examples, rel } }) => {
        const watchDirs = [root];

        let code = 'export default { load: function (path) { switch (path) {';
        const files = [];
        const tsFiles = [];
        const webcomponentsFiles = [];
        const glob = path.posix.join(root, examples.replace(/\.ts$/, '.{ts,tsx,vue,js}'));
        const rootNormalized = path.normalize(root);
        // posix: true needed for windows
        for await (const file of globIterate(glob, { posix: true })) {
          if (file.endsWith('.ts')) {
            const fileName = file
              .replace(new RegExp('^' + rootNormalized + '/'), '')
              .replace(/\.ts$/, '');
            let importFileName = rel ? `./${fileName}` : file.replace(/\.ts$/, '');
            code += `case '${fileName}': return import('${importFileName}');`;
            files.push(fileName);
            tsFiles.push(path.resolve(file));
          } else {
            webcomponentsFiles.push(file.replace(root + '/', '').replace(/\.(tsx|vue|js)$/, ''));
          }
        }
        files.sort();
        webcomponentsFiles.sort();

        const supportingFiles = collectSupportingFiles({ root, entryFiles: tsFiles });

        code += `default: return undefined; } }, list: ${JSON.stringify(files)}, supportingFiles: ${JSON.stringify(supportingFiles)}`;
        if (webcomponents) {
          code += `, webcomponentsList: ${JSON.stringify(webcomponentsFiles)}`;
        }

        code += '};';

        return { watchDirs, watchFiles: tsFiles, contents: code, resolveDir: root, loader: 'js' };
      }
    );
  }
};

export default livePreviewComponentLoader;
