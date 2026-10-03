import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const privateStorageRoot = path.join(process.cwd(), ".data", "private");

function safePath(key: string) {
  if (!/^[a-zA-Z0-9/_-]+\.[a-zA-Z0-9]+$/.test(key) || key.includes(".."))
    throw new Error("INVALID_STORAGE_KEY");
  const target = path.join(privateStorageRoot, ...key.split("/"));
  if (!target.startsWith(`${privateStorageRoot}${path.sep}`))
    throw new Error("INVALID_STORAGE_KEY");
  return target;
}

export async function putPrivateObject(key: string, contents: Uint8Array) {
  const target = safePath(key);
  await mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.${crypto.randomUUID()}.tmp`;
  await writeFile(temporary, contents, { flag: "wx" });
  await rename(temporary, target);
}

export async function getPrivateObject(key: string) {
  return readFile(safePath(key));
}
