# Ролики: голос

Голос пишется **первым** (кроме тренера — там после экрана, в оставленную тишину). Закадровый голос, **по-английски**, — **один заход с паузами** на ролик; перед первым блоком — 2 секунды тишины. Читаете блоки по порядку; «тишина» перед блоком и «пауза» после — держите по секундомеру. Шкала общая с [video-screen.md](video-screen.md), поэтому дорожка кладётся на видео с 0:00. Разъехалось — растяните или сократите паузу, речь не режете. Сбились в блоке — пауза 3 секунды и прочитайте блок заново: лишний дубль вырежется по паузе.

**Темп — 130 слов в минуту** (≈2,2 слова в секунду): средний спокойный темп дикторского английского; под него посчитана каждая длина. Тренировка: читайте блок под секундомер и укладывайтесь в «говорите ~N с» ±1 с. Быстрее — делайте паузы между фразами, медленнее — сокращайте их, но не слова. Реплики разговорные, с сокращениями (it's, doesn't); споткнулись — говорите полную форму. Числа записаны так, как произносятся. **Цифры и формулировки контрактов — слово в слово.**

**Произношение:** LLM — «эл-эл-эм», BM25 — «би-эм твенти-файв», nDCG — «эн-ди-си-джи», dofollow — «ду-фоллоу», RAG — «рэг».

---

## 0. Кружок о себе — ~35 секунд · всего 0:39

**Один живой дубль в камеру** — голос пишется вместе с видео.

**C-1 · 0:00–0:13** — говорите ~12 с → пауза 1 с

> I build LLM systems that keep working when the model is wrong. Not demos that work once — products with rules the model can't break.

**C-2 · 0:13–0:26** — говорите ~12 с → пауза 1 с

> The pattern is the same every time. The model proposes. A check decides. And a person confirms anything that costs money or can't be undone.

**C-3 · 0:26–0:39** — говорите ~12 с → пауза 1 с

> Below are five of them, two minutes each. In every video, watch for the moment the system says no. That moment is the work.

---

## 1. LinkBuilder — 97.9% delivery · всего 2:22 (концовки по желанию: с LB-8 — 2:32; с LB-9 — 2:29; лимит 2:30 — не больше одной)

**LB-1 · 0:00–0:19** — говорите ~18 с → пауза 1 с

> This is LinkBuilder — a link-building CRM I designed and built with AI coding agents. In production, one operator did the work of a team of five. It's a demo copy; the sites and people are invented.

**LB-2 · 0:19–0:37** — говорите ~17 с → пауза 1 с

> It covers the whole cycle, starting with competitors: their backlinks come in, and every new site goes through a chain of quality gates — stop list, traffic, spam, editorial fit. What passes becomes a donor.

**LB-3 · 0:37–0:56** — говорите ~18 с → пауза 1 с

> Outreach goes out in throttled batches. Replies land in one inbox, where each thread shows the deal stage and its owner. The AI drafts an answer; a person sends it — or rejects it and has to say why.

**LB-4 · 0:56–1:18** — тишина 2 с (ключевой кадр) → говорите ~19 с → пауза 1 с

> This one never went out. The webmaster said the budget is frozen — and the AI still wrote that two hundred and seventy dollars works for us. The check blocked it, so there's no send button. Only a person can answer.

**LB-5 · 1:18–1:43** — говорите ~24 с → пауза 1 с

> Every AI letter answers to ten versioned contracts, and an admin can switch the checks to full, warn-only or off without a restart. The AI earns its autonomy by measurement, not trust: shadow runs on real mail score every draft, and auto-send stays off until the numbers clear the bar.

**LB-6 · 1:43–2:04** — говорите ~20 с → пауза 1 с

> Then every link is watched: still there, still dofollow, still indexed. A lost link becomes an incident, then a letter asking for it back — but only after a second check, because nearly one "dead" link in five turned out to be alive.

**LB-7 · 2:04–2:22** — говорите ~17 с → пауза 1 с

> Around it: payment requests through the service desk, three roles, spend meters, and Slack alerts before a balance runs dry. Eleven thousand backend tests, seven hundred on the front end, a hundred and thirty-seven migrations.

**LB-8 · 2:22–2:32 · по желанию** — говорите ~9 с → пауза 1 с

