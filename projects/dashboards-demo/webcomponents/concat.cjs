var fs = require('fs');
var path = require('path');

build = async () => {
  const files = ['./dist/dashboards-demo-webcomponents/main.js'];
  const dir = './dist/dashboards-demo/webcomponents/';
  const dirEsm = './dist/dashboards-demo-esm/webcomponents/';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dirEsm)) {
    fs.mkdirSync(dirEsm, { recursive: true });
  }

  // Read each file and wrap in IIFE to avoid variable conflicts
  const wrappedContents = files.map(file => {
    const content = fs.readFileSync(file, 'utf8');
    // Wrap each file's content in an IIFE to isolate scope
    return `(function(){\n${content}\n})();`;
  });

  const combinedContent = wrappedContents.join('\n');

  // Write to all output locations
  fs.writeFileSync('dist/dashboards-demo/webcomponents/webcomponent-widgets.js', combinedContent);
  fs.writeFileSync(
    'dist/dashboards-demo-esm/webcomponents/webcomponent-widgets.js',
    combinedContent
  );
  fs.writeFileSync('dist/dashboards-demo-webcomponents/webcomponent-widgets.js', combinedContent);
};
build();
