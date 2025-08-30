const BROADCAST_FRAGMENT_2 = {
  "seed": "broadcast-2",
  "name": "broadcast-fragment-2",
  "startMap": "world",
  "startPoint": {
    "x": 110,
    "y": 22
  },
  "items": [
    {
      "id": "power_cell",
      "name": "Power Cell",
      "type": "quest"
    },
    {
      "id": "signal_fragment_2",
      "name": "Signal Fragment 2",
      "type": "quest",
      "desc": "Another humming fragment. The resonance is stronger."
    }
  ],
  "quests": [
    {
      "id": "q_silent_tower",
      "title": "The Silent Tower",
      "desc": "Find 3 Power Cells to help Echo restore power to the comms tower.",
      "item": "power_cell",
      "count": 3,
      "reward": "signal_fragment_2",
      "xp": 20
    }
  ],
  "npcs": [
    {
      "id": "echo_scavenger",
      "map": "comms_tower_base",
      "x": 4,
      "y": 4,
      "color": "#a9f59f",
      "name": "Echo",
      "title": "Tech Scavenger",
      "desc": "A young woman tinkering with a rusty control panel at the base of a huge comms tower.",
      "questId": "q_silent_tower",
      "tree": {
        "start": {
          "text": "Almost got it... this old tower wants to sing again, I know it. But the generators are dead. I need three more power cells to get it online. There are some old service depots around here, maybe you can find some?",
          "choices": [
            {
              "label": "(Accept) I'll find them.",
              "to": "accept",
              "q": "accept"
            },
            {
              "label": "(Turn in) I have 3 Power Cells.",
              "to": "turnin",
              "q": "turnin",
              "reqItem": "power_cell",
              "reqCount": 3
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "accept": {
          "text": "Thanks! Be careful out there.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "turnin": {
          "text": "You found them! Amazing! Let's plug these in... *The tower hums to life, and a clear, melodic signal plays for a moment before fading.* It's beautiful... Here, I recorded the fragment for you.",
          "choices": [
            {
              "label": "(Take Fragment)",
              "to": "post_quest",
              "reward": "signal_fragment_2",
              "costItem": "power_cell",
              "costCount": 3
            }
          ]
        },
        "post_quest": {
          "text": "That was just one piece of it. The signal is a symphony! The next part seems to be coming from... a cave system to the north. It's strange, almost like it's underground.",
          "choices": [
            {
              "label": "I'll check it out.",
              "applyModule": "BROADCAST_FRAGMENT_3",
              "to": "bye"
            },
            {
              "label": "I need a moment.",
              "to": "bye"
            }
          ]
        }
      }
    },
    {
      "id": "depot1",
      "map": "world",
      "x": 105,
      "y": 15,
      "color": "#9ef7a0",
      "name": "Service Depot",
      "desc": "A rusty service depot.",
      "tree": {
        "start": {
          "text": "You find a Power Cell inside.",
          "choices": [
            {
              "label": "(Take Cell)",
              "to": "bye",
              "reward": "power_cell",
              "once": true
            }
          ]
        }
      }
    },
    {
      "id": "depot2",
      "map": "world",
      "x": 115,
      "y": 25,
      "color": "#9ef7a0",
      "name": "Service Depot",
      "desc": "A rusty service depot.",
      "tree": {
        "start": {
          "text": "You find a Power Cell inside.",
          "choices": [
            {
              "label": "(Take Cell)",
              "to": "bye",
              "reward": "power_cell",
              "once": true
            }
          ]
        }
      }
    },
    {
      "id": "depot3",
      "map": "world",
      "x": 118,
      "y": 18,
      "color": "#9ef7a0",
      "name": "Service Depot",
      "desc": "A rusty service depot.",
      "tree": {
        "start": {
          "text": "You find a Power Cell inside.",
          "choices": [
            {
              "label": "(Take Cell)",
              "to": "bye",
              "reward": "power_cell",
              "once": true
            }
          ]
        }
      }
    }
  ],
  "interiors": [
    {
      "id": "comms_tower_base",
      "w": 9,
      "h": 9,
      "grid": [
        "🏝🏝🏝🏝🚪🏝🏝🏝🏝",
        "🏝⬜⬜⬜⬜⬜⬜⬜🏝",
        "🏝⬜🪨🪨🪨🪨🪨⬜🏝",
        "🏝⬜🪨🏠🏠🏠🪨⬜🏝",
        "🏝⬜🪨🏠⬜🏠🪨⬜🏝",
        "🏝⬜🪨🏠🏠🏠🪨⬜🏝",
        "🏝⬜🪨🪨🪨🪨🪨⬜🏝",
        "🏝⬜⬜⬜⬜⬜⬜⬜🏝",
        "🏝🏝🏝🏝🏝🏝🏝🏝🏝"
      ],
      "entryX": 4,
      "entryY": 0
    }
  ],
  "buildings": [
    {
      "x": 110,
      "y": 20,
      "w": 1,
      "h": 1,
      "interiorId": "comms_tower_base",
      "grid": [
        "🚪"
      ]
    }
  ]
};

globalThis.BROADCAST_FRAGMENT_2 = BROADCAST_FRAGMENT_2;
