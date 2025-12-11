const sharp = require('sharp');

async function createIcon(size) {
  const outputPath = `images/icon${size}.png`;
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 135, g: 206, b: 235, alpha: 1 }
    }
  })
  .png()
  .toFile(outputPath);
  console.log(`Created ${outputPath}`);
}

Promise.all([
  createIcon(128),
  createIcon(48),
  createIcon(16)
]).catch(err => {
  console.error(err);
  process.exit(1);
});
