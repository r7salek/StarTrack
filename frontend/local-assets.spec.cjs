const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

test('application fonts use bundled styles without remote font links', () => {
  const index = readFileSync(path.join(__dirname, 'src/index.html'), 'utf8');
  assert.doesNotMatch(index, /https?:\/\/fonts\.(?:googleapis|gstatic)\.com/i);
  const config = JSON.parse(readFileSync(path.join(__dirname, 'angular.json'), 'utf8'));
  const project = Object.values(config.projects)[0];
  const styles = project.architect.build.options.styles;
  assert.ok(styles.includes('node_modules/roboto-fontface/css/roboto/roboto-fontface.css'));
  assert.ok(styles.includes('node_modules/material-design-icons/iconfont/material-icons.css'));
});
