const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create a simple colored square as base image
const createBaseImage = (size) => {
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 1 }
    }
  });
};

// Generate icons
const generateIcons = async () => {
  const publicDir = path.join(__dirname, '../public');
  
  // Generate logo192.png
  await createBaseImage(192)
    .toFile(path.join(publicDir, 'logo192.png'));
  
  // Generate logo512.png
  await createBaseImage(512)
    .toFile(path.join(publicDir, 'logo512.png'));
  
  // Generate favicon.ico (as PNG first, then convert to ICO)
  await createBaseImage(32)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  
  // Convert PNG to ICO using a different approach
  const pngBuffer = await fs.promises.readFile(path.join(publicDir, 'favicon.png'));
  const icoBuffer = await sharp(pngBuffer)
    .resize(32, 32)
    .toFormat('ico')
    .toBuffer();
  
  await fs.promises.writeFile(path.join(publicDir, 'favicon.ico'), icoBuffer);
  await fs.promises.unlink(path.join(publicDir, 'favicon.png')); // Clean up temporary PNG
};

generateIcons().catch(console.error); 