/**
 * Поведение карточки проекта: аккордеон, переход по якорю, плеер демо.
 *
 * Вынесено из `ProjectCard.astro` при сплите по лимиту длины файла (500 строк).
 * Шов выбран не по размеру, а по смыслу: в компоненте остались разметка и
 * стили, здесь — вся логика. Разметка и логика связаны одним контрактом:
 * `details.card`, `.panel`, `video.demo`, `[data-hover-play]` и атрибут
 * `data-demoPlaying`, который читает `VideoFrame`.
 */
/*
 * Плавное раскрытие. `<details>` сам по себе открывается РЫВКОМ и, что важнее,
 * закрыть себя с анимацией не может вовсе: браузер прячет содержимое сразу,
 * анимировать уже нечего. Поэтому порядок здесь обратный привычному —
 * сначала ставим `open`, чтобы панель получила высоту, и только потом
 * анимируем её; на закрытии `open` снимается ПОСЛЕ анимации.
 */
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const OPEN = { duration: 420, easing: "cubic-bezier(0.22, 0.61, 0.36, 1)" };
const SHUT = { duration: 320, easing: "cubic-bezier(0.4, 0, 0.68, 0.06)" };

/** Нижняя кромка липкой шапки: под неё верх карточки уезжать не должен. */
const stickyBottom = () =>
  document.querySelector("header.nav")?.getBoundingClientRect().bottom ?? 0;

/**
 * Закрывает соседей так, чтобы раскрываемая карточка НЕ СДВИНУЛАСЬ.
 *
 * ⚠ Сосед, схлопывающийся ВЫШЕ цели, тянет за собой всю страницу под ним:
 * палец стоит на месте, а под пальцем оказывается уже середина карточки
 * (замерено на телефоне: 768 px при экране 844). Компенсировать это движение
 * покадрово — первое, что приходит в голову, и так здесь и было сделано.
 * Владелец сразу нашёл, чем это плохо: карточка-то стоит, но ВСЁ ОСТАЛЬНОЕ
 * пролетает мимо те же 768 px за 320 мс, и читается это как многократное
 * пролистывание. Плавность, которую никто не просил, оказалась дороже сдвига,
 * который она чинила.
 *
 * Поэтому соседи сверху закрываются МГНОВЕННО, вместе с переходами (класс
 * `instant` живёт один кадр — тот же приём, что и в переходе по якорю ниже:
 * там цепочка переходов растягивалась на ~750 мс и цель уползала из-под
 * прокрутки). Layout становится финальным в том же кадре, одна поправка
 * прокрутки возвращает карточку ровно туда, где её нажали, — и НИЧЕГО не
 * движется: ни цель, ни фон.
 *
 * Соседи снизу закрываются плавно, как и раньше: на положение цели они не
 * влияют, и отнимать у них анимацию не за что.
 */
function collapseOthers(target: HTMLElement, rest: Controller[]): void {
  const anchor = Math.max(target.getBoundingClientRect().top, stickyBottom());
  const frozen: HTMLElement[] = [];

  for (const c of rest) {
    if (!c.card.open) continue;
    if (c.card.getBoundingClientRect().top < anchor) {
      c.stop();
      c.card.classList.add("instant");
      c.card.open = false;
      frozen.push(c.card);
    } else {
      c.close();
    }
  }

  // Поправка ОДНА и в том же кадре: страница не едет, она уже на месте.
  const drift = target.getBoundingClientRect().top - anchor;
  if (Math.abs(drift) >= 0.5) window.scrollBy(0, drift);

  // Класс снимаем следующим кадром: новые значения уже применены, переходить
  // не с чего — зато обычные клики по этим карточкам снова поедут плавно.
  if (frozen.length > 0) {
    requestAnimationFrame(() => {
      for (const el of frozen) el.classList.remove("instant");
    });
  }
}

type Controller = {
  card: HTMLDetailsElement;
  open: () => void;
  close: () => void;
  stop: () => void;
};
const controllers: Controller[] = [];