_Концовка по желанию (+8 секунд). С 28.09 «built on my own» из первой фразы убрано: код пишут ИИ-агенты под управлением владельца (слово владельца), и ролик говорит это сразу. Эта строка связывает CRM с роликом про контур:_

> Built by one engineer — with AI coding agents working inside the quality gates from the contour video.

**LB-9 · 2:32–2:39 · по желанию** — говорите ~6 с → пауза 1 с

_Ещё одна строка по желанию — если готовы отвечать за неё на интервью:_

⚠ Это единственное число ролика без источника в репозитории: ни 12 000, ни 97.9% там нет, а лимит кампании по умолчанию — 5 000 получателей, при заявленных на карточке 5 400.

> In production it sent over twelve thousand emails, with ninety-eight percent delivered.

### Цифры ролика

Пути — от `Linkbuilding Automatization P/` в каталоге CRM.

| Звучит                                | Значение                                                                  | Источник                                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| a team of five                        | со слов владельца                                                         | в репозитории нет; карточка, oneLiner                                                            |
| two hundred and seventy dollars       | тред #420 демо-базы                                                       | на экране                                                                                        |
| ten versioned contracts               | 10 YAML-контрактов                                                        | `backend/features/outreach_contracts/contracts/*.yml`; на экране «Contracts in the registry: 10» |
| full / warn-only / off … no restart   | full / warn-only / off, в Redis, только Admin; «off» гасит проверки, а не агента | `backend/features/outreach_contracts/runtime_mode.py:1-20`; ревью кода 28.09 |
| shadow runs … score every draft       | теневой прогон: 109 подсказок, каждая оценена (как есть / правка / отказ) | `docs/MASS_OUTREACH_AI_REPLY_CALIBRATION_DESIGN.md:16-40`                                        |
| auto-send stays off … clear the bar   | автоотправку включает человек флагом после replay; на экране «Auto-send (step 1): 0» | `config/mass_outreach.py:191-193`; `docs/MASS_OUTREACH_AI_REPLY_CALIBRATION_DESIGN.md` |
| nearly one "dead" link in five        | 159 живых из 865 «мёртвых»                                                | `docs/MONITORING_DEAD_PAGE_VERIFICATION_2026_08_19.md:22-25`                                     |
| eleven thousand backend tests         | 11 048 passed, прогон 22.09                                               | `delivery/active/decisions.md` этого репозитория, строка 2026-09-22                              |
| seven hundred on the front end        | 703 из 703                                                                | коммит CRM `021d9fa5`                                                                            |
| a hundred and thirty-seven migrations | 137 файлов                                                                | `backend/shared/database/migrations/versions/`                                                   |

---

## 2. Voice Interview Coach — ~3 s per turn · всего 2:22

**VC-1 · 0:00–0:12** — говорите ~11 с → пауза 1 с

> I'm switching the Wi-Fi off. Everything you'll hear from now on runs on this laptop: speech recognition, a fourteen-billion-parameter model, and the voice.

**VC-2 · 0:12–0:24** — говорите ~11 с → пауза 1 с

> This is Henry, a mock interviewer: fifteen minutes in English, six questions. He's read my portfolio, so we talk about my real projects.

**VC-3 · 0:24–0:34** — **тишина 10 с**: «Start interview». ГОЛОС ГЕНРИ, закадра нет: приветствие и первый вопрос, ~10 секунд (середину приветствия можно вырезать).

**VC-4 · 0:34–0:45** — **тишина 11 с**: Вы отвечаете: в ролик идут 5 секунд ответа, остальное вырезается. Шар «Listening», полоска микрофона «hearing you». Затем «Thinking…» и уточняющий вопрос Генри, ~6 секунд.

**VC-5 · 0:45–1:01** — говорите ~15 с → пауза 1 с

> Two seconds of silence tell it I've finished. His first word comes back about a second and a quarter later: he speaks sentence by sentence, while the model is still writing.

**VC-6 · 1:01–1:26** — тишина 11 с (ваш вопрос и живой ответ Генри) → говорите ~13 с → пауза 1 с

> He won't say. Grades are banned from the live talk: every sentence passes a contract before it's spoken — English only, no scores, three sentences at most.

**VC-7 · 1:26–1:45** — тишина 6 с (ваша просьба и живой повтор Генри) → говорите ~12 с → пауза 1 с

> That one never reaches the model. It's a command in code: he repeats his last line word for word, slower, and the question isn't spent.

