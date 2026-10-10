#!/bin/sh
# Nutzung: ashot.sh name pfad [breite] [hoehe]
D="C:/Users/mailt/AppData/Local/Temp/claude/C--Users-mailt-OneDrive-KI-Programme-wss-digital-mathe-trainer/6aeb38f7-a412-4b0b-81e2-ef5386a5515d/scratchpad/app-shots"
W=${3:-1180}; H=${4:-820}
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=6000 --window-size=$W,$H --screenshot="$D/$1.png" "http://localhost:5173$2" >/dev/null 2>&1
echo "$D/$1.png"
