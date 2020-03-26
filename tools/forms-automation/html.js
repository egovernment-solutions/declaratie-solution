const fs = require('fs');
const path = require('path');

// startView="year" [startAt]="startDate"

const maybeGetAttr = (field, attrName, bound, customSyntax) => {
    if (!field[attrName]) {
        return '';
    }

    let htmlAttr = attrName;
    if (bound) {
        htmlAttr = `[${attrName}]`;
    }

    if (customSyntax) {
        return ` ${customSyntax.replace('<%= field[attrName] %>', field[attrName])}`;
    }

    return ` ${htmlAttr}="${field[attrName]}"`;
}

const getSelectOptionsSrc = (field) => {
    if (typeof field.options === 'undefined') {
        throw new Error('field.options is undefined for ' + field.name + '. ' + JSON.stringify(field));
    }

    return field.options.map((o) => `          <mat-option value="${o.value}">${o.name}</mat-option>`)
}

const getFieldSrc = (field) => {
    const controlMapFn = {
        'string': (field) => `      <mat-form-field appearance="fill"${maybeGetAttr(field, 'hidden', true, `[ngClass]="{'hidden-ctrl': <%= field[attrName] %>}"`)}>
        <mat-label>${field.prettyName}</mat-label>
        <input matInput type="text" formControlName="${field.name}" name="${field.name}" />
      </mat-form-field>`,
        'select': (field) => `      <mat-form-field appearance="fill"${maybeGetAttr(field, 'hidden', true, `[ngClass]="{'hidden-ctrl': <%= field[attrName] %>}"`)}>
        <mat-label>${field.prettyName}</mat-label>
        <mat-select formControlName="${field.name}" name="${field.name}">
${getSelectOptionsSrc(field).join('\n')}
        </mat-select>
      </mat-form-field>`,
      'datepicker': (field) => `      <mat-form-field appearance="fill"${maybeGetAttr(field, 'hidden', true, `[ngClass]="{'hidden-ctrl': <%= field[attrName] %>}"`)}>
        <mat-label>${field.prettyName}</mat-label>
        <input matInput [matDatepicker]="${field.name}Datepicker" formControlName="${field.name}" name="${field.name}" (click)="${field.name}Datepicker.open()"${maybeGetAttr(field, 'max', true)}${maybeGetAttr(field, 'min', true)}>
        <mat-datepicker-toggle matSuffix [for]="${field.name}Datepicker"></mat-datepicker-toggle>
        <mat-datepicker #${field.name}Datepicker${maybeGetAttr(field, 'startView', false)}${maybeGetAttr(field, 'startAt', true)}></mat-datepicker>
      </mat-form-field>`,
      'default': () => { throw new Error('No control found for field type: ' + field.type + '. ' + JSON.stringify(field)) }
    }

    return (controlMapFn[field.type] || controlMapFn.default)(field);
}

const getModelSrc = (model) => {
    return model.map(getFieldSrc).join('\n');
}

const getSrc = (models, integrate) => {
    const modelNames = Object.keys(models);
    const formsSrc = [];

    modelNames.map((modelName) => {
        const model = models[modelName];
        const modelSrc = getModelSrc(model);

        const formSrc = `
    <form [formGroup]="${modelName}Form" *ngIf="requestedDocument === '${modelName}'">
${modelSrc}
    </form>`;

        formsSrc.push(formSrc);
    });

    return formsSrc.join('\n');
}

const run = (models, integrate) => {
    const src = getSrc(models);

    const htmlFilePath = path.join(__dirname, '../../apps/declaratie-app/src/app/app.component.html');
    const htmlFile = fs.readFileSync(htmlFilePath, 'utf8');

    const startToken = '<!-- START AUTOMATION TOKEN -->';
    const endToken = '<!-- END AUTOMATION TOKEN -->';

    const bodyStartPos = htmlFile.indexOf(startToken) + startToken.length;
    const bodyEndPos = htmlFile.indexOf(endToken);

    const bodyContent = htmlFile.substring(bodyStartPos, bodyEndPos);
    const newBodyContent = htmlFile.replace(bodyContent, src);

    if (integrate) {
        // integrate changes
        fs.writeFileSync(htmlFilePath, newBodyContent, 'utf8');
        console.log(`Integrated changes into ${htmlFilePath}`);
    } else {
        console.log(bodyContent);
        console.log(`Not integrating changes into ${htmlFilePath}`);
    }
}

module.exports = run;