module.exports = {
  env: {
    node: true,
    es2021: true
  },
  extends: ['airbnb', 'prettier'],
  parserOptions: {
    requireConfigFile: false
  },
  ignorePatterns: ['scripts/deploy.js'],
  rules: {
    'import/no-extraneous-dependencies': 0,
    'no-console': 0,
    'import/extensions': 0
  }
};
