// Study Quest — desktop shell. Loads the game from ./app/index.html in a normal window.
const { app, BrowserWindow, Menu, shell, nativeTheme } = require("electron");
const path = require("path");
const fs = require("fs");

app.setName("Study Quest");
nativeTheme.themeSource = "dark";
app.setAboutPanelOptions({
  applicationName: "Study Quest",
  applicationVersion: "1.0.0",
  copyright: "Turn your notes into a game and ace your exams."
});

if (!app.requestSingleInstanceLock()) app.quit();

let win;
const isMac = process.platform === "darwin";
function createWindow() {
  win = new BrowserWindow({
    width: 1320,
    height: 880,
    minWidth: 380,
    minHeight: 560,
    title: "Study Quest — Exam Prep RPG",
    backgroundColor: "#070716",
    // macOS: content runs under the traffic lights. Windows/Linux keep the normal frame (a hidden title bar there removes the close/minimise buttons).
    ...(isMac ? { titleBarStyle: "hiddenInset", trafficLightPosition: { x: 18, y: 24 } } : { autoHideMenuBar: true }),
    icon: isMac ? undefined : path.join(__dirname, "icon.png"),
    show: false,
    webPreferences: { spellcheck: false, backgroundThrottling: false }
  });
  win.once("ready-to-show", () => win.show());
  win.loadFile(path.join(__dirname, "app", "index.html"));

  // links (e.g. "open AI Studio") go to the real browser, never inside the game window
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => {
    if (!url.startsWith("file:")) {
      e.preventDefault();
      if (/^https?:/.test(url)) shell.openExternal(url);
    }
  });
  win.on("page-title-updated", (e) => e.preventDefault());

  migrationHooks();

  // test mode (used to check the app really starts): reports state + console errors to a file, optionally a screenshot, then quits
  if (process.env.SQ_SHOT) {
    const out = process.env.SQ_SHOT, errors = [];
    win.webContents.on("console-message", (_e, level, msg) => { if (level >= 3) errors.push(msg); });
    win.webContents.once("did-finish-load", async () => {
      await new Promise((r) => setTimeout(r, 3000));
      let info = "{}";
      try {
        info = await win.webContents.executeJavaScript(
          "JSON.stringify({title:document.title,topbar:!!document.getElementById('topbar'),hasGame:typeof go==='function',view:typeof view==='string'?view:null,fonts:document.fonts?document.fonts.size:0})"
        );
      } catch (e) { info = JSON.stringify({err: String(e)}); }
      fs.writeFileSync(out + ".json", JSON.stringify({ windowTitle: win.getTitle(), page: JSON.parse(info), errors }));
      try {
        const img = await Promise.race([win.webContents.capturePage(), new Promise((_, rej) => setTimeout(() => rej(new Error("capture timeout")), 8000))]);
        fs.writeFileSync(out, img.toPNG());
      } catch (e) { fs.writeFileSync(out + ".err", String(e)); }
      app.exit(0);
    });
  }
}

// migration / inspection helpers (used when moving a save into the app): SQ_INSPECT=1 or SQ_IMPORT=<save.json>, SQ_REPORT=<out.json>, SQ_BACKUP=<out.json>
function migrationHooks() {
  if (!(process.env.SQ_IMPORT || process.env.SQ_INSPECT || process.env.SQ_JS)) return;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const run = (js) => win.webContents.executeJavaScript(js);
  const summary = "JSON.stringify((()=>{try{const s=JSON.parse(localStorage.getItem('studyquest.v2')||'null');const d=JSON.parse(localStorage.getItem('studyquest.v2.decks')||'[]');return{hero:s&&s.name||null,xp:s&&s.xp||0,notebooks:d.filter(x=>x.type!=='spellbook').length,spellbooks:d.filter(x=>x.type==='spellbook').length,cards:d.reduce((n,x)=>n+(x.cards||[]).length,0),keysSet:s?(s.keys||[]).filter(Boolean).length:0}}catch(e){return{err:String(e)}}})())";
  let phase = 0;
  win.webContents.on("did-finish-load", async () => {
    await sleep(2500);
    if (phase === 0 && process.env.SQ_IMPORT) {
      phase = 1;
      const before = await run(summary);
      if (process.env.SQ_BACKUP) {
        const dump = await run("JSON.stringify(Object.fromEntries(Object.keys(localStorage).filter(k=>k.startsWith('studyquest')).map(k=>[k,localStorage.getItem(k)])))");
        fs.writeFileSync(process.env.SQ_BACKUP, dump);
      }
      const data = JSON.parse(fs.readFileSync(process.env.SQ_IMPORT, "utf8")).data;
      await run("(d=>{for(const k of Object.keys(localStorage))if(k.startsWith('studyquest'))localStorage.removeItem(k);for(const k in d)localStorage.setItem(k,d[k])})(" + JSON.stringify(data) + ")");
      fs.writeFileSync(process.env.SQ_REPORT + ".before", before);
      win.webContents.reload();
      return;
    }
    if (process.env.SQ_JS) {
      let r;
      try { r = await run(fs.readFileSync(process.env.SQ_JS, "utf8")); } catch (e) { r = "ERR " + e; }
      fs.writeFileSync(process.env.SQ_REPORT, typeof r === "string" ? r : JSON.stringify(r));
      try { await win.webContents.session.flushStorageData(); } catch (e) {}
      await sleep(800);
      app.exit(0);
      return;
    }
    const after = await run(summary);
    fs.writeFileSync(process.env.SQ_REPORT, after);
    app.exit(0);
  });
}

