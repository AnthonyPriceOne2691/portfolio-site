// ESLint: парсеры. Пороги сложности сюда НЕ пишутся — их навязывает
// scripts/lint/check_complexity_gate.sh флагом --rule (CQG §3, cqg@1.66),
// чтобы правило нельзя было заглушить правкой этого файла.
//
// ⚠ Блок для `.astro` добавлен 07.08 и закрывает долг прошлой поставки: весь
// код проекта живёт в `.astro`, и до этого его не судил ни линтер, ни
// форматтер — гейт сложности честно печатал «просмотрено 1 файл», потому что
// единственным предметом был `content.config.ts`.
import parser from '@typescript-eslint/parser';
import astro from 'eslint-plugin-astro';

export default [
  { ignores: ['node_modules/**', 'dist/**', '.astro/**'] },
  { files: ['**/*.ts', '**/*.mts', '**/*.js', '**/*.mjs'], languageOptions: { parser } },
  ...astro.configs.recommended,
];
