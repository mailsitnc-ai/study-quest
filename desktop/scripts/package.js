// Builds Study Quest for this computer (or another: node scripts/package.js win32|darwin|linux [x64|arm64]).
// Output: desktop/dist/Study Quest-<platform>-<arch>/
const { packager } = require("@electron/packager");
const path = require("path");
const platform = process.argv[2] || process.platform, arch = process.argv[3] || process.arch;
const icon = path.join(__dirname, "..", platform === "darwin" ? "icon.icns" : platform === "win32" ? "icon.ico" : "icon.png");
packager({
  dir: path.join(__dirname, ".."), name: "Study Quest", platform, arch, out: path.join(__dirname, "..", "dist"), overwrite: true,
  icon, appBundleId: "com.studyquest.app", appVersion: require("../package.json").version,
  executableName: platform === "linux" ? "study-quest" : "Study Quest",
  ignore: [/^\/dist/, /^\/index\.html$/, /^\/scripts\/(?!sync)/, /make_icon\.py/, /icon\.iconset/, /icon-1024\.png/, /build-app\.sh/],
  win32metadata: { CompanyName: "Study Quest", ProductName: "Study Quest", FileDescription: "Study Quest — Exam Prep RPG" }
}).then((out) => console.log("built:", out.join(", "))).catch((e) => { console.error(e); process.exit(1); });
