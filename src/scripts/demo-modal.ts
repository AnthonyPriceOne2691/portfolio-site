/**
 * Демо проекта — в модалке поверх страницы, а не плеером в раскрытой карточке.
 *
 * Решение владельца 2026-10-02: «не превращать карточку в простыню». Ролик
 * открывается кликом по фрейму РАСКРЫТОЙ карточки (свёрнутую клик по фрейму
 * раскрывает, как и раньше) или по «Watch demo»; закрывается крестиком, кликом
 * мимо ролика, Esc и кнопкой «Назад». Закрыли — на экране та же раскрытая карточка.
 *
 * ⚠ Адрес несёт `?demo=<slug>#<slug>`, а секунду ролика хранит sessionStorage:
 * перезагрузка во время просмотра НЕ закрывает ролик (требование владельца) и
 * возвращает его на ту же секунду. Хэш раскрывает карточку под модалкой силами
 * `card-accordion`.
 *
 * Контракт разметки: `dialog[data-demo-modal]` (`DemoModal`), `template#demo-<slug>`
 * с `<video>` и дорожками субтитров (`ProjectCard`), `[data-demo-open]` на фрейме
 * (`VideoFrame`), ссылка `a[data-proof="video"]` (`ProofLinks`) и флаг
 * `data-demo-playing` на карточке — по нему `VideoFrame` не заводит тизер, пока
 * идёт ролик.
 */
const PARAM = "demo";
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const dialog = document.querySelector<HTMLDialogElement>(
  "dialog[data-demo-modal]",
);
const stage = dialog?.querySelector<HTMLElement>("[data-demo-stage]");

type Shown = {
  id: string;
  video: HTMLVideoElement;
  card: HTMLDetailsElement | null;
};
let current: Shown | null = null;
let scrollBefore = 0;
/** Шаг истории, добавленный ЭТИМ документом: после перезагрузки он чужой. */
let pushed: string | null = null;

/** sessionStorage бросает в приватном режиме и при запрете хранилища — секунда не критична. */
function remember(id: string, seconds: number | null): void {
  try {
    if (seconds === null) sessionStorage.removeItem(`demo-t:${id}`);
    else sessionStorage.setItem(`demo-t:${id}`, seconds.toFixed(1));
  } catch {
    /* без хранилища ролик просто начнётся сначала */
  }
}
function recall(id: string): number {
  try {
    return Number(sessionStorage.getItem(`demo-t:${id}`)) || 0;
  } catch {
    return 0;
  }
}

function addressFor(id: string | null): string {
  const u = new URL(location.href);
  if (id) {
    u.searchParams.set(PARAM, id);
    u.hash = id;
  } else u.searchParams.delete(PARAM);
  return `${u.pathname}${u.search}${u.hash}`;
}

/**
 * ⚠ Пауза НЕ останавливает загрузку: браузер докачивает буфер, а то и весь
 * файл. Обрывает её только снятый источник — `load()` без `src` сбрасывает
 * элемент и отменяет запрос (алгоритм загрузки медиа в HTML).
 */
function unload(v: HTMLVideoElement): void {
  v.pause();
  v.removeAttribute("src");
  v.load();
}

/** Тизер в шапке карточки молчит, пока идёт ролик, и оживает после. */
function quietTeaser(card: HTMLDetailsElement | null, on: boolean): void {
  if (!card) return;
  const teaser = card.querySelector<HTMLVideoElement>("video[data-hover-play]");
  if (on) {
    card.dataset.demoPlaying = "1";
    // Тизер не только молчит, но и не качается: на медленной сети он делил
    // канал с роликом, и тот стартовал на 0,6 с позже (замер 03.10).
    if (teaser) unload(teaser);
    return;
  }
  delete card.dataset.demoPlaying;
  if (!teaser || !card.open || reduced) return;
  if (!teaser.src && teaser.dataset.src) teaser.src = teaser.dataset.src;
  void teaser.play().catch(() => {});
}

/**
 * ⚠ Дорожка с `default` включается ЯВНО. Chrome атрибут соблюдает, а Safari в режиме
 * субтитров «Автоматически» его пропускает, если язык системы совпадает с языком звука:
 * у англоязычного посетителя ролик шёл без строк (проверка прода 03.10; у владельца с
 * русской системой строки были). Решение владельца — английские видны сразу. Второй раз —
 * после метаданных: тогда Safari делает свой выбор; дальше выбор в меню плеера за зрителем.
 */
