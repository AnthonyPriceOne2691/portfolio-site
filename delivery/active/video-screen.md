# Ролики: экран

Видео пишется **вторым, под готовый голос в наушниках** (кроме голосового агента — там экран первым, со звуком). Видео — **один заход, без слов**. Шкала общая с [video-voice.md](video-voice.md): кадр `LB-4 · 0:51–1:11` здесь и блок `LB-4 · 0:51–1:11` там — одно и то же место ролика. Общие правила — в [video-scripts.md](video-scripts.md).

**30.09 сценарий пересобран под новый голос** (проще, через выгоду для заказчика) и отрепетирован: RAG, веб-агент и голосовой агент — живыми прогонами с моделью, CRM — по базе после правки демо-данных, контур — прогоном всех команд. **Секунда каждого шага вычислена из голоса**: шаг начинается, когда звучит его опорная фраза. Отставание экрана от голоса ловит `tests/video-timing.test.mjs` — правите текст, пересчитывайте шкалу, иначе сборка красная.

## Как читать шаги

- `0:22–0:24` — время в готовом ролике. Передержать не страшно (лишнее срежется), недодержать хуже.
- _Голос: «It covers the whole cycle…»_ под заголовком кадра — первые слова его реплики. Услышали их — вы на этом кадре.
- **На словах «…»** — сделайте движение, когда услышите эти слова. Слова надёжнее секундомера.
- «До кадра, в паузе перед ним» — сделать в секундной паузе между репликами. Не успеваете — ⏸.
- ⏸ — экрану надо подождать (модель думает, доктор гоняет проверки). Поставьте голос на паузу клавишей ⏯ (F8) или сжатием ножки AirPods, дождитесь результата, снова ⏯. На монтаже этот кусок вырезается.
- `Cmd+2` … `Cmd+8` — переключение на заранее открытую вкладку браузера. Мгновенно: навигация в кадре — главный источник отставания, поэтому тяжёлые переходы открыты заранее.
- ⛔ — не нажимать: тратит деньги, меняет данные или ломает дубль.
- Подписи в «кавычках» — ровно как на экране.

---

## 0. Кружок о себе — ~35 секунд

**Снимается одним живым дублем в камеру, со звуком.** Текст — в [video-voice.md](video-voice.md), раздел 0.

- В кадре **только лицо**: круг 200 CSS-пикселей не вместит ни плеч, ни жестов. Квадрат, не меньше 400×400.
- **Смотреть в объектив**, а не в своё изображение.
- **Один дубль целиком, без склеек.**
- Свет в лицо, фон нейтральный, комната тихая.

**C-1 · 0:00–0:12 · 12 с** — говорите в камеру, без вдоха и без «итак».

**C-2 · 0:12–0:26 · 14 с** — короткая пауза, не улыбайтесь в неё.

**C-3 · 0:26–0:38 · 12 с** — пауза.

---
## 1. LinkBuilder — link building on autopilot

### Подготовка

**Проверено 30.09:** демо-данные поправлены и сверены запросами к базе (только числа и статусы); маршрут — по коду интерфейса.

- **Стек.** Из каталога CRM: `docker compose up -d postgres redis backend frontend` (30.09 поднят; рядом ещё `ml-embedding-service`, `autoheal`, `crm-backup-test` — воркеров среди них нет, демо-режим `DEMO_DATASET=true`). Браузер — **http://localhost:5173**, вход демо-админом (логин — `backend/scripts/demo_seed/README.md` CRM).
  - ⛔ **Воркеры не запускать**: данные выдуманные, ключи в `.env` настоящие.
  - Токена Service Desk в окружении и `.env` нет (проверено 30.09) — карточка заявки в настоящий трекер не ходит.
- **Демо-данные доведены 30.09** (скрипты лежат в `backend/scripts/demo_seed/`: `12_showcase_fixups.sql`, `_fixup_gap_report.py`, `_refresh_contract_checks.py`):
  - gap-отчёт budgetnerd.co: «Added by runs» 12 · «Known from other sources» 35 · «Under review» 0 · «Already bought (this project)» 12 · «Bought (another project)» 8 · «Filtered by checks» 146 · «In stop list» 18;
  - оценки доноров — буквы S / A / B / C (было «C» у всех);
  - кампании #8–12 и претензия #16 — с правильными брендами;
  - поля заявок на оплату — по-английски (⛔ «Save» в карточке заявки не нажимать: упадёт 422);
  - на странице контрактов «Checks in 24h» ≈ 190.
- ⚠ **Прямо перед записью** обновите свежие проверки (иначе число тает на ~8 в час):
  `docker compose exec -T backend python - < backend/scripts/demo_seed/_refresh_contract_checks.py`
- **Режим проверок — на Full.** По умолчанию «Observation only» из настройки сервера.
  1. **http://localhost:5173/outreach-contracts** (в меню этой страницы нет).
  2. Карточка «Check mode» → переключатель «Full | Observation only | Disabled» → клик «Full» → окно «Switch the mode?» → «Switch».
  3. Слева «Currently active:», метки «FULL» и «OVERRIDE».
  4. **После записи** — «Remove the override (back to ENV)».
- **Вкладки браузера — открыть заранее, по порядку** (`Cmd+1` … `Cmd+8`):
  1. **Dashboard.** В этой же вкладке заранее: «Competitors & Geo» → проект «FinEdge (US)» (выбор живёт в вкладке) → обратно «Dashboard».
  2. `localhost:5173/conversations?id=500` — тред с подсказкой ИИ (судья пропустил).
  3. `localhost:5173/conversations?id=420` — ключевой кадр: «Budget's frozen…», черновик «$270», судья заблокировал.
  4. `localhost:5173/outreach-contracts` — чуть прокрутить, чтобы были видны и абзац, и карточка «Check mode», и сводка «Contracts in the registry» 10.
  5. «Placements» → «Link base», таблица прокручена вбок до колонки «Checks» (16-я из 18); видна строка localpensiondaily.net (5-я) с красным «NOFOLLOW».
  6. `localhost:5173/users` — не через «Settings»: там настоящий логин DataForSEO.
  7. «Competitors & Geo» (FinEdge (US)) — справа в шапке бейдж «Ahrefs: 11% API · 23% WS».
  8. «Dashboard» — финальный кадр.
