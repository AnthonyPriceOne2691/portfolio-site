/**
 * Сценарии роликов: экран не отстаёт от голоса, реплика влезает в свои секунды.
 *
 * Класс дефекта, который здесь закрыт: шкала голоса и экрана живёт в двух
 * файлах и правится руками. 29.09 обе были «сверены», а 30.09 прогон показал 15
 * из 78 шагов, начатых позже, чем голос произносит их слова (до 6 секунд), и
 * реплику, которой по слогам нужно 20 секунд при отведённых 15. Глазами это не
 * видно: цифры в обоих файлах выглядят правдоподобно.
 *
 * Правила (те же, что у сборщика шкалы 30.09):
 * - блок голоса = тишина + речь + пауза (или живой звук), блоки встык;
 * - речь ≥ слоги / 3,2 + 0,5 с — 130 слов/мин, честные к числам словами;
 * - кадр экрана совпадает с блоком голоса секунда в секунду, шаги встык;
 * - шаг «На словах «…»» начинается не позже, чем звучат эти слова (±1 с),
 *   при равномерном темпе внутри блока.
 */
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";

const ROOT = new URL("../delivery/active/", import.meta.url);
const VOICE = readFileSync(new URL("video-voice.md", ROOT), "utf8");
const SCREEN = readFileSync(new URL("video-screen.md", ROOT), "utf8");

const SYL_PER_S = 3.2;
const EXCEPT = new Map(
  Object.entries({
    ai: 2, seo: 3, llm: 3, "wi-fi": 2, dofollow: 3, "it's": 1, "i'm": 1, "i've": 1,
    "don't": 1, "doesn't": 2, "isn't": 2, "can't": 1, "there's": 1, "that's": 1, "let's": 1,
    "what's": 1, "he's": 1, "you'll": 1, "i'll": 1, "didn't": 2, "won't": 1, someone: 2,
    every: 2, business: 2, people: 2, the: 1, fire: 1, hour: 1, our: 1, idea: 3, area: 3,
    real: 1, reply: 2, replies: 2, rules: 1, sites: 1, site: 1, checked: 1, checks: 1,
    lines: 1, times: 1, prototypes: 3, minutes: 2, quote: 1, quotes: 1, guide: 1,
    guides: 1, done: 1, one: 1, once: 1, gone: 1, some: 1, come: 1, comes: 1, sale: 1,
    whole: 1,
  }),
);

