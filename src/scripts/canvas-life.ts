/**
 * Свет фона дрейфует, только пока посетитель что-то делает: листает, водит
 * мышью, касается, жмёт клавиши. Перестал — через 2,5 с свет замирает, и
 * страница не рисует ни одного кадра.
 *
 * ⚠ Раньше дрейф шёл бесконечно, и страница, на которую просто смотрят,
 * перерисовывалась 60 раз в секунду: под 13 стёклами блюр пересчитывался на
 * каждом кадре (замер 03.10: ~60 мс/с работы GPU-процесса на Mac M5, на слабом
 * телефоне кратно больше — батарея и нагрев). На паузе — 0 кадров и ~2 мс/с.
 * Дрейф медленный (26 с на ход), поэтому остановка и продолжение глазу
 * незаметны: пока читают, свет просто стоит.
 *
 * Без скрипта фон неподвижен; при `prefers-reduced-motion` анимации нет вовсе
 * (canvas.css). Класс — `canvas-live` на `<html>`.
 */
const root = document.documentElement;
const CALM_MS = 2500;
let timer = 0;
let last = -Infinity;

function wake(): void {
  const now = performance.now();
  // `pointermove` и `scroll` сыплют десятками в секунду — хватает отметки раз в 250 мс.
  if (now - last < 250) return;
  last = now;
  root.classList.add("canvas-live");
  clearTimeout(timer);
  timer = window.setTimeout(
    () => root.classList.remove("canvas-live"),
    CALM_MS,
  );
}

for (const type of [
  "scroll",
  "wheel",
  "pointermove",
  "pointerdown",
  "touchstart",
  "keydown",
]) {
  addEventListener(type, wake, { passive: true });
}
// Прибытие: свет успевает шевельнуться, пока страница появляется.
wake();

export {};
