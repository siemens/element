const glob = require('glob');
const path = require('path');

// note: this can't be an arrow function!
exports.default = function () {
  const args = this.getOptions();

  let root = args.root;
  const examples = args.examples;
  const webcomponents = args.webcomponents;
  if (!root || !examples) {
    throw 'config error: need to pass "root" (path) and "examples" (glob)';
  }

  if (!root.endsWith('/')) {
    root += '/';
  }

  const baseDir = root + examples;
  this.addDependency(path.resolve(baseDir));

  if (webcomponents) {
    this.addDependency(path.resolve(baseDir.replace('*.ts', '*.tsx')));
  }
  const files = glob.sync(baseDir, { posix: true });
  if (webcomponents) {
    files.push(...glob.sync(baseDir.replace('*.ts', '*.tsx')));
    files.push(...glob.sync(baseDir.replace('*.ts', '*.vue')));
    files.push(...glob.sync(baseDir.replace('*.ts', '*-js.html')));
  }

  const tsRegex = new RegExp(`${root}(.+)\\.(ts|vue|tsx|jsx|html)`);
  const reactVueRegex = new RegExp(`${root}(.+)-(react|vue|js)\\.(vue|tsx|jsx|html)`);
  const list = [];
  const webcomponentsList = [];
  let code = 'export default { load: function (path) {';
  for (const file of files) {
    const match = tsRegex.exec(file);
    if (match) {
      if (!reactVueRegex.exec(file)) {
        this.addDependency(path.resolve(file));
        this.addDependency(path.resolve(path.dirname(file)));
        code += `if (path == '${match[1]}') return import('${file}');`;
        list.push(match[1]);
      } else {
        webcomponentsList.push(match[1]);
      }
    }
  }

  code += `}, list: ${JSON.stringify(list)}, webcomponentsList: ${JSON.stringify(webcomponentsList)}}`;

  return code;
};