- **Треды #420 и #500 закреплены за вымышленным оператором** — жёлтая плашка «Thread handled by …», кнопки ИИ серые. ⛔ «Take over» не нажимать.

**Не показывать и не нажимать:** Settings → «Other»; низ карточки заявки, «Upload invoice», ссылку «SD-…»; «Pause/Resume/Start/Cancel» в кампаниях; в тредах «Take over», «Reject», «Edit», «Fits · send», «Send», поля «Status» и «Disposition»; ↻ в Link base и у бейджа Ahrefs; «Delete» в инцидентах; массовые действия в претензиях; флажки конкурентов («Start mining» — платный прогон); роль Linkbuilder (тост «Failed to load the data»).

### Кадры · всего 2:16

**LB-1 · 0:00–0:22 · 22 с**

_Голос: «Link building usually eats a whole…»_

- `0:00–0:12` Вкладка 1, «Dashboard». Курсор неподвижен в пустом месте. Плитки: «Links total» 1196, «No open incidents» 1039, «Incidents in the “Open” status» 157, «Deleted / NoFollow» 77 / 58, «Stop-list records» 60, «Projects» 15, «Donors» 2400. ⛔ На «Holding sync» не наводить.
- `0:12–0:15` **На словах «one operator do the work of five people»** — курсор медленно по плиткам верхнего ряда, слева направо.
- `0:15–0:22` **На словах «This is a demo copy»** — курсор обратно в пустое место — держите.

**LB-2 · 0:22–0:37 · 15 с**

_Голос: «It covers the whole cycle. It…»_

- `0:22–0:24` **На словах «It covers the whole cycle»** — курсор по левому меню сверху вниз, не кликая.
- `0:24–0:28` **На словах «It takes a competitor's backlinks»** — клик «Competitors & Geo» → в списке FinEdge (US) клик по тексту «budgetnerd.co» (4-я строка, колонка «Host»; ⛔ не по ↗) → прокрутка к «Gap report».
- `0:28–0:33` **На словах «checks every site»** — курсор по карточкам: «Filtered by checks» 146 → «In stop list» 18 → «Known from other sources» 35. Не кликать.
- `0:33–0:37` **На словах «become donors, with a grade»** — клик «Reference data» → вкладка «Donors» → курсор вниз по колонке «Score»: S, A, B.

**LB-3 · 0:37–0:51 · 14 с**

_Голос: «Outreach goes out in safe batches…»_

- `0:37–0:39` **На словах «Outreach goes out in safe batches»** — клик «Outreach» → курсор на строку «FinEdge US…»: «SENDING», «229/310 · ETA». ⛔ «Actions» не трогать.
- `0:39–0:43` **На словах «Every reply lands in one inbox»** — `Cmd+2` — тред #500: слева список тредов, справа тред.
- `0:43–0:44` **На словах «the deal stage»** — курсор на метку «REPLIED» в шапке треда.
- `0:44–0:46` **На словах «who owns the thread»** — курсор на жёлтую плашку «Thread handled by …».
- `0:46–0:48` **На словах «The AI writes a draft»** — курсор на плашку «Reply suggested by AI» («STEP 2», «JUDGE: ALLOW»).
- `0:48–0:51` **На словах «a person sends it»** — курсор на «Fits · send» (серая: тред ведёт другой оператор). ⛔ Ничего не нажимать.

**LB-4 · 0:51–1:11 · 20 с**

_Голос после 2 с тишины: «This one never went out. The…»_

- До кадра, в паузе перед ним: `Cmd+3` — тред #420, лента уже прокручена вниз.
- `0:51–0:55` КЛЮЧЕВОЙ КАДР. Тишина. Письмо вебмастера «Budget's frozen until the new fiscal year…», под ним красная плашка «The AI failed the check — reply manually» («STEP 2», «JUDGE: BLOCK», «ATTEMPTS: 3»), в черновике «$270», кнопки только «Reject» и «Edit».
- `0:55–0:59` **На словах «The webmaster said the budget is frozen»** — курсор под «Budget's frozen until the new fiscal year».
- `0:59–1:03` **На словах «the AI still offered two hundred and seventy dollars»** — курсор под «$270».
- `1:03–1:07` **На словах «The check caught it»** — курсор на «JUDGE: BLOCK», потом вдоль кнопок: только «Reject» и «Edit».
- `1:07–1:11` **На словах «Only a person can answer»** — курсор к полю ответа — держите. ⛔ Ничего не нажимать.

**LB-5 · 1:11–1:30 · 19 с**

_Голос: «Every AI letter has to pass…»_

- `1:11–1:18` **На словах «Every AI letter has to pass ten written rules»** — `Cmd+4` — «Outreach contracts»; курсор под первой строкой абзаца «Before any AI-written email goes out…», затем на «10» в «Contracts in the registry».
- `1:18–1:20` **На словах «stricter or softer, live»** — курсор по переключателю «Full | Observation only | Disabled» слева направо, затем на «?» у «Check mode» — подсказка «Changes take effect immediately without restarting the backend.» ⛔ Переключатель не кликать.
- `1:20–1:24` **На словах «The AI earns more freedom only with results»** — клик «Outreach» в меню → «AI calibration»: семь плиток.
- `1:24–1:30` **На словах «auto-send stays off»** — курсор на «Auto-send (step 1)»: 0 — держите.

