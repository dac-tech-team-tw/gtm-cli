// TextDecoder strips one leading UTF-8 BOM without changing any other text.
const utf8Decoder = new TextDecoder("utf-8", { fatal: true });

// Inline empty values were historically treated as omitted by write commands.
export async function readPayload(
  flag: string,
  inline: string | undefined,
  path: string | undefined,
): Promise<string | undefined> {
  if (path === undefined) return inline || undefined;

  const fileFlag = `${flag}-file`;
  if (inline !== undefined) {
    throw new Error(`Use either ${flag} or ${fileFlag}, not both.`);
  }

  let bytes: Uint8Array;
  try {
    bytes = await Deno.readFile(path);
  } catch (err) {
    throw new Error(`Cannot read ${fileFlag} ${JSON.stringify(path)}: ${err}`, { cause: err });
  }

  if (
    (bytes[0] === 0xff && bytes[1] === 0xfe) ||
    (bytes[0] === 0xfe && bytes[1] === 0xff)
  ) {
    throw new Error(`${fileFlag} ${JSON.stringify(path)} has a UTF-16 BOM. Save it as UTF-8.`);
  }

  try {
    return utf8Decoder.decode(bytes);
  } catch (err) {
    throw new Error(`${fileFlag} ${JSON.stringify(path)} is not valid UTF-8. Save it as UTF-8.`, {
      cause: err,
    });
  }
}

export async function readJsonPayload(
  flag: string,
  inline: string | undefined,
  path: string | undefined,
): Promise<unknown> {
  const text = await readPayload(flag, inline, path);
  if (text === undefined) return undefined;

  try {
    return JSON.parse(text);
  } catch (err) {
    if (path === undefined) throw err;
    // Parser errors can include excerpts of the payload; do not print file contents.
    throw new Error(`Invalid JSON in ${flag}-file ${JSON.stringify(path)}.`, { cause: err });
  }
}
