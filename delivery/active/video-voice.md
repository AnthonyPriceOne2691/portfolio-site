# Ролики: голос

Голос пишется **первым** (кроме голосового агента — там после экрана, в места без живого звука). Закадровый голос **по-английски**, **один заход с паузами** на ролик; перед первым блоком — 2 секунды тишины. «Тишина» перед блоком и «пауза» после — по секундомеру. Шкала общая с [video-screen.md](video-screen.md): дорожка кладётся на видео с 0:00. Разъехалось — растяните или сократите паузу, речь не режете. Сбились в блоке — пауза 3 секунды и блок заново.

**30.09 голос переписан под заказчика** — руководителей и CPO SEO- и маркетинговых агентств, а заодно рекрутёров. Сначала выгода (сроки, люди, риск), потом доказательство на экране, в конце — что это даёт им. Никакого жаргона вроде BM25, nDCG, канареек и храповиков: техника — в PDF-брифах на сайте.

**Темп — 130 слов в минуту**, но длительность считана **по слогам** (3,2 слога в секунду): числа словами и аббревиатуры длиннее, чем кажутся по числу слов. Тренировка: блок под секундомер, укладывайтесь в «говорите ~N с» ±1 с. Реплики разговорные, короткими фразами; споткнулись на сокращении — говорите полную форму. **Цифры — слово в слово.**

**Произношение:** AI — «эй-ай», SEO — «эс-и-оу», dofollow — «ду-фоллоу», Wi-Fi — «вай-фай».

---

## 0. Кружок о себе · всего 0:38

**Один живой дубль в камеру** — голос пишется вместе с видео.

**C-1 · 0:00–0:12** — говорите ~11 с → пауза 1 с

> I build LLM systems that keep working when the model is wrong. Not demos that work once — products with rules the model can't break.

**C-2 · 0:12–0:26** — говорите ~13 с → пауза 1 с

> The pattern is the same every time. The model proposes. A check decides. And a person confirms anything that costs money or can't be undone.

**C-3 · 0:26–0:38** — говорите ~11 с → пауза 1 с

> Below are five of them, about two minutes each. In every video, watch for the moment the system says no. That moment is the work.

---

## 1. LinkBuilder — link building on autopilot · всего 2:16 · 266 слов

**LB-1 · 0:00–0:22** — говорите ~21 с → пауза 1 с

> Link building usually eats a whole team: finding sites, writing to webmasters, negotiating, paying, and checking the links. In production, this platform let one operator do the work of five people. This is a demo copy — the sites and people are invented.

**LB-2 · 0:22–0:37** — говорите ~14 с → пауза 1 с

> It covers the whole cycle. It takes a competitor's backlinks and checks every site — quality, traffic, spam, topic. The ones that pass become donors, with a grade.

**LB-3 · 0:37–0:51** — говорите ~13 с → пауза 1 с

> Outreach goes out in safe batches. Every reply lands in one inbox, where you see the deal stage and who owns the thread. The AI writes a draft; a person sends it.

**LB-4 · 0:51–1:11** — тишина 2 с (ключевой кадр) → говорите ~17 с → пауза 1 с

> This one never went out. The webmaster said the budget is frozen, and the AI still offered two hundred and seventy dollars. The check caught it, so there's no send button. Only a person can answer.

**LB-5 · 1:11–1:30** — говорите ~18 с → пауза 1 с

> Every AI letter has to pass ten written rules, and an admin can make the checks stricter or softer, live. The AI earns more freedom only with results: auto-send stays off until it proves itself on real mail.

**LB-6 · 1:30–1:51** — говорите ~20 с → пауза 1 с

> Then every bought link is watched: is it still there, still dofollow, still indexed? A lost link becomes a ticket, then a letter asking for it back — but only after a second check, because almost one dead link in five was actually alive.

**LB-7 · 1:51–2:06** — говорите ~14 с → пауза 1 с

> Around it: payment requests, three user roles, spend meters and alerts before a balance runs out. More than eleven thousand automated tests keep it all working.

**LB-8 · 2:06–2:16** — говорите ~9 с → пауза 1 с

