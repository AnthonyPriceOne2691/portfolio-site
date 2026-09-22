# Сценарии демо-видео

Пять роликов, по одному на карточку, **1–2 минуты**, 720p. Плюс шестой, особый:
короткий кружок о себе в герое главной (§0). Требования к файлам — в
[content-guide.md](content-guide.md).

## Как читать этот документ

**Русские строки жирным — вам.** Что открыть, куда вести курсор, где держать
кадр, где молчать. Их никто не слышит.

> Блоки цитатой — то, что вы **говорите вслух, по-английски**. Это закадровый
> голос: на экране в этот момент идёт работа, а не вы.

Русской озвучки не будет вовсе — ни одной версии. Сайт одноязычный, `proof.video`
у проекта один, и силы уходят в английскую дорожку целиком. Русский в этом
документе — только язык режиссёрских указаний.

## Общее для всех

**Первые пять секунд решают.** Не «привет, меня зовут» — сразу работающий экран
и одна фраза, что это. Представиться можно в конце, если захочется.

- **Показывать работу, а не слайды.** Рекрутёр видел сто презентаций и ноль
  запусков. Ценность ролика — в том, что видно, как оно реально идёт.
- **Говорить, что происходит, а не что нажимаете.** Не «кликаю сюда», а «здесь
  агент сравнил четыре сайта и отказался утверждать то, чего не нашёл».
- **Показывать провал наравне с успехом.** Демо, где всё гладко, выглядит
  постановкой. Отказ системы в нужный момент убеждает сильнее удачи.
- Без музыки. Микрофон ближе, комната тише.
- Ошиблись — не переснимайте целиком, вырежьте. Склейка честнее дубля.

**Молчание — половина ролика, и это не недобор.** Чистой речи в каждом сценарии
55–70 секунд при длине полторы-две минуты. Остальное зритель молча смотрит, как
система работает: агент ходит по сайтам, идёт диалог, бегут проверки. Демо, где
говорят без пауз, смотрится как реклама; демо, где дают посмотреть, — как работа.
Не заполняйте тишину. Паузы в раскадровке проставлены — они такая же часть
сценария, как реплики.

**Реплики — опора, а не телесуфлёр.** Слово в слово читать не нужно, своими
словами звучит живее. Но **цифры и формулировки контрактов берите как есть**:
в них легко ошибиться на ходу, а ошибка в цифре на витрине инженера стоит
дороже любой оговорки. Числа записаны так, как произносятся, — читайте их
глазами как текст, а не как числа.

Говорите медленнее, чем кажется нужным: на записи темп всегда выше, чем в
комнате.

### Подготовка, общая для всех пяти

- **Масштаб интерфейса 125–150 %.** 720p — это мало. Мелкий шрифт в терминале
  и в браузере на записи не читается, а зритель не станет всматриваться.
- **Чистый экран.** Ни личной почты, ни чужих доменов, ни имён клиентов, ни
  уведомлений. Ролик публичный и остаётся в интернете навсегда.
- **Заранее прогрейте систему.** Первый запрос к модели после старта всегда
  дольше остальных: холодная загрузка весов — это не то, что вы показываете.
- **Ключевой кадр готовится до записи, а не ловится на ней.** В каждом сценарии
  он назван отдельно. Если он не воспроизводится по команде — воспроизведите
  его до съёмки и убедитесь, что он повторяется.

---

## 0. Кружок о себе — 30 секунд

Не проект, а лицо в герое главной. Живёт в круге 200 пикселей, играет по клику,
постером стоит ваша фотография.

**Зачем он.** Не затем, чтобы что-то сообщить: текст в сантиметре справа скажет
то же самое точнее. Ценность ровно одна — доказательство, что с вами можно
провести созвон на английском. Тембр, темп, живая речь.

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

> I build LLM systems that run under contract. Not a demo that works once — a
> service that keeps working when the model is wrong.

**Короткая пауза. Не улыбайтесь в неё — просто пауза.**

> It usually comes down to the same three things. The model proposes. A check
> decides. And a human confirms anything that spends money.

**Пауза.**

> Below are five of them. In every video there is a moment where the system
> refuses to do something. That moment is the work.

---

## 1. LinkBuilder — 97.9% delivery

**Хронометраж:** 1:55. Чистой речи ~72 с.

**Ключевой кадр:** момент, где контракт **отклоняет** письмо. Он доказывает, что
AI под контролем, а не просто подключён. Без него ролик — реклама.