**VC-8 · 1:45–1:57** — говорите ~11 с → пауза 1 с

> After the session there's a written review: five scores, what to fix, better versions of my weak answers, and new words to learn.

**VC-9 · 1:57–2:16** — говорите ~18 с → пауза 1 с

> It comes from a reasoning model that needed thirty-one to fifty-two seconds a turn — too slow for talking, fine for homework. The interview itself is code: if my technical answer has no numbers, Henry asks for them.

**VC-10 · 2:16–2:22** — говорите ~5 с → пауза 1 с

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

---

## 3. Local Web Agent — 451 tests · всего 2:16

**WA-1 · 0:00–0:21** — говорите ~20 с → пауза 1 с

> This is a research agent that lives on my laptop. I paste a few links and ask a question — it opens each site in a real browser and quotes where it found the answer. No cloud: every model runs right here.

**WA-2 · 0:21–0:40** — говорите ~18 с → пауза 1 с

> Here I asked it how clearly three electronics stores explain shipping and returns. It read all three, scored them against a rubric and picked a winner — at temperature zero, so the same pages always get the same scores.

**WA-3 · 0:40–0:57** — говорите ~16 с → пауза 1 с

> It also names its own limit: it didn't read all of one site. That sentence is written by code — when I asked the model to say it, it did about half the time.

**WA-4 · 0:57–1:18** — говорите ~20 с → пауза 1 с

> Every site shows how it got there, page by page. A confident fact needs a quote from the page — if the quote isn't really there, the fact is thrown out. And anything seen only on a screenshot never gets top confidence.

**WA-5 · 1:18–1:37** — говорите ~18 с → пауза 1 с

> Now live, on a local test shop, with the browser visible. It doesn't scrape with selectors: it looks at the page, plans and acts — and fourteen hard rules are checked in code before any action reaches the browser.

**WA-6 · 1:37–1:56** — тишина 2 с (ключевой кадр) → говорите ~16 с → пауза 1 с

> And here it stops. Paying can't be undone, so the agent prepares everything, and I press the button. Captchas work the same way — it waits for me. No anti-bot tricks, by design.

**WA-7 · 1:56–2:16** — говорите ~19 с → пауза 1 с

> Four hundred and fifty-one tests, over a hundred and forty runs in the log, twenty-seven real websites — and almost every recent test began as a failure on one of them. The code is open; the link is under the video.

### Цифры ролика

Пути — от `~/Documents/local-web-agent/`.

| Звучит                             | Значение                                           | Источник                                     |
| ---------------------------------- | -------------------------------------------------- | -------------------------------------------- |
| temperature zero                   | сравнение сайтов при t=0                           | `backend/app/config.py:47-52`                |
| about half the time                | модель выполнила инструкцию на одном сайте из двух | `knowledge/engineering/llm-canon.md:98`      |
| fourteen hard rules                | 9 инвариантов + 5 лимитов                          | `data/contracts/crawl.contract.yaml`         |
| four hundred and fifty-one tests   | 451 passed, 28.09 (python:3.14, чистый клон)       | CI `main`; `backend/.venv/bin/pytest -q`    |
| over a hundred and forty runs      | 143 прогона, 932 шага                              | `data/runs/app.db`                           |
| twenty-seven real websites         | 73 прогона на 27 реальных сайтах                   | `data/runs/app.db`                           |

---

## 4. RAG over a rulebook — 0 uncited answers · всего 2:15

**RG-1 · 0:00–0:17** — говорите ~16 с → пауза 1 с

> This is a search desk over my own engineering rulebook: four documents, about a hundred and ten thousand tokens. It's in Russian, so I'll translate. I'm asking how many quality gates the rulebook allows.

**RG-2 · 0:17–0:35** — говорите ~17 с → пауза 1 с

> The answer comes back with an address — file and section. Twenty-two gates: sixteen at commit, six outside. An address on every answer is the principle here — and I measure it instead of assuming it.

**RG-3 · 0:35–0:41** — говорите ~5 с → пауза 1 с

> I open that section — and it says exactly that.

**RG-4 · 0:41–1:06** — тишина 2 с (ключевой кадр) → говорите ~22 с → пауза 1 с

> Now something it doesn't cover: how to run load tests. Search finds nothing close enough, so not a single line of the rulebook reaches the model. And with an empty context, it answered "not covered" two hundred and ten times out of two hundred and ten.

