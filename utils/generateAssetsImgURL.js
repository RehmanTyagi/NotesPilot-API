const fs = require('fs');
const path = require('path');

function generateAssetsImgURL(filePath) {
  const logoPath = path.join(__dirname, '..', 'assets', filePath);
  const logo = fs.readFileSync(logoPath, 'base64')
  const logoSrc = `data:image/svg+xml;base64,${logo}`
  return logoSrc;
}

module.exports = generateAssetsImgURL;