### Подготовка

- **Данные.** В кампании живут чужие домены и адреса. Заведите тестовую
  кампанию на своих адресах либо размойте столбец с почтой. Публичный ролик с
  контактами чужих людей — это не демо, это утечка.
- **Найдите отклонённый черновик заранее** и оставьте вкладку открытой. Если
  под рукой нет — сделайте его: поставьте сумму выше потолка или отключите
  условие, которое гарантирует отказ. Ловить отказ на записи нельзя.
- **Три вкладки в браузере:** список кампаний, поиск площадок, письмо с панелью
  контрактов. Переключение между готовыми вкладками читается как работа,
  ожидание загрузки — как затык.

### Раскадровка

**0:00 · На экране список кампаний: названия, статусы, счётчики. Курсор
неподвижен, ничего не кликаете — пусть зритель успеет прочитать экран.**

> This is an outreach platform, and it runs in production. What used to take a
> team of five now runs with a single operator.

**0:10 · Открываете одну кампанию. Видно площадки, их статусы, кто ответил, что
уже оплачено.**

> One campaign looks like this. Sites, their status, who replied, what has
> already been paid for.

**0:18 · Переходите на вкладку поиска площадок. Вводите тему, запускаете поиск.
Дальше 6–8 секунд МОЛЧИТЕ: пусть видно, как приходят результаты.**

> Sites are found through search results. The system filters them and drops them
> into the campaign. Nothing here is moved by hand.

**0:32 · Отмечаете две-три площадки и отправляете в кампанию. Движение курсора
медленное — на записи быстрые жесты читаются как мельтешение.**

> From here it is one flow: prospecting, negotiation, payment, and then watching
> the placement.

**0:40 · Открываете письмо-черновик, написанный моделью. Даёте кадру постоять
две секунды, чтобы текст письма было видно.**

> Then the negotiation. The model writes the draft — but it cannot send it.

**0:48 · Открываете панель контрактов над черновиком. Ведёте курсор сверху вниз
по списку, НЕ кликая. Читать их вслух не нужно, важно, что их много.**

> Every draft passes behavioral contracts before a human sees it. Payment
> invariants, spending caps, a kill switch. They are specs in version control,
> one per agent, not instructions inside a prompt — hard invariants that must
> never break, and soft ones that are judged.

**0:58 · Если под рукой есть переписка не на английском — покажите её. Если нет,
пропустите: выдумывать эту секунду не нужно.**

> The same contracts apply across six languages — the negotiation does not
> switch to English just because a rule was written in it.

**1:00 · КЛЮЧЕВОЙ КАДР. Переключаетесь на заранее открытый отклонённый черновик.
Причина отказа должна быть видна крупно. Держите кадр три секунды МОЛЧА, потом
говорите.**

> This one a contract rejected. The reason is right there. A human will never
> even see this draft.

**1:12 · Возвращаетесь к нормальному черновику и нажимаете отправку. Показываете,
что подтверждение делает человек, а не расписание.**

> The send is always confirmed by a human. The model drafts, the human decides.

**1:22 · Экран оплаты и контроля размещения: видно, что ссылка на месте. Если
есть пример снятой ссылки — покажите и его, он ценнее удачного.**

> After publication the platform keeps watching: the link is either live, or it
> has been pulled, and that changes the status here. Relevance scoring runs on a
> local embedding service the workers share, rather than four copies of the same
> model in memory.

**1:32 · Возвращаетесь на общий экран кампании. Последняя фраза идёт поверх него,
титр не нужен.**

> Twelve thousand emails. Almost ninety-eight percent delivery on a campaign of
> five thousand four hundred recipients. Six and a half thousand tests, around
> thirty services, a hundred and two database migrations — designed and built
> solo.

### Если пойдёт не так

- **Поиск площадок отвечает дольше десяти секунд.** Не заполняйте паузу словами.
  Вырежьте ожидание на монтаже — это честнее, чем болтать поверх него.
- **Отклонённый черновик не открылся.** Не импровизируйте, остановите запись.
  Ролик без ключевого кадра переснимать дешевле, чем объяснять его словами.

---

## 2. Voice Interview Coach — ~3 s per turn

**Хронометраж:** 1:40. Чистой речи ~55 с — здесь её меньше всех, потому что
половину ролика говорит сама система.

**Ключевой кадр:** выключенный Wi-Fi в начале. Без него «локально» — слово,
а с ним — факт.

