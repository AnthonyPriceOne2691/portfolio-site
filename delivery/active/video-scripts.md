# Сценарии демо-видео

Пять роликов, по одному на карточку, **по 2 минуты**, 720p. Плюс шестой, особый:
короткий кружок о себе в герое главной (§0). Требования к файлам — в
[content-guide.md](content-guide.md).

## Как читать этот документ

**Русские строки жирным — вам.** Что открыть, куда вести курсор, что должно быть
в кадре. Их никто не слышит.

> Блоки цитатой — закадровый голос, **по-английски**. Его слышит зритель.

Русской озвучки не будет ни в одной версии: сайт одноязычный, `proof.video` у
проекта один. Русский здесь — только язык режиссёрских указаний.

Таймкоды посчитаны из длины текста при **130 словах в минуту** — это спокойная
речь, не скороговорка. У каждого ролика есть таблица «Цифры ролика»: каждое
число, которое звучит, и откуда оно взято. Числа, которого нет в таблице, в
голосе нет.

## Общее для всех: обзор, а не один кадр

Ролик — экскурсия по продукту за две минуты. Зритель должен унести три вещи:
**что это и для кого**, **насколько оно большое и взрослое**, **где в нём
инженерная глубина**. Одним эффектным кадром этого не сказать. Нужен маршрут по
экранам и голос, который по ходу объясняет, на что смотреть.

**Скелет у всех пяти одинаковый:**

1. **Крючок, 10–15 с.** Что это, одной фразой, поверх работающего экрана. Не
   «привет, меня зовут».
2. **Масштаб, 20–30 с.** Быстрый проход по разделам: сколько всего система
   умеет.
3. **Глубина, 30–40 с.** Два-три экрана, где видно инженерное решение, а не
   форму.
4. **Отказ, 15–20 с.** Ключевой кадр: система чего-то _не_ делает — и это
   правильно. Кружок о себе обещает зрителю именно его: «watch for the moment
   the system says no».
5. **Цифры, последние 10–15 с.** Тесты, объём, замеры — то, что держит всё
   показанное.

**Голос звучит почти всё время.** Две минуты — это 230–260 слов. Пауз в ролике
две, и обе названы в раскадровке: 2 секунды тишины на ключевом кадре (дать
прочитать экран) и места, где говорит сама система (голос Генри в тренере).
Ожидание — загрузка, «думает», прогон агента — не заполняется молчанием, а
вырезается или ускоряется на монтаже.

**Говорите о том, что на экране.** Каждая реплика привязана к кадру: фраза про
мониторинг звучит, когда на экране мониторинг. Фраза без кадра — радиопередача.

**Тон — инженер показывает свою систему коллеге.** От первого лица, спокойно,
без «революционный», «мощный», «инновационный». Реплики написаны разговорно, с
сокращениями (it's, doesn't): так звучит живая речь. Споткнулись на сокращении —
говорите полную форму, смысл не меняется. Числа записаны так, как
произносятся, — читайте их глазами как текст.

Термины читаются так: LLM — «эл-эл-эм», BM25 — «би-эм твенти-файв», nDCG —
«эн-ди-си-джи», dofollow — «ду-фоллоу», RAG — «рэг».

**Цифры и формулировки контрактов — слово в слово.** Остальное можно своими
словами. Ошибка в цифре на витрине инженера стоит дороже любой оговорки.

**Демо-данные — это демо.** В CRM все сайты и люди выдуманы, и ролик говорит это
вслух в первые 15 секунд. Числа с экрана демо-базы не выдаются за продовые:
продовые звучат только из таблицы «Цифры ролика».

**Русский текст на экране не прячем.** Свод правил в RAG и вывод гейтов в контуре
написаны по-русски. Голос переводит ключевую строку («It's in Russian, so I'll
translate») — это честнее и интереснее, чем подменять вывод.

### Как записывать: экран и голос отдельно

Живой комментарий поверх работающей системы давал ровно то, от чего мы уходим:
паузы, пока система думает, и сбивчивую речь, пока руки заняты мышью. Поэтому
запись идёт в два прохода.

1. **Экран.** Пройти раскадровку без слов. Каждый кадр держать на 2–3 секунды
   дольше, чем кажется нужным: это запас для монтажа. Системный звук записывать
   только в тренере.
2. **Голос.** Отдельно, в тишине, по блокам: один блок цитаты — один файл.
   Ошибка переписывается одним блоком, а не всем роликом. Читать можно с листа,
   но как рассказ, а не как диктант. Говорите медленнее, чем кажется нужным: на
   записи темп всегда выше, чем в комнате.
3. **Монтаж.** Главная дорожка — голос, экран режется под него. Ожидания
   вырезаются. Долгий прогон агента ускоряется с пометкой скорости в углу
   («×8»): ускорение без пометки выглядит как подделка.

⚠ **В тренере это не совет, а условие.** Живой комментарий попадёт в микрофон
интервью, и Генри примет его за ответ.

### Подготовка, общая для всех пяти

- **Масштаб интерфейса 125–150 %,** шрифт терминала от 16 pt. 720p — это мало:
  мелкий текст на записи не читается, а зритель не станет всматриваться.
- **Чистый экран.** Ни личной почты, ни уведомлений, ни `.env`. Ролик публичный
  и остаётся в интернете навсегда.
- **Прогрейте модели до записи.** Первый запрос после старта грузит веса
  секундами — это не то, что вы показываете.
- **Ключевой кадр готовится до записи, а не ловится на ней.** Если он не
  воспроизводится по команде, воспроизведите его заранее и убедитесь, что он
  повторяется.
- **Команды терминала — в заранее заготовленном файле.** Вставляются, а не
  набираются.

---

## 0. Кружок о себе — ~35 секунд

Не проект, а лицо в герое главной. Живёт в круге 200 пикселей, играет по клику,
постером стоит ваша фотография.

**Зачем он.** Не затем, чтобы что-то сообщить: текст в сантиметре справа скажет
то же самое точнее. Ценность ровно одна — доказательство, что с вами можно
провести созвон на английском. Тембр, темп, живая речь. Поэтому здесь, в
отличие от пяти демо, голос не пишется отдельно: один живой дубль в камеру.