**RG-5 · 1:06–1:21** — говорите ~14 с → пауза 1 с

> The limits sit above the strengths in the README. The gate mostly reacts to how long a question is, and exact file-and-section accuracy is fifty percent on an independent set.

**RG-6 · 1:21–1:37** — говорите ~15 с → пауза 1 с

> Retrieval is hand-written — BM25, fusion, parent documents, standard library only. Recall at twenty: seventy-six percent on three hundred and fourteen independent questions, and seventy-two on the eighty I held out.

**RG-7 · 1:37–1:51** — говорите ~13 с → пауза 1 с

> Every look at those eighty is logged. Three so far — and one is marked unsanctioned, because a design decision was made with them inside the numbers.

**RG-8 · 1:51–2:08** — говорите ~16 с → пауза 1 с

> And I checked the ruler itself on a public benchmark: nDCG at ten, zero point six six six, against a published zero point six six five. The predictions were written down before the run.

**RG-9 · 2:08–2:15** — говорите ~6 с → пауза 1 с

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

---

## 5. Quality contour — 22 gates, hard-capped · всего 2:14

**QC-1 · 0:00–0:15** — говорите ~14 с → пауза 1 с

> This is a quality contour: a rulebook plus gates that deploy into any repository. It exists because an AI coding agent will happily report green on something nobody checked.

**QC-2 · 0:15–0:29** — говорите ~13 с → пауза 1 с

> Here it runs on this very site. Every gate prints how much it actually looked at — because "no problems found" means nothing if it saw no code.

**QC-3 · 0:29–0:42** — говорите ~12 с → пауза 1 с

> Now I break a gate: one number, and a five-hundred-line limit becomes fifty thousand. It still passes — and still calls itself a five-hundred-line check.

**QC-4 · 0:42–1:04** — тишина 2 с (ключевой кадр) → говорите ~19 с → пауза 1 с

> This is the doctor. It feeds every gate a planted violation — a canary. A gate that's declared, wired in, and silent on its own canary isn't weak. It's lying — and that's the one thing that fails the run.

**QC-5 · 1:04–1:10** — говорите ~5 с → пауза 1 с

> Put the line back, and the lie is gone.

**QC-6 · 1:10–1:35** — говорите ~24 с → пауза 1 с

> The doctor has limits, too. For a month, one gate here misread its own tool: whenever there was a warning, it reported "zero modules checked" — and the doctor still rated it fine. Now a test replays that bug, so if an update brings it back, it goes red the same day.

**QC-7 · 1:35–1:51** — говорите ~15 с → пауза 1 с

> The rulebook limits itself. Twenty-two gates, and the budget is spent: a twenty-third gets in only by swapping one out. Old debt is frozen in a snapshot that can only shrink.

**QC-8 · 1:51–2:08** — говорите ~16 с → пауза 1 с

> It runs in seven repositories, and the field log holds twenty-five findings, each one classified. From the next one on, a test rejects any finding that doesn't name which check should have caught it.

**QC-9 · 2:08–2:14** — говорите ~5 с → пауза 1 с

> Nothing counts as done unless a mechanism can refuse it.

### Цифры ролика

| Звучит               | Значение                                                  | Источник                                                                                                  |
| -------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| for a month          | урок L6: два гейта месяц судили неверно при вердикте AUTO | `delivery/archive/INDEX.md:24`; `delivery/archive/2026-08-07-contour-bootstrap/observed.md:40-51`         |
| twenty-two gates     | 16 на коммите + 6 вне                                     | `~/Documents/Prepare/CODE_QUALITY_GATES.md:679-694`                                                       |
| seven repositories   | контур с доктором и хуками                                | portfolio-site, voice-interview-coach, local-web-agent, lash-try-on, Fake office, G connect, Ahrefs cases |
| twenty-five findings | F1–F25 по шести развёртываниям                            | `~/Documents/Prepare/field/FIELD-LOG.md`; `~/Documents/Prepare/CONTOUR-EN.md:99-109`                      |

---

## Короткие версии (60–90 с)

Для личных сообщений владельцам SEO-агентств. Свой голос, свои блоки.

### LinkBuilder — 175 слов · всего 1:31

**LBs-1 · 0:00–0:18** — говорите ~17 с → пауза 1 с

