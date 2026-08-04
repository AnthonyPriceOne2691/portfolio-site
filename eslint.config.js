// ESLint: парсер для TS. Пороги сложности сюда НЕ пишутся — их навязывает
// scripts/lint/check_complexity_gate.sh флагом --rule (CQG §3, cqg@1.66),
// чтобы правило нельзя было заглушить правкой этого файла.
import parser from '@typescript-eslint/parser';

export default [
  { ignores: ['node_modules/**', 'dist/**', '.astro/**'] },
  { files: ['**/*.ts', '**/*.mts', '**/*.js', '**/*.mjs'], languageOptions: { parser } },
];