**Чего не говорить:** «Hello, my name is Anton». Имя написано рядом крупным
шрифтом, и первые пять секунд уйдут на его повтор вслух.

### Подготовка

- В кадре **только лицо**: круг 200 CSS-пикселей не вместит ни плеч с
  интерьером, ни жестов. Снимать квадратом, не меньше 400×400.
- **Смотреть в объектив, а не в своё изображение на экране.** Разница видна
  сразу: взгляд мимо зрителя читается как неуверенность.
- **Один дубль целиком, без склеек.** В маленьком круге склейка заметна как
  дёрганье головы.
- Свет в лицо (окно перед вами, не за спиной), фон нейтральный, комната тихая.

### Раскадровка

**Говорите в камеру, экран не участвует. Начинаете сразу, без вдоха и без
«итак».**

> I build LLM systems that keep working when the model is wrong. Not demos that
> work once — products with rules the model can't break.

**Короткая пауза. Не улыбайтесь в неё — просто пауза.**

> The pattern is the same every time. The model proposes. A check decides. And
> a person confirms anything that costs money or can't be undone.

**Пауза.**

> Below are five of them, two minutes each. In every video, watch for the
> moment the system says no. That moment is the work.

---

## 1. LinkBuilder — 97.9% delivery

**Хронометраж:** ~2:02 · голос 262 слова · одна пауза (ключевой кадр).

**Что зритель уносит:** это не скрипт с интерфейсом, а корпоративный продукт.
Весь цикл, от бэклинков конкурентов до письма о потерянной ссылке. ИИ пишет,
отправляет человек, и за ИИ следят контракты с рубильником. Роли, деньги и
алерты под контролем. И инженерия, которая всё это держит.

**Ключевой кадр:** тред #420. Вебмастер пишет, что бюджет заморожен до нового
финансового года, а ИИ всё равно отвечает «$270 works for us». Судья блокирует
черновик: красная плашка «The AI failed the check — reply manually», кнопки
отправки нет.

### Подготовка

**Блокеры — пока не закрыты, не снимать:**

1. **В демо-базе лежат реальные данные холдинга.** 25.09 синхронизация с
   холдингом залила в `holding_placements` 16 249 настоящих закупок (десять
   реальных проектов, 40,4 млн ₽ и $672 тыс.). **26.09 закрыт путь, которым они
   пришли:** в режиме витрины бэкенд не стартует ни одного тика, а бейджи
   балансов и проверки провайдеров отвечают снимком витрины без сети (сторож —
   `backend/tests/test_seocrmlb7_demo_outbound_guard.py`). **Сами строки ещё в
   базе** — удаление требует решения владельца: `delete from holding_placements
where created_at >= '2026-09-24'` (строки сида — от 22–23.09). На экране это
   только число «in the mirror 16793 placements» на дашборде.
2. ~~Русский тост на каждом треде.~~ **Исправлено 26.09:** 404 «статья не
   выбрана» стал пустым состоянием, а не ошибкой (сторож —
   `linkbuilder-cms/src/api/articleThreadUses.conversation.test.ts`); тост на
   #420, #500 и #5 проверен в живом интерфейсе.
3. ~~Прогон мониторинга #1 висит в «Running».~~ **Исправлено 26.09** в данных
   (`backend/scripts/demo_seed/11_fixup_existing.py` в CRM): зависших прогонов нет,
   у всех заполнены Source/Scope и журнал событий. Там же подсказки ИИ приведены к
   письмам, воронки конкурентных прогонов сходятся, отказы отправителей 1,6–3,2 %,
   gap-отчёт конкурента больше не падает 500-й.

**Кадры, которые готовятся заранее:**

- **Треды открываются адресом, а не поиском.** `/conversations?id=500` — жёлтая
  плашка: вебмастер просит $275 с пометкой sponsored, ИИ соглашается на
  disclosure. `/conversations?id=420` — ключевой кадр. Остальные подсказки ИИ в
  демо-базе подобраны к письмам случайно: на «Invoice received, payment goes out
  on Friday» ИИ отвечает «Thanks — $506 works for us», и судья это пропускает.
  В кадре — только эти два треда; запасной заблокированный — #627.
- **Check mode — Full.** Вверху `/outreach-contracts` сейчас «Observation only»
  («NOTHING is blocked»), а через двадцать секунд после кадра, где проверка
  заблокировала письмо, это противоречие. Переключить сегментный переключатель
  на Full (роль Admin). После записи — «Remove the override (back to ENV)».
- **Карточка конкурента:** Competitors & Geo → проект **FinEdge US** →
  budgetnerd.co. По умолчанию страница открывается на проекте с одним
  конкурентом — переключите заранее. Прогон #61 не показывать: у него
  «Candidates 0» и «Donors created 5», это читается как баг.
- **Дашборд** — на «All projects». **Роль — Admin:** под Linkbuilder вкладка
  Link base кидает ошибку.

**Не показывать и не нажимать:**

- **Чужие реальные данные.** Settings → Other (логин DataForSEO). Выпадающий
  список «Payment source» в карточке оплаты (реальные юрлица) и нижнюю часть
  этой карточки (TelecomAsia, rg.org). Ссылку SD-… (ведёт на
  youtrack.rantsports.com). Бейджи расходов (DFS, SearchAPI, Ahrefs) показывают
  реальные балансы: в кадре допустимы, но не задерживайтесь.
- **Кнопки, которые зовут реальные API или создают вечные прогоны.** «Start
  monitoring», «Find donors», «Start» в майнинге и генерации, «Refresh status»,
  поиск контактов Hunter, «Regenerate (AI)», Assistant.
- **Senders** — теперь можно: отказы 1,6–3,2 %, выше 7 % только у домена,
  запаркованного брейкером (исправлено 26.09).

### Раскадровка

**0:00 · Dashboard, «All projects». Курсор неподвижен.**

> This is LinkBuilder — a link-building CRM I designed and built on my own: one
> operator, doing the work of a team of five. It's a demo copy; the sites and
> people are invented.

