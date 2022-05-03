// @ts-check

// TODO Rename to eslint.config.js when supported: https://github.com/eslint/eslint/issues/11844

/** @type {import('eslint').Linter.Config} */
const config = {
  parser: '@typescript-eslint/parser',
  parserOptions: {},
  extends: [
    // /!\ Order matters: the next one overrides rules from the previous one
    'plugin:unicorn/recommended',
    'plugin:jest/recommended',
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  plugins: ['simple-import-sort'],
  env: {},

  rules: {
    'no-console': ['error', { allow: ['info', 'error'] }],
    'no-underscore-dangle': 'off',
    'spaced-comment': 'off',
    camelcase: 'off',

    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',
    'import/extensions': 'off',

    'simple-import-sort/imports': [
      'error',
      {
        // https://github.com/lydell/eslint-plugin-simple-import-sort/blob/v7.0.0/src/imports.js#L5
        groups: [
          // Side effect imports
          ['^\\u0000'],

          // Packages
          // Things that start with a letter (or digit or underscore), or `@` followed by a letter
          ['^@?\\w'],

          // Absolute imports and other imports such as Vue-style `@/foo`
          // Anything not matched in another group
          ['^'],

          // Relative imports
          [
            // https://github.com/lydell/eslint-plugin-simple-import-sort/issues/15

            // ../whatever/
            '^\\.\\./(?=.*/)',
            // ../
            '^\\.\\./',
            // ./whatever/
            '^\\./(?=.*/)',
            // Anything that starts with a dot
            '^\\.',
            // .html are not side effect imports
            '^.+\\.html$',
            // .scss/.css are not side effect imports
            '^.+\\.s?css$'
          ]
        ]
      }
    ],
    'simple-import-sort/exports': 'error',

    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/class-name-casing': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    'unicorn/filename-case': 'off',
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/catch-error-name': 'off',
    // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v27.0.0/docs/rules/no-array-for-each.md
    // https://github.com/github/eslint-plugin-github/blob/v4.1.1/docs/rules/array-foreach.md
    // conflicts with
    // https://github.com/airbnb/javascript/issues/1271
    'unicorn/no-array-for-each': 'off',
    // FIXME Activate when ES modules are well supported
    'unicorn/prefer-module': 'off',
    // FIXME Activate when ES modules are well supported
    'unicorn/prefer-node-protocol': 'off',

    'jest/no-restricted-matchers': 'error'
  }
};

module.exports = config;