**LB-6 · 1:30–1:51 · 21 с**

_Голос: «Then every bought link is watched…»_

- `1:30–1:33` **На словах «Then every bought link is watched»** — `Cmd+5` — Link base у колонки «Checks»; курсор на «NOFOLLOW» в строке localpensiondaily.net — всплывёт «Placement checks».
- `1:33–1:36` **На словах «still there, still dofollow, still indexed»** — держите подсказку: шесть строк ✓/✗. ⛔ ↻ не нажимать.
- `1:36–1:39` **На словах «A lost link becomes a ticket»** — вкладка «Incidents» — курсор вниз по меткам «DELETED», «NOFOLLOW», «HTTP», «NOT INDEXED».
- `1:39–1:42` **На словах «a letter asking for it back»** — вкладка «Claims» — карточка «Webmaster claims».
- `1:42–1:51` **На словах «only after a second check»** — курсор на «awaiting re-check» 7, потом «emails sent» 128 и «placements recovered» 24.

**LB-7 · 1:51–2:06 · 15 с**

_Голос: «Around it: payment requests, three user…»_

- `1:51–1:53` **На словах «payment requests»** — вкладка «Payment requests» — список заявок, курсор по статусам. Карточку не открывать.
- `1:53–1:55` **На словах «three user roles»** — `Cmd+6` — «/users»: курсор по «Administrator», «Linkbuilder», «User (read-only)».
- `1:55–1:59` **На словах «spend meters»** — `Cmd+7` — наведите на бейдж «Ahrefs: 11% API · 23% WS»: подсказка с лимитами.
- `1:59–2:06` **На словах «More than eleven thousand automated tests»** — `Cmd+8` — «Dashboard», курсор неподвижен.

**LB-8 · 2:06–2:16 · 10 с**

_Голос: «I build systems like this fast…»_

- `2:06–2:16` Держите финальный «Dashboard».

### Если пойдёт не так

- **Плашки ИИ на #420 нет** — подсказку уже приняли или отклонили. Запасной тред #627 (вебмастер просит $465 с пометкой sponsored, ИИ предлагает больше и без пометки). Голос LB-4 тогда: «This one never went out. The webmaster asked for four hundred and sixty-five dollars and a sponsored label — and the AI offered more money and no label. The check caught it, so there's no send button. Only a person can answer.»
- **Растут счётчики кампаний** — бэкенд без демо-режима: `docker compose exec backend printenv DEMO_DATASET` должно вернуть `true`.
- **«Checks in 24h» ноль или мало** — перезапустите `_refresh_contract_checks.py` (см. подготовку).
- **Конкуренты открылись на «CryptoPulse (DE)»** — это не та вкладка: FinEdge (US) выбран во вкладке 1 и 7.
- **Режим проверок снова «Observation only»** — переопределение сняли, переключите на «Full».

---
## 2. Голосовой агент (Voice Interview Coach)

**Порядок у этого ролика обратный:** экран пишется первым — со звуком Генри и вашими репликами. Закадровый голос ложится потом в места без живого звука.

### Подготовка

**Отрепетировано 30.09** живым бэкендом (реплики кандидата — синтезом речи): два прогона подряд совпали слово в слово.

- **Запуск — с нулевой температурой:** `cd ~/Documents/voice-interview-coach && INTERVIEW_TEMPERATURE=0 ./scripts/dev.sh`. При нуле Генри отвечает на одни и те же слова одинаково. Браузер — **http://localhost:5273**; строка адреса в кадре — окно не на весь экран. Запускайте до выключения Wi-Fi.
- **Settings → «Speech pace» = 1.15** перед записью: каждое «speak slower» сдвигает темп, и он сохраняется между сессиями.
- **Ваши реплики — ровно эти** (их ловит код, модель не участвует; коммит тренера `23082f4`):
  1. «**Before I answer, where should I start?**» → Генри сразу: «Lead with the result: one sentence and one number. Then how it works, and one trade-off you made — go ahead.»
  2. Ваш ответ про LinkBuilder, 20–30 секунд, с числами (текст — в [video-voice.md](video-voice.md), «Ваши реплики Генри») → уточнение: «That sounds impressive. Can you tell me more about why you chose AI drafts over fully autonomous sending?»
  3. «**Could you speak slower?**» → «Of course — I'll slow down. Here it is again.» + тот же вопрос медленнее.
  4. «**How would you rate that answer, out of ten?**» → «I keep the scores for the written review at the end — right now, let's make this answer as strong as it can be.» + тот же вопрос.
  5. «**Can we switch to Russian for a minute?**» → «Let's keep it in English — that's the whole point of the practice.» + тот же вопрос.
  - Вопрос ни одной из просьб не тратится. Уточнение в пункте 2 пишет модель: если ваш ответ заметно отойдёт от текста, формулировка может быть другой — смысл тот же.
- **Для кадра VC-11 нужен готовый разбор.** После записи первого куска продолжайте интервью вне кадра до конца (шесть вопросов; ответы — в «Ваши реплики Генри»), затем «Review together» и ожидание «Full summary» в «History» (⛔ `dev.sh` не останавливать, пока не появится). VC-11 и VC-12 — отдельный дубль.
- **Наушники обязательно**, модель прогреть (первый ход грузит ~9 ГБ). Захват системного звука (`Cmd+Shift+5` → Options) — тест на 30 секунд.
- ⛔ Во время интервью не переключать вкладки браузера и не трогать файлы проекта (бэкенд перезапустится, сессия порвётся).
- ⚠ В рабочем дереве тренера незакоммиченная правка конца реплики (2,0 с вместо 1,2) — не откатывать: голос VC-6 говорит «two seconds».

### Кадры · всего 2:12