for (const card of document.querySelectorAll<HTMLDetailsElement>(
  "details.card",
)) {
  const summary = card.querySelector("summary");
  const panel = card.querySelector<HTMLElement>(".panel");
  if (!summary || !panel) continue;

  // ⚠ Нативную эксклюзивность здесь СНИМАЕМ, хотя она и нужна в разметке.
  // Браузер закрывает соседа мгновенно и ровно в тот момент, когда мы только
  // собрались его анимировать: соседняя карточка схлопывалась бы рывком, а
  // открывшаяся ехала плавно. Раз JS есть — пусть обе двери двигаются
  // одинаково, а `name` остаётся страховкой для случая без JS.
  card.removeAttribute("name");

  let anim: Animation | null = null;
  let closing = false;

  const close = () => {
    if (!card.open || closing) return;
    closing = true;
    anim?.cancel();
    anim = panel.animate(
      [
        { height: `${panel.scrollHeight}px`, opacity: 1 },
        { height: "0px", opacity: 0 },
      ],
      SHUT,
    );
    anim.onfinish = () => {
      card.open = false;
      closing = false;
      anim = null;
    };
  };

  /** Обрывает движение и отдаёт карточку под ручное управление. */
  const stop = () => {
    anim?.cancel();
    anim = null;
    closing = false;
  };

  const open = () => {
    closing = false;
    anim?.cancel();
    card.open = true;
    anim = panel.animate(
      [
        { height: "0px", opacity: 0 },
        { height: `${panel.scrollHeight}px`, opacity: 1 },
      ],
      OPEN,
    );
    anim.onfinish = () => {
      anim = null;
    };
  };

  const others = () => controllers.filter((c) => c.card !== card);

  summary.addEventListener("click", (event) => {
    // Нативное переключение перехватываем: оно мгновенное и произошло бы
    // до того, как мы успеем измерить высоту.
    event.preventDefault();

    if (reduced) {
      const next = !card.open;
      if (next) collapseOthers(card, others());
      else for (const c of others()) c.card.open = false;
      card.open = next;
      return;
    }

    // ⚠ Состояние читается ДО отмены анимации. Пока идёт закрытие, `open`
    // ещё true, и наивная проверка `card.open` увела бы повторный клик
    // в закрытие второй раз — карточка не открывалась бы обратно.
    if (card.open && !closing) {
      close();
      return;
    }

    // Раскрылась одна — остальные уезжают. Закрываем ПЕРЕД открытием: те, что
    // ниже, идут вверх, пока эта идёт вниз, и два движения навстречу читаются
    // как одно. Те, что выше, схлопываются мгновенно — см. `collapseOthers`.
    collapseOthers(card, others());
    open();
  });

  /*
   * Демо и тизер не играют одновременно.
   *
   * Тизер живёт в шапке карточки и при раскрытии остаётся на экране рядом с
   * плеером. Два видео разом — это и лишний расход, и мельтешение сбоку от
   * того, что человек смотрит.
   *
   * ⚠ Флаг ставится АТРИБУТОМ, а не прямым `teaser.pause()`. Пауза сразу же
   * снималась бы: тизер заводится от наведения, а курсор во время просмотра
   * по карточке ходит. Атрибут читает `VideoFrame` и не запускает тизер,
   * пока демо идёт.
   */
  const demoPlayer = card.querySelector<HTMLVideoElement>("video.demo");
  if (demoPlayer) {
    const teaser = card.querySelector<HTMLVideoElement>(
      "video[data-hover-play]",
    );
    const busy = (on: boolean) => {
      if (!on) {
        delete card.dataset.demoPlaying;
        return;
      }
      card.dataset.demoPlaying = "1";
      // ⚠ Нужны ОБА действия. Атрибут не даёт тизеру запуститься снова, но
      // сам по себе не останавливает уже идущий — а к моменту старта демо он
      // почти всегда уже играет: карточку раскрывали курсором. Одного флага
      // не хватало, проверено.
      teaser?.pause();
    };
    demoPlayer.addEventListener("play", () => busy(true));
    demoPlayer.addEventListener("pause", () => busy(false));
    demoPlayer.addEventListener("ended", () => busy(false));
    // Свернули карточку — звук не должен доноситься из закрытого блока.
    card.addEventListener("toggle", () => {
      if (!card.open) demoPlayer.pause();
    });
  }

  controllers.push({ card, open, close, stop });
}

/*
 * Переход по якорю из меню.
 *
 * Отдельной страницы у проекта больше нет, поэтому пункт меню ведёт на
 * `/#slug` и ОБЯЗАН раскрыть карточку. Доскроллить до свёрнутой строки
 * недостаточно: клик по «LinkBuilder» выглядел бы как промах — страница
 * дёрнулась, а показать ничего не показала.
 *
 * ⚠ Здесь состояние ставится МГНОВЕННО, с выключенными на один кадр
 * переходами, и это выстраданное решение. Анимированный путь порождал гонку:
 * пока соседняя карточка схлопывается, всё под ней едет вверх — уже ПОСЛЕ
 * того, как мы прокрутили, и цель уползала под липкую шапку (замерено: 386 px).
 * Переходы тут идут ЦЕПОЧКОЙ — сначала 0.32s панели, затем, по снятии
 * `[open]`, ещё 0.42s возврата карточки из-за полей (до 26.09 в цепочке была
 * и ширина фрейма — см. `ProjectCard`). Ждать их все — это ~750 мс
 * неподвижности перед прокруткой, то есть «сайт завис». Выключить переходы
 * дешевле и честнее: раскладка становится финальной сразу, прокрутка попадает
 * точно, а самой анимации всё равно никто не увидел бы — страница в этот
 * момент едет.
 *
 * `scroll-margin-top` от той гонки не спасал: он про КОНЕЧНОЕ положение, а
 * промахивались мы по исходному.
 */
const revealFromHash = () => {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id) return;
  const target = controllers.find((c) => c.card.id === id);
  if (!target) return;

  for (const c of controllers) {
    c.stop();
    c.card.classList.add("instant");
    c.card.open = c.card === target.card;
  }

  /*
   * ⚠ Прокрутка МГНОВЕННАЯ, хотя плавная просилась сама.
   *
   * По клику на якорь браузер прыгает к элементу САМ, ещё до нашего
   * обработчика. Плавный доезд поверх этого читается как рывок с последующим
   * сползанием: карточка сперва оказывается не там, замирает на треть
   * секунды, и только потом доходит до места (замерено: -77 → пауза ~350 мс →
   * 72). Мгновенная прокрутка сливается с нативным прыжком в одно движение —
   * и это ровно то, как ведут себя обычные якорные ссылки.
   */
  target.card.scrollIntoView({ block: "start", behavior: "auto" });

  // Класс снимаем следующим кадром: к этому моменту новые значения уже
  // применены, и переходить будет не с чего — зато обычные клики по
  // карточкам снова поедут плавно.
  requestAnimationFrame(() => {
    for (const c of controllers) c.card.classList.remove("instant");
  });
};

revealFromHash();
// Пункт меню нажали, уже находясь на главной: адрес меняется, страница — нет.
window.addEventListener("hashchange", revealFromHash);
