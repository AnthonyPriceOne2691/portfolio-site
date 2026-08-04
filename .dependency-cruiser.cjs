/**
 * dependency-cruiser: направление зависимостей.
 * Запуск — только через scripts/lint/check_layers_gate.sh (CQG §3.6): голый
 * depcruise на пустой области выходит НУЛЁМ, и это зелёное на непроверенном.
 *
 * ⚠ Правила приведены к раскладке ЭТОГО проекта, а не скопированы из канона.
 * Шаблон канона говорит про src/{api,services,models} — у статического сайта на
 * Astro таких слоёв нет вовсе, и скопированный дословно контракт не совпал бы ни
 * с одним файлом, то есть был бы зелёным всегда. Это названный предел §3.6, и он
 * подтвердился здесь при первом же применении.
 *
 * Слои сайта: content (данные коллекций + схема) — ЛИСТ; pages (представление)
 * читает content, но не наоборот.
 */
module.exports = {
  forbidden: [
    {
      name: 'content-is-leaf',
      comment: 'контент и его схема не знают про страницы (§2.3: направление вниз)',
      severity: 'error',
      from: { path: '^src/content' },
      to: { path: '^src/pages' },
    },
    {
      name: 'no-circular',
      comment: 'цикл между модулями — направление потеряно',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-orphan-config',
      comment: 'модуль, на который никто не ссылается и который ничего не тянет',
      severity: 'warn',
      from: { orphan: true, pathNot: '\\.(config|d)\\.(ts|js|mjs|cjs)$' },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
    exclude: { path: '(\\.test\\.|\\.spec\\.|__tests__)' },
  },
};
