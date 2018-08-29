const fs = require('fs');
const path = require('path');
const endOfLine = require('os').EOL;
const uppercamelcase = require('uppercamelcase');
const render = require('json-templater/string');

const Components = require('../../components.json');
const OUTPUT_PATH = path.join(__dirname, '../../src/index.js');

const IMPORT_TEMPLATE = 'import {{name}} from \'../packages/{{package}}/index.js\';';
const INSTALL_COMPONENT_TEMPLATE = '  {{name}}';
const MAIN_TEMPLATE = `/* Automatically generated by './build/bin/build-entry.js' */

{{include}}

const components = [
{{install}}
];

const install = function(Vue, opts = {}) {
  components.forEach(component => {
    Vue.component(component.name, component);
  });

  Vue.prototype.$ELEMENT = {
    size: opts.size || '',
    zIndex: opts.zIndex || 2000
  };

};

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export default {
  version: '{{version}}',
  install,
{{list}}
};
`;

const includeComponentTemplate = [];
const installTemplate = [];
const listTemplate = [];

Object.keys(Components).forEach(name => {
  const componentName = uppercamelcase(name);

  includeComponentTemplate.push(render(IMPORT_TEMPLATE, {
    name: componentName,
    package: name
  }));

  // 剔除下面四个组件, 其它全都注入(Install)到Vue中
  if (['Loading', 'MessageBox', 'Notification', 'Message'].indexOf(componentName) === -1) {
    installTemplate.push(render(INSTALL_COMPONENT_TEMPLATE, {
      name: componentName,
      component: name
    }));
  }

  if (componentName !== 'Loading') {
    listTemplate.push(`  ${componentName}`);
  }
});

fs.writeFileSync(OUTPUT_PATH, render(MAIN_TEMPLATE, {
  include: includeComponentTemplate.join(endOfLine),
  install: installTemplate.join(',' + endOfLine),
  version: process.env.VERSION || require('../../package.json').version,
  list: listTemplate.join(',' + endOfLine)
}));

console.log('[build entry] DONE: ', OUTPUT_PATH);