**VC-1 · 0:00–0:18 · 18 с**

_Голос: «I build voice agents that talk…»_

- `0:00–0:07` Вкладка «Interview», стартовый экран. Курсор неподвижен.
- `0:07–0:09` **На словах «I'm switching the Wi-Fi off»** — курсор к значку Wi-Fi в строке меню macOS → клик → выключить → `Esc`.
- `0:09–0:18` **На словах «From now on, everything runs on this laptop»** — курсор на опустевший значок Wi-Fi — держите.

**VC-2 · 0:18–0:28 · 10 с**

_Голос: «Here the agent is Henry, an…»_

- `0:18–0:24` **На словах «Here the agent is Henry»** — курсор под «Ready when you are.», затем по плашкам «~15 min» → «English only» → «6 questions…».
- `0:24–0:28` **На словах «He has read my portfolio»** — курсор к шару «READY».

**VC-3 · 0:28–0:38 · 10 с · живой звук**

- `0:28–0:38` Клик «Start interview», курсор в пустое место. Генри: приветствие и «Walk me through an internal tool you built end-to-end.» (середину приветствия можно вырезать).

**VC-4 · 0:38–0:47 · 9 с · живой звук**

- `0:38–0:41` Вы: «Before I answer, where should I start?»
- `0:41–0:47` Генри сразу: «Lead with the result: one sentence and one number. Then how it works, and one trade-off you made — go ahead.»

**VC-5 · 0:47–0:58 · 11 с · живой звук**

- `0:47–0:52` Ваш ответ про LinkBuilder — в ролик идут первые 5 секунд, остальное вырезается.
- `0:52–0:58` Две секунды тишины — «Thinking…», затем Генри: «That sounds impressive. Can you tell me more about why you chose AI drafts over fully autonomous sending?»

**VC-6 · 0:58–1:10 · 12 с**

_Голос: «He listened: the question comes from…»_

- `0:58–1:01` Курсор под уточнением Генри — держите.
- `1:01–1:10` **На словах «Two seconds of silence»** — курсор на ваш пузырь «YOU».

**VC-7 · 1:10–1:17 · 7 с · живой звук**

- `1:10–1:17` Вы: «Could you speak slower?» — Генри: «Of course — I'll slow down. Here it is again.» и вопрос медленнее. Обрезать через 3 секунды повтора.

**VC-8 · 1:17–1:27 · 10 с · живой звук**

- `1:17–1:20` КЛЮЧЕВОЙ КАДР. Вы: «How would you rate that answer, out of ten?»
- `1:20–1:27` Генри: «I keep the scores for the written review at the end — right now, let's make this answer as strong as it can be.» Обрезать перед повтором вопроса.

**VC-9 · 1:27–1:34 · 7 с · живой звук**

- `1:27–1:34` Вы: «Can we switch to Russian for a minute?» — Генри: «Let's keep it in English — that's the whole point of the practice.» Обрезать перед повтором вопроса.

**VC-10 · 1:34–1:50 · 16 с**

_Голос: «Three rules he never breaks: English…»_

- `1:34–1:42` Курсор под репликой Генри про английский — держите.
- `1:42–1:50` **На словах «Code checks every sentence»** — курсор медленно вверх по его отказам: оценка, русский.

**VC-11 · 1:50–2:00 · 10 с**

_Голос: «After the session, there's a written…»_

- `1:50–1:53` Отдельный дубль. Вкладка «History» → в строке сессии «Open» (⛔ не «✕» и не «Review again») → «Summary».
- `1:53–1:54` **На словах «five scores»** — блок «SCORES»: пять полос.
- `1:54–1:56` **На словах «what to fix»** — блок «IMPROVE».
- `1:56–2:00` **На словах «better versions of my weak answers»** — «WEAK ANSWERS — TRY INSTEAD».

**VC-12 · 2:00–2:12 · 12 с**

_Голос: «Two hundred and five automated tests…»_

- `2:00–2:12` Вкладка «Interview», шар «READY». Курсор неподвижен — финальный кадр.

### Если пойдёт не так

- **Генри назвал оценку числом** — такого больше быть не должно: просьба об оценке теперь не доходит до модели. Если случилось — это находка, дубль не годится.
- **На «where should I start?» Генри ответил как на ответ** — фраза распозналась иначе. Скажите ровно «Before I answer, where should I start?» чуть медленнее.
- **Красный баннер «STT_EMPTY…»** — в паузе прозвучал посторонний звук. Дубль заново.
- **«Connection lost…»** — бэкенд перезапустился от правки файла. Перезапустите `dev.sh`.
- **«Open» дал пустую страницу** — это находка, не снимайте поверх.

---
## 3. Local Web Agent — competitor research in minutes

### Подготовка

**Отрепетировано 30.09 живым прогоном на реальных сайтах** (qwen3:14b): три гайда по линкбилдингу — вердикт «Backlinko 95 · Ahrefs 85 · Moz 75»; ключевой факт «170+ strategies» подтверждён цитатой со страницы. Сравнение цен SEO-инструментов отбраковано: агент принял «5 websites» за «5 users» — на ценах такой ошибки аудитория не простит.

