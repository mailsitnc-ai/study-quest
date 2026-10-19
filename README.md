# ⚔️ Study Quest

Turn your notes into an RPG and prep for exams. Upload notes, past papers (even screen recordings),
fight monsters made of your flashcards, and sit timed MYP-style papers that are marked for you, with a
**Road to a 7** after every paper.

## Play it

### Option 1: in your browser (any laptop, nothing to install)

**👉 https://mailsitnc-ai.github.io/study-quest/**

Works in Chrome, Edge, Safari, Firefox and Brave, on Windows, Mac, Linux and Chromebook. Your progress is
saved in that browser on that laptop.

### Option 2: the desktop app

Download the file for your laptop from **[Releases](https://github.com/mailsitnc-ai/study-quest/releases/latest)**:

| Laptop | Download |
|---|---|
| Windows | `Study-Quest-Windows-x64.zip` |
| Mac (M1/M2/M3/M4) | `Study-Quest-Mac-AppleSilicon.zip` |
| Mac (Intel) | `Study-Quest-Mac-Intel.zip` |
| Linux | `Study-Quest-Linux-x64.tar.gz` |

**Opening it the first time.** The app isn't signed, so your computer will warn you once:

- **Windows:** unzip, open the folder, double-click `Study Quest.exe`. If "Windows protected your PC"
  appears, click **More info → Run anyway**.
- **Mac:** unzip and drag `Study Quest.app` into Applications. If macOS says it can't be opened, run this
  in Terminal once, then open it normally:
  ```bash
  xattr -cr "/Applications/Study Quest.app"
  ```
- **Linux:** `tar -xzf Study-Quest-Linux-x64.tar.gz`, then run `./study-quest` inside the folder.

## The AI tutor (Sage)

Sage writes your cards and papers using **your own** free AI keys. Never share keys with anyone.

1. Open the **Sage** tab in the app.
2. Pick a provider. **Groq** is free and fast (get a key at console.groq.com); Gemini and others work too.
3. Paste your key(s). They stay on your laptop only, inside the app or browser.

No keys? You can still play with the cards you make yourself. An optional offline model works if you
install [Ollama](https://ollama.com), but its papers are much simpler.

## For developers

The whole game is `index.html` (+ `decks.js`). The desktop app is a small Electron shell in `desktop/`.

```bash
cd desktop
npm install
npm start            # run the desktop app
npm run build        # build for this computer → desktop/dist/
```

Automatic builds for every platform: move `desktop/ci/desktop-builds.yml` to `.github/workflows/`
(easiest from the GitHub website: **Add file → Create new file**, paste it in). After that, pushing a version
tag (`git tag v1.0.1 && git push --tags`) builds Windows, Mac and Linux downloads into a Release.
