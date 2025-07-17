var concat = require('concat');

build = async () => {
  const files = [
    './dist/dashboards-demo-webcomponents/runtime.js',
    './dist/dashboards-demo-webcomponents/main.js'
  ];
  await concat(files, 'dist/dashboards-demo-webcomponents/webcomponent-widgets.js');
};
build();