function showDefaultCaptions(video: HTMLVideoElement): void {
  const pick = () => {
    const tracks = [...video.querySelectorAll("track")];
    tracks.forEach(
      (el) => (el.track.mode = el.default ? "showing" : "disabled"),
    );
  };
  pick();
  video.addEventListener("loadedmetadata", pick, { once: true });
}

/**
 * Ролик карточки из её шаблона — при каждом открытии заново: закрытие плеер
 * выгружает (см. обработчик `close`). Секунду хранит sessionStorage, поэтому
 * повторное открытие продолжает с неё.
 */
function mount(id: string): Shown | null {
  const tpl = document.getElementById(`demo-${id}`);
  if (!stage || !(tpl instanceof HTMLTemplateElement)) return null;
  stage.replaceChildren(tpl.content.cloneNode(true));
  const video = stage.querySelector("video");
  if (!video) return null;
  showDefaultCaptions(video);
  // До загрузки метаданных `currentTime` задаёт позицию старта — так и нужно.
  const from = recall(id);
  if (from > 0) video.currentTime = from;
  let saved = from;
  video.addEventListener("timeupdate", () => {
    // Выгруженный при закрытии плеер сообщает «0 с» — это не просмотр.
    if (!video.isConnected) return;
    if (Math.abs(video.currentTime - saved) < 1) return;
    saved = video.currentTime;
    remember(id, saved);
  });
  video.addEventListener("ended", () => remember(id, null));
  const card = document.getElementById(id);
  return { id, video, card: card instanceof HTMLDetailsElement ? card : null };
}

/** `focusVisible` есть в стандарте HTML (WebKit, Firefox), но ещё не в типах TypeScript. */
const QUIET: FocusOptions & { focusVisible: boolean } = {
  preventScroll: true,
  focusVisible: false,
};

/**
 * ⚠ Фокус, который переносит САМ браузер — `showModal()` ставит его на крестик,
 * `close()` возвращает туда, откуда открывали, — рисует клавиатурное кольцо,
 * только если оно было и ДО переноса. Так велит эвристика `:focus-visible` для
 * переноса фокуса скриптом (CSS Selectors 4), и так делает Chromium. WebKit
 * (Safari и любой браузер на iOS) считает такой перенос видимым всегда: после
 * касания кольцо вставало на крестик, а после закрытия обводило всю шапку
 * раскрытой карточки — «рамка» со скриншота владельца с iPhone, 03.10.
 *
 * Фокус при этом остаётся, где его поставил браузер: для скринридера это и есть
 * «вернулись к карточке». Повторный `focus()` на элементе в фокусе WebKit
 * пропускает — поэтому сначала `blur()`. Esc — клавиатура: его закрытие идёт
 * мимо этой функции, и кольцо после него законно. Сторож — `tests/touch.test.mjs`.
 */
function moveFocusAsBefore(move: () => void): void {
  const before = document.activeElement;
  const ringBefore = before?.matches(":focus-visible") ?? false;
  move();
  const now = document.activeElement;
  if (ringBefore || !(now instanceof HTMLElement)) return;
  if (!now.matches(":focus-visible")) return;
  now.blur();
  now.focus(QUIET);
}

/** Закрытие крестиком, кликом мимо ролика и «Назад»; Esc закрывает сам браузер. */
function shut(): void {
  if (dialog?.open) moveFocusAsBefore(() => dialog.close());
}

/** Обычный клик: с модификатором посетитель открывает ссылку в новой вкладке — это его право. */
function plainClick(e: MouseEvent): boolean {
  return e.button === 0 && !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey);
}

/** Ролик с фрейма — только у РАСКРЫТОЙ карточки: свёрнутую клик по фрейму раскрывает. */
function frameDemo(el: Element | null): string | null {
  const frame = el?.closest<HTMLElement>("[data-demo-open]");
  const id = frame?.dataset.demoOpen;
  return id && frame?.closest("details")?.open ? id : null;
}

/** Ролик со ссылки «Watch demo» — если у карточки есть свой ролик для модалки. */
function linkDemo(el: Element | null): string | null {
  const card = el?.closest('a[data-proof="video"]')?.closest("details.card");
  return card && document.getElementById(`demo-${card.id}`) ? card.id : null;
}

