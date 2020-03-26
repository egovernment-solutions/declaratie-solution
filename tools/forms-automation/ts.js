const fs = require('fs');
const path = require('path');

const getFieldSrc = (field) => {
    return `      ${field.name}: new FormControl(''),`;
}

const getModelSrc = (model, modelName) => {
    return `
    this.${modelName}Form = new FormGroup({
${model.map(getFieldSrc).join('\n')}
    });`;
}

const getSrc = (models) => {
    const modelNames = Object.keys(models);
    const modelsSrc = [];

    modelNames.map((modelName) => {
        const model = models[modelName];
        const modelSrc = getModelSrc(model, modelName);
        modelsSrc.push(modelSrc);
    });

    return modelsSrc.join('\n\n');
}

const run = (models, integrate) => {
    const src = getSrc(models);

    const tsFilePath = path.join(__dirname, '../../apps/declaratie-app/src/app/app.component.ts');
    const tsFile = fs.readFileSync(tsFilePath, 'utf8');

    const startToken = '// START AUTOMATION TOKEN';
    const endToken = '// END AUTOMATION TOKEN';

    const bodyStartPos = tsFile.indexOf(startToken) + startToken.length;
    const bodyEndPos = tsFile.indexOf(endToken);

    const bodyContent = tsFile.substring(bodyStartPos, bodyEndPos);
    const newBodyContent = tsFile.replace(bodyContent, src);

    if (integrate) {
        // integrate changes
        fs.writeFileSync(tsFilePath, newBodyContent, 'utf8');
        console.log(`Integrated changes into ${tsFilePath}`);
    } else {
        console.log(bodyContent);
        console.log(`Not integrating changes ${tsFilePath}`);
    }
}

module.exports = run;