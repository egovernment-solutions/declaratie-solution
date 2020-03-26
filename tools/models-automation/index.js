const fs = require('fs');
const path = require('path');

const modelsTxt = fs.readFileSync(path.join(__dirname, '../../data/models.txt'), 'utf8');
const modelsTxtLines = modelsTxt.split('\n');

const models = {};

let currentModel = null;

modelsTxtLines.forEach((l) => {
    if (l.includes(':')) {
        const modelName = l.replace(':', '');
        currentModel = modelName;
        models[currentModel] = [];
    } else if (l.includes('    ')) {
        const propName = l.replace('    ', '');
        models[currentModel].push({
            name: propName,
            prettyName: '',
            type: ''
        });
    } else {
        throw `Unparsable line:\n${l}`;
    }
});

const modelsStringified = JSON.stringify(models, null, 2);

fs.writeFileSync(path.join(__dirname, '../../data/models.json'), modelsStringified, 'utf8');