// ---- automatic backups: every few minutes and on quit, the last 12 are kept (API keys are NOT included) ----
const backupDir = path.join(app.getPath("userData"), "backups");
async function backup() {
  try {
    if (!win || win.isDestroyed()) return;
    const raw = await win.webContents.executeJavaScript(
      "JSON.stringify(Object.fromEntries(Object.keys(localStorage).filter(k=>k.startsWith('studyquest')).map(k=>[k,localStorage.getItem(k)])))"
    );
    const data = JSON.parse(raw || "{}");
    if (!data["studyquest.v2"]) return;
    const st = JSON.parse(data["studyquest.v2"]);
    st.keys = ["", "", "", "", "", ""]; delete st.key; st.kbad = {}; st.kfail = {}; st.kidx = 0;
    data["studyquest.v2"] = JSON.stringify(st);
    fs.mkdirSync(backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 16);
    fs.writeFileSync(path.join(backupDir, "save-" + stamp + ".json"), JSON.stringify({ app: "study-quest", v: 1, data }));
    const all = fs.readdirSync(backupDir).filter((x) => x.startsWith("save-")).sort();
    while (all.length > 12) fs.unlinkSync(path.join(backupDir, all.shift()));
  } catch (e) { /* never let a backup problem interrupt studying */ }
}
setInterval(backup, 3 * 60 * 1000);
let quitting = false;
app.on("before-quit", (e) => {
  if (quitting || process.env.SQ_SHOT || process.env.SQ_JS || process.env.SQ_IMPORT || process.env.SQ_INSPECT) return;
  e.preventDefault(); quitting = true;
  backup().finally(() => app.quit());
});

// ---- live status (never includes keys): lets a developer / helper see what the background AI job is doing ----
async function status() {
  try {
    if (!win || win.isDestroyed()) return;
    const r = await win.webContents.executeJavaScript(
      "JSON.stringify({time:new Date().toISOString(),provider:S.prov,model:S.model||'(default)',keysEntered:(S.keys||[]).filter(Boolean).length,keyShapes:(S.keys||[]).filter(Boolean).map(k=>k.slice(0,3)+'… ('+k.length+' chars)'),upg:(typeof UPG!=='undefined'&&UPG)?{name:UPG.name,done:UPG.done,total:UPG.total,sub:UPG.sub}:null,queued:(typeof UPQ!=='undefined')?UPQ.length:0,log:(S.aiLog||[]).slice(-14).map(l=>new Date(l.t).toISOString().slice(11,19)+' '+l.m),notebooks:NBS().filter(n=>n.type!=='spellbook').map(n=>n.name+': '+n.cards.length+' cards, '+n.sources.filter(s=>s.cards).length+'/'+n.sources.length+' files AI-written')})"
    );
    fs.writeFileSync(path.join(app.getPath("userData"), "status.json"), r);
  } catch (e) { /* ignore */ }
}
setInterval(status, 10000);
app.on("second-instance", () => {
  if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
});

app.whenReady().then(() => {
  // local Ollama fallback: the page is a file://, so let it talk to the local Ollama server (Ollama rejects the "null" origin)
  const oll = { urls: ["http://localhost:11434/*", "http://127.0.0.1:11434/*"] };
  const ses = require("electron").session.defaultSession;
  ses.webRequest.onBeforeSendHeaders(oll, (d, cb) => { const h = d.requestHeaders; delete h.Origin; delete h.origin; cb({ requestHeaders: h }); });
  ses.webRequest.onHeadersReceived(oll, (d, cb) => { const h = d.responseHeaders || {}; h["Access-Control-Allow-Origin"] = ["*"]; h["Access-Control-Allow-Headers"] = ["*"]; h["Access-Control-Allow-Methods"] = ["GET, POST, OPTIONS"]; cb({ responseHeaders: h, statusLine: d.method === "OPTIONS" ? "HTTP/1.1 204 No Content" : d.statusLine }); });
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(isMac ? [{ role: "appMenu" }] : []),
    { role: "fileMenu" },
    { role: "editMenu" },
    {
      label: "View",
      submenu: [
        { role: "reload" }, { role: "forceReload" }, { role: "togglefullscreen" },
        { type: "separator" },
        { role: "resetZoom" }, { role: "zoomIn" }, { role: "zoomOut" }
      ]
    },
    ...(isMac ? [{ role: "windowMenu" }] : [])
  ]));
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on("window-all-closed", () => app.quit());
