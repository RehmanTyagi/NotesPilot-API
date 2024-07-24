const fs = require('fs');
const path = require('path');

function generateAssetsImgURL(filePath) {
  const logoPath = `public/assets/${filePath}`
  console.log(logoPath)
  const logo = fs.readFileSync(logoPath, 'base64')
  const logoSrc = `data:image/svg+xml;base64,${logo}`
  return logoSrc;
}

module.exports = generateAssetsImgURL;