**0:15 · Медленно ведёте курсор по меню сверху вниз, не кликая. Затем
Competitors & Geo → карточка budgetnerd.co: семь цветных плашек gap-отчёта.
Потом Reference data → Donors: в колонке Status видны состояния гейтов
(`blocked_by_gate_d`, `discovered_pending_editorial_gate`).**

> It covers the whole cycle, starting with competitors: their backlinks come in,
> and every new site goes through a chain of quality gates — stop list, traffic,
> spam, editorial fit. What passes becomes a donor.

**0:30 · Outreach → Campaigns: статусы, прогресс с ETA, reply rate. Две
секунды — и в Threads, `/conversations?id=500`. Жёлтая плашка «Reply suggested
by AI», курсор на «Fits · send», не нажимая.**

> Outreach goes out in throttled batches. Replies land in one inbox, where each
> thread shows the deal stage and its owner. The AI drafts an answer; a person
> sends it — or rejects it and has to say why.

**0:48 · КЛЮЧЕВОЙ КАДР. `/conversations?id=420`. Письмо вебмастера «Budget's
frozen until the new fiscal year» и под ним красная плашка. Две секунды молча,
курсор на «JUDGE: BLOCK», потом говорите.**

> This one never went out. The webmaster said the budget is frozen — and the AI
> still wrote that two hundred and seventy dollars works for us. The check
> blocked it, so there's no send button. Only a person can answer.

**1:08 · `/outreach-contracts`: переключатель «Full / Observation only /
Disabled» вверху, затем прокрутка до карточек контрактов («Contracts in the
registry: 10», версии v0.1.0 / v0.2.0). Потом Outreach → Campaigns → AI
calibration: плитки «Accepted as is», «Edited», «Rejected», «Auto-send (step 1):
0».**

> Every AI letter answers to ten versioned contracts, with a kill switch an
> admin can flip without a restart. And the AI earns its autonomy by
> measurement, not trust: shadow runs on real mail score every draft before
> anything goes out on its own.

**1:27 · Placements → Link base: наводите на красный бейдж в колонке Checks —
всплывает чеклист «Placement checks». Потом Incidents (типы Deleted, NoFollow,
HTTP, Not indexed), потом Claims (сводка: emails sent, replied, placements
recovered).**

> Then every link is watched: still there, still dofollow, still indexed. A lost
> link becomes an incident, then a letter asking for it back — but only after a
> second check, because nearly one "dead" link in five turned out to be alive.

**1:47 · Быстро, по 2 секунды: Payment requests (открыть заявку, верх карточки:
NOT PAID, SD REQUEST, Upload invoice) → Settings → Users (три роли) → бейдж
Ahrefs на Competitors → Dashboard.**

> Around it: payments through the service desk, three roles, spend meters, and
> Slack alerts before a balance runs dry. Eleven thousand backend tests, seven
> hundred on the front end, a hundred and thirty-seven migrations.

**Вариант концовки — решение за вами.** В git 1 096 из 1 951 коммита подписаны
соавтором-ИИ. Если репозиторий когда-нибудь увидит нанимающий, «built on my
own» он прочтёт по-своему. Честная и при этом сильная формулировка связывает
CRM с роликом про контур (+8 секунд):

> Built by one engineer — with AI coding agents working inside the quality gates
> from the contour video.

**Ещё одна строка по желанию — если готовы отвечать за неё на интервью:**

> In production it sent over twelve thousand emails, with ninety-eight percent
> delivered.

⚠ Это единственное число ролика без источника в репозитории: ни 12 000, ни 97.9%
там нет, а лимит кампании по умолчанию — 5 000 получателей, при заявленных на
карточке 5 400.

### Цифры ролика

Пути — от `Linkbuilding Automatization P/` в каталоге CRM.

| Звучит                                | Значение                                                                  | Источник                                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| a team of five                        | со слов владельца                                                         | в репозитории нет; карточка, oneLiner                                                            |
| two hundred and seventy dollars       | тред #420 демо-базы                                                       | на экране                                                                                        |
| ten versioned contracts               | 10 YAML-контрактов                                                        | `backend/features/outreach_contracts/contracts/*.yml`; на экране «Contracts in the registry: 10» |
| a kill switch … without a restart     | full / warn-only / off, в Redis, только Admin                             | `backend/features/outreach_contracts/runtime_mode.py:1-20`                                       |
| shadow runs … score every draft       | теневой прогон: 109 подсказок, каждая оценена (как есть / правка / отказ) | `docs/MASS_OUTREACH_AI_REPLY_CALIBRATION_DESIGN.md:16-40`                                        |
| nearly one "dead" link in five        | 159 живых из 865 «мёртвых»                                                | `docs/MONITORING_DEAD_PAGE_VERIFICATION_2026_08_19.md:22-25`                                     |
| eleven thousand backend tests         | 11 048 passed, прогон 22.09                                               | `delivery/active/decisions.md` этого репозитория, строка 2026-09-22                              |
| seven hundred on the front end        | 703 из 703                                                                | коммит CRM `021d9fa5`                                                                            |
| a hundred and thirty-seven migrations | 137 файлов                                                                | `backend/shared/database/migrations/versions/`                                                   |

### Если пойдёт не так

- **На треде выскочил красный тост.** Не снимайте поверх: это блокер №2, он не
  закрыт.
- **Плашки ИИ на #420 нет.** Значит, подсказку уже приняли или отклонили
  (кто-то нажал «Reject»). Берите #627: вебмастер просит $465 с пометкой
  sponsored, ИИ отвечает «$532 works for us… no sponsored label needed».
  Реплика меняется:

  > This one never went out. The webmaster asked for four hundred and sixty-five
  > dollars and a sponsored label — and the AI offered more money and no label.
  > The check blocked it, so there's no send button. Only a person can answer.

- **Вырос счётчик Bounce/Fail или появились новые «Queued».** Планировщики
  внутри бэкенда работают и в демо-режиме: получатели в очереди переходят в
  failed с `sendgrid_not_configured`. Проверьте таблицу кампаний перед записью.

---

## 2. Voice Interview Coach — ~3 s per turn

