/*
 * Gatsby 3 uses a PostCSS loader that reads postcss/package.json directly.
 * Node 20 respects PostCSS package exports, so we explicitly expose that file
 * before Gatsby starts. The script is safe to run repeatedly after yarn install.
 */

const fs = require('fs');
const path = require('path');

const postcssPackagePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'gatsby',
  'node_modules',
  'postcss',
  'package.json',
);

if (!fs.existsSync(postcssPackagePath)) {
  console.error('Gatsby dependencies are missing. Run "corepack yarn install" first.');
  process.exit(1);
}

const postcssPackage = JSON.parse(fs.readFileSync(postcssPackagePath, 'utf8'));
const packageJsonExport = './package.json';

if (!postcssPackage.exports?.[packageJsonExport]) {
  postcssPackage.exports = {
    ...postcssPackage.exports,
    [packageJsonExport]: packageJsonExport,
  };
  fs.writeFileSync(postcssPackagePath, `${JSON.stringify(postcssPackage, null, 2)}\n`);
  console.log('Applied Node 20 compatibility patch for Gatsby PostCSS.');
}
