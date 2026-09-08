import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { seedStore } from "../src/lib/cms/serialize";

async function main() {
  const dir = path.join(process.cwd(), ".data", "cms");
  await mkdir(dir, { recursive: true });
  const data = seedStore();
  await writeFile(path.join(dir, "store.json"), JSON.stringify(data, null, 2));
  console.log(`Seeded ${data.projects.length} projects, ${data.insights.length} insights, ${data.media.length} media files → .data/cms/store.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
