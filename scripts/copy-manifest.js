const fs = require('fs');
const path = require('path');

// Copy manifest.json to dist folder
const sourcePath = path.resolve(__dirname, '../public/manifest.json');
const destPath = path.resolve(__dirname, '../dist/manifest.json');

fs.copyFileSync(sourcePath, destPath);
console.log('Manifest.json copied to dist folder'); 