> This is LinkBuilder — a link-building CRM I designed and built with AI coding agents. In production, one operator did the work of a team of five. This is a demo copy; the data is invented.

**LBs-2 · 0:18–0:34** — говорите ~15 с → пауза 1 с

> It covers the whole cycle: competitors' backlinks come in, every site passes quality gates, outreach goes out in throttled batches, and replies land in one inbox where the AI drafts an answer.

**LBs-3 · 0:34–0:54** — тишина 2 с (ключевой кадр) → говорите ~17 с → пауза 1 с

> This one never went out. The webmaster said the budget is frozen — and the AI still wrote that two hundred and seventy dollars works for us. The check blocked it. Only a person can answer.

**LBs-4 · 0:54–1:04** — говорите ~9 с → пауза 1 с

> Every AI letter answers to ten versioned contracts, and auto-send stays off until the numbers clear the bar.

**LBs-5 · 1:04–1:22** — говорите ~17 с → пауза 1 с

> Then every link is watched — still there, still dofollow, still indexed. A lost link gets a second check before anyone asks for it back: nearly one "dead" link in five turned out to be alive.

**LBs-6 · 1:22–1:31** — говорите ~8 с → пауза 1 с

> Eleven thousand backend tests hold it together. If your team still does this by hand, message me.

### Local Web Agent — 160 слов · всего 1:25

**WAs-1 · 0:00–0:20** — говорите ~19 с → пауза 1 с

> This is a research agent that lives on my laptop. I paste links and ask a question — it opens each site in a real browser and quotes where it found the answer. No cloud: every model runs right here.

**WAs-2 · 0:20–0:37** — говорите ~16 с → пауза 1 с

> It also names its own limit: it didn't read all of one site. That sentence is written by code — when I asked the model to say it, it did about half the time.

**WAs-3 · 0:37–0:48** — говорите ~10 с → пауза 1 с

> A confident fact needs a quote from the page — if the quote isn't really there, the fact is thrown out.

**WAs-4 · 0:48–1:03** — говорите ~14 с → пауза 1 с

> Now live, with the browser visible. It looks at the page, plans and acts — and fourteen hard rules are checked in code before any action reaches the browser.

**WAs-5 · 1:03–1:15** — тишина 2 с (ключевой кадр) → говорите ~9 с → пауза 1 с

> And here it stops. Paying can't be undone, so the agent prepares everything, and I press the button.

**WAs-6 · 1:15–1:25** — говорите ~9 с → пауза 1 с

> Four hundred and fifty-one tests, twenty-seven real websites. The code is open; the link is under the video.

### Контур качества — 161 слово · всего 1:25

**QCs-1 · 0:00–0:15** — говорите ~14 с → пауза 1 с

> This is a quality contour: a rulebook plus gates that deploy into any repository. It exists because an AI coding agent will happily report green on something nobody checked.

**QCs-2 · 0:15–0:26** — говорите ~10 с → пауза 1 с

> Every gate prints how much it actually looked at — "no problems found" means nothing if it saw no code.

**QCs-3 · 0:26–0:35** — говорите ~8 с → пауза 1 с

> Now I break a gate: one number, and a five-hundred-line limit becomes fifty thousand. It still passes.

**QCs-4 · 0:35–0:52** — тишина 2 с (ключевой кадр) → говорите ~14 с → пауза 1 с

> This is the doctor. It feeds every gate a planted violation. A gate that stays silent on its own canary isn't weak — it's lying, and that fails the run.

**QCs-5 · 0:52–1:12** — говорите ~19 с → пауза 1 с

> Twenty-two gates, and the budget is spent: a new one gets in only by swapping one out. It runs in seven repositories, and the field log holds twenty-five findings — each must name the check that should have caught it.

**QCs-6 · 1:12–1:25** — говорите ~12 с → пауза 1 с

> That's how two services went from a bare spec to production in under three weeks. Nothing counts as done unless a mechanism can refuse it.

### Число, которого нет в длинных версиях

| Звучит            | Значение                                                                    | Источник                                                                                          |
| ----------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| under three weeks | два сервиса SEO-агентства, 10.09 → 24.09 (SEO-кейсы), 16.09 → 24.09 (outreach) | слово владельца 28.09; git `Ahrefs cases` (первый коммит 10.09, выкладка 24.09) и `Parsing and Outri` |

Сервисы под NDA агентства: в ролике — только срок, без названий, экранов и клиентов.

---
