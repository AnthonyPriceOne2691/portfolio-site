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
 *
 * ⚠ Объявлено в `scripts/lint/adapted.json` (обновление до cqg@2.20). До него
 * адаптация была НЕОБЪЯВЛЕННОЙ: `plan_update.py` останавливался на этом файле
 * «стоп — незадекларированная адаптация», а доктор о нём молчал вовсе, потому
 * что `CANON_CONFIGS` его не перечисляет. Адаптировано ТОЛЬКО `forbidden:`;
 * блок `options:` приведён к канонному (cqg@2.07/2.16, кандидаты tsconfig).
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
    // Канонная форма (`cqg@2.16`): путь резолвится от CWD, а гейт зовёт
    // depcruise из КОРНЯ репозитория — значит зашитый `tsconfig.json` верен
    // только когда фронт в корне. Здесь он в корне, и раньше зашитая строка
    // работала; но работала она по совпадению, а не по правилу. Кандидаты
    // разрешают и раскладку с фронтом в подкаталоге, и `LINT_TSCONFIG`.
    tsConfig: {
      fileName: process.env.LINT_TSCONFIG
        || ['tsconfig.depcruise.json',
            `${process.env.LINT_FE_DIR || 'frontend'}/tsconfig.json`,
            'tsconfig.json'].find((p) => require('fs').existsSync(p))
        || 'tsconfig.json',
    },
    tsPreCompilationDeps: true,
    exclude: { path: '(\\.test\\.|\\.spec\\.|__tests__)' },
  },
};
