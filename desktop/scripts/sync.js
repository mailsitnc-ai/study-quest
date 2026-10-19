// Copies the game (../index.html, ../decks.js) into ./app — works on Windows, macOS and Linux.
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..", ".."), app = path.join(__dirname, "..", "app");
fs.mkdirSync(app, { recursive: true });
for (const f of ["index.html", "decks.js"]) fs.copyFileSync(path.join(root, f), path.join(app, f));
console.log("synced index.html + decks.js into desktop/app");
