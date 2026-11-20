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

  try {
    const text = await Deno.readTextFile(path);
    return text.startsWith("\uFEFF") ? text.slice(1) : text;
  } catch (err) {
    throw new Error(`Cannot read ${fileFlag} ${JSON.stringify(path)}: ${err}`, { cause: err });
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