const clean = (w) => w.toLowerCase().replace(/^[.,:;!?—–\-"'«»()]+|[.,:;!?—–\-"'«»()]+$/g, "");

function syllables(word) {
  const w = clean(word);
  if (!w) return 0;
  if (EXCEPT.has(w)) return EXCEPT.get(w);
  if (w.includes("-")) return w.split("-").reduce((n, p) => n + syllables(p), 0);
  let g = (w.match(/[aeiouy]+/g) || []).length;
  if (w.endsWith("e") && !/(le|ee|ye)$/.test(w) && g > 1) g -= 1;
  if (w.endsWith("ed") && !/(ted|ded)$/.test(w) && g > 1) g -= 1;
  return Math.max(1, g);
}

const sec = (m, s) => Number(m) * 60 + Number(s);
const RANGE = /(\d+):(\d\d)[–-](\d+):(\d\d)/;

/** Блоки голоса: id → {start, end, silence, speech, pause, live, text}. */
function voiceBlocks() {
  const blocks = new Map();
  let cur = null;
  for (const line of VOICE.split("\n")) {
    const m = line.match(/^\*\*([A-Za-z]+s?-\d+) · (\d+):(\d\d)[–-](\d+):(\d\d)\*\* — (.*)$/);
    if (m) {
      const tail = m[6];
      cur = {
        id: m[1],
        start: sec(m[2], m[3]),
        end: sec(m[4], m[5]),
        silence: Number((tail.match(/тишина (\d+) с/) || [0, 0])[1]),
        speech: Number((tail.match(/говорите ~(\d+) с/) || [0, 0])[1]),
        pause: Number((tail.match(/пауза (\d+) с/) || [0, 0])[1]),
        live: Number((tail.match(/живой звук (\d+) с/) || [0, 0])[1]),
        // «По записи» — длительность настоящего дубля: она и есть истина, слоговая
        // оценка нужна только тому, что ещё не записано.
        measured: tail.includes("(по записи)"),
        text: "",
      };
      blocks.set(cur.id, cur);
      continue;
    }
    if (cur && line.startsWith("> ")) cur.text += " " + line.slice(2).trim();
    if (/^#{2,3} /.test(line)) cur = null;
  }
  return blocks;
}

/** Кадры экрана: id → {start, end, steps: [{s, e, cues: [..]}]}. */
function screenFrames() {
  const frames = new Map();
  let cur = null;
  for (const line of SCREEN.split("\n")) {
    const f = line.match(/^\*\*([A-Za-z]+s?-\d+) · (\d+):(\d\d)[–-](\d+):(\d\d) · (\d+) с/);
    if (f) {
      cur = { id: f[1], start: sec(f[2], f[3]), end: sec(f[4], f[5]), dur: Number(f[6]), steps: [] };
      frames.set(cur.id, cur);
      continue;
    }
    if (/^#{2,3} /.test(line)) cur = null;
    if (!cur) continue;
    const st = line.match(/^- `(\d+):(\d\d)[–-](\d+):(\d\d)`(.*)$/);
    if (st) {
      const cues = [...st[5].matchAll(/На словах «([^»]+)»/g)].map((c) => c[1]);
      cur.steps.push({ s: sec(st[1], st[2]), e: sec(st[3], st[4]), cues, line });
    }
  }
  return frames;
}

const voice = voiceBlocks();
const screen = screenFrames();

test("есть что сверять: блоки голоса и кадры экрана разобраны", () => {
  assert.ok(voice.size > 40, `разобрано блоков голоса: ${voice.size}`);
  assert.ok(screen.size > 40, `разобрано кадров экрана: ${screen.size}`);
});

test("блок голоса = тишина + речь + пауза, и речь влезает по слогам", () => {
  const bad = [];
  for (const b of voice.values()) {
    const parts = b.silence + b.speech + b.pause + b.live;
    if (b.end - b.start !== parts) bad.push(`${b.id}: ${b.end - b.start} с ≠ ${parts} с`);
    if (b.text && !b.measured) {
      const need = b.text.split(/\s+/).reduce((n, w) => n + syllables(w), 0) / SYL_PER_S + 0.5;
      if (need > b.speech + 0.01) bad.push(`${b.id}: по слогам нужно ${need.toFixed(1)} с, отведено ${b.speech}`);
    }
  }
  assert.deepEqual(bad, [], "шкала голоса разошлась:\n  " + bad.join("\n  "));
});

test("блоки одного ролика идут встык", () => {
  const bad = [];
  const byVideo = new Map();
  for (const b of voice.values()) {
    const key = b.id.split("-")[0];
    if (!byVideo.has(key)) byVideo.set(key, []);
    byVideo.get(key).push(b);
  }
  for (const [key, list] of byVideo) {
    if (key === "C") continue; // кружок — живой дубль, без шкалы экрана
    list.forEach((b, i) => {
      if (i && list[i - 1].end !== b.start) bad.push(`${list[i - 1].id} → ${b.id}: ${list[i - 1].end} ≠ ${b.start}`);
    });
  }
  assert.deepEqual(bad, [], "дыра или нахлёст между блоками:\n  " + bad.join("\n  "));
});

test("кадр экрана совпадает с блоком голоса, шаги встык от начала до конца", () => {
  const bad = [];
  for (const b of voice.values()) {
    if (b.id.startsWith("C-")) continue;
    const f = screen.get(b.id);
    if (!f) {
      bad.push(`${b.id}: кадра на экране нет`);
      continue;
    }
    if (f.start !== b.start || f.end !== b.end) bad.push(`${b.id}: экран ${f.start}–${f.end}, голос ${b.start}–${b.end}`);
    if (f.dur !== f.end - f.start) bad.push(`${b.id}: подпись «${f.dur} с» ≠ ${f.end - f.start}`);
    if (!f.steps.length) continue;
    if (f.steps[0].s !== f.start) bad.push(`${b.id}: первый шаг с ${f.steps[0].s}, кадр с ${f.start}`);
    if (f.steps.at(-1).e !== f.end) bad.push(`${b.id}: последний шаг до ${f.steps.at(-1).e}, кадр до ${f.end}`);
    f.steps.forEach((s, i) => {
      if (i && f.steps[i - 1].e !== s.s) bad.push(`${b.id}: шаг до ${f.steps[i - 1].e}, следующий с ${s.s}`);
    });
  }
  assert.deepEqual(bad, [], "экран разошёлся с голосом:\n  " + bad.join("\n  "));
});

test("шаг «На словах…» начинается, когда звучат его слова (±1 с)", () => {
  const bad = [];
  for (const f of screen.values()) {
    const b = voice.get(f.id);
    if (!b || !b.text) continue;
    const words = b.text.split(/\s+/).filter(Boolean);
    const syl = words.map(syllables);
    const rate = syl.reduce((a, n) => a + n, 0) / b.speech;
    const norm = words.map(clean);
    for (const step of f.steps) {
      for (const cue of step.cues) {
        const cw = cue.split(/\s+/).map(clean);
        const at = norm.findIndex((_, i) => cw.every((w, j) => norm[i + j] === w));
        if (at < 0) {
          bad.push(`${f.id}: слов «${cue}» в реплике нет`);
          continue;
        }
        const t = b.start + b.silence + syl.slice(0, at).reduce((a, n) => a + n, 0) / rate;
        if (t < step.s - 1 || t > step.e + 0.5) {
          bad.push(`${f.id}: «${cue}» звучит на ${t.toFixed(1)} с, а шаг ${step.s}–${step.e}`);
        }
      }
    }
  }
  assert.deepEqual(bad, [], "экран отстаёт от голоса или бежит вперёд:\n  " + bad.join("\n  "));
});