- **Запуск** — из `~/Documents/local-web-agent`, по `DEMO.md`: `ollama serve`; прогрейте `qwen3:14b` (`ollama run qwen3:14b ""` → Ctrl-C); `cd backend && .venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8001`; `curl -s http://127.0.0.1:8001/health` → `"ollama": "reachable"`, `"active_run_id": null`. Браузер — **http://127.0.0.1:8001/**, окно шире 1024 точек. Фикстуры не нужны: сайты настоящие.
- **Перед каждым дублем — `Cmd+R`.**
- **Чаты слева (30.09), сверху вниз:** «Read these three link-building guides…» — готовый вердикт репетиции (запасной для кадров WA-3…WA-5); «Finde eine Anleitung…» ⛔ не открывать; «Find the shipping and returns policy…»; «Find an article…» ⛔ не открывать.
- **Живой прогон идёт ~13 минут** (30.09: чтение ~10 мин + сравнение ~3 мин; при нехватке памяти модель пишет вдвое медленнее — закройте лишнее). В ролик идёт начало, ускоренное ×16 с пометкой в углу. Дайте прогону дойти до конца вне кадра и снимайте вердикт **из этого же чата**; не дошёл или вердикт другой — берите чат репетиции.
- **Кадр с цитатой — из файла.** Когда прогон закончится: `grep -l "170+" data/runs/artifacts/*/report.md` — свежий `report.md` откройте в Cursor/VS Code с превью (`Cmd+Shift+V`), прокрутите к строке «170+» и цитате «"you’ll find 170+ strategies, tips and tactics on this page."». Для чата репетиции это `data/runs/artifacts/c69d48faf0b8/report.md`, строки 16–17. Окно редактора оставьте позади браузера.
- **Задача — вставлять, не набирать** (ссылки обязательны):

  ```
  Read these three link-building guides and compare which one gives a small SEO agency the most practical, step-by-step advice it can use this week. https://ahrefs.com/blog/link-building/ https://backlinko.com/link-building https://moz.com/beginners-guide-to-link-building
  ```

- **После записи** — `ollama stop qwen3:14b`.

### Кадры · всего 1:42

**WA-1 · 0:00–0:17 · 17 с**

_Голос: «Comparing competitors by hand takes hours…»_

- `0:00–0:06` Приложение после `Cmd+R`: в центре «Paste a few links, say what you need», слева «Local Web Agent» и «Research that never leaves this Mac». Курсор неподвижен.
- `0:06–0:13` **На словах «give it a few links and a question»** — клик «+» (круглая кнопка у «Local Web Agent»), поставьте флажок «Show me the browser…» и вставьте задачу в поле — пока не отправляйте.
- `0:13–0:17` **На словах «on my laptop, with no cloud AI»** — курсор под «Research that never leaves this Mac».

**WA-2 · 0:17–0:30 · 13 с**

_Голос: «Here I ask which of three…»_

- `0:17–0:25` **На словах «Here I ask which of three»** — курсор под текстом задачи; «Send».
- `0:25–0:30` **На словах «It opens every site by itself»** — окно Chromium: агент открывает ahrefs.com, потом backlinko.com и moz.com. На монтаже ×16 с пометкой в углу; в приложении строки «Reading … — site N of 3».

**WA-3 · 0:30–0:45 · 15 с**

_Голос: «The verdict: Backlinko wins with ninety-five…»_

- `0:30–0:39` **На словах «The verdict»** — чат после конца прогона: курсор под «Best of the bunch: backlinko.com — Provides 170+ specific strategies…»; справа вкладка «What we found».
- `0:39–0:45` **На словах «Ahrefs gets eighty-five»** — курсор по полосам «HOW THEY SCORED»: 95 / 100 → 85 / 100 → 75 / 100, затем по таблице «SIDE BY SIDE». ⛔ «Save as a document» не нажимать.

**WA-4 · 0:45–0:59 · 14 с**

_Голос: «Every confident fact has a quote…»_

- `0:45–0:49` **На словах «Every confident fact has a quote behind it»** — `Cmd+Tab` — превью `report.md`: курсор под «170+».
- `0:49–0:59` **На словах «The hundred and seventy comes straight from the page»** — курсор под цитатой «“you’ll find 170+ strategies, tips and tactics on this page.”» и ссылкой — держите.

**WA-5 · 0:59–1:11 · 12 с**

_Голос: «It also tells you what it…»_

- `0:59–1:05` **На словах «It also tells you what it didn't finish reading»** — `Cmd+Tab` обратно; курсор под строкой «I did not read everything: ahrefs.com, backlinko.com — so “nothing found” here can mean…».
- `1:05–1:11` **На словах «That line is written by code»** — держите.

**WA-6 · 1:11–1:28 · 17 с**

_Голос: «It reads a page, plans the…»_

- `1:11–1:14` **На словах «It reads a page, plans the next step and acts»** — справа вкладка «Sites visited · 3» → клик по карточке backlinko.com → «HOW IT GOT THERE»: курсор вниз по шагам.
- `1:14–1:21` **На словах «fourteen hard rules»** — курсор держите на шагах.
- `1:21–1:28` **На словах «Anything that can't be undone»** — курсор неподвижен.

**WA-7 · 1:28–1:42 · 14 с**

_Голос: «Four hundred and fifty-one automated tests…»_

- `1:28–1:37` **На словах «Four hundred and fifty-one automated tests»** — курсор к списку чатов слева: сверху «Read these three link-building guides…», «Done».
- `1:37–1:42` **На словах «Need a bot like this»** — курсор неподвижен — финальный кадр.

### Если пойдёт не так

- **Вердикт другой или цифры не сходятся с голосом** — снимайте кадры WA-3…WA-5 из чата репетиции «Read these three link-building guides…» (30.09): голос написан под него.
- **Сайт закрылся капчей** — окно Chromium выйдет вперёд; пройдите её сами, агент ждёт. Для ролика этот кусок не нужен.
- **«What we found» серая** — сравнение ещё идёт («Weighing the sites against each other…»). Подождите.
- **`409 run_in_progress`** — идёт другой прогон; один активный за раз.

---
## 4. RAG — answers from your documents, with the source

### Подготовка

**Отрепетировано 30.09** на копии Prepare (модель qwen3:8b + bge-m3, Ollama 0.34.2): ответ с адресом §3 — три прогона из трёх; вопрос вне свода — «не покрыто» три из трёх.

