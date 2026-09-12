const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

test('Docker preview reduces debug overhead without changing native development source maps', () => {
  const config = JSON.parse(readFileSync(path.join(__dirname, 'angular.json'), 'utf8'));
  const project = config.projects.StarTrack;
  assert.equal(project.architect.build.configurations['local-preview'].sourceMap, false);
  assert.equal(project.architect.build.configurations.development.sourceMap, true);
  assert.equal(project.architect.serve.configurations['local-preview'].browserTarget, 'StarTrack:build:local-preview');
  const dockerfile = readFileSync(path.join(__dirname, 'Dockerfile.dev'), 'utf8');
  assert.match(dockerfile, /ENV NG_BUILD_MAX_WORKERS=2/);
  assert.match(dockerfile, /"--configuration", "local-preview"/);
});

test('application fonts use bundled styles without remote font links', () => {
  const index = readFileSync(path.join(__dirname, 'src/index.html'), 'utf8');
  assert.doesNotMatch(index, /https?:\/\/fonts\.(?:googleapis|gstatic)\.com/i);
  const config = JSON.parse(readFileSync(path.join(__dirname, 'angular.json'), 'utf8'));
  const project = Object.values(config.projects)[0];
  const styles = project.architect.build.options.styles;
  assert.ok(styles.includes('node_modules/roboto-fontface/css/roboto/roboto-fontface.css'));
  assert.ok(styles.includes('node_modules/material-design-icons/iconfont/material-icons.css'));
});

test('each project editor step uses its own form validity', () => {
  for (const [file, prefix] of [
    ['CreateProject/CreateProject.component.html', ''],
    ['CreateProjectManagement/updateProject/updateProject.component.html', 'createProjectService.'],
  ]) {
    const template = readFileSync(path.join(__dirname, 'src/app', file), 'utf8');
    const controls = [...template.matchAll(/\[stepControl\]="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(controls, ['form', 'form5', 'form3', 'form1', 'form2', 'form4'].map(form => prefix + form));
    assert.equal((template.match(/<form stFocusInvalid/g) || []).length, 6);
  }
});
