function seedWorldContent() {}
const DATA = `
{
  "seed": "silencer-encounter",
  "name": "silencer-encounter",
  "start": {
    "map": "arena",
    "x": 2,
    "y": 2
  },
  "items": [],
  "quests": [],
  "npcs": [
    {
      "id": "silencer",
      "map": "arena",
      "x": 2,
      "y": 2,
      "name": "Silencer Scout",
      "desc": "A rival drifter watches your moves.",
      "prompt": "Hooded drifter with goggles and a muffled scarf",
      "tree": {
        "start": {
          "text": "A Silencer scout scans the relay. How do you approach?",
          "choices": [
            {
              "label": "Sneak past",
              "to": "sneak"
            },
            {
              "label": "Negotiate",
              "to": "talk"
            },
            {
              "label": "Clash",
              "to": "fight"
            },
            {
              "label": "Taunt",
              "to": "taunt"
            }
          ]
        },
        "taunt": {
          "text": "You bark a challenge. The scout's visor tilts, amused.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye",
              "effects": [
                {
                  "effect": "toast",
                  "msg": "The scout bides his time."
                }
              ]
            }
          ]
        },
        "sneak": {
          "text": "You slip past while his visor fogs.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye",
              "effects": [
                {
                  "effect": "toast",
                  "msg": "You avoid the scout."
                }
              ]
            }
          ]
        },
        "talk": {
          "text": "State your business, he grates. You keep it brief and he lets you pass.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye",
              "effects": [
                {
                  "effect": "toast",
                  "msg": "The scout steps aside."
                }
              ]
            }
          ]
        },
        "fight": {
          "text": "You reach for your weapon but the scout backs off, marking you.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye",
              "effects": [
                {
                  "effect": "toast",
                  "msg": "Conflict avoided—for now."
                }
              ]
            }
          ]
        }
      }
    }
  ],
  "interiors": [
    {
      "id": "arena",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱"
      ],
      "entryX": 2,
      "entryY": 2
    }
  ],
  "events": [],
  "portals": [],
  "buildings": []
}
`;

function postLoad(module) {}

globalThis.SILENCER_ENCOUNTER = JSON.parse(DATA);
globalThis.SILENCER_ENCOUNTER.postLoad = postLoad;

startGame = function () {
  applyModule(SILENCER_ENCOUNTER);
  var s = SILENCER_ENCOUNTER.start;
  setPartyPos(s.x, s.y);
  setMap(s.map, 'Arena');
  log('A Silencer scout blocks your path.');
};