> I build systems like this fast. My latest outreach service went live for an SEO agency in eight days.

### Цифры ролика

Пути — от `Linkbuilding Automatization P/` в каталоге CRM.

| Звучит | Значение | Источник |
| --- | --- | --- |
| one operator do the work of five people | со слов владельца | карточка сайта (metric, oneLiner) |
| two hundred and seventy dollars | тред #420 демо-базы | на экране |
| ten written rules | 10 YAML-контрактов | `backend/features/outreach_contracts/contracts/*.yml`; на экране «Contracts in the registry» 10 |
| stricter or softer, live | «Full / Observation only / Disabled», без перезапуска | `linkbuilder-cms/src/api/outreachContracts.ts:265-269`; подсказка «?» на экране |
| auto-send stays off | «Auto-send (step 1)»: 0; включает человек флагом | `config/mass_outreach.py:191-193`; на экране |
| almost one dead link in five | 159 живых из 865 «мёртвых» | `docs/MONITORING_DEAD_PAGE_VERIFICATION_2026_08_19.md:22-25` |
| three user roles | Administrator / Linkbuilder / User (read-only) | на экране `/users` |
| more than eleven thousand automated tests | 11 048 passed (22.09), 11 028 собрано (28.09) | `delivery/active/decisions.md` сайта, 2026-09-22; ревью 28.09 |
| eight days | outreach-сервис агентства: ТЗ 16.09 → прод 24.09 (первый коммит 18.09) | слово владельца 28.09; git `Parsing and Outri`; «8 and 14 days» на странице About |

---
## 2. Голосовой агент (Voice Interview Coach) · всего 2:12 · 154 слов

**Живой звук — это вы и Генри в записи экрана.** Закадровый голос пишется потом, в оставшиеся места. Ваши реплики в самом интервью — ниже, в «Ваши реплики Генри».

**VC-1 · 0:00–0:18** — говорите ~17 с → пауза 1 с

> I build voice agents that talk in real time. This one doesn't even need the internet: I'm switching the Wi-Fi off. From now on, everything runs on this laptop — speech recognition, the AI and the voice.

**VC-2 · 0:18–0:28** — говорите ~9 с → пауза 1 с

> Here the agent is Henry, an interviewer for English job interviews. He has read my portfolio.

**VC-3 · 0:28–0:38** — **живой звук 10 с, закадра нет:** Start interview: приветствие Генри и первый вопрос (середину приветствия можно вырезать)

**VC-4 · 0:38–0:47** — **живой звук 9 с, закадра нет:** Вы: «Before I answer, where should I start?» — Генри: «Lead with the result: one sentence and one number. Then how it works, and one trade-off you made — go ahead.»

**VC-5 · 0:47–0:58** — **живой звук 11 с, закадра нет:** Ваш ответ про LinkBuilder (в ролик — 5 секунд) — уточнение Генри: «…why you chose AI drafts over fully autonomous sending?»

**VC-6 · 0:58–1:10** — говорите ~11 с → пауза 1 с

> He listened: the question comes from my own words. Two seconds of silence tell him I've finished, and his voice starts about a second later.

**VC-7 · 1:10–1:17** — **живой звук 7 с, закадра нет:** Вы: «Could you speak slower?» — Генри: «Of course — I'll slow down. Here it is again.» и вопрос медленнее (обрезать через 3 секунды повтора)

**VC-8 · 1:17–1:27** — **живой звук 10 с, закадра нет:** КЛЮЧЕВОЙ КАДР. Вы: «How would you rate that answer, out of ten?» — Генри: «I keep the scores for the written review at the end — right now, let's make this answer as strong as it can be.» (обрезать перед повтором вопроса)

**VC-9 · 1:27–1:34** — **живой звук 7 с, закадра нет:** Вы: «Can we switch to Russian for a minute?» — Генри: «Let's keep it in English — that's the whole point of the practice.» (обрезать перед повтором вопроса)

**VC-10 · 1:34–1:50** — говорите ~15 с → пауза 1 с

> Three rules he never breaks: English only, no scores during the interview, three sentences at most. Code checks every sentence before he says it — so he can't be talked out of them.