### Подготовка

Пять шагов из `docs/DEMO.md`, каждый отвечает «да/нет». Ни один не пропускать:
все пять отказов случались вживую.

1. `./scripts/dev.sh` — весь стек одной командой.
2. Ассеты на месте: модели, голос Piper, `whisper-cli`.
3. `delivery/evals/browser/run.sh mid-turn` — живой оракул полного цикла на
   настоящем Chromium. Ожидаемый вердикт `closed-mid-turn`.
4. **Прогреть модель** одним запросом к ollama. Первый ход на холодной грузит
   девять гигабайт и выглядит как «зависло».
5. **Наушники, не колонки.** На колонках VAD слышит Генри, и агент перебивает
   сам себя. Эхо-защита — самое сложное место проекта, и на записи она
   проверяется именно так.

**Если шаги 1–3 красные — вживую не снимать.** Снимки последнего прогона лежат
в `delivery/evals/browser/out/*.png`.

- **Прогрейте модели до записи.** Whisper и Ollama на холодную грузятся
  секундами, и это ровно те секунды, из-за которых ролик про задержку выглядит
  как ролик про тормоза.
- **Наушники обязательны.** Голос интервьюера пойдёт в запись системным звуком,
  и без наушников он попадёт ещё и в микрофон — эхом.
- **Проверьте захват системного звука** тридцатисекундным тестом: в `Cmd+Shift+5`
  → Options включите и микрофон, и Include System Audio. Записать диалог, где
  слышно только вас, — самый обидный способ потерять дубль.
- **Заготовьте свои ответы.** Вы отвечаете на техническом английском, и
  запинка здесь читается как слабость языка, а не как живость. Два-три ответа
  прогоните заранее.

### Раскадровка

**0:00 · Камеры нет, только экран. Демонстративно открываете меню Wi-Fi и
ВЫКЛЮЧАЕТЕ его. Курсор задерживается на выключенном значке.**

> I am turning the internet off. Everything you are about to see runs on this
> laptop.

**0:10 · Запускаете приложение. Видно, что оно поднимается локально — адрес
localhost в строке браузера покажите специально.**

> This is a mock technical interview in English. The interviewer is called
> Henry. Speech in, speech out, nothing leaves the machine.

**0:20 · Начинается диалог. Генри задаёт вопрос, вы отвечаете голосом вслух.
Дальше 25–30 секунд ПОЛНОГО молчания закадрового голоса: слышно только
интервью. Это самая ценная часть ролика — не комментируйте её.**

**0:52 · Диалог продолжается. Наводите курсор на индикатор паузы между репликами
(или на таймер, если он есть). Говорить начинаете поверх идущего разговора.**

> Watch the pause between turns. About three seconds.

**1:00 · Оставляете диалог идти. Реплика — про то, как это далось.**

> In the first version it was almost five, and the conversation fell apart —
> that is not a dialogue any more, it is correspondence. Sentence-level
> streaming fixed it: speech starts on the first finished sentence, before the
> model has written the rest. Four point eight seconds down to three, and the
> first sound lands in about one point three.

**1:08 · Не переключая экран, добавляете про выбор модели. Диалог продолжает
идти.**

> A reasoning model was measured here too: thirty-one to fifty-two seconds per
> turn. It stayed — but only for the offline review after the session, where
> nobody is waiting.

**1:08 · МЕТА-ХОД. Говорите Генри: «speak slower». Он подтверждает и ДОСЛОВНО
повторяет прошлую реплику новым темпом.**

> I can also interrupt him. "Speak slower" — and he repeats the previous line
> word for word, at a new pace. That is not a request to the model: it is a
> deterministic meta-turn, so the question is not spent.

**1:20 · Завершаете сессию и открываете разбор: рубрика с оценками, словарь
терминов. Прокручиваете медленно, чтобы было видно, что это не одна строка.**

> After the session there is a review. A rubric over the answers, and a
> vocabulary list worth working on.

**1:28 · Наводите курсор на конкретную цитату из вашего ответа внутри разбора —
показываете, что разбор опирается на сказанное.**

> The review is grounded in the transcript, not written from scratch. And every
> sentence the interviewer says passes a contract before it is spoken: English
> only, no coaching, three sentences at most, one question per turn. The
> structure is code, not prompting — six questions alternating technical and
> behavioral, and a deterministic follow-up policy. The model only phrases them.