function open(id: string, push: boolean): boolean {
  if (!dialog) return false;
  if (dialog.open) return true;
  const shown = mount(id);
  if (!shown) return false;
  current = shown;
  // Под модалкой — раскрытая карточка, с которой ролик и запускали.
  if (shown.card && !shown.card.open) shown.card.open = true;
  quietTeaser(shown.card, true);
  scrollBefore = window.scrollY;
  document.documentElement.classList.add("demo-open");
  moveFocusAsBefore(() => dialog.showModal());
  if (push) {
    history.pushState({ demo: id }, "", addressFor(id));
    pushed = id;
  }
  // Клик — жест пользователя, ролик стартует со звуком. После перезагрузки жеста
  // нет, и браузер может отказать: тогда ролик ждёт на своей секунде кнопки play.
  void shown.video.play().catch(() => {});
  return true;
}

if (dialog) {
  dialog.addEventListener("close", () => {
    if (!current) return;
    const { id, video, card } = current;
    video.pause();
    if (!video.ended) remember(id, video.currentTime);
    // Закрытый ролик больше не качается: на медленной сети он докачивал все
    // 6,4 МБ (замер 03.10). Следующее открытие соберёт плеер заново.
    unload(video);
    stage?.replaceChildren();
    current = null;
    document.documentElement.classList.remove("demo-open");
    // iOS прокручивает страницу и под модалкой — возвращаем туда, где открывали.
    if (Math.abs(window.scrollY - scrollBefore) > 1)
      window.scrollTo(0, scrollBefore);
    quietTeaser(card, false);
    // Открывали своим шагом истории — снимаем его, и «Вперёд» вернёт ролик.
    // ⚠ Только если шаг добавлен ЭТИМ документом: после перезагрузки шаг назад
    // ведёт в прежний документ, и `back()` перезагрузил бы страницу. Тогда, как
    // и при входе по ссылке с `?demo=`, адрес просто чистится.
    const own = pushed === id && history.state?.demo === id;
    pushed = null;
    if (own) history.back();
    else if (new URL(location.href).searchParams.has(PARAM))
      history.replaceState(null, "", addressFor(null));
  });

  /*
   * ⚠ Клик по затемнению приходит в сам `<dialog>`, ролик и крестик — его дети.
   * Но закрываем, только если и НАЖАЛИ на затемнении: протянули ползунок плеера
   * за край ролика и отпустили — клик достаётся общему предку, то есть диалогу,
   * и без этой проверки перемотка закрывала бы ролик.
   */
  let pressedOutside = false;
  dialog.addEventListener("pointerdown", (e) => {
    pressedOutside = e.target === dialog;
  });
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog && pressedOutside) shut();
  });
  dialog.querySelector("[data-demo-close]")?.addEventListener("click", shut);

  /*
   * Запуск. Слушатель — на документе и в фазе ПЕРЕХВАТА: фрейм живёт внутри
   * `<summary>`, и клик по нему в раскрытой карточке иначе свернул бы её —
   * обработчик аккордеона висит на самом `summary` и до перехвата не доходит.
   */
  document.addEventListener(
    "click",
    (e) => {
      if (!plainClick(e)) return;
      const el = e.target instanceof Element ? e.target : null;
      const fromFrame = frameDemo(el);
      if (fromFrame) {
        e.preventDefault();
        e.stopPropagation();
        open(fromFrame, true);
        return;
      }
      const fromLink = linkDemo(el);
      if (fromLink) {
        e.preventDefault();
        open(fromLink, true);
      }
    },
    true,
  );

  // «Назад» закрывает ролик, «Вперёд» открывает снова.
  window.addEventListener("popstate", () => {
    const id = new URL(location.href).searchParams.get(PARAM);
    if (!id && dialog.open) shut();
    else if (id && !dialog.open) open(id, false);
  });

  // Перезагрузка во время просмотра — ролик остаётся открытым.
  const initial = new URL(location.href).searchParams.get(PARAM);
  if (initial) open(initial, false);
}

// Модуль, а не глобальный скрипт: свои `reduced`, `dialog` не сталкиваются с
// одноимёнными в card-accordion.ts.
export {};
