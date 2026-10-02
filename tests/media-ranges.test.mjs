/**
 * Воркер медиа отвечает на диапазоны байтов, как ждёт Safari.
 *
 * Статика Cloudflare на `Range` отдаёт целый файл (200) — Safari такое видео не
 * играет (замер 2026-10-02). `worker/media.js` встаёт перед `*.mp4`; здесь он
 * гоняется на подставной статике, а `wrangler.toml` сверяется с тем, что воркер
 * вообще подключён и стоит только перед медиа.
 */
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";
import worker, { parseRange } from "../worker/media.js";

const BYTES = new Uint8Array([...Array(100).keys()]); // 0, 1, … 99
const env = {
  ASSETS: {
    async fetch(req) {
      assert.equal(req.headers.get("Range"), null, "статике Range не передаётся — она его не умеет");
      return new URL(req.url).pathname === "/demo.mp4"
        ? new Response(BYTES, { headers: { "Content-Type": "video/mp4" } })
        : new Response("нет", { status: 404 });
    },
  },
};
const get = (range, method = "GET", path = "/demo.mp4") =>
  worker.fetch(
    new Request(`https://site.test${path}`, { method, headers: range ? { Range: range } : {} }),
    env,
  );

test("Safari: bytes=0-1 → 206, два байта и Content-Range", async () => {
  const r = await get("bytes=0-1");
  assert.equal(r.status, 206);
  assert.equal(r.headers.get("Content-Range"), "bytes 0-1/100");
  assert.equal(r.headers.get("Content-Length"), "2");
  assert.equal(r.headers.get("Content-Type"), "video/mp4");
  assert.deepEqual([...new Uint8Array(await r.arrayBuffer())], [0, 1]);
});

test("открытый и хвостовой диапазоны режутся верно", async () => {
  assert.deepEqual([...new Uint8Array(await (await get("bytes=97-")).arrayBuffer())], [97, 98, 99]);
  assert.deepEqual([...new Uint8Array(await (await get("bytes=-2")).arrayBuffer())], [98, 99]);
  assert.equal((await get("bytes=90-500")).headers.get("Content-Range"), "bytes 90-99/100");
});

test("без Range — весь файл и обещание диапазонов; мимо — 416; нет файла — 404", async () => {
  const whole = await get();
  assert.equal(whole.status, 200);
  assert.equal(whole.headers.get("Accept-Ranges"), "bytes");
  assert.equal((await whole.arrayBuffer()).byteLength, 100);
  const bad = await get("bytes=200-300");
  assert.equal(bad.status, 416);
  assert.equal(bad.headers.get("Content-Range"), "bytes */100");
  assert.equal((await get("bytes=0-1", "GET", "/nope.mp4")).status, 404);
  assert.equal(await (await get("bytes=0-1", "HEAD")).text(), "");
  assert.equal(parseRange("items=0-1", 100), null);
});

test("wrangler.toml: воркер подключён и стоит только перед медиа", () => {
  const toml = readFileSync(new URL("../wrangler.toml", import.meta.url), "utf8");
  assert.match(toml, /^main\s*=\s*"worker\/media\.js"/m, "воркер не подключён — Safari снова без диапазонов");
  assert.match(toml, /^binding\s*=\s*"ASSETS"/m, "воркеру нечем брать файл из статики");
  const first = toml.match(/^run_worker_first\s*=\s*(\[.*\])/m)?.[1];
  assert.ok(first, "без run_worker_first статика отдаст mp4 раньше воркера");
  assert.deepEqual(JSON.parse(first), ["/*.mp4"], "воркер должен стоять только перед видео");
});
