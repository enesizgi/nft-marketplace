module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['plugin:react/recommended', 'airbnb', 'prettier'],
  overrides: [
    {
      files: ['src/frontend/*.js', 'index.js'],
    },
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    babelOptions: {
      presets: ['@babel/preset-react'],
    },
  },
  plugins: ['react'],
  rules: {
    'comma-dangle': 0,
    'react/jsx-filename-extension': 0,
    'react/function-component-definition': 0,
    'arrow-parens': 0,
    'import/no-extraneous-dependencies': ['error', { packageDir: '.' }],
    'max-len': ['error', { code: 150, comments: 150 }],
    'class-methods-use-this': 0,
    'react/prop-types': 0
  },
};