**1:45 · Финальный кадр — вкладка History или Settings с полоской микрофона.**

> A hundred and seventy-six backend tests at ninety-five percent coverage,
> forty-one on the front end, strict typing, and gates that run before the
> commit rather than when I remember.

### Если пойдёт не так

- **Генри переспросил или не расслышал.** Оставьте как есть, если это случилось
  один раз: живая система переспрашивает, и это честно. Два раза подряд —
  вырежьте.
- **Задержка на записи вышла больше трёх секунд.** Не называйте цифру, которой
  нет на экране. Скажите «about three seconds» только если зритель может это
  проверить по ролику.

---

## 3. Local Web Agent — ~180 tests

**Хронометраж:** 1:55. Чистой речи ~60 с.

**Ключевой кадр:** отказ в конце. Он отличает исследователя от генератора текста.

⚠ **Живьём реальные сайты не показывать.** Ваш же замер 17.08: один реальный
сайт — 7 мин 38 с, из них на модель ушло 97 с, остальное съела сеть под VPN
(Chromium встаёт на 16–30 с примерно на трети загрузок). Ролик строится из двух
слоёв ровно как `DEMO.md`: готовые прогоны из витрины плюс ОДИН живой запуск на
локальной фикстуре — 3 мин 09 с, и его легко сжать монтажом.

### Подготовка

- **Прогреть Ollama** (`ollama run qwen3:14b ""`), поднять сервер фикстур
  (`scripts/spike/fixtures_server.py`) и бэкенд, проверить `/health` — должно
  отвечать `ollama: reachable`.
- **Открыть витрину сессий заранее.** Показываем немецкую: задача задана
  по-немецки, агент обошёл три сайта и ответил по-немецки. Это сильнее любого
  рассказа про мультиязычность.
- **Тему живого запуска брать из содержимого фикстур** (8901–8903 — про ставки
  на футбол). Проверено на своей шкуре: задача про кэширование отработала
  штатно, но сравнивать было нечего, и на показе это выглядело поломкой.
- **Заготовить вопрос, ответа на который в фикстурах НЕТ** — это ключевой кадр.

### Раскадровка

**0:00 · Витрина: список готовых сессий. Открываете немецкую. Видно задачу
по-немецки и три обойдённых сайта.**

> This agent runs entirely on the laptop. Here is a session where the task was
> written in German — it browsed three sites and answered in German.

**0:10 · Прокручиваете к оценкам: 95 / 85 / 75 с разбором. Разбор целиком на
языке вопроса — задержитесь на нём.**

> Scores with reasoning, in the language of the question. The comparison runs
> against a rubric, not by feel.

**0:20 · Наводите курсор на приписку про границу знания («I did not read
everything…»). Это самый недооценённый кадр ролика.**

> And it marks its own limit: it did not read everything, so "nothing found"
> here can mean "not read far enough". That sentence is added by code, not by
> the model — asking the model for it worked about half the time.

**0:32 · Переходите к живому запуску. Вставляете задачу, указываете локальный
сайт, ставите флажок «Show me the browser». Запускаете.**

> Now a live run. One site, and I ask it to show me the browser.

**0:40 · Открывается видимое окно браузера, агент начинает обход. 15 секунд
МОЛЧИТЕ — идёт лента событий «Reading… site 1 of 3».**

**0:57 · Говорите поверх работающего агента.**

> It does not parse pages with selectors. It opens a real browser and looks at
> the page: screenshot, decide, act. Observe, plan, act — and every model call
> runs here, on this machine.

**1:10 · Показываете ленту событий, где видно проверку действия перед
выполнением.**

> Every action is validated before it reaches the browser — under ten
> milliseconds per check. Destructive actions are not allowed at all: actions
> are tiered by how reversible they are. And if a site puts up a challenge, the
> agent stops and asks me to pass it. There is no anti-bot spoofing here, and
> that is a decision, not a gap.

**1:25 · Прогон закончился. Открываете отчёт, показываете вывод и цитату рядом.
Кликаете по цитате — открывается страница с этим текстом.**

> Here is the answer, and here is the quote it rests on. I click, and it opens
> on the page it came from. A fact marked high confidence has to match a quote
> on the real site, or the confidence drops. Facts that came from the screenshot
> instead of the text are tagged separately — vision never gets top confidence.

**1:40 · КЛЮЧЕВОЙ КАДР. Задаёте заготовленный вопрос, ответа на который нет.
Ждёте ответ МОЛЧА, потом говорите поверх «не найдено».**

