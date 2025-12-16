import path from 'path';
import { globIterate } from 'glob';

const livePreviewComponentLoader = {
  name: 'live-preview-component-loader',
  setup: build => {
    // Loader for .html files to return raw string content
    build.onLoad({ filter: /\.html$/ }, async args => {
      const fs = await import('fs/promises');
      const contents = await fs.readFile(args.path, 'utf8');
      return {
        contents: `export default ${JSON.stringify(contents)};`,
        loader: 'js'
      };
    });

    build.onResolve({ filter: /(@siemens|@simpl)\/live-preview\/component-loader.*/ }, args => {
      const [data] = args.path.split('!');
      const url = new URL('fake:' + data);
      const root = url.searchParams.get('root');
      const examples = url.searchParams.get('examples');
      const webcomponents = url.searchParams.get('webcomponents');

      if (!root) {
        throw 'config error: need to pass "root" (path)';
      }

      return {
        namespace: 'live-preview-component-loader',
        path: args.path,
        pluginData: { root, webcomponents, examples }
      };
    });

    build.onLoad(
      {
        filter: /(@siemens|@simpl)\/live-preview\/component-loader.*/,
        namespace: 'live-preview-component-loader'
      },
      async ({ pluginData: { root, webcomponents, examples } }) => {
        const watchDirs = [root];

        let code = 'export default { load: function (path) { switch (path) {';
        const files = [];
        const webcomponentsFiles = [];

        for await (const file of globIterate(
          path.posix.join(root, examples.replace(/\.ts$/, '.{ts,tsx,vue,js,html}')),
          { posix: true } // needed for windows
        )) {
          if (file.endsWith('.ts')) {
            const fileName = file.replace(new RegExp('^' + root + '/'), '').replace(/\.ts$/, '');
            code += `case '${fileName}': return import('${file.replace(/\.ts$/, '')}');`;
            files.push(fileName);
          } else if (file.endsWith('.html')) {
            const fileName = file.replace(new RegExp('^' + root + '/'), '');
            code += `case '${fileName}': return import('${file}');`;
          } else {
            webcomponentsFiles.push(file.replace(root + '/', '').replace(/\.(tsx|vue|js)$/, ''));
          }
        }

        files.sort();
        webcomponentsFiles.sort();

        code += `default: return undefined; } }, list: ${JSON.stringify(files)}`;
        if (webcomponents) {
          code += `, webcomponentsList: ${JSON.stringify(webcomponentsFiles)}`;
        }

        code += '};';

        return { watchDirs, contents: code, resolveDir: root, loader: 'js' };
      }
    );
  }
};

export default livePreviewComponentLoader;
