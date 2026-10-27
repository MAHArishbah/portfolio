import pluginSecurity from 'eslint-plugin-security';

export default [
  // 1. Global ignores (MUST be in its own object with no other keys)
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'node_modules/**',
    ],
  },

  // 2. Security plugin recommended rules
  pluginSecurity.configs.recommended,

  // 3. Optional: Override noisy false-positive rules in your source code
  {
    rules: {
      // Un-comment the line below if normal array/object indexing (like arr[i]) 
      // in your React components still triggers warnings:
      // 'security/detect-object-injection': 'off',
    },
  },
];