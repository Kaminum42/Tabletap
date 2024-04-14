// version.js
const fs = require('fs');
const path = require('path');
 
const version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;

// write dist/version.json
fs.writeFileSync(path.join(__dirname, '../dist/version.json'), JSON.stringify({
    version: version,
    build_time: new Date().toLocaleString()
}, null, 4));