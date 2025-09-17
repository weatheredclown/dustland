#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT_DIR"

MODULE_NAME=${1:-cli-demo}
JSON_PATH="data/modules/${MODULE_NAME}.json"
JS_PATH="modules/${MODULE_NAME}.module.js"

if [[ ! -f "$JS_PATH" ]]; then
  echo "Module file $JS_PATH not found. Run create-cli-adventure.sh first." >&2
  exit 1
fi

node scripts/supporting/module-json.js export "$JS_PATH"

if [[ ! -f "$JSON_PATH" ]]; then
  echo "Export failed; JSON file $JSON_PATH not found." >&2
  exit 1
fi

node scripts/module-tools/edit-npc.js "$JSON_PATH" guide_rowan questId coded_stone
node scripts/module-tools/edit-npc.js "$JSON_PATH" guide_rowan "tree.start.choices.2.label" "Do you have any other work?"
node scripts/module-tools/edit-npc.js "$JSON_PATH" guide_rowan "tree.start.choices.2.to" quest_offer
node scripts/module-tools/edit-npc.js "$JSON_PATH" guide_rowan "tree.quest_offer.text" "I found a coded stone near the ridge. Want to decipher it?"
node scripts/module-tools/edit-npc.js "$JSON_PATH" guide_rowan "tree.quest_offer.choices.0.label" "I'll take the challenge."
node scripts/module-tools/edit-npc.js "$JSON_PATH" guide_rowan "tree.quest_offer.choices.0.to" accept_coded
node scripts/module-tools/edit-npc.js "$JSON_PATH" guide_rowan "tree.quest_offer.choices.0.q" accept
node scripts/module-tools/edit-npc.js "$JSON_PATH" guide_rowan "tree.quest_offer.choices.1.label" "Not right now."
node scripts/module-tools/edit-npc.js "$JSON_PATH" guide_rowan "tree.quest_offer.choices.1.to" bye
node scripts/module-tools/edit-npc.js "$JSON_PATH" guide_rowan "tree.accept_coded.text" "Take this cipher wheel and meet me when you're done."
node scripts/module-tools/edit-npc.js "$JSON_PATH" guide_rowan "tree.accept_coded.choices.0.label" "I'll get started."
node scripts/module-tools/edit-npc.js "$JSON_PATH" guide_rowan "tree.accept_coded.choices.0.to" bye
node scripts/module-tools/edit-npc.js "$JSON_PATH" guide_rowan "tree.accept_coded.choices.0.reward" camp_rations

node scripts/module-tools/append.js "$JSON_PATH" quests \
  id=coded_stone \
  title="Decode the Stone" \
  desc="Use the cipher wheel Rowan gave you to decode the humming stone." \
  reward=camp_rations \
  xp=4

node scripts/supporting/module-json.js import "$JS_PATH"

echo "Adventure module extended and re-imported from $JSON_PATH into $JS_PATH"
