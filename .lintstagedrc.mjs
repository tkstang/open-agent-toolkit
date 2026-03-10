export default {
  // TypeScript/JavaScript files: lint with oxlint, format with oxfmt
  '*.{ts,tsx,js,jsx}': ['oxlint --fix', 'oxfmt'],

  // JSON files: format with oxfmt
  '*.json': ['oxfmt'],

  // Markdown files: format with oxfmt
  '*.md': ['oxfmt'],
};