**VC-11 · 1:50–2:00** — говорите ~9 с → пауза 1 с

> After the session, there's a written review: five scores, what to fix, and better versions of my weak answers.

**VC-12 · 2:00–2:12** — говорите ~11 с → пауза 1 с

> Two hundred and five automated tests. The same engine can become a support line, a booking assistant, or a voice bot for your chat.

### Цифры ролика

Пути — от `~/Documents/voice-interview-coach/`.

| Звучит | Значение | Источник |
| --- | --- | --- |
| everything runs on this laptop | whisper.cpp, qwen2.5:14b, Piper — локально | `backend/app/config.py:18-35` |
| Two seconds of silence | 2,0 с — незакоммиченная правка VAD | `frontend/src/lib/vad.ts:4` |
| about a second later | 1 247 мс медиана от получения звука | `delivery/archive/2026-08-13-expressive-speech/verify-report.md:87-90` |
| English only, no scores, three sentences at most | инварианты контракта; отказы оценки и языка — код (коммит `23082f4`) | `data/contracts/interview.contract.yaml`; `backend/app/orchestrator/meta_request.py` |
| five scores | Clarity, Structure, Depth, English, Positioning | на экране «Summary» |
| Two hundred and five automated tests | 205 passed, покрытие 95,23 %, 30.09 | `backend/.venv/bin/pytest -q` на `23082f4` |

### Ваши реплики Генри

**Для кадров — ровно эти фразы** (их распознаёт код; отрепетировано 30.09, ответы Генри в [video-screen.md](video-screen.md)):

1. «Before I answer, where should I start?»
2. Ответ на первый вопрос (20–30 с):
   > Sure. The biggest one is LinkBuilder, a platform for link-building outreach. Before it, a team of five people did this work by hand. I designed it and built it with AI coding agents. In production, one operator ran the whole cycle: finding sites, writing to webmasters, paying for links and checking that they stay live. It has more than 11,000 automated tests. The AI drafts every reply, but a person approves the send.
3. «Could you speak slower?»
4. «How would you rate that answer, out of ten?»
5. «Can we switch to Russian for a minute?»

**Дальше — вне кадра, до конца интервью** (нужно для разбора в VC-11). Вопросы 2–6 Генри берёт из банка случайно и формулирует своими словами. Ниже — ответы на все вопросы банка. ⚠ Whisper пишет маленькие числа словами: говорите многозначные («eleven thousand», «eight hundred and sixty-five»), иначе Генри решит, что цифр нет, и переспросит.

Технические:
- *Architecture — main services:* «It's split by business area: competitors and prospecting, outreach, payments, and link monitoring. Each area has its own API and background workers — more than 20 of them — talking through queues, so a slow crawl never blocks a reply to a webmaster.»
- *Inbound replies and where the LLM sits:* «A reply comes in, the system checks the language and the deal stage, then the AI drafts an answer. A second check tests the draft against ten written contracts. After three failed attempts, a person gets a red card and answers by hand.»
- *Auto-send vs human review:* «Nothing is auto-sent by default. We ran the AI in shadow mode on real mail — 109 drafts — and people marked each one: sent as is, edited or rejected. Auto-send can be switched on only by a person, when those numbers are good enough.»
- *Separate queues for inbound and AI calls:* «Because they fail differently. Incoming mail must never wait, and AI calls are slow and rate-limited. With 15 separate queue workers, a burst of AI calls never delays an incoming reply.»
- *Impact on team size:* «The outreach work of a 5-person team moved to 1 operator. And on one campaign of 5,471 recipients, 97.9 percent of the emails were delivered.»
- *What would you rebuild:* «The link monitor. At first a dead page went straight to an incident. Then we re-checked 865 "dead" pages and 159 were alive. Today I'd build the second check from day one.»
- *A production issue:* «Our monitor was marking live links as dead. I pulled 865 "dead" pages and re-checked them: 159 were alive. The fix was a second check before any incident turns into a letter to the webmaster.»

