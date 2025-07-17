var concat = require('concat');
var fs = require('fs');

build = async () => {
  const files = [
    './dist/dashboards-demo-webcomponents/runtime.js',
    './dist/dashboards-demo-webcomponents/main.js'
  ];
  fs.mkdirSync('./dist/dashboards-demo/webcomponents/');
  await concat(files, 'dist/dashboards-demo/webcomponents/webcomponent-widgets.js');
};
build();
