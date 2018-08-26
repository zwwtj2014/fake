'use strict';

/**
 * 提取icon.css中定义的icon
 */

const postcss = require('postcss');
const fs = require('fs');
const path = require('path');

const fontFile = fs.readFileSync(path.resolve(__dirname, '../../packages/theme-chalk/src/icon.scss'), 'utf8');
const nodes = postcss.parse(fontFile).nodes;

const classList = [];

for (const node of nodes) {
  const selector = node.selector || '';
  const reg = new RegExp(/\.el-icon-([^:]+):before/);
  const arr = selector.match(reg);

  if (arr && arr[1]) {
    classList.push(arr[1]);
  }
}

fs.writeFile(path.resolve(__dirname, '../../examples/icon.json'), JSON.stringify(classList), ()=>{});
