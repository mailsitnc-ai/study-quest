#!/bin/bash
# Rebuilds the Study Quest desktop app from ../index.html and installs it to ~/Applications.
set -e
cd "$(dirname "$0")"
mkdir -p app && cp ../index.html ../decks.js app/
[ -f icon.icns ] || python3 make_icon.py
npx @electron/packager . "Study Quest" --platform=darwin --arch=arm64 --out=dist --overwrite \
  --icon=icon.icns --app-bundle-id=com.studyquest.app --app-version=1.0.0 \
  --ignore='^/dist' --ignore='make_icon\.py' --ignore='icon\.iconset' --ignore='icon-1024\.png' --ignore='build-app\.sh'
APP="dist/Study Quest-darwin-arm64/Study Quest.app"
codesign --force --deep -s - "$APP"
mkdir -p "$HOME/Applications"
rm -rf "$HOME/Applications/Study Quest.app"
cp -R "$APP" "$HOME/Applications/"
echo "Installed: $HOME/Applications/Study Quest.app"
