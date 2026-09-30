/**
 * Превью ссылки (`public/og.jpg`) собрано из ТЕКУЩИХ текстов сайта.
 *
 * Класс дефекта: картинка генерируется из карточек и героя, но пересобирается
 * руками. 26.09–30.09 превью показывало «443 tests» и «Outreach Automation
 * SaaS» после того, как карточки переписали, — сборка была зелёной, а увидеть
 * это мог только тот, кто вставит ссылку в Telegram или LinkedIn.
 *
 * Сборщик пишет снимок текстов, из которых собран кадр (`scripts/og-inputs.json`);
 * здесь тот же снимок снимается заново и сравнивается.
 */
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import test from "node:test";

import { ogInputs } from "../scripts/og-inputs.mjs";

test("превью ссылки собрано из текущих карточек и героя", () => {
  const recorded = JSON.parse(
    readFileSync(new URL("../scripts/og-inputs.json", import.meta.url), "utf8"),
  );
  assert.deepEqual(
    ogInputs(),
    recorded,
    "карточки или герой поменялись, а превью ссылки — нет: " +
      "node scripts/make-assets.mjs и закоммить public/og.jpg вместе со scripts/og-inputs.json",
  );
});
