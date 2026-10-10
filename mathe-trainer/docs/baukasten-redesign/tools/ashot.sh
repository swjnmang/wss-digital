#!/bin/sh
# Nutzung: ashot.sh name pfad [breite] [hoehe]   (Ziel: $SHOT_DIR, Server: $SHOT_PORT, Standard 5173)
D="${SHOT_DIR:-.}"
P="${SHOT_PORT:-5173}"
W=${3:-1180}; H=${4:-820}
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=6000 --window-size=$W,$H --screenshot="$D/$1.png" "http://localhost:$P$2" >/dev/null 2>&1
echo "$D/$1.png"
