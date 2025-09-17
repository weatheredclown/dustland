#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT_DIR"

MODULE_NAME=${1:-cli-demo}
JSON_PATH="data/modules/${MODULE_NAME}.json"
JS_PATH="modules/${MODULE_NAME}.module.js"

rm -f "$JSON_PATH" "$JS_PATH"

node scripts/module-tools/init-module-json.js "$JSON_PATH" \
  seed="${MODULE_NAME}-seed" \
  name="CLI Demo Adventure" \
  map=world \
  x=6 \
  y=5

node scripts/module-tools/append.js "$JSON_PATH" items id=starter_kit name="Starter Kit" type=quest map=world x=5 y=5
node scripts/module-tools/append.js "$JSON_PATH" items id=camp_rations name="Camp Rations" type=food map=world x=7 y=5

node scripts/module-tools/add-npc.js "$JSON_PATH" \
  id=guide_rowan \
  map=world \
  x=6 \
  y=5 \
  name="Guide Rowan" \
  color=#44ccff \
  prompt="A seasoned scout checking their compass" \
  "tree.start.text=Welcome to the CLI-built adventure." \
  "tree.start.choices.0.label=Any tips?" \
  "tree.start.choices.0.to=tip" \
  "tree.start.choices.1.label=Let's head out." \
  "tree.start.choices.1.to=bye" \
  "tree.tip.text=Stay alert and keep your supplies ready." \
  "tree.tip.choices.0.label=Thanks." \
  "tree.tip.choices.0.to=bye" \
  "tree.bye.text=I'll meet you at the lookout." \
  "tree.bye.choices.0.label=Leave" \
  "tree.bye.choices.0.to=end"

node scripts/module-tools/append.js "$JSON_PATH" interiors \
  id=trail_hut \
  w=3 \
  h=3 \
  entryX=1 \
  entryY=1 \
  "grid.0=🏝🚪🏝" \
  "grid.1=🪨🪨🪨" \
  "grid.2=🏝🏝🏝"

node scripts/module-tools/add-building.js "$JSON_PATH" \
  x=8 \
  y=5 \
  interiorId=trail_hut \
  name="Trail Hut" \
  boarded=false

node scripts/module-tools/append.js "$JSON_PATH" events \
  map=world \
  x=7 \
  y=5 \
  "events.0.when=enter" \
  "events.0.effect=toast" \
  "events.0.msg=The air hums with old power." \
  "events.1.when=enter" \
  "events.1.effect=modStat" \
  "events.1.stat=PER" \
  "events.1.delta=1" \
  "events.1.duration=3"

node scripts/module-tools/append.js "$JSON_PATH" quests \
  id=trail_briefing \
  title="Trail Briefing" \
  desc="Talk to Rowan and inspect the humming stones." \
  reward=starter_kit \
  xp=2

node scripts/supporting/json-to-module.js "$JSON_PATH"

echo "Adventure module created: $JSON_PATH -> $JS_PATH"
