import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { env } from "@/config/env";

const privateStorageRoot = path.join(process.cwd(), ".data", "private");

function s3Config() {
  if (
    !env.STORAGE_S3_BUCKET ||
    !env.STORAGE_S3_ACCESS_KEY_ID ||
    !env.STORAGE_S3_SECRET_ACCESS_KEY
  )
    throw new Error("S3_STORAGE_NOT_CONFIGURED");
  return {
    bucket: env.STORAGE_S3_BUCKET,
    client: new S3Client({
      endpoint: env.STORAGE_S3_ENDPOINT,
      region: env.STORAGE_S3_REGION,
      forcePathStyle: env.STORAGE_S3_FORCE_PATH_STYLE,
      credentials: {
        accessKeyId: env.STORAGE_S3_ACCESS_KEY_ID,
        secretAccessKey: env.STORAGE_S3_SECRET_ACCESS_KEY,
      },
    }),
  };
}

function safePath(key: string) {
  if (!/^[a-zA-Z0-9/_-]+\.[a-zA-Z0-9]+$/.test(key) || key.includes(".."))
    throw new Error("INVALID_STORAGE_KEY");
  const target = path.join(privateStorageRoot, ...key.split("/"));
  if (!target.startsWith(`${privateStorageRoot}${path.sep}`))
    throw new Error("INVALID_STORAGE_KEY");
  return target;
}

export async function putPrivateObject(key: string, contents: Uint8Array) {
  if (env.STORAGE_DRIVER === "s3") {
    const { client, bucket } = s3Config();
    await client.send(
      new PutObjectCommand({ Bucket: bucket, Key: key, Body: contents }),
    );
    return;
  }
  const target = safePath(key);
  await mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.${crypto.randomUUID()}.tmp`;
  await writeFile(temporary, contents, { flag: "wx" });
  await rename(temporary, target);
}

export async function getPrivateObject(key: string) {
  if (env.STORAGE_DRIVER === "s3") {
    const { client, bucket } = s3Config();
    const result = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );
    if (!result.Body) throw new Error("STORAGE_OBJECT_NOT_FOUND");
    return Buffer.from(await result.Body.transformToByteArray());
  }
  return readFile(safePath(key));
}

export async function deletePrivateObject(key: string) {
  if (env.STORAGE_DRIVER === "s3") {
    const { client, bucket } = s3Config();
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    return;
  }
  await unlink(safePath(key)).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
}

export function usesDirectPrivateUploads() {
  return env.STORAGE_DRIVER === "s3";
}

export async function createPrivateUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 300,
) {
  const { client, bucket } = s3Config();
  return getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: expiresInSeconds },
  );
}
