/**
 * Видео с диапазонами байтов (HTTP Range → 206).
 *
 * ⚠ Статика Cloudflare Workers на `Range` отвечает целым файлом со статусом 200 —
 * замерено 2026-10-02 на демо контура, и из кэша (HIT) тоже. Chrome это переживает,
 * а Safari (iPhone, Mac) видео без ответа 206 не играет: он сначала просит
 * `bytes=0-1` и по ответу решает, можно ли воспроизводить.
 *
 * Воркер встаёт ТОЛЬКО перед медиа (`run_worker_first` в wrangler.toml): страницы,
 * стили и субтитры отдаёт статика, как раньше. Файл берётся из той же статики
 * (`env.ASSETS`), здесь лишь вырезается запрошенный кусок.
 */

const notSatisfiable = (size) =>
  new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });

/** `bytes=a-b`, `bytes=a-`, `bytes=-n` → [начало, конец] включительно; null — диапазон не годен. */
export function parseRange(header, size) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m || (m[1] === "" && m[2] === "")) return null;
  const [start, end] =
    m[1] === ""
      ? [Math.max(0, size - Number(m[2])), size - 1] // последние n байт
      : [Number(m[1]), m[2] === "" ? size - 1 : Math.min(Number(m[2]), size - 1)];
  return start <= end && start < size ? [start, end] : null;
}

export default {
  async fetch(request, env) {
    const range = request.headers.get("Range");
    const plain = new Headers(request.headers);
    plain.delete("Range");
    const asset = await env.ASSETS.fetch(new Request(request.url, { headers: plain }));
    if (!asset.ok) return asset; // 404, 304 — как отдала статика

    const headers = new Headers(asset.headers);
    headers.set("Accept-Ranges", "bytes");
    const head = request.method === "HEAD";
    if (!range) return new Response(head ? null : asset.body, { status: 200, headers });

    const body = await asset.arrayBuffer();
    const span = parseRange(range, body.byteLength);
    if (!span) return notSatisfiable(body.byteLength);
    const [start, end] = span;
    headers.set("Content-Range", `bytes ${start}-${end}/${body.byteLength}`);
    headers.set("Content-Length", String(end - start + 1));
    return new Response(head ? null : body.slice(start, end + 1), { status: 206, headers });
  },
};