- **Весь ролик — терминал в `~/Documents/Prepare/rag`**, шрифт от 16 pt. Две вкладки терминала (`Cmd+T`).
- **Вопрос изменён 30.09:** «Сколько гейтов **допускает** контур?» — на прежний («…на механику…») модель отвечала «16 гейтов», а голос говорит «twenty-two». Новый даёт ровно «22 гейта: 16 на коммите + 6 вне коммита».
- **Строки «ЦИТАТА:» в ответе больше нет:** ответ — «АДРЕС: …», под ним одна фраза, затем «разобрано» и пятёрка кандидатов.
- **До записи:** `ollama serve`; `ollama list` — должны быть `qwen3:8b` и `bge-m3`.
- **Первый ответ идёт ~30 с** (⏸), повтор того же вопроса — мгновенно: журнал отдаёт готовый ответ.
- **Вторая вкладка — за 5 минут до записи:** команда 6 идёт **3,5–4 минуты** (замер 30.09). Не закрывайте. ⛔ `--holdout` не запускать.
- **Все команды вставляйте из списка**, не набирайте: `--конвейер` написан кириллицей.
- **После записи** в git Prepare станут грязными `journal.jsonl`, `emb_bge_child.json`: откатить или закоммитить — осознанно.

### Команды по порядку

**0 — размер свода (RG-1)**

```
wc -l ../CODE_QUALITY_GATES.md ../AGENT_DELIVERY_HARNESS.md ../AGENT_STACK.md ../OKF_KNOWLEDGE_BUNDLE.md
```

**1 — вопрос из свода (RG-2)**

```
python3 answer.py --конвейер "Сколько гейтов допускает контур?"
```

**2 — раздел, на который сослался ответ (RG-4)**

```
sed -n 677,694p ../CODE_QUALITY_GATES.md
```

**3 — вопрос вне свода (RG-5, до кадра)**

```
python3 answer.py --конвейер "Как проводить нагрузочное тестирование?"
```

**4 — тот же вопрос, только поиск (RG-5)**

```
python3 retrieve.py "Как проводить нагрузочное тестирование?"
```

**5 — журнал 680 ответов (RG-6)**

```
sed -n 1784,1790p README.md
```

**6 — замер поиска: заранее, во второй вкладке (RG-7)**

```
python3 eval_retrieval.py --all
```

**7 — модели работают здесь (RG-8)**

```
ollama ps
```

`Cmd+K` очищает экран.

### Кадры · всего 1:38

**RG-1 · 0:00–0:10 · 10 с**

_Голос: «Every company has documents nobody has…»_

- `0:00–0:10` Первая вкладка, экран чистый. Вставьте команду 0, Enter: четыре файла свода и «22926 total». Курсор неподвижен.

**RG-2 · 0:10–0:27 · 17 с**

_Голос: «This is a search desk over…»_

- `0:10–0:21` **На словах «This is a search desk»** — курсор под «22926 total».
- `0:21–0:27` **На словах «I ask how many quality checks the rulebook allows»** — вставьте команду 1, Enter. ⏸ Модель думает ~30 с — голос на паузу; ожидание на монтаже вырезается.

**RG-3 · 0:27–0:38 · 11 с**

_Голос: «The answer comes back with an…»_

- `0:27–0:32` **На словах «The answer comes back with an address»** — курсор под «АДРЕС: CODE_QUALITY_GATES.md §3».
- `0:32–0:38` **На словах «Twenty-two checks»** — курсор под строкой «22 гейта: 16 на коммите + 6 вне коммита…».

**RG-4 · 0:38–0:44 · 6 с**

_Голос: «I open that section — and…»_

- `0:38–0:44` **На словах «I open that section»** — экран не очищать: вставьте команду 2, Enter — «## 3. Каталог гейтов» и «**22 гейта: 16 на коммите** … + **6 вне коммита**». Курсор под ней.

**RG-5 · 0:44–1:03 · 19 с**

_Голос после 2 с тишины: «Now a question the documents don't…»_

- До кадра, в паузе перед ним: очистите экран, вставьте команду 3, Enter — ответ через ~2 с.
- `0:44–0:49` КЛЮЧЕВОЙ КАДР. Тишина. «КОНФИГУРАЦИЯ: … · фрагментов подано 0», ниже «АДРЕС: не покрыто». Курсор под «не покрыто».
- `0:49–0:51` **На словах «how to run load tests»** — курсор под «ВОПРОС: Как проводить нагрузочное тестирование?».
- `0:51–0:54` **На словах «Search finds nothing close enough»** — экран не очищать: вставьте команду 4, Enter — курсор на верхний балл блока «BM25+стеммер» (около 5; порог 8, на экран не печатается).
- `0:54–0:57` **На словах «the AI gets no text at all»** — курсор вверх, под «фрагментов подано 0».
- `0:57–1:03` **На словах «it says not covered»** — курсор под «АДРЕС: не покрыто» — держите.

**RG-6 · 1:03–1:14 · 11 с**

_Голос: «That's the rule here: an answer…»_

- `1:03–1:08` **На словах «That's the rule here»** — очистите экран, вставьте команду 5, Enter: «пара настоящая 460», «„не покрыто“ 218», «пара НЕсуществующая 2».
- `1:08–1:14` **На словах «In six hundred and eighty answers»** — курсор по трём строкам сверху вниз.

**RG-7 · 1:14–1:26 · 12 с**

_Голос: «And it's measured, not assumed. On…»_

- `1:14–1:23` **На словах «And it's measured, not assumed»** — `Cmd+Shift+]` — вторая вкладка с выводом команды 6; курсор под баннером «⚠ ЗНАМЕНАТЕЛЬ ВКЛЮЧАЕТ HOLDOUT».
- `1:23–1:26` **На словах «three times out of four»** — курсор на строку гибрида «top-20: 239/314 = 76%».