**Хронометраж:** ~2:05 · голос 198 слов + ~35 с живого звука интервью (это не
пауза: говорит система) · одна пауза.

**Что зритель уносит:** разговор идёт без интернета и без задержки, которая
убивает диалог. Интервью ведёт код, модель только формулирует. Каждая фраза
Генри проходит контракт до того, как прозвучит. После — разбор.

**Ключевой кадр:** вы просите у Генри оценку, и он её не даёт. Оценки в живом
разговоре запрещены контрактом: фраза с баллом режется до озвучки.

### Подготовка

- **Голос пишется отдельно** (см. «Как записывать»). В записи экрана звучат
  только Генри и вы-кандидат.
- **Пять шагов preflight из `docs/DEMO.md`** — все пять отказов случались
  вживую. Шаги 1–3 красные — не снимать. `whisper-cli` обновился 22.09 (1.9.1),
  и после этого шаг 3 (`delivery/evals/browser/run.sh mid-turn` →
  `closed-mid-turn`) не прогонялся — прогнать заново.
- **Прогреть модель** (первый ход на холодную грузит ~9 ГБ и выглядит как
  «зависло») и **надеть наушники** (на колонках VAD слышит Генри).
- **Захват системного звука:** `Cmd+Shift+5` → Options → микрофон и Include
  System Audio. Тест на 30 секунд: запись диалога, где слышно только вас, —
  самый обидный способ потерять дубль.
- **Записать свежую полную сессию (~15 минут) и резать из неё.** В базе всего
  две сессии, обе технические. «End session → Skip for now» из `DEMO.md` не
  существует: «End session» закрывает сокет сразу. Полный разбор с пятью
  шкалами и словами появляется, только если интервью закончилось само и вы
  прошли «Review together». Пишет его reasoning-модель, время не замерено —
  закладывайте монтаж.
- **Ключевой кадр отрепетировать трижды.** Стоп-лист ловит «out of ten», «I'd
  rate», «your score», но не «7/10» и не «a solid seven». Если на репетиции
  Генри хоть раз назвал число — выкидывайте блок: это находка для стоп-листа, а
  не кадр.
- **Две настройки не работают** — слайдер «Silence before your turn ends» и
  переключатель «Live transcript». Сохраняются, но сессия их не читает. Не
  показывайте их.
- ⚠ **В рабочем дереве тренера незакоммиченная правка:** тишина конца реплики
  1,2 → 2,0 с (`frontend/src/lib/vad.ts:4` и ещё 10 файлов, от 07.09). Реплика
  ниже написана под 2 секунды.
- **Заготовьте два-три ответа** на техническом английском и прогоните заранее:
  запинка здесь читается как слабость языка, а не как живость.

### Раскадровка

**0:00 · Камеры нет, только экран. Открываете меню Wi-Fi и выключаете его.
Курсор задерживается на выключенном значке.**

> I'm switching the Wi-Fi off. Everything you'll hear from now on runs on this
> laptop: speech recognition, a fourteen-billion-parameter model, and the
> voice.

**0:10 · Стартовый экран: «Ready when you are.», чипы «~15 min · English only ·
6 questions · 3 technical · 3 behavioral». Адрес localhost в строке браузера —
в кадре.**

> This is Henry, a mock interviewer: fifteen minutes in English, six questions.
> He's read my portfolio, so we talk about my real projects.

**0:21 · «Start interview». ГОЛОС ГЕНРИ, закадра нет: приветствие и первый
вопрос, ~10 секунд (середину приветствия можно вырезать).**

**0:31 · Вы отвечаете: в ролик идут 5 секунд ответа, остальное вырезается. Шар
«Listening», полоска микрофона «hearing you». Затем «Thinking…» и уточняющий
вопрос Генри, ~6 секунд.**

**0:42 · Поверх транскрипта (пузыри «Henry» / «You»):**

> Two seconds of silence tell it I've finished. His first word comes back about
> a second and a quarter later: he speaks sentence by sentence, while the model
> is still writing.

**0:56 · КЛЮЧЕВОЙ КАДР. Вы спрашиваете: «How would you rate that answer — out of
ten?» Генри отвечает без числа (~6 секунд живого звука). Две секунды тишины
после его реплики.**

> He won't say. Grades are banned from the live talk: every sentence passes a
> contract before it's spoken — English only, no scores, three sentences at
> most.

**1:16 · Вы говорите: «Could you speak slower?» Генри: «Of course — I'll slow
down. Here it is again.» — и начинает дословно повторять прошлую реплику. Через
3 секунды обрезать.**

> That one never reaches the model. It's a command in code: he repeats his last
> line word for word, slower, and the question isn't spent.

**1:34 · History → «Open» → вкладка «Summary»: пять полос «N/5» (Clarity,
Structure, Depth, English, Positioning), «Strengths», «Fix: …», «Weak answers —
try instead». Медленная прокрутка, потом вкладка Useful Words.**

> After the session there's a written review: five scores, what to fix, better
> versions of my weak answers, and new words to learn.

**1:44 · Остаётесь на Useful Words.**

> It comes from a reasoning model that needed thirty-one to fifty-two seconds a
> turn — too slow for talking, fine for homework. The interview itself is code:
> if my technical answer has no numbers, Henry asks for them.

**2:01 · Финальный кадр — Settings с полоской микрофона.**

> A hundred and seventy-six backend tests at ninety-five percent coverage.

### Цифры ролика

Пути — от `~/Documents/voice-interview-coach/`.

| Звучит                                   | Значение                                              | Источник                                                               |
| ---------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| a fourteen-billion-parameter model       | qwen2.5:14b-instruct                                  | `backend/app/config.py:18-22`                                          |
| fifteen minutes, six questions           | чипы стартового экрана                                | `frontend/src/pages/InterviewPage.tsx:52-96`                           |
| two seconds of silence                   | 2,0 с — незакоммиченная правка                        | `frontend/src/lib/vad.ts:4`                                            |
| a second and a quarter                   | 1 247 мс медиана, 1 302 мс худший, от получения звука | `delivery/archive/2026-08-13-expressive-speech/verify-report.md:87-90` |
| English only, no scores, three sentences | инварианты I1-H1, I1-H3, G1-H1                        | `data/contracts/interview.contract.yaml`                               |
| thirty-one to fifty-two seconds          | deepseek-r1:14b на реплику                            | `docs/14-llm-model-split.md:35-40`                                     |
| a hundred and seventy-six backend tests  | 176                                                   | `delivery/archive/2026-08-17-stand-selector-rot/verify-report.md:22`   |
| ninety-five percent coverage             | 94,93% с ветками                                      | `backend/.coverage` от 22.09                                           |

