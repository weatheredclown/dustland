function seedWorldContent() {}

const DATA = `
{
  "seed": "cli-demo-seed",
  "name": "CLI Demo Adventure",
  "start": {
    "map": "world",
    "x": 6,
    "y": 5
  },
  "items": [
    {
      "id": "starter_kit",
      "name": "Starter Kit",
      "type": "quest",
      "map": "world",
      "x": 5,
      "y": 5
    },
    {
      "id": "camp_rations",
      "name": "Camp Rations",
      "type": "food",
      "map": "world",
      "x": 7,
      "y": 5
    }
  ],
  "quests": [
    {
      "id": "trail_briefing",
      "title": "Trail Briefing",
      "desc": "Talk to Rowan and inspect the humming stones.",
      "reward": "starter_kit",
      "xp": 6
    },
    {
      "id": "coded_stone",
      "title": "Decode the Stone",
      "desc": "Use the cipher wheel Rowan gave you to decode the humming stone.",
      "reward": "camp_rations",
      "xp": 12
    }
  ],
  "npcs": [
    {
      "id": "guide_rowan",
      "map": "world",
      "x": 6,
      "y": 5,
      "name": "Guide Rowan",
      "color": "#44ccff",
      "prompt": "A seasoned scout checking their compass",
      "tree": {
        "start": {
          "text": "Welcome to the CLI-built adventure.",
          "choices": [
            {
              "label": "Any tips?",
              "to": "tip"
            },
            {
              "label": "Let's head out.",
              "to": "bye"
            },
            {
              "label": "Do you have any other work?",
              "to": "quest_offer"
            }
          ]
        },
        "tip": {
          "text": "Stay alert and keep your supplies ready.",
          "choices": [
            {
              "label": "Thanks.",
              "to": "bye"
            }
          ]
        },
        "bye": {
          "text": "I'll meet you at the lookout.",
          "choices": [
            {
              "label": "Leave",
              "to": "end"
            }
          ]
        },
        "quest_offer": {
          "text": "I found a coded stone near the ridge. Want to decipher it?",
          "choices": [
            {
              "label": "I'll take the challenge.",
              "to": "accept_coded",
              "q": "accept"
            },
            {
              "label": "Not right now.",
              "to": "bye"
            }
          ]
        },
        "accept_coded": {
          "text": "Take this cipher wheel and meet me when you're done.",
          "choices": [
            {
              "label": "I'll get started.",
              "to": "bye",
              "reward": "camp_rations"
            }
          ]
        }
      },
      "questId": "coded_stone"
    }
  ],
  "events": [
    {
      "map": "world",
      "x": 7,
      "y": 5,
      "events": [
        {
          "when": "enter",
          "effect": "toast",
          "msg": "The air hums with old power."
        },
        {
          "when": "enter",
          "effect": "modStat",
          "stat": "PER",
          "delta": 1,
          "duration": 3
        }
      ]
    }
  ],
  "portals": [],
  "interiors": [
    {
      "id": "trail_hut",
      "w": 3,
      "h": 3,
      "entryX": 1,
      "entryY": 1,
      "grid": [
        "🏝🚪🏝",
        "🪨🪨🪨",
        "🏝🏝🏝"
      ]
    }
  ],
  "buildings": [
    {
      "x": 8,
      "y": 5,
      "interiorId": "trail_hut",
      "name": "Trail Hut",
      "boarded": false
    }
  ],
  "zones": [],
  "templates": []
}
`;

function postLoad(module) {}

globalThis.CLI_DEMO_MODULE = JSON.parse(DATA);
globalThis.CLI_DEMO_MODULE.postLoad = postLoad;

startGame = function () {
  CLI_DEMO_MODULE.postLoad?.(CLI_DEMO_MODULE);
  applyModule(CLI_DEMO_MODULE);
  const s = CLI_DEMO_MODULE.start;
  if (s) {
    setPartyPos(s.x, s.y);
    setMap(s.map, 'CLI Demo Adventure');
  }
};
