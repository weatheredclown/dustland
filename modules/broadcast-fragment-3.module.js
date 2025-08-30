const DATA = `
{
  "seed": "broadcast-3",
  "name": "broadcast-fragment-3",
  "startMap": "world",
  "startPoint": {
    "x": 118,
    "y": 12
  },
  "items": [
    {
      "id": "signal_fragment_3",
      "name": "Signal Fragment 3",
      "type": "quest",
      "desc": "The final fragment. It hums with a powerful, clear energy."
    }
  ],
  "quests": [
    {
      "id": "q_resonant_cave",
      "title": "The Resonant Cave",
      "desc": "Follow the Hermit's instructions to activate the Resonant Crystals in the correct order.",
      "reward": "signal_fragment_3",
      "xp": 30,
      "reqFlag": "cave_puzzle_complete"
    }
  ],
  "npcs": [
    {
      "id": "cave_hermit",
      "map": "resonant_cave",
      "x": 5,
      "y": 1,
      "color": "#9abf9a",
      "name": "The Hermit",
      "title": "Cave Dweller",
      "desc": "A man with eyes that seem to look through you, not at you.",
      "questId": "q_resonant_cave",
      "tree": {
        "start": {
          "text": "You feel the hum, don't you? This cave sings. The stones remember the signal's song. To hear it, you must play along. Red, Blue, then Green. Touch the crystals in that order.",
          "choices": [
            {
              "label": "(Accept) I will listen.",
              "to": "accept",
              "q": "accept"
            },
            {
              "label": "(Complete) I have activated the crystals.",
              "to": "turnin",
              "q": "turnin"
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "accept": {
          "text": "The cave is patient.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "turnin": {
          "text": "You hear it now! The full song! The signal is not a what, but a where. It points to the Salt Flats. To the Observatory. Go.",
          "choices": [
            {
              "label": "(Take Final Fragment)",
              "to": "bye",
              "reward": "signal_fragment_3",
              "applyModule": "MARA_PUZZLE"
            }
          ]
        }
      }
    },
    {
      "id": "red_crystal",
      "map": "resonant_cave",
      "x": 2,
      "y": 5,
      "color": "#f88",
      "name": "Red Crystal",
      "tree": {
        "start": {
          "text": "A large, red crystal hums faintly.",
          "choices": [
            {
              "label": "(Touch it)",
              "to": "bye",
              "effects": [
                {
                  "effect": "addFlag",
                  "flag": "crystal_1_red"
                }
              ]
            }
          ]
        }
      }
    },
    {
      "id": "blue_crystal",
      "map": "resonant_cave",
      "x": 8,
      "y": 5,
      "color": "#88f",
      "name": "Blue Crystal",
      "tree": {
        "start": {
          "text": "A large, blue crystal hums faintly.",
          "choices": [
            {
              "label": "(Touch it)",
              "to": "bye",
              "if": {
                "flag": "crystal_1_red"
              },
              "effects": [
                {
                  "effect": "addFlag",
                  "flag": "crystal_2_blue"
                }
              ]
            }
          ]
        }
      }
    },
    {
      "id": "green_crystal",
      "map": "resonant_cave",
      "x": 5,
      "y": 8,
      "color": "#8f8",
      "name": "Green Crystal",
      "tree": {
        "start": {
          "text": "A large, green crystal hums faintly.",
          "choices": [
            {
              "label": "(Touch it)",
              "to": "bye",
              "if": {
                "flag": "crystal_2_blue"
              },
              "effects": [
                {
                  "effect": "addFlag",
                  "flag": "cave_puzzle_complete"
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
      "id": "resonant_cave",
      "w": 11,
      "h": 11,
      "grid": [
        "🪨🪨🪨🪨🪨🚪🪨🪨🪨🪨🪨",
        "🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨",
        "🪨⬜🪨🪨⬜⬜⬜🪨🪨⬜🪨",
        "🪨⬜🪨⬜⬜⬜⬜⬜🪨⬜🪨",
        "🪨⬜⬜⬜🪨⬜🪨⬜⬜⬜🪨",
        "🪨⬜⬜🪨⬜⬜⬜🪨⬜⬜🪨",
        "🪨⬜⬜⬜⬜🪨⬜⬜⬜⬜🪨",
        "🪨⬜🪨⬜⬜⬜⬜⬜🪨⬜🪨",
        "🪨⬜🪨🪨⬜⬜⬜🪨🪨⬜🪨",
        "🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨",
        "🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨"
      ],
      "entryX": 5,
      "entryY": 0
    }
  ],
  "buildings": [
    {
      "x": 118,
      "y": 10,
      "w": 1,
      "h": 1,
      "interiorId": "resonant_cave",
      "grid": [
        "🚪"
      ]
    }
  ]
}
`;

function postLoad(module) {}

globalThis.BROADCAST_FRAGMENT_3 = JSON.parse(DATA);
globalThis.BROADCAST_FRAGMENT_3.postLoad = postLoad;

