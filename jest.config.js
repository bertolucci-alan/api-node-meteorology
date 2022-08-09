// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const path = require('path');
// eslint-disable-next-line no-undef
const root = path.resolve(__dirname);
// eslint-disable-next-line no-undef
module.exports = {
    rootDir: root,
    displayName: 'root-tests',
    testMatch: ['<rootDir>/src/**/*.test.ts'],
    testEnvironment: 'node',
    clearMocks: true,
    preset: 'ts-jest',
    moduleNameMapper: {
        '@src/(.*)/': '<rootDir>/src/$1',
        '@test/(.*)/': '<rootDir>/test/$1'
    }
}
