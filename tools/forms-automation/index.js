const fs = require('fs');
const path = require('path');

const models = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/models.json'), 'utf8'));

require('./html')(models, true);
require('./ts')(models, true);