> Now something that is not there at all. It says: not found. That is the point
> — an honest refusal instead of an invention. Around a hundred and eighty tests
> hold that behavior in place, and almost every recent one is a failure I hit on
> a live site first.

### Если пойдёт не так

- **Прогон завис на загрузке.** Это VPN, а не агент. Переключайтесь на витрину
  и продолжайте рассказ — ровно как на живом показе.
- **`409 run_in_progress`.** Идёт другой прогон: один активный за раз, так
  задумано. Скажите это вслух, если попало в кадр.
- **Агент ответил на вопрос, которого нет в источниках.** Останавливайте запись:
  ролик утверждает обратное.

## 4. RAG over a rulebook — 0 uncited answers

**Хронометраж:** 2:00. Чистой речи ~75 с — здесь цифр больше всего.

**Ключевой кадр:** поверка прибора. Мерить чужую систему умеют все, проверить
собственную линейку — почти никто.

### Подготовка

- **Терминал крупно**, шрифт не меньше 16pt. Весь ролик проходит в нём.
- **Вопрос задавайте СВОИМИ словами**, не цитатой из документа. Половина
  ценности демо в том, что формулировка не совпадает с текстом свода.
- **Откройте заранее** файл свода, на который придётся ссылка, — но не тот
  раздел: его вы найдёте на экране, и это часть доказательства.
- **Прогон замеров подготовьте отдельно.** Если он идёт дольше двадцати секунд,
  запустите его до записи и покажите готовый вывод — но скажите вслух, что это
  сохранённый прогон.

### Раскадровка

**0:00 · Терминал. Набираете вопрос своими словами и запускаете.**

> This is a search desk over a rulebook. A hundred and ten thousand tokens, four
> documents, two hundred and thirty-two sections. I am asking in my own words,
> not in the document's terms.

**0:14 · Ответ появляется. Курсором подчёркиваете адрес — файл и номер раздела.**

> The answer comes back with an address: file and section.

**0:22 · Открываете этот файл и находите этот раздел. Держите кадр, чтобы
зритель прочитал совпадение. Это доказательство, а не иллюстрация.**

> I open that file. Exactly what it said. An answer without an address never
> leaves the system at all.

**0:36 · КЛЮЧЕВОЙ КАДР, часть первая. Задаёте вопрос, которого в своде нет.
Ответ приходит почти мгновенно — на это и обращаете внимание.**

> Now something that is not in the rulebook. Refused — and notice how fast. The
> model was never called: the question was cut off at the gate. There is nothing
> left to hallucinate with.

**0:50 · Запускаете прогон замеров. Пока он идёт, МОЛЧИТЕ 8–10 секунд.**

**1:02 · На экране цифры. Ведёте курсор по строке recall@20.**

> Recall at twenty: seventy-six percent, on three hundred and fourteen held-out
> questions. Across six hundred and eighty answers, not one came back without an
> address, and fabricated pairs were three in a thousand.

**1:18 · КЛЮЧЕВОЙ КАДР, часть вторая. Показываете прогон на чужом эталонном
наборе — тот, где сходится с якорем.**

> The retrieval is written by hand — BM25, fusion, parent-document — no
> dependencies outside the standard library. So I calibrated the instrument
> itself against someone else's benchmark: nDCG at ten, zero point six six six,
> against an anchor of zero point six six five. Measuring someone else's system
> is easy. Almost nobody checks their own ruler.

**1:35 · Открываете `MEASUREMENTS.md` на таблице «взгляды на holdout». Видно три
строки, одна из них помечена как несанкционированная.**

> And I keep a ledger of every look at the holdout. Three so far — and one of
> them is written down as unsanctioned, because an architectural decision was
> made with the holdout inside the denominator. Spending a holdout is fixed by
> accounting, not by good intentions.

**1:48 · Открываете README на строке про ограничения. Она должна быть видна
целиком.**

> The limits are stated, not hidden. Exact file-and-section accuracy is fifty
> percent on an independent holdout. That line sits in the README above the
> strengths, not below them.

### Если пойдёт не так

- **Замеры разошлись с тем, что написано в README.** Снимайте то, что на экране,
  и правьте README — а не наоборот.
- **Ответ пришёл без адреса.** Это отказ системы, о которой ролик утверждает
  обратное. Запись останавливается, ролик откладывается.

