module.exports = {
  name: 'declaratie-app',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/declaratie-app',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
