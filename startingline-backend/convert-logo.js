const fs = require('fs');
const path = require('path');

// Read the logo file
const logoPath = '/Users/mac/Code/Startingline/startingline-organiser/public/SL_Logo_WtV2.png';
const logoBuffer = fs.readFileSync(logoPath);
const base64Logo = logoBuffer.toString('base64');

console.log('data:image/png;base64,' + base64Logo);