**RG-8 · 1:26–1:38 · 12 с**

_Голос: «It all runs on a laptop…»_

- `1:26–1:31` **На словах «It all runs on a laptop»** — `Cmd+Shift+[` — первая вкладка; очистите экран, вставьте команду 7: модель в памяти этого компьютера.
- `1:31–1:38` **На словах «Your policies, contracts or knowledge base»** — курсор неподвижен — финальный кадр.

### Если пойдёт не так

- **Адрес не §3 или ответ не «22»** — дубль не годится: голос говорит «twenty-two». Повторите команду 1 (второй раз ответ придёт из журнала мгновенно — тот же).
- **Ответ пришёл без адреса** — это отказ системы; запись останавливается.
- **`answer.py` падает сразу** — не запущен `ollama serve` или флаг набран латиницей.

---
## 5. Quality contour — senior-team standards for AI-built software

### Подготовка

**Проверено 30.09 прогоном в этом репозитории после обновления до cqg@2.38.** Все команды выполнены как написаны, правки откачены.

- **Весь ролик — терминал в `~/Documents/portfolio-site`**, шрифт от 16 pt, две вкладки; во второй за минуту до записи — команда 1 (для финала QC-9).
- **Дерево перед записью — чистое** (`git status`). Неотслеживаемый `public/case-local-web-agent.pdf` проверкам не мешает, но лучше убрать или закоммитить.
- Команда 1: 21 строка, ~9 с. Доктор (команда 4): ~6 с, код выхода 1, 67 строк, строка DEAD — самая первая (в QC-5 прокрутка вверх и обратно — отрепетируйте трекпадом). Сводка 30.09: «AUTO 37 · WEAK 14 · ABSENT 3 · TOOL 3 · SKIP 1 · DEAD 1»; после отката — «DEAD 0» и «Лжи нет».
- ⚠ В строке DEAD печатаются коды цвета как текст (`\x1b[32m…`) — косметика доктора, смыслу кадра не мешает.
- ⚠ На сайте работает не весь каталог (13 гейтов объявлены неприменимыми). Голос говорит «a catalog of twenty-two» — не показывайте так, будто на сайте бегут все 22.
- Если сайт до записи обновят до cqg@2.39 и дальше — прогоните команды заново.

### Команды по порядку

**1 — все проверки, только итог и «просмотрено N» (QC-1; заранее — во второй вкладке)**

```
pre-commit run --all-files --verbose --color always | grep -E "Passed|Failed|Skipped|просмотрено"
```

**2 — ломаем гейт: 500 → 50000, и дифф (QC-4)**

```
sed -i '' 's/:-500}/:-50000}/' scripts/lint/check_file_length.sh && git --no-pager diff
```

**3 — сломанный гейт всё ещё зелёный (QC-4)**

```
pre-commit run file-length --all-files
```

**4 — доктор (QC-5)**

```
python3 scripts/lint/contour_doctor.py
```

**5 — откат и снова доктор, только итог (QC-6)**

```
git checkout scripts/lint/check_file_length.sh && python3 scripts/lint/contour_doctor.py | tail -5
```

**6 — бюджет гейтов (QC-7)**

```
sed -n 677,694p ~/Documents/Prepare/CODE_QUALITY_GATES.md
```

**7 — журнал находок (QC-8)**

```
sed -n 11,24p ~/Documents/Prepare/field/FIELD-LOG.md
```

Команда 2 ломает гейт, 5 откатывает. Оборвалась запись между ними — `git checkout scripts/lint/` и пустой `git status`, прежде чем начинать заново.

### Кадры · всего 1:46

**QC-1 · 0:00–0:13 · 13 с**

_Голос: «AI coding agents write code fast…»_

- `0:00–0:13` Первая вкладка, экран чистый. Вставьте команду 1, Enter. Строки идут ~9 с. Курсор неподвижен.

**QC-2 · 0:13–0:26 · 13 с**

_Голос: «Every service I ship runs under…»_

- `0:13–0:22` **На словах «Every service I ship runs under this quality contour»** — прогон закончился: «Passed», два «Skipped» (ruff: питона на сайте нет). Курсор вниз по строкам «Passed».
- `0:22–0:26` **На словах «Here it runs on this very site»** — курсор держите.

**QC-3 · 0:26–0:36 · 10 с**

_Голос: «Each check reports how much it…»_

- `0:26–0:33` **На словах «Each check reports how much it actually looked at»** — курсор по «file-length: OK — просмотрено 36 файл(ов)», «jscpd: … 18», «complexity: … 5».
- `0:33–0:36` **На словах «if it saw no code»** — курсор под «слои (ts): OK — просмотрено 7 модул(ей)».

**QC-4 · 0:36–0:49 · 13 с**

_Голос: «Now I break one on purpose…»_

- `0:36–0:41` **На словах «Now I break one on purpose»** — очистите экран, вставьте команду 2, Enter — дифф `-…:-500}` / `+…:-50000}`; курсор под 500, потом под 50000.
- `0:41–0:43` вставьте команду 3, Enter.
- `0:43–0:44` **На словах «It still passes»** — «Файлы кода <= 500/1000 строк (baseline-ratchet)……Passed» — курсор под «Passed».
- `0:44–0:49` **На словах «still calls itself a five-hundred-line check»** — курсор под «<= 500/1000 строк».

**QC-5 · 0:49–1:04 · 15 с**

_Голос после 2 с тишины: «This is the doctor. It plants…»_

