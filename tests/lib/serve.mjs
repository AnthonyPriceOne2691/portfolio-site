/**
 * Собранный `dist/` по http:// — для тестов, которым нужен движок браузера.
 *
 * Судить надо то, что уедет на хостинг, поэтому сервер раздаёт сборку, а не
 * исходники. ⚠ Не `file://`: Astro подключает стили АБСОЛЮТНЫМ путём `/_astro/…`,
 * под `file://` он уходит в корень файловой системы, и страницы открывались бы
 * вовсе без CSS — тест «нет горизонтального скролла» на неверстанной странице
 * проходит всегда (так и было до замены).
 *
 * Вынесено из `layout.test.mjs` (02.10), когда сервер понадобился и тестам модалки
 * демо: второй экземпляр той же логики разошёлся бы с первым при первой правке.
 */
import { createServer } from "node:http";
import { readFileSync } from "node:fs";

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".xml": "application/xml",
  ".mp4": "video/mp4",
  ".vtt": "text/vtt",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".pdf": "application/pdf",
};

/** Поднимает сервер на свободном порту; вернёт адрес и способ остановить. */
export async function serveDist(dist) {
  const server = createServer((req, res) => {
    // ⚠ Каталог отдаётся как `index.html`: ссылки на сайте ведут на `/` и
    // `/#якорь`, а не на `/index.html`. Без этого переход по меню упирался в
    // попытку прочитать каталог.
    const raw = decodeURIComponent(req.url.split("?")[0].split("#")[0]);
    const path = raw.endsWith("/") ? `${raw}index.html` : raw;
    try {
      // ⚠ Файл читается ДО `writeHead`, и порядок здесь принципиален. Раньше
      // заголовки уходили первыми, и на отсутствующем пути `readFileSync`
      // бросал уже ПОСЛЕ них: ветка `catch` пыталась дослать 404, получала
      // ERR_HTTP_HEADERS_SENT, и тест падал с ошибкой про асинхронную
      // активность вместо внятного «нет такой страницы».
      const body = readFileSync(new URL("." + path, dist));
      const ext = path.slice(path.lastIndexOf("."));
      const type = MIME[ext] ?? "application/octet-stream";
      // ⚠ Диапазоны (206) — как у прода (`worker/media.js`): Safari без них mp4 не
      // играет вовсе, и тест WebKit с роликом смотрел бы в пустой плеер (03.10).
      // `bytes=0-` честно значит «до конца файла».
      const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? "");
      if (m && (m[1] || m[2])) {
        const start = m[1] ? Number(m[1]) : Math.max(0, body.length - Number(m[2]));
        const end = m[1] && m[2] ? Math.min(Number(m[2]), body.length - 1) : body.length - 1;
        res.writeHead(206, {
          "content-type": type,
          "accept-ranges": "bytes",
          "content-range": `bytes ${start}-${end}/${body.length}`,
          "content-length": end - start + 1,
        });
        res.end(body.subarray(start, end + 1));
        return;
      }
      res.writeHead(200, { "content-type": type, "accept-ranges": "bytes" });
      res.end(body);
    } catch {
      res.writeHead(404).end("not found");
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return {
    origin: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((r) => server.close(r)),
  };
}
