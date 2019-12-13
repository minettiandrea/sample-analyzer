const deepmerge = require('deepmerge')
const defaultPreset = require('@vue/cli-plugin-unit-jest/presets/typescript-and-babel/jest-preset')

module.exports = deepmerge(defaultPreset, {
  moduleFileExtensions: ['wav'],
  transform: {
    '.+\\.(wav|css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': require.resolve('jest-transform-stub')
  },
  verbose: false,
  'automock': false,
  'setupFiles': [
    './tests/setup-jest.ts'
  ]
})
