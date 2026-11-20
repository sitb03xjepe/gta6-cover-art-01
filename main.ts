// Palm Shores Cover Studio — gta6-cover-art-01 entrypoint (Node 22, stdlib only).
//
// The app is plain static files under app/ (index.html + ES modules, no build
// step, no network request) and 3-4 screenshots under screenshots/. This
// program hands them in: it copies both folders beside this file into the
// output directory and writes /output/dossier.json with the vendored make.fun
// library, so the scorer can check the app and the judge can read it.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// The program is deterministic: two runs over the same tree write the same
// bytes (verified by running it twice and comparing sha256 sums).

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// Caps from the bounty gate (RULES.txt, "The gate"): app/ at most 993 files
// and 48 MiB, index.html at most 1 MiB, screenshots at most 4 files of
// 256 KiB each, dossier text at most 160 KiB. buildDossier refuses anything
// over them, so a bad tree fails here instead of at the scorer.
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
