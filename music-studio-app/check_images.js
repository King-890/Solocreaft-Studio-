const fs = require('fs');
const path = require('path');

const filesToCheck = [
    'home_bg.png',
    'blossom_goddess_windy.png',
    'blossom_goddess.png',
    'band_room_3d_background.png'
];

const assetsDir = path.join(__dirname, 'assets');

filesToCheck.forEach(file => {
    const filePath = path.join(assetsDir, file);
    if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        const header = buffer.toString('hex', 0, 8);
        const isPng = header === '89504e470d0a1a0a';
        const isJpg = header.startsWith('ffd8ff');
        const isWebp = buffer.toString('utf8', 8, 12) === 'WEBP';

        console.log(`File: ${file}`);
        console.log(`Header: ${header}`);
        console.log(`Is PNG: ${isPng}`);
        console.log(`Is JPG: ${isJpg}`);
        console.log(`Is WebP: ${isWebp}`);
        console.log('---');
    } else {
        console.log(`File not found: ${file}`);
    }
});
