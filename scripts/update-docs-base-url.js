import fs from "fs";
import path from "node:path";

const OLD = "https://github-readme-stats.vercel.app";
const NEW =
  process.env.NEW_BASE_URL ||
  "https://github-readme-stats-plus-theta.vercel.app";

const files = [path.resolve("readme.md"), path.resolve("themes/README.md")];

for (const file of files) {
  if (!fs.existsSync(file)) {
    continue;
  }
  const before = fs.readFileSync(file, "utf8");
  const after = before.split(OLD).join(NEW);
  if (after !== before) {
    fs.writeFileSync(file, after);
    console.log(`Updated base URL in ${path.basename(file)}`);
  }
}