### Если пойдёт не так

- **Генри переспросил или не расслышал.** Один раз — оставьте: живая система
  переспрашивает, и это честно. Два раза подряд — вырежьте.
- **Длинная тишина после первого вопроса.** Модель остыла: Ollama выгружает её
  после нескольких минут простоя. Прогрейте и начните заново.
- **Шар застыл на «Listening».** Тихий микрофон или не тот вход: Settings →
  Microphone → «Test».
- **Генри назвал оценку числом.** Ключевой кадр не годится, см. подготовку.
  Не монтируйте вокруг — такой дубль в ролик не идёт.

---

## 3. Local Web Agent — 443 tests

**Хронометраж:** ~1:58 · голос 253 слова · одна пауза.

**Что зритель уносит:** частный исследователь, который живёт на ноутбуке и
ходит по настоящим сайтам настоящим браузером. Отвечает тем, что может
процитировать, и сам называет, чего не дочитал. Необратимое нажимает человек.

**Ключевой кадр:** агент сам заполнил форму заказа в видимом браузере и
остановился перед кнопкой оплаты: карточка «Your turn to press it».

⚠ **Живьём реальные сайты не показывать.** Замер 17.08: один реальный сайт —
7 мин 38 с, из них на модель 97 с, остальное съела сеть под VPN. Ролик строится
из двух слоёв, как `DEMO.md`: готовые сессии из списка чатов плюс один живой
запуск на локальной фикстуре.

### Подготовка

**Английская фикстура заказа готова (26.09):** `http://127.0.0.1:8909/` —
«WX-9 industrial widget — $59», кнопка «Place order and pay»; 8 тестов
(`backend/tests/test_tier3_checkout_fixtures.py`) доказывают паузу перед оплатой.
Задача для кадра: «Order the WX-9 widget: fill in name, email and address, and take
it through to payment». ⚠ Правки в репозитории веб-агента пока не закоммичены:
pre-commit краснеет на чужом неотслеживаемом `backend/probes/inject_navigator.py`.

- **Записывать из текущего рабочего дерева** (ветка
  `axis-5/cassettes-keyed-by-prompt`). Английские правки интерфейса от 23.09
  есть только там: запуск из `main` вернёт русские строки.
- **Preflight из `DEMO.md`:** `ollama serve`, прогрев `ollama run qwen3:14b ""`,
  сервер фикстур, бэкенд на `127.0.0.1:8001`, `curl /health` →
  `ollama: reachable`.
- **Флажок «Show me the browser» ставится до первого сообщения:** после он
  заблокирован.
- **Отрепетировать живой запуск с английской формулировкой** и засечь время:
  английскую задачу на форму заказа ещё никто не гонял.
- **Сессии для витрины.** Основная — магазины электроники (adafruit / pihut /
  sparkfun). Немецкую про хлеб можно: утечку ключа `brot_backen_anleitung_url` из текста
  убрали 26.09 (бэкап базы — `data/runs/app.db.bak-2026-09-26`). `report.md` King Arthur не
  показывать: там рядом стоят оценка модели «1200 слов» и замер кода 3 771.
- **Цитаты в интерфейсе не выводятся** (тип `Evidence` есть, компонента нет).
  Кадр с цитатой снимается с
  `data/runs/artifacts/1b14aebef030/report.md` в превью редактора: строка
  `processing_time (high) · source: dom`, под ней цитата «Orders usually ship
  within 1-2 business days.» и ссылка adafruit.com/shipping.
- **После записи** — `ollama stop` и пустой `ollama ps`.

### Раскадровка

**0:00 · Экран приветствия: «Paste a few links, say what you need», слева
подпись «Research that never leaves this Mac».**

> This is a research agent that lives on my laptop. I paste a few links and ask
> a question — it opens each site in a real browser and quotes where it found
> the answer. No cloud: every model runs right here.

**0:18 · Слева открываете чат про магазины. Ответ в чате, затем вкладка «What we
found»: «Best of the bunch: adafruit.com», полосы 95 / 75 / 60, таблица «Side by
side».**

> Here I asked it how clearly three electronics stores explain shipping and
> returns. It read all three, scored them against a rubric and picked a winner
> — at temperature zero, so the same pages always get the same scores.

**0:36 · Прокручиваете ответ до конца, курсор на строке «I did not read
everything: sparkfun.com — so "nothing found" here can mean "not read far
enough"…».**

> It also names its own limit: it didn't read all of one site. That sentence is
> written by code — when I asked the model to say it, it did about half the
> time.

**0:51 · Раскрываете карточку adafruit.com → «How it got there». Затем
переключаетесь на `report.md` в редакторе: строка с цитатой и ссылкой.**

> Every site shows how it got there, page by page. A confident fact needs a
> quote from the page — if the quote isn't really there, the fact is thrown out.
> And anything seen only on a screenshot never gets top confidence.

**1:10 · Новый чат («+»), флажок «Show me the browser», задача на английскую
форму заказа, Send. Открывается видимый Chromium и сам заполняет поля. Прогон
ускорить на монтаже с пометкой «×8».**

> Now live, on a local test shop, with the browser visible. It doesn't scrape
> with selectors: it looks at the page, plans and acts — and fourteen hard rules
> are checked in code before any action reaches the browser.

**1:28 · КЛЮЧЕВОЙ КАДР. Карточка «Your turn to press it» — «This step can't be
undone… so the agent never presses it». Две секунды молча, потом говорите.
Нажимаете оплату в браузере сами, затем «Done — carry on».**