---

## 5. Quality contour — 53 gates

**Хронометраж:** 2:00. Чистой речи ~70 с.

**Ключевой кадр:** переход зелёного в красное от одной сломанной строки. Только
он доказывает, что проверка живая.

### Подготовка

- **Выберите репозиторий, который не жалко ломать** — лучше этот сайт: гейты
  на нём стоят, а сломанную строку можно вернуть одним `git checkout`.
- **Решите заранее, какую маску ломаете**, и проверьте, что гейт от этого
  краснеет с внятным сообщением. Гейт, который от вашей правки просто
  промолчит, — худший кадр из возможных.
- **Заготовьте вывод доктора** с настоящей находкой: гейтом, который врал
  «0 модулей просмотрено». Если в свежем прогоне её нет, покажите сохранённый
  и скажите об этом вслух.

### Раскадровка

**0:00 · Терминал в репозитории. Делаете коммит. Хуки бегут — видно список
проверок.**

> This is a set of checks that deploys into any repository. I make a commit, the
> hooks run, everything is green.

**0:12 · Прогон закончился, всё зелёное. Даёте кадру постоять две секунды.**

> Fifty-three gates. Twenty-two thousand six hundred lines of canon behind them,
> across four documents. They run on six projects, including the site you are looking at.

**0:25 · КЛЮЧЕВОЙ КАДР. Открываете файл гейта и ломаете ОДНУ строку — маску, по
которой он находит файлы. Правку показываете крупно.**

> Now I break it. One line in a gate's file mask — the line it uses to find what
> to check.

**0:35 · Запускаете прогон заново. Пока он идёт, МОЛЧИТЕ.**

**0:45 · Гейт краснеет. Наводите курсор на сообщение об ошибке — там должно быть
видно, что именно не так и где чинить.**

> It goes red, and it says exactly what is wrong and where to fix it. A check
> that cannot turn red is not a check.

**0:58 · Возвращаете строку на место, убеждаетесь, что снова зелено. Быстро,
без комментариев — это техническая склейка.**

**1:05 · Запускаете доктора. На экране вердикты по гейтам: AUTO, WEAK, DEAD.**

> The checks themselves are audited separately. This is the doctor: a verdict
> per gate.

**1:15 · Наводите курсор на гейт со статусом, означающим молчание на собственной
канарейке.**

> If a gate is declared, wired in, and stays silent on its own canary, that does
> not count as green. That counts as a lie.

**1:28 · КЛЮЧЕВОЙ КАДР, вторая часть. Показываете настоящую находку — гейт,
который месяц докладывал «0 модулей просмотрено».**

> And here is a real find. This gate spent a month reporting that it had not
> seen any code. The code was there. It was misreading its own output.

**1:40 · Открываете полевой журнал `field/FIELD-LOG.md`. Прокручиваете, чтобы
было видно, что записей много и у каждой есть строка «кто должен был поймать».**

> The canon is measured in the field. Five deployments, twenty-six recorded
> findings, and every one of them names which existing check claimed to cover
> that class and stayed silent. Fixing the symptom without that line leaves the
> next instance to walk through the same hole.

**1:52 · Возвращаетесь к общему прогону, зелёному.**

> A green light over a check that verified nothing — that is the failure this
> whole thing exists to catch. While this site was being built, it surfaced
> three of them.

### Если пойдёт не так

- **Сломанная строка не покраснела.** Это находка, а не неудача съёмки: значит
  гейт не проверяет то, что должен. Остановите запись и чините гейт — ролик
  подождёт, а такой кадр в него всё равно нельзя.
- **Доктор показал чистый лист.** Покажите сохранённый прогон с находкой и
  скажите вслух, что он сохранённый. Выдавать старую находку за сегодняшнюю
  нельзя: ровно про это весь ролик.

---

## Порядок съёмки

Начните с **контура** или **RAG**: там всё в терминале, переснять дёшево, и вы
набьёте руку до того, как дойдёте до LinkBuilder, где экранов больше всего.

**Кружок о себе — третьим, не первым.** Он самый лёгкий: не надо готовить
экран, не надо ловить момент, где контракт отклоняет письмо. Ровно поэтому он
и снимется первым, если не решить иначе. А рекрутёр, который видит говорящую
голову и пять пустых фреймов под ней, читает это однозначно: рассказывать
любит, показывать нечего. Кружок работает добавкой к работающим демо и не
работает вместо них.
