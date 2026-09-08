import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import type { InsightRecord, MediaRecord, PartnerRecord, PersonRecord, ProjectRecord, SiteSettingsRecord, StaffRecord } from "./types";
import { seedStore } from "./serialize";

export interface LocalCmsData {
  projects: ProjectRecord[];
  insights: InsightRecord[];
  people: PersonRecord[];
  partners: PartnerRecord[];
  media: MediaRecord[];
  settings: SiteSettingsRecord;
  staff: StaffRecord[];
}

const dir = () => (process.env.VERCEL ? path.join("/tmp", "cit-cms") : path.join(process.cwd(), ".data", "cms"));
const file = () => path.join(dir(), "store.json");

let writeQueue: Promise<void> = Promise.resolve();

async function readStore(): Promise<LocalCmsData> {
  try {
    const raw = await readFile(file(), "utf8");
    return JSON.parse(raw) as LocalCmsData;
  } catch {
    const seeded = seedStore();
    await persist(seeded);
    return seeded;
  }
}

async function persist(data: LocalCmsData): Promise<void> {
  await mkdir(dir(), { recursive: true });
  const tmp = `${file()}.${process.pid}.${randomBytes(6).toString("hex")}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await rename(tmp, file());
}

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(fn, fn);
  writeQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function getLocalStore(): Promise<LocalCmsData> {
  return enqueue(readStore);
}

export async function updateLocalStore(mutator: (data: LocalCmsData) => void): Promise<LocalCmsData> {
  return enqueue(async () => {
    const data = await readStore();
    mutator(data);
    await persist(data);
    return data;
  });
}

export async function resetLocalStore(): Promise<LocalCmsData> {
  return enqueue(async () => {
    const seeded = seedStore();
    await persist(seeded);
    return seeded;
  });
}
