const BROADCAST_FRAGMENT_1 = {
  "seed": "broadcast-1",
  "name": "broadcast-fragment-1",
  "startMap": "world",
  "startPoint": { "x": 102, "y": 20 },
  "items": [
    { "id": "tuned_crystal", "name": "Tuned Crystal", "type": "quest" },
    { "id": "signal_fragment_1", "name": "Signal Fragment 1", "type": "quest", "desc": "A strange, humming piece of metal that seems to resonate with the radio waves." }
  ],
  "quests": [
    { "id": "q_first_echo", "title": "The First Echo", "desc": "Find the Tuned Crystal for Sparks to help him focus the Ghost Signal.", "item": "tuned_crystal", "reward": "signal_fragment_1", "xp": 10 }
  ],
  "npcs": [
    {
      "id": "sparks",
      "map": "radio_shack",
      "x": 3,
      "y": 2,
      "color": "#a9f59f",
      "name": "Sparks",
      "title": "Wasteland Listener",
      "desc": "An old man hunched over a crackling radio, his eyes wide with a strange light.",
      "questId": "q_first_echo",
      "tree": {
        "start": {
          "text": "The signal... it's so faint. A whisper in a hurricane. I need something to focus the receiver. A crystal. A tuned crystal. There's one in the ruins to the east. Bring it to me!",
          "choices": [
            { "label": "(Accept) I'll find your crystal.", "to": "accept", "q": "accept" },
            { "label": "(Turn in) I have the Tuned Crystal.", "to": "turnin", "q": "turnin" },
            { "label": "(Leave)", "to": "bye" }
          ]
        },
        "accept": {
          "text": "Hurry! The ghosts don't wait forever.",
          "choices": [ { "label": "(Leave)", "to": "bye" } ]
        },
        "turnin": {
          "text": "Yes, yes! This is it! Let me just... *static crackles* ... there! A fragment... a piece of the song! Take it. It's the key.",
          "choices": [ { "label": "(Take Fragment)", "to": "post_quest", "reward": "signal_fragment_1" } ]
        },
        "post_quest": {
          "text": "The signal is stronger now, but it's moving. It points east, towards the old comms tower. You should go there.",
          "choices": [
            { "label": "Head toward the tower.", "applyModule": "BROADCAST_FRAGMENT_2", "to": "bye" },
            { "label": "Not yet.", "to": "bye" }
          ]
        }
      }
    },
    {
      "id": "crystal_ruin",
      "map": "world",
      "x": 110,
      "y": 20,
      "color": "#9ef7a0",
      "name": "Collapsed Hut",
      "title": "",
      "desc": "A pile of rubble. Something glints within.",
      "tree": {
        "start": {
          "text": "A collapsed hut. It looks like it was recently scavenged.",
          "choices": [
            { "label": "(Search the rubble)", "to": "search", "once": true },
            { "label": "(Leave)", "to": "bye" }
          ]
        },
        "search": {
          "text": "Among the debris, you find a strange, perfectly formed crystal.",
          "choices": [ { "label": "(Take Tuned Crystal)", "to": "empty", "reward": "tuned_crystal" } ]
        },
        "empty": { "text": "There's nothing else of interest here.", "choices": [ { "label": "(Leave)", "to": "bye" } ] }
      }
    }
  ],
  "interiors": [
    {
      "id": "radio_shack",
      "w": 7,
      "h": 5,
      "grid": [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 7, 7, 7, 7, 7, 0],
        [0, 7, 7, 7, 7, 7, 0],
        [0, 7, 7, 7, 7, 7, 0],
        [0, 0, 0, 8, 0, 0, 0]
      ],
      "entryX": 3,
      "entryY": 3
    }
  ],
  "buildings": [
    { "x": 100, "y": 20, "w": 1, "h": 1, "interiorId": "radio_shack", "boarded": false }
  ]
};
globalThis.BROADCAST_FRAGMENT_1 = BROADCAST_FRAGMENT_1;
