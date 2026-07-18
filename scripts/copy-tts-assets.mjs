// Copie les builds WASM du moteur TTS (Kokoro + espeak-ng) depuis node_modules
// vers public/vendor, d'où ils sont chargés hors-webpack dans le navigateur
// (voir lib/tts-browser.js). Lancé au postinstall → régénéré en dev comme sur
// Vercel, sans committer ces gros binaires générés.

import { mkdir, copyFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dest = path.join(root, "public", "vendor");

const files = [
  ["node_modules/kokoro-js/dist/kokoro.web.js", "kokoro.web.js"],
  ["node_modules/espeak-ng/dist/espeak-ng.js", "espeak-ng.js"],
  ["node_modules/espeak-ng/dist/espeak-ng.wasm", "espeak-ng.wasm"],
];

await mkdir(dest, { recursive: true });

for (const [from, name] of files) {
  const src = path.join(root, from);
  try {
    await access(src);
    await copyFile(src, path.join(dest, name));
    console.log(`[tts-assets] copié ${name}`);
  } catch {
    // Ne pas casser l'install si un paquet manque (ex: --ignore-scripts).
    console.warn(`[tts-assets] introuvable, ignoré : ${from}`);
  }
}