> And here it stops. Paying can't be undone, so the agent prepares everything,
> and I press the button. Captchas work the same way — it waits for me. No
> anti-bot tricks, by design.

**1:44 · Список чатов слева, финальный кадр.**

> Four hundred and forty-three tests, over a hundred and forty runs in the log,
> twenty-seven real websites — and almost every recent test began as a failure
> on one of them.

### Цифры ролика

Пути — от `~/Documents/local-web-agent/`.

| Звучит                             | Значение                                           | Источник                                     |
| ---------------------------------- | -------------------------------------------------- | -------------------------------------------- |
| temperature zero                   | сравнение сайтов при t=0                           | `backend/app/config.py:47-52`                |
| about half the time                | модель выполнила инструкцию на одном сайте из двух | `knowledge/engineering/llm-canon.md:98`      |
| fourteen hard rules                | 9 инвариантов + 5 лимитов                          | `data/contracts/crawl.contract.yaml`         |
| four hundred and forty-three tests | 443 собрано, 23.09                                 | `backend/.venv/bin/pytest --collect-only -q` |
| over a hundred and forty runs      | 143 прогона, 932 шага                              | `data/runs/app.db`                           |
| twenty-seven real websites         | 73 прогона на 27 реальных сайтах                   | `data/runs/app.db`                           |

### Если пойдёт не так

- **Английской фикстуры нет или прогон не остановился на оплате.** Запасной
  ключевой кадр — честное «не найдено». Чат с задачей, ответа на которую в
  фикстурах нет: статья про кэширование на 8901, 40–52 секунды на ответ. Это
  именно запасной вариант: победителя нет, и на показе кадр легко принять за
  поломку. Реплика:

  > Now I ask for something that isn't there. It says so — not found — instead
  > of making something up. And that sentence about what it didn't read is
  > there too.

- **Прогон завис на загрузке.** Это сеть, а не агент; режьте ожидание.
- **`409 run_in_progress`.** Идёт другой прогон: оставленный CLI или прогон на
  паузе держит блокировку. Один активный за раз — так задумано.
- **Агент ответил тем, чего нет в источниках.** Останавливайте запись: ролик
  утверждает обратное.

---

## 4. RAG over a rulebook — 0 uncited answers

**Хронометраж:** ~1:56 · голос 249 слов · одна пауза.

**Что зритель уносит:** ответ всегда с адресом или отказ. Поиск написан руками и
откалиброван на чужом эталоне. Измерения честные: holdout, реестр взглядов на
него, пределы записаны выше сильных сторон.

**Ключевой кадр:** вопрос, которого нет в своде. Поиск не находит ничего
близкого, модели не подаётся ни строки свода, ответ — «не покрыто».

### Подготовка

- **Весь ролик — терминал в `~/Documents/Prepare/rag`.**
- **Вопросы и вывод — на русском.** Свод написан по-русски, и английские
  вопросы почти все не проходят гейт («How many gates…» набирает 4,99 при
  пороге 8,0). Спрашиваем по-русски, голос переводит.
- **Флаг `--конвейер` — кириллица:** все команды вставлять из заготовленного
  файла.
- **`ollama serve` до записи;** модели `qwen3:8b` и `bge-m3` на месте. **Первый
  прогон — до записи:** свод менялся после кеша эмбеддингов, первый запуск их
  пересчитает.
- **Вопросы проверены на гейт:**
  - в своде: «Сколько гейтов на механику у контура?» — 9,74, проходит, ответ
    `CODE_QUALITY_GATES.md §3`;
  - вне свода: «Как проводить нагрузочное тестирование?» — 5,12, отказ.
  - ⚠ Не брать «Как настроить GDPR для хранения персональных данных?» (9,83:
    проходит гейт и получает уверенный ответ соседним разделом) и «Что такое
    ратчет в контуре?» (6,48: отказ, хотя тема в своде есть). Это
    задокументированные пределы, а не кадры.
- **`eval_retrieval.py --all` прогнать заранее** (1–3 минуты) и показать готовый
  вывод. **`--holdout` в кадре не запускать:** каждый запуск расходует взгляд на
  holdout и обязан попасть в реестр.
- **Ответ модели может отличаться от сохранённого:** свод правили после замеров.
  Отрепетируйте — адрес должен быть §3 (или §2.9).
- **После записи** в git станут грязными `journal.jsonl`, `emb_bge_child.json`,
  `runs/beir-scifact.json` — откатить или закоммитить осознанно.

### Раскадровка

**0:00 · Терминал. Вставляете `python3 answer.py --конвейер "Сколько гейтов на
механику у контура?"` и запускаете.**

> This is a search desk over my own engineering rulebook: four documents, about
> a hundred and ten thousand tokens. It's in Russian, so I'll translate. I'm
> asking how many quality gates the rulebook allows.

**0:15 · Ответ: `АДРЕС: CODE_QUALITY_GATES.md §3` и «22 гейта: 16 на коммите + 6
вне коммита». Курсором подчёркиваете адрес.**

> The answer comes back with an address — file and section. Twenty-two gates:
> sixteen at commit, six outside. No address, no answer: that's the rule
> everything here is built around.

**0:29 · `sed -n 677,694p ../CODE_QUALITY_GATES.md` — тот же раздел. Держите
кадр, чтобы зритель прочитал совпадение: это доказательство, а не
иллюстрация.**

> I open that section — and it says exactly that.

**0:33 · КЛЮЧЕВОЙ КАДР. `python3 retrieve.py "Как проводить нагрузочное
тестирование?"` — верхний балл 5,12, ниже порога 8,0. Затем тот же вопрос через
`answer.py --конвейер`: «фрагментов подано 0», «АДРЕС: не покрыто». Две секунды
молча.**

> Now something it doesn't cover: how to run load tests. Search finds nothing
> close enough, so not a single line of the rulebook reaches the model. And with
> an empty context, it answered "not covered" two hundred and ten times out of
> two hundred and ten.

**0:56 · `sed -n 23,44p README.md` — таблица чисел и абзац «Пределы названы, а не
спрятаны».**

