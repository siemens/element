var concat = require('concat');
var fs = require('fs');

build = async () => {
  const files = [
    './dist/dashboards-demo-webcomponents/runtime.js',
    './dist/dashboards-demo-webcomponents/main.js'
  ];
  const dir = './dist/dashboards-demo/webcomponents/';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  await concat(files, 'dist/dashboards-demo/webcomponents/webcomponent-widgets.js');
  await concat(files, 'dist/dashboards-demo-webcomponents/webcomponent-widgets.js');
};
build();
