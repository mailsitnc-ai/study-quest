#!/bin/bash
# Rebuilds the Study Quest desktop app from ../index.html and installs it to ~/Applications.
# There is only ever ONE Study Quest on this Mac: the build happens in a temporary folder outside the
# project (so Spotlight, Launchpad and the Dock never pick up a second copy) and is deleted after installing.
set -e
cd "$(dirname "$0")"
mkdir -p app && cp ../index.html ../decks.js app/
[ -f icon.icns ] || python3 make_icon.py
OUT="$(mktemp -d "${TMPDIR:-/tmp}/studyquest-build.XXXXXX")"
trap 'rm -rf "$OUT"' EXIT
npx @electron/packager . "Study Quest" --platform=darwin --arch=arm64 --out="$OUT" --overwrite \
  --icon=icon.icns --app-bundle-id=com.studyquest.app --app-version=1.0.0 \
  --ignore='^/dist' --ignore='^/rel' --ignore='make_icon\.py' --ignore='icon\.iconset' --ignore='icon-1024\.png' --ignore='build-app\.sh'
APP="$OUT/Study Quest-darwin-arm64/Study Quest.app"
codesign --force --deep -s - "$APP"
mkdir -p "$HOME/Applications"
rm -rf "$HOME/Applications/Study Quest.app"
cp -R "$APP" "$HOME/Applications/"
echo "Installed: $HOME/Applications/Study Quest.app (the only copy)"