> The limits sit above the strengths in the README. The gate mostly reacts to
> how long a question is, and exact file-and-section accuracy is fifty percent
> on an independent set.

**1:10 · Готовый вывод `python3 eval_retrieval.py --all`: BM25 / bge-m3 / гибрид,
top-20, доверительные интервалы; баннер «⚠ ЗНАМЕНАТЕЛЬ ВКЛЮЧАЕТ HOLDOUT».**

> Retrieval is hand-written — BM25, fusion, parent documents, standard library
> only. Recall at twenty: seventy-six percent on three hundred and fourteen
> independent questions, and seventy-two on the eighty I held out.

**1:24 · `sed -n 31,41p MEASUREMENTS.md` — реестр взглядов на holdout. Сырым
текстом: в превью Markdown строки 2–3 выпадают из таблицы.**

> Every look at those eighty is logged. Three so far — and one is marked
> unsanctioned, because a design decision was made with them inside the
> numbers.

**1:36 · `python3 probe_beir_bm25.py` (5,5 секунды): «nDCG@10 0.666 (якорь
0.665)» … «ВЕРДИКТ по З-14: все предсказания сбылись».**

> And I checked the ruler itself on a public benchmark: nDCG at ten, zero point
> six six six, against a published zero point six six five. The predictions
> were written down before the run.

**1:51 · Остаётесь на вердикте.**

> Six hundred and eighty answers — and not one without an address.

### Цифры ролика

Пути — от `~/Documents/Prepare/`.

| Звучит                                            | Значение                                            | Источник                                             |
| ------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------- |
| four documents, a hundred and ten thousand tokens | 4 свода, ~110K токенов                              | `rag/README.md:3-7`; `rag/MEASUREMENTS.md:2767-2774` |
| twenty-two gates: sixteen at commit, six outside  | на экране                                           | `CODE_QUALITY_GATES.md:679-684`                      |
| two hundred and ten out of two hundred and ten    | отказов при пустом контексте                        | `rag/README.md:1820-1821`                            |
| fifty percent                                     | 12/24, точная пара (файл, §) на независимом holdout | `rag/README.md:27, 2058-2069`                        |
| seventy-six percent on three hundred and fourteen | 76% [71..80], гибрид, все 314 независимых вопросов  | `rag/README.md:1300-1304`                            |
| seventy-two on the eighty                         | 72% [62..83], 58 из 80, чистый holdout              | `rag/MEASUREMENTS.md:161-174`                        |
| three looks, one unsanctioned                     | реестр взглядов                                     | `rag/MEASUREMENTS.md:31-41`                          |
| zero point six six six / six six five             | nDCG@10 на BEIR/SciFact, 300 запросов               | `rag/MEASUREMENTS.md:3010-3029`                      |
| six hundred and eighty answers                    | 0 без адреса, 0,3% выдуманных пар                   | `rag/README.md:1782-1791`                            |

### Если пойдёт не так

- **Замеры разошлись с README.** Снимайте то, что на экране, и правьте README —
  а не наоборот.
- **Ответ пришёл без адреса.** Это отказ системы, о которой ролик утверждает
  обратное. Запись останавливается, ролик откладывается.
- **`answer.py` падает сразу.** Не запущен `ollama serve` — или флаг набран
  латиницей: вставляйте из файла.
- **В выводе «⚠ ПОВЕРХНОСТЬ УЕХАЛА…».** Ollama новее закреплённой версии
  (0.32.15 в `model-surface.json`). Это честное предупреждение инструмента: либо
  обновить закрепление до записи, либо не снимать этот вывод.

---

## 5. Quality contour — 22 gates, hard-capped

**Хронометраж:** ~1:56 · голос 249 слов · одна пауза.

**Что зритель уносит:** «зелёное» от ИИ-агента ничего не стоит, пока механизм не
может его отклонить. Контур проверяет даже свои проверки, ограничивает сам себя
и измерен в поле.

**Ключевой кадр:** гейт сломан так, что остаётся зелёным, — и доктор называет
это ложью: DEAD.

### Подготовка

- **Весь ролик — терминал в этом репозитории** (`portfolio-site`).
- **Дерево перед записью — чистое** (`git status` пуст): все правки гейтов в
  кадре делаются и откатываются через `git checkout`, и посторонний дифф
  спутает и вас, и зрителя. Хуки гоняются через `pre-commit run <id>
--all-files`, а не через `git commit`.
- **Ключевой кадр отрепетирован 26.09 — работает.** В
  `scripts/lint/check_file_length.sh:22` лимит `MAX_LINES_PROD=${MAX_LINES_PROD:-500}`
  → `:-50000}`. `pre-commit run file-length --all-files` — **Passed**, и хук
  по-прежнему называет себя «Файлы кода <= 500/1000 строк». Доктор
  (`python3 scripts/lint/contour_doctor.py`, ~5 с) — код выхода 1, строка
  «DEAD канарейка check_file_length.sh — МОЛЧИТ на своём же нарушении»,
  «contour-doctor: … DEAD 1» и «ERROR: 1 проверк(и) объявлены и МОЛЧАТ на
  своём же нарушении». Заодно он пишет WEAK «тело отличается от снимка канона» —
  заметил, что гейт трогали. Откат — `git checkout
scripts/lint/check_file_length.sh`, доктор снова «DEAD 0 · Лжи нет».
- ⚠ **Не берите для кадра гейт слоёв** (`.dependency-cruiser.cjs`): его
  канарейку доктор и без поломки оценивает WEAK («половины не проверены»),
  поэтому сломанное правило там остаётся незамеченным — проверено 26.09.
- **Повтор настоящей находки — отрепетировать.** В
  `scripts/lint/check_layers_gate.sh:129` `'[0-9]+ modules'` →
  `'\([0-9]+ modules'`; `node --test tests/gates.test.mjs` — красный с «ЛОЖНЫЙ
  ДИАГНОЗ… Шаблон счётчика снова ждёт скобку». Откат — `git checkout`.
- **Вывод гейтов и доктора — на русском.** Голос переводит ключевую строку.
- ⚠ **Из 22 гейтов на этом сайте применимы 10;** остальные 12 объявлены
  неприменимыми с причинами (`scripts/lint/not-applicable.json`). Не говорите и
  не показывайте так, будто на сайте бегут все 22.