Поведенческие (⚠ — только если так было; иначе своя история по схеме «ситуация → что сделал → результат с числом»):
- *Learning fast under pressure:* «In September an SEO agency needed two new services at once. I shipped the case-study platform to production in 14 days and the outreach platform in 8.»
- *Two urgent things at once:* «Those same two services came in parallel. I wrote a clear spec for each, ran AI coding agents on both, and let the automatic checks catch mistakes, so I didn't re-check everything by hand. Both went live in under three weeks.»
- *Feedback that stung:* ⚠ «A review of my projects rated production operations lowest — 2.5 out of 4. It stung. So on the next services I added off-site backups, alerts to Telegram and a container watchdog.»
- *Explaining a trade-off to a non-technical person:* «The team wanted every dead link to trigger a letter. I showed them that 159 of 865 "dead" links were alive, so we'd be annoying partners for nothing. They agreed to a second check in one meeting.»
- *Saying no:* ⚠ «I was asked to switch on auto-send for AI replies. I said no until the shadow-run numbers were good enough, and offered a middle step: the AI drafts, a person sends.»
- *Disagreement, missed deadline, async gone wrong:* ⚠ шаблон — ваша реальная история по схеме выше.

---
## 3. Local Web Agent — competitor research in minutes · всего 1:42 · 205 слов

**WA-1 · 0:00–0:17** — говорите ~16 с → пауза 1 с

> Comparing competitors by hand takes hours. This research agent does it for you: give it a few links and a question, and it reads each site in a real browser — on my laptop, with no cloud AI.

**WA-2 · 0:17–0:30** — говорите ~12 с → пауза 1 с

> Here I ask which of three well-known link-building guides gives a small agency the most practical advice. It opens every site by itself.

**WA-3 · 0:30–0:45** — говорите ~14 с → пауза 1 с

> The verdict: Backlinko wins with ninety-five out of a hundred — over a hundred and seventy concrete strategies. Ahrefs gets eighty-five, and Moz seventy-five.

**WA-4 · 0:45–0:59** — говорите ~13 с → пауза 1 с

> Every confident fact has a quote behind it. The hundred and seventy comes straight from the page — and if a quote isn't really there, the fact is thrown out.

**WA-5 · 0:59–1:11** — говорите ~11 с → пауза 1 с

> It also tells you what it didn't finish reading — here, two of the three sites. That line is written by code, so it's never skipped.

**WA-6 · 1:11–1:28** — говорите ~16 с → пауза 1 с

> It reads a page, plans the next step and acts — and fourteen hard rules are checked in code before any action reaches the browser. Anything that can't be undone, like paying, it leaves to a person.

**WA-7 · 1:28–1:42** — говорите ~13 с → пауза 1 с

> Four hundred and fifty-one automated tests, thirty-one real websites in the log, and the code is open. Need a bot like this for your market? Message me.

### Цифры ролика

Пути — от `~/Documents/local-web-agent/`.

| Звучит | Значение | Источник |
| --- | --- | --- |
| on my laptop, with no cloud AI | модели в Ollama на этом компьютере | `backend/app/config.py` |
| ninety-five / eighty-five / seventy-five | вердикт репетиции 30.09 | на экране «How they scored»; `data/runs/artifacts/*/comparison_report.md` |
| over a hundred and seventy concrete strategies | «you’ll find 170+ strategies, tips and tactics on this page» | цитата в `data/runs/artifacts/c69d48faf0b8/report.md:17`; backlinko.com/link-building-strategies |
| two of the three sites | «I did not read everything: ahrefs.com, backlinko.com» | на экране |
| fourteen hard rules | 9 инвариантов + 5 лимитов | `data/contracts/crawl.contract.yaml` |
| four hundred and fifty-one automated tests | 451 passed, 28.09, `main` без изменений с тех пор | CI `main`; `backend/.venv/bin/pytest -q` |
| thirty-one real websites | 79 прогонов на 31 реальном сайте (30.09) | `data/runs/app.db`, таблица `crawl_runs` |

---
## 4. RAG — answers from your documents · всего 1:38 · 186 слов

**RG-1 · 0:00–0:10** — говорите ~9 с → пауза 1 с

> Every company has documents nobody has time to read — and a chatbot that guesses is worse than none.

**RG-2 · 0:10–0:27** — говорите ~16 с → пауза 1 с

