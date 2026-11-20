import assert from "node:assert/strict";
import { readJsonPayload, readPayload } from "./payload.ts";

const encoder = new TextEncoder();

async function withPayload(bytes: Uint8Array, check: (path: string) => Promise<void>) {
  const path = await Deno.makeTempFile();
  try {
    await Deno.writeFile(path, bytes);
    await check(path);
  } finally {
    await Deno.remove(path);
  }
}

Deno.test("rejects Big5 JSON instead of altering its Chinese text", async () => {
  // Big5 bytes for 測試 inside an otherwise valid JSON object.
  const big5 = Uint8Array.of(
    ...encoder.encode('{"name":"'),
    0xb4,
    0xfa,
    0xb8,
    0xd5,
    ...encoder.encode('"}'),
  );
  await withPayload(big5, async (path) => {
    await assert.rejects(readJsonPayload("--config", undefined, path), {
      message: `--config-file ${JSON.stringify(path)} is not valid UTF-8. Save it as UTF-8.`,
    });
  });
});

Deno.test("identifies UTF-16 BOMs before parsing JSON", async () => {
  const utf16le = Uint8Array.of(0xff, 0xfe, 0x7b, 0x00, 0x7d, 0x00);
  const utf16be = Uint8Array.of(0xfe, 0xff, 0x00, 0x7b, 0x00, 0x7d);
  for (const bytes of [utf16le, utf16be]) {
    await withPayload(bytes, async (path) => {
      await assert.rejects(readJsonPayload("--config", undefined, path), {
        message: `--config-file ${JSON.stringify(path)} has a UTF-16 BOM. Save it as UTF-8.`,
      });
    });
  }
});

Deno.test("strips a UTF-8 BOM and preserves the rest of the payload", async () => {
  const text = "  中文 \uFFFD\r\n";
  await withPayload(encoder.encode("\uFEFF" + text), async (path) => {
    assert.equal(await readPayload("--template-data", undefined, path), text);
  });
});