### Раскадровка

**0:00 · Терминал в репозитории сайта. `pre-commit run --all-files` — бегут
проверки.**

> This is a quality contour: a rulebook plus gates that deploy into any
> repository. It exists because an AI coding agent will happily report green on
> something nobody checked.

**0:13 · Прогон закончился, всё зелёное. Курсор вдоль строк, где гейты печатают,
сколько просмотрели: файлы, модули.**

> Here it runs on this very site. Every gate prints how much it actually looked
> at — because "no problems found" means nothing if it saw no code.

**0:25 · Открываете `scripts/lint/check_file_length.sh`, меняете `500` на `50000`
в строке `MAX_LINES_PROD`. Правку показываете крупно. `pre-commit run
file-length --all-files` — Passed, и курсор на названии хука: «<= 500/1000
строк».**

> Now I break a gate: one number, and a five-hundred-line limit becomes fifty
> thousand. It still passes — and still calls itself a five-hundred-line check.

**0:35 · КЛЮЧЕВОЙ КАДР. `python3 scripts/lint/contour_doctor.py`. Строка DEAD и
текст ошибки. Две секунды молча, курсор на «ложь».**

> This is the doctor. It feeds every gate a planted violation — a canary. A gate
> that's declared, wired in, and silent on its own canary isn't weak. It's lying
> — and that's the one thing that fails the run.

**0:54 · `git checkout scripts/lint/check_file_length.sh`, доктор ещё раз:
«DEAD 0» и «Лжи нет». Быстро.**

> Put the line back, and the lie is gone.

**0:58 · `delivery/archive/2026-08-07-contour-bootstrap/observed.md` на разделе
про «0 модулей просмотрено». Затем правка регулярки в `check_layers_gate.sh` и
`node --test tests/gates.test.mjs` — красный.**

> The doctor has limits, too. For a month, one gate here misread its own tool:
> whenever there was a warning, it reported "zero modules checked" — and the
> doctor still rated it fine. Now a test replays that bug, so if an update brings
> it back, it goes red the same day.

**1:22 · Откат, затем `sed -n 679,694p ~/Documents/Prepare/CODE_QUALITY_GATES.md`:
«22 гейта … БЮДЖЕТ ИСЧЕРПАН».**

> The rulebook limits itself. Twenty-two gates, and the budget is spent: a
> twenty-third gets in only by swapping one out. Old debt is frozen in a snapshot
> that can only shrink.

**1:36 · `sed -n 11,24p ~/Documents/Prepare/field/FIELD-LOG.md` — правило строки
«Кто должен был поймать».**

> It runs in seven repositories, and the field log holds twenty-five findings,
> each one classified. From the next one on, a test rejects any finding that
> doesn't name which check should have caught it.

**1:52 · Возвращаетесь к зелёному прогону.**

> Nothing counts as done unless a mechanism can refuse it.

### Цифры ролика

| Звучит               | Значение                                                  | Источник                                                                                                  |
| -------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| for a month          | урок L6: два гейта месяц судили неверно при вердикте AUTO | `delivery/archive/INDEX.md:24`; `delivery/archive/2026-08-07-contour-bootstrap/observed.md:40-51`         |
| twenty-two gates     | 16 на коммите + 6 вне                                     | `~/Documents/Prepare/CODE_QUALITY_GATES.md:679-694`                                                       |
| seven repositories   | контур с доктором и хуками                                | portfolio-site, voice-interview-coach, local-web-agent, lash-try-on, Fake office, G connect, Ahrefs cases |
| twenty-five findings | F1–F25 по шести развёртываниям                            | `~/Documents/Prepare/field/FIELD-LOG.md`; `~/Documents/Prepare/CONTOUR-EN.md:99-109`                      |

### Если пойдёт не так

- **Сломанный гейт не дал DEAD.** Это находка, а не неудача съёмки: доктор не
  видит класса, который обязан видеть. Остановите запись и чините доктора —
  ролик подождёт, а такой кадр в него всё равно нельзя.
- **Доктор показал DEAD ещё до вашей правки.** Тоже находка; снимать поверх
  нельзя.
- **Хук упал на неотслеживаемом PDF.** См. подготовку: дерево — до записи.

---

## Где ролик и карточка расходятся

26.09 карточки приведены к тому, что подтверждается кодом и замерами (12
утверждений: сервисы и языки LinkBuilder, контракт и задержка тренера, «10 ms»
веб-агента, holdout и гейт RAG, число развёртываний, находок и прогонов
контура). Числа в общих текстах сайта теперь стережёт `tests/numbers.test.mjs`:
число, которого нет на карточке, валит сборку.

Осталось только то, что держится на слове владельца, а не на репозитории:

| Карточка    | Утверждение                                                    | Статус                                                                                       |
| ----------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| LinkBuilder | «What took a team of five now runs on one operator»            | со слов владельца; в ролике звучит                                                           |
| LinkBuilder | «12,000+ emails, 97.9% delivery on a 5,400-recipient campaign» | источника в репозитории нет, лимит кампании по умолчанию 5 000; в ролике — только по желанию |

---

## Порядок съёмки

1. **Контур и RAG.** Всё в терминале, переснять дёшево. На них набивается рука,
   в том числе на записи голоса отдельно от экрана.
2. **Веб-агент** — после английской фикстуры формы заказа.
3. **CRM** — после трёх блокеров. Экранов больше всего, монтажа тоже.
4. **Тренер** — последним из демо: нужна полная 15-минутная сессия и отдельная
   дорожка голоса.
5. **Кружок о себе — не раньше, чем готовы два демо.** Он самый лёгкий: не надо
   готовить экран, не надо ловить момент, где контракт отклоняет письмо. Ровно
   поэтому он и снимется первым, если не решить иначе. А рекрутёр, который видит
   говорящую голову и пять пустых фреймов под ней, читает это однозначно:
   рассказывать любит, показывать нечего. Кружок работает добавкой к работающим
   демо и не работает вместо них.