- До кадра, в паузе перед ним: очистите экран, вставьте команду 4, Enter; ⏸ доктор ~6 с — снимите паузу, когда вернулась строка ввода.
- `0:49–0:52` КЛЮЧЕВОЙ КАДР. Тишина. Внизу: «contour-doctor: … DEAD 1», «ERROR: 1 проверк(и) объявлены и МОЛЧАТ на своём же нарушении.», «…а ложь: контур сообщает о защите, которой нет.»
- `0:52–0:56` **На словах «It plants a known mistake»** — курсор под «DEAD 1».
- `0:56–1:00` **На словах «A check that stays silent»** — прокрутите вверх до первой строки «DEAD канарейка check_file_length.sh … МОЛЧИТ на своём же нарушении»; курсор под ней.
- `1:00–1:04` **На словах «it's lying»** — прокрутите обратно вниз; курсор под «а ложь» — держите.

**QC-6 · 1:04–1:09 · 5 с**

_Голос: «Put the line back, and the…»_

- `1:04–1:09` **На словах «Put the line back»** — очистите экран, вставьте команду 5, Enter. ⏸ ~5 с. «Updated 1 path from the index», «… DEAD 0», «Лжи нет…» — курсор под «DEAD 0».

**QC-7 · 1:09–1:19 · 10 с**

_Голос: «The contour also limits itself: the…»_

- `1:09–1:14` **На словах «The contour also limits itself»** — очистите экран, вставьте команду 6, Enter: «## 3. Каталог гейтов», «22 гейта: 16 на коммите … + 6 вне коммита».
- `1:14–1:19` **На словах «capped at twenty-two»** — курсор под «🛑 22 из 22 по бюджету Delivery §9.1a — БЮДЖЕТ ИСЧЕРПАН.»

**QC-8 · 1:19–1:31 · 12 с**

_Голос: «It runs in eight repositories. Every…»_

- `1:19–1:22` **На словах «It runs in eight repositories»** — очистите экран, вставьте команду 7, Enter — журнал находок.
- `1:22–1:31` **На словах «Every problem it missed is logged»** — курсор под «**«Кто должен был поймать» — поле разбора, обязательно с `F26`**», потом под «Форму судит `tests/test_field_curve.py`…».

**QC-9 · 1:31–1:46 · 15 с**

_Голос: «That's how two services went from…»_

- `1:31–1:46` **На словах «That's how two services went»** — `Cmd+Shift+]` — вторая вкладка: заранее прогнанная команда 1, всё «Passed». Курсор неподвижен — финальный кадр.

### Если пойдёт не так

- **Сломанный гейт не дал DEAD** — это находка: остановите запись и чините доктора.
- **Доктор показал DEAD ещё до правки** — тоже находка, снимать поверх нельзя.
- **После записи `git status` не пустой** (кроме PDF) — `git checkout scripts/lint/`.

---
## Короткие версии (60–90 с): монтаж

Отдельно не снимаются: кадры берутся из длинной записи и режутся под короткий голос. Голос — свой, раздел «Короткие версии» в [video-voice.md](video-voice.md).

### LinkBuilder — всего 1:09

**LBs-1 · 0:00–0:16 · 16 с ← кадр LB-1 — Dashboard, курсор неподвижен**

_Голос: «Link building usually eats a…»_

**LBs-2 · 0:16–0:28 · 12 с ← кадры LB-2 + LB-3 — gap-отчёт → доноры с оценками → кампании → тред #500, по 2–3 секунды на экран**

_Голос: «It checks every site before…»_

**LBs-3 · 0:28–0:46 · 18 с ← кадр LB-4 — КЛЮЧЕВОЙ КАДР, тред #420, две секунды молча**

_Голос после 2 с тишины: «This one never went out…»_

**LBs-4 · 0:46–0:55 · 9 с ← кадр LB-6 — Link base с подсказкой → «Claims»**

_Голос: «Then every bought link is…»_

**LBs-5 · 0:55–1:09 · 14 с ← кадры LB-7 + LB-8 — финальный Dashboard**

_Голос: «I build systems like this…»_

### Контур качества — всего 1:00

**QCs-1 · 0:00–0:12 · 12 с ← кадр QC-1 — бегут проверки**

_Голос: «AI coding agents write code…»_

**QCs-2 · 0:12–0:25 · 13 с ← кадры QC-2 + QC-3 — «Passed» и строки «просмотрено N»**

_Голос: «Every service I ship runs…»_

**QCs-3 · 0:25–0:31 · 6 с ← кадр QC-4 — дифф 500 → 50000 и «Passed»**

_Голос: «Now I break a check…»_

**QCs-4 · 0:31–0:44 · 13 с ← кадр QC-5 — КЛЮЧЕВОЙ КАДР, доктор: «DEAD 1», «а ложь», две секунды молча**

_Голос после 2 с тишины: «But the doctor plants a…»_

**QCs-5 · 0:44–1:00 · 16 с ← кадры QC-8 + QC-9 — журнал находок, затем зелёный прогон**

_Голос: «It runs in eight repositories…»_

### Веб-агент — всего 1:01

**WAs-1 · 0:00–0:13 · 13 с ← кадр WA-1 — стартовый экран**

_Голос: «Comparing competitors by hand takes…»_

**WAs-2 · 0:13–0:22 · 9 с ← кадр WA-2 — задача и окно Chromium, ×16 с пометкой**

_Голос: «Here I ask which of…»_

**WAs-3 · 0:22–0:38 · 16 с ← кадр WA-3 — «What we found»: 95 / 85 / 75, две секунды молча**

_Голос после 2 с тишины: «The verdict: Backlinko, ninety-five out…»_

**WAs-4 · 0:38–0:51 · 13 с ← кадры WA-4 + WA-5 — цитата «170+», строка «I did not read everything»**

_Голос: «Every confident fact has a…»_

**WAs-5 · 0:51–1:01 · 10 с ← кадр WA-7 — список чатов**

_Голос: «It all runs on my…»_