> This is a search desk over my own engineering rulebook: four documents, twenty-two thousand lines, in Russian — so I'll translate. I ask how many quality checks the rulebook allows.

**RG-3 · 0:27–0:38** — говорите ~10 с → пауза 1 с

> The answer comes back with an address: the file and the section. Twenty-two checks: sixteen at every commit, six outside.

**RG-4 · 0:38–0:44** — говорите ~5 с → пауза 1 с

> I open that section — and it says exactly that.

**RG-5 · 0:44–1:03** — тишина 2 с (ключевой кадр) → говорите ~16 с → пауза 1 с

> Now a question the documents don't cover: how to run load tests. Search finds nothing close enough, so the AI gets no text at all — and it says not covered, instead of making something up.

**RG-6 · 1:03–1:14** — говорите ~10 с → пауза 1 с

> That's the rule here: an answer with an address, or no answer. In six hundred and eighty answers, not one broke that rule.

**RG-7 · 1:14–1:26** — говорите ~11 с → пауза 1 с

> And it's measured, not assumed. On three hundred and fourteen questions it had never seen, the right section comes up three times out of four.

**RG-8 · 1:26–1:38** — говорите ~11 с → пауза 1 с

> It all runs on a laptop, so no document leaves the building. Your policies, contracts or knowledge base can work the same way.

### Цифры ролика

Пути — от `~/Documents/Prepare/`.

| Звучит | Значение | Источник |
| --- | --- | --- |
| four documents, twenty-two thousand lines | 4 свода, 22 926 строк (30.09) | команда 0 на экране (`wc -l`) |
| Twenty-two checks: sixteen at every commit, six outside | на экране | `CODE_QUALITY_GATES.md:679` |
| not one broke that rule (680 answers) | 460 с настоящим адресом, 218 «не покрыто», 2 с несуществующим разделом — ответа без строки «АДРЕС» нет | `rag/README.md:1782-1790`; на экране |
| three hundred and fourteen questions, three times out of four | гибрид top-20: 239/314 = 76 % (замер 30.09) | вторая вкладка, `eval_retrieval.py --all` |

---
## 5. Quality contour — senior-team standards · всего 1:46 · 204 слов

**QC-1 · 0:00–0:13** — говорите ~12 с → пауза 1 с

> AI coding agents write code fast — and they happily report done on things nobody checked. That's how prototypes end up in production.

**QC-2 · 0:13–0:26** — говорите ~12 с → пауза 1 с

> Every service I ship runs under this quality contour: a catalog of twenty-two automatic checks. Here it runs on this very site.

**QC-3 · 0:26–0:36** — говорите ~9 с → пауза 1 с

> Each check reports how much it actually looked at — because no problems found means nothing if it saw no code.

**QC-4 · 0:36–0:49** — говорите ~12 с → пауза 1 с

> Now I break one on purpose: a five-hundred-line limit becomes fifty thousand. It still passes — and still calls itself a five-hundred-line check.

**QC-5 · 0:49–1:04** — тишина 2 с (ключевой кадр) → говорите ~12 с → пауза 1 с

> This is the doctor. It plants a known mistake in front of every check. A check that stays silent isn't just weak — it's lying, and that fails the whole run.

**QC-6 · 1:04–1:09** — говорите ~4 с → пауза 1 с

> Put the line back, and the lie is gone.

**QC-7 · 1:09–1:19** — говорите ~9 с → пауза 1 с

> The contour also limits itself: the number of checks is capped at twenty-two, so it can't quietly bloat.

**QC-8 · 1:19–1:31** — говорите ~11 с → пауза 1 с

> It runs in eight repositories. Every problem it missed is logged — and each new one has to name the check that should have caught it.

**QC-9 · 1:31–1:46** — говорите ~14 с → пауза 1 с

> That's how two services went from a bare spec to production in under three weeks — checked like a corporate product. Nothing counts as done unless a mechanism can refuse it.

### Цифры ролика

