import { createHash } from 'node:crypto';
import { createReadStream, existsSync } from 'node:fs';
import { mkdir, rename, rm } from 'node:fs/promises';
import path from 'node:path';

type DatabaseFileProviderOptions = {
  databasePath: string;
  download?: (destination: string) => Promise<unknown>;
  sha256?: string;
};

async function fileSha256(filePath: string): Promise<string> {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(filePath)) hash.update(chunk);
  return hash.digest('hex');
}

export function createDatabaseFileProvider(options: DatabaseFileProviderOptions) {
  let initialization: Promise<string> | undefined;

  async function prepare() {
    if (existsSync(options.databasePath)) return options.databasePath;
    if (!options.download) {
      throw new Error(`Remedies database not found at ${options.databasePath}`);
    }

    await mkdir(path.dirname(options.databasePath), { recursive: true });
    const temporaryPath = `${options.databasePath}.${process.pid}.download`;

    try {
      await options.download(temporaryPath);
      if (options.sha256 && await fileSha256(temporaryPath) !== options.sha256.toLowerCase()) {
        throw new Error('Downloaded remedies database failed SHA-256 verification');
      }
      await rename(temporaryPath, options.databasePath);
      return options.databasePath;
    } catch (error) {
      await rm(temporaryPath, { force: true });
      throw error;
    }
  }

  return {
    getPath() {
      initialization ??= prepare().catch((error) => {
        initialization = undefined;
        throw error;
      });
      return initialization;
    },
  };
}

function createProductionDownload() {
  const bucket = process.env.REMEDIES_BUCKET;
  const object = process.env.REMEDIES_OBJECT;
  if (!bucket || !object) return undefined;

  return async (destination: string) => {
    const { Storage } = await import('@google-cloud/storage');
    await new Storage().bucket(bucket).file(object).download({ destination });
  };
}

const configuredPath = process.env.REMEDIES_DB_PATH;
const databasePath = configuredPath
  ? path.resolve(configuredPath)
  : path.join(process.cwd(), 'server-data', 'demo-remedies.db');

const provider = createDatabaseFileProvider({
  databasePath,
  download: createProductionDownload(),
  sha256: process.env.REMEDIES_DB_SHA256,
});

export const getDatabaseFilePath = provider.getPath;