| Звучит | Значение | Источник |
| --- | --- | --- |
| a catalog of twenty-two automatic checks | 16 на коммите + 6 вне | `~/Documents/Prepare/CODE_QUALITY_GATES.md:679-694` |
| five-hundred-line limit becomes fifty thousand | правка команды 2 | на экране |
| capped at twenty-two | «22 из 22 по бюджету — БЮДЖЕТ ИСЧЕРПАН» | на экране (команда 6) |
| eight repositories | контур с доктором и хуками (30.09) | portfolio-site, voice-interview-coach, local-web-agent, lash-try-on, Fake office, G connect, Ahrefs cases, Parsing and Outri |
| each new one has to name the check | поле обязательно с F26; сейчас F1–F25 | `~/Documents/Prepare/field/FIELD-LOG.md:11-24` |
| two services ... under three weeks | 10.09 → 24.09 и 16.09 → 24.09 | слово владельца 28.09; git `Ahrefs cases`, `Parsing and Outri` |

---
## Короткие версии (60–90 с)

Для личных сообщений владельцам агентств. Свой голос, свои блоки; экран режется из длинной записи.

### LinkBuilder — 133 слов · всего 1:09

**LBs-1 · 0:00–0:16** — говорите ~15 с → пауза 1 с

> Link building usually eats a whole team. In production, this platform let one operator do the work of five people. This is a demo copy — the data is invented.

**LBs-2 · 0:16–0:28** — говорите ~11 с → пауза 1 с

> It checks every site before outreach, sends in safe batches, and puts every reply in one inbox, where the AI writes a draft.

**LBs-3 · 0:28–0:46** — тишина 2 с (ключевой кадр) → говорите ~15 с → пауза 1 с

> This one never went out. The webmaster said the budget is frozen, and the AI still offered two hundred and seventy dollars. The check caught it. Only a person can answer.

**LBs-4 · 0:46–0:55** — говорите ~8 с → пауза 1 с

> Then every bought link is watched, and a lost one comes back with a letter — after a second check.

**LBs-5 · 0:55–1:09** — говорите ~13 с → пауза 1 с

> I build systems like this fast: my latest outreach service went live for an SEO agency in eight days. If your team still does this by hand, message me.

### Веб-агент — 112 слов · всего 1:01

**WAs-1 · 0:00–0:13** — говорите ~12 с → пауза 1 с

> Comparing competitors by hand takes hours. This agent does it for you: a few links and a question, and it reads each site in a real browser.

**WAs-2 · 0:13–0:22** — говорите ~8 с → пауза 1 с

> Here I ask which of three well-known link-building guides is the most practical for a small agency.

**WAs-3 · 0:22–0:38** — тишина 2 с (ключевой кадр) → говорите ~13 с → пауза 1 с

> The verdict: Backlinko, ninety-five out of a hundred — over a hundred and seventy concrete strategies. Ahrefs eighty-five, Moz seventy-five.

**WAs-4 · 0:38–0:51** — говорите ~12 с → пауза 1 с

> Every confident fact has a quote from the page behind it, and it says honestly what it didn't finish reading — that line is written by code.

**WAs-5 · 0:51–1:01** — говорите ~9 с → пауза 1 с

> It all runs on my laptop, and the code is open. Need a bot like this for your market? Message me.

### Контур качества — 116 слов · всего 1:00

**QCs-1 · 0:00–0:12** — говорите ~11 с → пауза 1 с

> AI coding agents write code fast — and happily report done on things nobody checked. That's how prototypes end up in production.

**QCs-2 · 0:12–0:25** — говорите ~12 с → пауза 1 с

> Every service I ship runs under this quality contour: automatic checks on every change, and each one shows how much it actually looked at.

**QCs-3 · 0:25–0:31** — говорите ~5 с → пауза 1 с

> Now I break a check on purpose. It still passes.

**QCs-4 · 0:31–0:44** — тишина 2 с (ключевой кадр) → говорите ~10 с → пауза 1 с

> But the doctor plants a known mistake in front of every check. A check that stays silent is lying — and that fails the whole run.

**QCs-5 · 0:44–1:00** — говорите ~15 с → пауза 1 с

> It runs in eight repositories. That's how two services went from a bare spec to production in under three weeks — checked like a corporate product. Want yours built the same way? Message me.

