function seedWorldContent() {}

const DATA = `
{
  "seed": "dustland",
  "start": {
    "map": "hall",
    "x": 15,
    "y": 18
  },
  "items": [
    {
      "id": "rusted_key",
      "name": "Rusted Key",
      "type": "quest",
      "tags": [
        "key"
      ]
    },
    {
      "id": "toolkit",
      "name": "Toolkit",
      "type": "quest",
      "tags": [
        "tool"
      ]
    },
    {
      "id": "signal_beacon",
      "name": "Signal Beacon",
      "type": "quest"
    },
    {
      "id": "fuel_cell",
      "name": "Fuel Cell",
      "type": "quest"
    },
    {
      "map": "world",
      "x": 8,
      "y": 45,
      "id": "pipe_rifle",
      "name": "Pipe Rifle",
      "type": "weapon",
      "slot": "weapon",
      "mods": {
        "ATK": 2,
        "ADR": 15
      }
    },
    {
      "map": "world",
      "x": 10,
      "y": 45,
      "id": "leather_jacket",
      "name": "Leather Jacket",
      "type": "armor",
      "slot": "armor",
      "mods": {
        "DEF": 1
      }
    },
    {
      "map": "world",
      "x": 12,
      "y": 45,
      "id": "lucky_bottlecap",
      "name": "Lucky Bottlecap",
      "type": "trinket",
      "slot": "trinket",
      "mods": {
        "LCK": 1
      }
    },
    {
      "map": "world",
      "x": 28,
      "y": 41,
      "id": "crowbar",
      "name": "Crowbar",
      "type": "weapon",
      "slot": "weapon",
      "mods": {
        "ATK": 1,
        "ADR": 10
      }
    },
    {
      "map": "world",
      "x": 30,
      "y": 52,
      "id": "rebar_club",
      "name": "Rebar Club",
      "type": "weapon",
      "slot": "weapon",
      "mods": {
        "ATK": 1,
        "ADR": 10
      }
    },
    {
      "map": "world",
      "x": 52,
      "y": 42,
      "id": "kevlar_scrap_vest",
      "name": "Kevlar Scrap Vest",
      "type": "armor",
      "slot": "armor",
      "mods": {
        "DEF": 2
      }
    },
    {
      "map": "world",
      "x": 64,
      "y": 53,
      "id": "goggles",
      "name": "Goggles",
      "type": "trinket",
      "slot": "trinket",
      "mods": {
        "PER": 1
      }
    },
    {
      "map": "world",
      "x": 83,
      "y": 43,
      "id": "wrench",
      "name": "Wrench",
      "type": "trinket",
      "slot": "trinket",
      "mods": {
        "INT": 1
      }
    },
    {
      "map": "world",
      "x": 95,
      "y": 47,
      "id": "lucky_rabbit_foot",
      "name": "Lucky Rabbit Foot",
      "type": "trinket",
      "slot": "trinket",
      "mods": {
        "LCK": 1
      }
    },
    {
      "map": "world",
      "x": 32,
      "y": 47,
      "id": "water_flask",
      "name": "Water Flask",
      "type": "consumable",
      "use": {
        "type": "heal",
        "amount": 3
      }
    },
    {
      "map": "world",
      "x": 80,
      "y": 42,
      "id": "medkit",
      "name": "Medkit",
      "type": "consumable",
      "use": {
        "type": "heal",
        "amount": 10
      }
    },
    {
      "map": "world",
      "x": 34,
      "y": 47,
      "id": "adrenaline_shot",
      "name": "Adrenaline Shot",
      "type": "consumable",
      "use": {
        "type": "boost",
        "stat": "ATK",
        "amount": 2,
        "duration": 3,
        "text": "Power surges through you."
      }
    },
    {
      "map": "world",
      "x": 36,
      "y": 47,
      "id": "armor_polish",
      "name": "Armor Polish",
      "type": "consumable",
      "use": {
        "type": "boost",
        "stat": "DEF",
        "amount": 2,
        "duration": 3,
        "text": "You feel protected."
      }
    },
    {
      "map": "world",
      "x": 18,
      "y": 43,
      "id": "valve",
      "name": "Valve",
      "type": "quest"
    },
    {
      "map": "world",
      "x": 26,
      "y": 48,
      "id": "lost_satchel",
      "name": "Lost Satchel",
      "type": "quest"
    },
    {
      "map": "world",
      "x": 60,
      "y": 44,
      "id": "rust_idol",
      "name": "Rust Idol",
      "type": "quest",
      "tags": [
        "idol"
      ]
    },
    {
      "map": "world",
      "x": 44,
      "y": 80,
      "id": "cloth",
      "name": "Cloth",
      "type": "quest"
    },
    {
      "map": "world",
      "x": 46,
      "y": 80,
      "id": "plant_fiber",
      "name": "Plant Fiber",
      "type": "quest"
    },
    {
      "id": "bandage",
      "name": "Bandage",
      "type": "consumable",
      "use": {
        "type": "heal",
        "amount": 6
      }
    },
    {
      "id": "raider_knife",
      "name": "Raider Knife",
      "type": "weapon",
      "slot": "weapon",
      "mods": {
        "ATK": 1,
        "ADR": 10
      }
    },
    {
      "map": "world",
      "x": 110,
      "y": 49,
      "id": "artifact_blade",
      "name": "Artifact Blade",
      "type": "weapon",
      "slot": "weapon",
      "mods": {
        "ATK": 5,
        "ADR": 20
      }
    },
    {
      "map": "world",
      "x": 60,
      "y": 40,
      "id": "signal_fragment_a",
      "name": "Signal Fragment",
      "type": "quest",
      "tags": [
        "signal_fragment"
      ]
    },
    {
      "map": "world",
      "x": 62,
      "y": 42,
      "id": "signal_fragment_b",
      "name": "Signal Fragment",
      "type": "quest",
      "tags": [
        "signal_fragment"
      ]
    },
    {
      "map": "world",
      "x": 64,
      "y": 44,
      "id": "signal_fragment_c",
      "name": "Signal Fragment",
      "type": "quest",
      "tags": [
        "signal_fragment"
      ]
    },
    {
      "id": "epic_blade",
      "name": "Epic Blade",
      "type": "weapon",
      "slot": "weapon",
      "rarity": "epic",
      "mods": {
        "ATK": 5
      },
      "value": 500
    },
    {
      "id": "epic_armor",
      "name": "Epic Armor",
      "type": "armor",
      "slot": "armor",
      "rarity": "epic",
      "mods": {
        "DEF": 5
      },
      "value": 500
    },
    {
      "map": "hall",
      "x": 14,
      "y": 18,
      "id": "glinting_key",
      "name": "Glinting Key",
      "type": "quest",
      "tags": [
        "key"
      ],
      "use": {
        "effect": "vision"
      }
    },
    {
      "map": "hall",
      "x": 16,
      "y": 18,
      "id": "wand",
      "name": "Wand",
      "type": "quest",
      "use": {
        "type": "heal",
        "amount": 0,
        "text": "You wave the wand."
      }
    },
    {
      "map": "echoes_atrium",
      "x": 3,
      "y": 2,
      "id": "spark_key",
      "name": "Spark Key",
      "type": "quest",
      "tags": [
        "key"
      ]
    },
    {
      "map": "echoes_workshop",
      "x": 4,
      "y": 5,
      "id": "cog_key",
      "name": "Cog Key",
      "type": "quest",
      "tags": [
        "key"
      ]
    },
    {
      "map": "echoes_archive",
      "x": 8,
      "y": 4,
      "id": "sun_charm",
      "name": "Sun Charm",
      "type": "trinket",
      "slot": "trinket",
      "mods": {
        "LCK": 1
      }
    },
    {
      "id": "rat_tail",
      "name": "Rat Tail",
      "type": "quest"
    },
    {
      "id": "copper_cog",
      "name": "Copper Cog",
      "type": "quest"
    }
  ],
  "quests": [
    {
      "id": "q_hall_key",
      "title": "Find the Rusted Key",
      "desc": "Search the hall for a Rusted Key to unlock the exit.",
      "item": "rusted_key"
    },
    {
      "id": "q_waterpump",
      "title": "Water for the Pump",
      "desc": "Find a Valve and help Nila restart the pump.",
      "item": "valve",
      "reward": {
        "id": "rusted_badge",
        "name": "Rusted Badge",
        "type": "trinket",
        "slot": "trinket",
        "mods": {
          "LCK": 1
        }
      },
      "xp": 4
    },
    {
      "id": "q_recruit_grin",
      "title": "Recruit Grin",
      "desc": "Convince or pay Grin to join."
    },
    {
      "id": "q_postal",
      "title": "Lost Parcel",
      "desc": "Find and return the Lost Satchel to Ivo.",
      "item": "lost_satchel",
      "reward": {
        "id": "brass_stamp",
        "name": "Brass Stamp",
        "type": "trinket",
        "slot": "trinket",
        "mods": {
          "LCK": 1
        }
      },
      "xp": 4
    },
    {
      "id": "q_tower",
      "title": "Dead Air",
      "desc": "Repair the radio tower console (Toolkit helps).",
      "item": "toolkit",
      "reward": {
        "id": "tuner_charm",
        "name": "Tuner Charm",
        "type": "trinket",
        "slot": "trinket",
        "mods": {
          "PER": 1
        }
      },
      "xp": 5
    },
    {
      "id": "q_idol",
      "title": "Rust Idol",
      "desc": "Recover the Rust Idol from roadside ruins.",
      "item": "rust_idol",
      "reward": {
        "id": "pilgrim_thread",
        "name": "Pilgrim Thread",
        "type": "trinket",
        "slot": "trinket",
        "mods": {
          "CHA": 1
        }
      },
      "xp": 5
    },
    {
      "id": "q_toll",
      "title": "Toll-Booth Etiquette",
      "desc": "You met the Duchess on the road.",
      "xp": 2
    },
    {
      "id": "q_signal",
      "title": "Broken Signal",
      "desc": "Collect three signal fragments in the wastes.",
      "item": "signal_fragment",
      "count": 3,
      "xp": 3
    },
    {
      "id": "q_spark",
      "title": "Spark the Way",
      "desc": "Find the Spark Key to open the workshop.",
      "item": "spark_key"
    },
    {
      "id": "q_cog",
      "title": "Unlock the Archive",
      "desc": "Find the Cog Key to reach the beacon.",
      "item": "cog_key"
    },
    {
      "id": "q_beacon",
      "title": "Light the Beacon",
      "desc": "Defeat the Gear Ghoul and claim hope."
    }
  ],
  "npcs": [
    {
      "id": "dust_storm_entrance",
      "map": "world",
      "x": 10,
      "y": 10,
      "color": "#f5d442",
      "name": "Strange Vortex",
      "title": "A swirling vortex of dust and sand.",
      "desc": "You feel a strange pull towards it.",
      "portraitSheet": "assets/portraits/dustland-module/strange_vortex_4.png",
      "tree": {
        "start": {
          "text": "A swirling vortex of dust and sand blocks your path.",
          "choices": [
            {
              "label": "(Enter the vortex)",
              "to": "enter"
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "enter": {
          "text": "You are pulled into the vortex.",
          "choices": [
            {
              "label": "(Continue)",
              "to": "bye",
              "goto": {
                "map": "world",
                "x": 10,
                "y": 18
              }
            }
          ]
        }
      }
    },
    {
      "id": "hidden_crate",
      "map": "world",
      "x": 12,
      "y": 12,
      "color": "#c8bba0",
      "name": "Buried Crate",
      "desc": "Sand conceals a supply crate.",
      "portraitSheet": "assets/portraits/dustland-module/buried_crate_4.png",
      "portraitLock": false,
      "prompt": "Crate half-buried under shifting sand",
      "hintSound": true,
      "tree": {
        "start": {
          "text": "You sense something under the sand.",
          "choices": [
            {
              "label": "(Dig)",
              "to": "dig",
              "once": true
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "dig": {
          "text": "You uncover a supply crate packed with scrap.",
          "choices": [
            {
              "label": "(Take Scrap)",
              "to": "empty",
              "reward": "SCRAP 5",
              "effects": [
                {
                  "effect": "removeSoundSource",
                  "id": "hidden_crate"
                }
              ]
            }
          ]
        },
        "empty": {
          "text": "Just disturbed sand remains.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        }
      }
    },
    {
      "id": "tape_sage",
      "map": "hall",
      "x": 20,
      "y": 15,
      "color": "#b0c4de",
      "name": "Archivist",
      "title": "Memory Keeper",
      "portraitSheet": "assets/portraits/dustland-module/archivist_4.png",
      "portraitLock": false,
      "desc": "Curious about recorded tales.",
      "prompt": "Elder hunched over reels of magnetic tape",
      "tree": {
        "start": {
          "text": "Got anything on tape?",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            },
            {
              "label": "(Chat)",
              "to": "_chat__mff7uw9d_start"
            }
          ]
        },
        "_chat__mff7uw9d_start": {
          "text": "The Archivist peers up, tape spooling through his fingers. 'Every scrap of sound is a life. What do you bring?'",
          "choices": [
            {
              "label": "Who are you?",
              "to": "_chat__mff7uw9d_who"
            },
            {
              "label": "Why tapes?",
              "to": "_chat__mff7uw9d_why"
            },
            {
              "label": "No stories today",
              "to": "bye"
            }
          ]
        },
        "_chat__mff7uw9d_who": {
          "text": "'Just a keeper of ghosts.' He taps a stack of reels. 'These hold the before-times.'",
          "choices": [
            {
              "label": "Sounds lonely",
              "to": "_chat__mff7uw9d_lonely"
            },
            {
              "label": "Back",
              "to": "_chat__mff7uw9d_start"
            }
          ]
        },
        "_chat__mff7uw9d_lonely": {
          "text": "'Lonely? Maybe. But the past whispers company if you listen.'",
          "choices": [
            {
              "label": "Back",
              "to": "_chat__mff7uw9d_start"
            }
          ]
        },
        "_chat__mff7uw9d_why": {
          "text": "'Tape endures where memory fades. Magnetics don't judge.'",
          "choices": [
            {
              "label": "Got any stories?",
              "to": "_chat__mff7uw9d_story"
            },
            {
              "label": "Back",
              "to": "_chat__mff7uw9d_start"
            }
          ]
        },
        "_chat__mff7uw9d_story": {
          "text": "He feeds a reel into a rusty player. A raspy voice tells of caravans lost in sand.",
          "choices": [
            {
              "label": "(Listen)",
              "to": "_chat__mff7uw9d_listen"
            },
            {
              "label": "(Enough)",
              "to": "_chat__mff7uw9d_start"
            }
          ]
        },
        "_chat__mff7uw9d_listen": {
          "text": "The tale winds down. 'Keep it,' he says, handing you the reel.",
          "choices": [
            {
              "label": "(Thank him)",
              "to": "bye",
              "reward": "XP 5"
            }
          ]
        }
      }
    },
    {
      "id": "exitdoor",
      "map": "hall",
      "x": 15,
      "y": 17,
      "color": "#a9f59f",
      "name": "Caretaker Kesh",
      "title": "Hall Steward",
      "desc": "Weary caretaker guarding the hall's chained exit.",
      "portraitSheet": "assets/portraits/kesh_4.png",
      "questId": "q_hall_key",
      "tree": {
        "start": {
          "text": "Caretaker Kesh eyes the chained exit.",
          "choices": [
            {
              "label": "(Search for key)",
              "to": "accept",
              "q": "accept",
              "setFlag": {
                "flag": "q_hall_key_active",
                "op": "set",
                "value": 1
              }
            },
            {
              "label": "(Use Rusted Key)",
              "to": "do_turnin",
              "q": "turnin"
            },
            {
              "label": "(Use Glinting Key)",
              "to": "glint_fail",
              "if": {
                "flag": "q_hall_key_active",
                "op": ">=",
                "value": 1
              }
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "accept": {
          "text": "Try the crates. This hall sheltered survivors once. Don’t scuff the floor.",
          "choices": [
            {
              "label": "(Okay)",
              "to": "bye"
            }
          ]
        },
        "glint_fail": {
          "text": "Kesh squints at the glinting key. Shiny things aren't always the best in this place.",
          "choices": [
            {
              "label": "(Back)",
              "to": "start"
            }
          ]
        },
        "do_turnin": {
          "text": "Kesh unlocks the chain. “Off you go.”",
          "choices": [
            {
              "label": "(Continue)",
              "to": "bye",
              "goto": {
                "map": "world",
                "x": 2,
                "y": 45
              }
            }
          ]
        }
      }
    },
    {
      "id": "keycrate",
      "map": "hall",
      "x": 17,
      "y": 18,
      "color": "#9ef7a0",
      "name": "Dusty Crate",
      "title": "",
      "desc": "A dusty crate that might hide something useful.",
      "portraitSheet": "assets/portraits/crate_4.png",
      "portraitLock": false,
      "tree": {
        "start": {
          "text": "A dusty crate rests here.",
          "choices": [
            {
              "label": "(Open)",
              "to": "open",
              "once": true
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "open": {
          "text": "Inside you find a Rusted Key.",
          "choices": [
            {
              "label": "(Take Rusted Key)",
              "to": "empty",
              "reward": "rusted_key"
            }
          ]
        },
        "empty": {
          "text": "An empty crate.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        }
      }
    },
    {
      "id": "hallflavor",
      "map": "hall",
      "x": 11,
      "y": 17,
      "color": "#b8ffb6",
      "name": "Lone Drifter",
      "title": "Mutters",
      "desc": "A drifter muttering to themselves.",
      "portraitSheet": "assets/portraits/drifter_4.png",
      "tree": {
        "start": {
          "text": "Dust gets in everything.",
          "choices": [
            {
              "label": "(Nod)",
              "to": "bye"
            }
          ]
        }
      }
    },
    {
      "id": "hall_rotwalker",
      "map": "hall",
      "x": 15,
      "y": 2,
      "color": "#f88",
      "name": "Rotwalker",
      "title": "Test Monster",
      "desc": "A shambler posted here for practice.",
      "portraitSheet": "assets/portraits/dustland-module/rotwalker_4.png",
      "portraitLock": false,
      "tree": {
        "start": {
          "text": "A rotwalker lurches at you."
        }
      },
      "combat": {
        "HP": 6,
        "ATK": 1,
        "loot": "water_flask",
        "auto": true
      }
    },
    {
      "id": "party_mira",
      "map": "world",
      "x": 16,
      "y": 45,
      "color": "#f66",
      "name": "Mira",
      "title": "Blade Dancer",
      "desc": "A lithe fighter ready to strike back.",
      "portraitSheet": "assets/portraits/dustland-module/mira_4.png",
      "tree": {
        "start": {
          "text": "Mira sizes you up.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        }
      },
      "combat": {
        "HP": 8,
        "ATK": 3,
        "DEF": 1,
        "counterBasic": {
          "dmg": 2
        },
        "auto": true
      }
    },
    {
      "id": "party_nora",
      "map": "world",
      "x": 15,
      "y": 21,
      "color": "#f66",
      "name": "Nora",
      "title": "Storm Caller",
      "desc": "Crackling energy dances across her gauntlet.",
      "portraitSheet": "assets/portraits/dustland-module/nora_4.png",
      "tree": {
        "start": {
          "text": "Nora steps forward, eyes sparking.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        }
      },
      "combat": {
        "HP": 8,
        "ATK": 2,
        "DEF": 1,
        "special": {
          "cue": "releases a stunning arc!",
          "dmg": 2,
          "stun": 1,
          "delay": 800
        },
        "auto": true
      }
    },
    {
      "id": "party_tess",
      "map": "world",
      "x": 15,
      "y": 21,
      "color": "#f66",
      "name": "Tess",
      "title": "Venom Rogue",
      "desc": "She twirls a dagger dripping with toxins.",
      "portraitSheet": "assets/portraits/dustland-module/tess_4.png",
      "tree": {
        "start": {
          "text": "Tess grins wickedly.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        }
      },
      "combat": {
        "HP": 8,
        "ATK": 2,
        "DEF": 1,
        "special": {
          "cue": "flings poisoned knives everywhere!",
          "dmg": 2,
          "poison": {
            "strength": 1,
            "duration": 3
          },
          "spread": true,
          "delay": 800
        },
        "auto": true
      }
    },
    {
      "id": "road_sign",
      "map": "world",
      "x": 6,
      "y": 45,
      "color": "#225a20",
      "name": "Worn Sign",
      "title": "Warning",
      "desc": "Faded letters warn travelers.",
      "portraitSheet": "assets/portraits/dustland-module/worn_sign_4.png",
      "symbol": "?",
      "tree": {
        "start": {
          "text": "Rust storms east. Shelter west.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        }
      }
    },
    {
      "id": "pump",
      "map": "world",
      "x": 14,
      "y": 44,
      "color": "#9ef7a0",
      "name": "Nila the Pump-Keeper",
      "title": "Parched Farmer",
      "desc": "Sunburnt hands, hopeful eyes. Smells faintly of mud.",
      "portraitSheet": "assets/portraits/mara_4.png",
      "questId": "q_waterpump",
      "tree": {
        "start": {
          "text": [
            "I can hear the pump wheeze. Need a Valve to breathe again.",
            "Pump’s choking on sand. Only a Valve will save it."
          ],
          "choices": [
            {
              "label": "(Accept) I will find a Valve.",
              "to": "accept",
              "q": "accept"
            },
            {
              "label": "(Hand Over Valve)",
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
          "text": "Bless. Try the roadside ruins.",
          "choices": [
            {
              "label": "(Ok)",
              "to": "bye"
            }
          ]
        },
        "turnin": {
          "text": "Let me see...",
          "choices": [
            {
              "label": "(Give Valve)",
              "to": "do_turnin"
            }
          ]
        },
        "do_turnin": {
          "text": "It fits! Water again. Take this.",
          "choices": [
            {
              "label": "(Continue)",
              "to": "bye"
            }
          ]
        }
      }
    },
    {
      "id": "grin",
      "map": "world",
      "x": 22,
      "y": 45,
      "color": "#caffc6",
      "name": "Grin",
      "title": "Scav-for-Hire",
      "desc": "Lean scav with a crowbar and half a smile.",
      "portraitSheet": "assets/portraits/grin_4.png",
      "questId": "q_recruit_grin",
      "tree": {
        "start": {
          "text": [
            "Got two hands and a crowbar. You got a plan?",
            "Crowbar’s itching for work. You hiring?"
          ],
          "choices": [
            {
              "label": "(Recruit) Join me.",
              "to": "rec",
              "ifOnce": {
                "node": "rec",
                "label": "(CHA) Talk up the score"
              }
            },
            {
              "label": "(Recruit) Got a trinket?",
              "to": "rec_fail",
              "ifOnce": {
                "node": "rec",
                "label": "(CHA) Talk up the score",
                "used": true
              }
            },
            {
              "label": "(Chat)",
              "to": "chat"
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "chat": {
          "text": [
            "Keep to the road. The sand eats soles and souls.",
            "Stay off the dunes. Sand chews boots."
          ],
          "choices": [
            {
              "label": "(Nod)",
              "to": "bye"
            }
          ]
        },
        "rec": {
          "text": "Convince me. Or pay me.",
          "choices": [
            {
              "label": "(CHA) Talk up the score",
              "check": {
                "stat": "CHA",
                "dc": 10
              },
              "success": "Grin smirks: Alright.",
              "failure": "Grin shrugs: Not buying it.",
              "join": {
                "id": "grin",
                "name": "Grin",
                "role": "Scavenger"
              },
              "once": true
            },
            {
              "label": "(Pay) Give 1 trinket as hire bonus",
              "costSlot": "trinket",
              "success": "Deal.",
              "failure": "You have no trinket to pay with.",
              "join": {
                "id": "grin",
                "name": "Grin",
                "role": "Scavenger"
              }
            },
            {
              "label": "(Back)",
              "to": "start"
            }
          ]
        },
        "rec_fail": {
          "text": "Charm didn't work. Got a trinket?",
          "choices": [
            {
              "label": "(Pay) Give 1 trinket as hire bonus",
              "costSlot": "trinket",
              "success": "Deal.",
              "failure": "You have no trinket to pay with.",
              "join": {
                "id": "grin",
                "name": "Grin",
                "role": "Scavenger"
              }
            },
            {
              "label": "(Back)",
              "to": "start"
            }
          ]
        }
      }
    },
    {
      "id": "post",
      "map": "world",
      "x": 30,
      "y": 46,
      "color": "#b8ffb6",
      "name": "Postmaster Ivo",
      "title": "Courier of Dust",
      "desc": "Dusty courier seeking a lost parcel.",
      "portraitSheet": "assets/portraits/ivo_4.png",
      "questId": "q_postal",
      "tree": {
        "start": {
          "text": "Lost a courier bag on the road. Grey canvas. Reward if found.",
          "choices": [
            {
              "label": "(Accept) I will look.",
              "to": "accept",
              "q": "accept"
            },
            {
              "label": "(Turn in Satchel)",
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
          "text": "Much obliged.",
          "choices": [
            {
              "label": "(Ok)",
              "to": "bye"
            }
          ]
        },
        "turnin": {
          "text": "You got it?",
          "choices": [
            {
              "label": "(Give Lost Satchel)",
              "to": "do_turnin"
            }
          ]
        },
        "do_turnin": {
          "text": "Mail moves again. Take this stamp. Worth more than water.",
          "choices": [
            {
              "label": "(Ok)",
              "to": "bye"
            }
          ]
        }
      }
    },
    {
      "id": "tower",
      "map": "world",
      "x": 48,
      "y": 43,
      "color": "#a9f59f",
      "name": "Rella",
      "title": "Radio Tech",
      "desc": "Tower technician with grease-stained hands.",
      "portraitSheet": "assets/portraits/rella_4.png",
      "questId": "q_tower",
      "tree": {
        "start": {
          "text": "Tower’s console fried. If you got a Toolkit and brains, lend both.",
          "choices": [
            {
              "label": "(Accept) I will help.",
              "to": "accept",
              "q": "accept"
            },
            {
              "label": "(Repair) INT check with Toolkit",
              "check": {
                "stat": "INT"
              },
              "success": "Static fades. The tower hums.",
              "failure": "You cross a wire and pop a fuse.",
              "q": "turnin"
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "accept": {
          "text": "I owe you static and thanks.",
          "choices": [
            {
              "label": "(Ok)",
              "to": "bye"
            }
          ]
        }
      }
    },
    {
      "id": "hermit",
      "map": "world",
      "x": 70,
      "y": 47,
      "color": "#9abf9a",
      "name": "The Shifting Hermit",
      "title": "Pilgrim",
      "desc": "A cloaked hermit murmuring about rusted idols.",
      "portraitSheet": "assets/portraits/pilgrim_4.png",
      "questId": "q_idol",
      "tree": {
        "start": {
          "text": "Something rust-holy sits in the ruins. Bring the Idol.",
          "choices": [
            {
              "label": "(Accept)",
              "to": "accept",
              "q": "accept"
            },
            {
              "label": "(Offer Rust Idol)",
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
          "text": "The sand will guide or bury you.",
          "choices": [
            {
              "label": "(Ok)",
              "to": "bye"
            }
          ]
        },
        "turnin": {
          "text": "Do you carry grace?",
          "choices": [
            {
              "label": "(Give Idol)",
              "to": "do_turnin"
            }
          ]
        },
        "do_turnin": {
          "text": "The idol warms. You are seen.",
          "choices": [
            {
              "label": "(Ok)",
              "to": "bye"
            }
          ]
        }
      }
    },
    {
      "id": "duchess",
      "map": "world",
      "x": 40,
      "y": 45,
      "color": "#a9f59f",
      "name": "Scrap Duchess",
      "title": "Toll-Queen",
      "desc": "A crown of bottlecaps; eyes like razors.",
      "portraitSheet": "assets/portraits/scrap_4.png",
      "questId": "q_toll",
      "tree": {
        "start": {
          "text": [
            "Road tax or road rash.",
            "Coins or cuts. Your pick."
          ],
          "choices": [
            {
              "label": "(Pay) Nod and pass",
              "to": "pay",
              "q": "turnin"
            },
            {
              "label": "(Refuse)",
              "to": "ref",
              "q": "turnin"
            },
            {
              "label": "(Rumors)",
              "to": "rumors"
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "pay": {
          "text": "Wise. Move along.",
          "choices": [
            {
              "label": "(Ok)",
              "to": "bye"
            }
          ]
        },
        "ref": {
          "text": "Brave. Or foolish.",
          "choices": [
            {
              "label": "(Ok)",
              "to": "bye"
            }
          ]
        },
        "rumors": {
          "text": "Radio crackles from the north; idol whispers from the south.",
          "choices": [
            {
              "label": "(Thanks)",
              "to": "bye"
            }
          ]
        }
      }
    },
    {
      "id": "hidden_hermit",
      "hidden": true,
      "map": "world",
      "x": 20,
      "y": 47,
      "color": "#b8ffb6",
      "name": "Hidden Hermit",
      "title": "Lurker",
      "desc": "A hermit steps out when you return.",
      "portraitSheet": "assets/portraits/dustland-module/hidden_hermit_4.png",
      "tree": {
        "start": {
          "text": "Didn't expect company twice.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        }
      },
      "reveal": {
        "flag": "visits@world@20,47",
        "op": ">=",
        "value": 2
      }
    },
    {
      "id": "signal_tech",
      "map": "world",
      "x": 26,
      "y": 43,
      "color": "#9ef7a0",
      "name": "Signal Tech",
      "title": "Tinkerer",
      "desc": "Fiddles with a busted radio.",
      "prompt": "Grease-streaked tinkerer fixing a busted radio",
      "portraitSheet": "assets/portraits/dustland-module/signal_tech_4.png",
      "portraitLock": true,
      "questId": "q_signal",
      "tree": {
        "start": {
          "text": "Radio's dead. Need fragments to spark it.",
          "choices": [
            {
              "label": "(Accept)",
              "to": "accept",
              "q": "accept"
            },
            {
              "label": "(Turn in fragments)",
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
          "text": "Try the dunes; bits wash up there.",
          "choices": [
            {
              "label": "(Ok)",
              "to": "bye"
            }
          ]
        },
        "turnin": {
          "text": "Got the pieces?",
          "choices": [
            {
              "label": "(Give fragments)",
              "to": "do_turnin"
            }
          ]
        },
        "do_turnin": {
          "text": "Signal hums again. Nice work.",
          "choices": [
            {
              "label": "(Continue)",
              "to": "bye"
            }
          ]
        }
      }
    },
    {
      "id": "raider",
      "map": "world",
      "x": 56,
      "y": 44,
      "color": "#f88",
      "name": "Road Raider",
      "title": "Bandit",
      "desc": "Scarred scav looking for trouble.",
      "portraitSheet": "assets/portraits/raider_4.png",
      "portraitLock": false,
      "tree": {
        "start": {
          "text": "A raider blocks the path, eyeing your gear.",
          "choices": [
            {
              "label": "(Talk) Stand down",
              "check": {
                "stat": "CHA",
                "dc": 10
              },
              "success": "He grunts and lets you pass.",
              "failure": "He tightens his grip.",
              "to": "bye"
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        }
      },
      "combat": {
        "ATK": 4,
        "DEF": 5,
        "loot": "raider_knife"
      }
    },
    {
      "id": "trader",
      "map": "world",
      "x": 34,
      "y": 44,
      "color": "#caffc6",
      "name": "Cass the Trader",
      "title": "Shopkeep",
      "desc": "A roving merchant weighing your wares.",
      "portraitSheet": "assets/portraits/cass_4.png",
      "tree": {
        "start": {
          "text": "Got goods to sell? I pay in scrap.",
          "choices": [
            {
              "label": "Browse goods",
              "to": "buy"
            },
            {
              "label": "(Sell items)",
              "to": "sell"
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        }
      },
      "loop": [
        {
          "x": 10,
          "y": 44
        },
        {
          "x": 110,
          "y": 44
        }
      ],
      "shop": {
        "markup": 1,
        "inv": [
          {
            "id": "pipe_rifle"
          },
          {
            "id": "leather_jacket"
          },
          {
            "id": "water_flask"
          }
        ]
      }
    },
    {
      "id": "tess_patrol",
      "map": "world",
      "x": 14,
      "y": 44,
      "color": "#9ef7a0",
      "name": "Tess the Scout",
      "title": "Water Runner",
      "desc": "She checks the pump then the far ridge.",
      "portraitSheet": "assets/portraits/dustland-module/tess_4.png",
      "tree": {
        "start": {
          "text": "Tess strides past on her rounds.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        }
      },
      "loop": [
        {
          "x": 14,
          "y": 44
        },
        {
          "x": 80,
          "y": 49
        }
      ]
    },
    {
      "id": "scrap_mutt",
      "map": "world",
      "x": 18,
      "y": 43,
      "color": "#d88",
      "name": "Scrap Mutt",
      "title": "Mangy Hound",
      "desc": "A feral mutt snarling over junk.",
      "portraitSheet": "assets/portraits/dustland-module/scrap_mutt_4.png",
      "portraitLock": false,
      "tree": {
        "start": {
          "text": "The mutt bares its teeth.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        }
      },
      "combat": {
        "HP": 5,
        "ATK": 1,
        "loot": "water_flask",
        "auto": true
      }
    },
    {
      "id": "scavenger_rat",
      "map": "world",
      "x": 32,
      "y": 48,
      "color": "#c66",
      "name": "Scavenger Rat",
      "title": "Vermin",
      "desc": "A giant rat rooting through scraps.",
      "portraitSheet": "assets/portraits/dustland-module/scavenger_rat_4.png",
      "portraitLock": false,
      "tree": {
        "start": {
          "text": "It hisses.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        }
      },
      "combat": {
        "HP": 4,
        "ATK": 1,
        "loot": "water_flask",
        "auto": true
      }
    },
    {
      "id": "rust_bandit",
      "map": "world",
      "x": 44,
      "y": 42,
      "color": "#f88",
      "name": "Rust Bandit",
      "title": "Scav Raider",
      "desc": "A bandit prowling for easy loot.",
      "portraitSheet": "assets/portraits/dustland-module/rust_bandit_4.png",
      "portraitLock": false,
      "tree": {
        "start": {
          "text": "The bandit sizes you up.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        }
      },
      "combat": {
        "HP": 6,
        "ATK": 1,
        "loot": "raider_knife",
        "auto": true
      }
    },
    {
      "id": "feral_nomad",
      "map": "world",
      "x": 72,
      "y": 48,
      "color": "#f77",
      "name": "Feral Nomad",
      "title": "Mad Drifter",
      "desc": "A wild-eyed drifter muttering to himself.",
      "portraitSheet": "assets/portraits/dustland-module/feral_nomad_4.png",
      "portraitLock": false,
      "tree": {
        "start": {
          "text": "He lunges without warning.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        }
      },
      "combat": {
        "HP": 6,
        "ATK": 2,
        "loot": "medkit",
        "auto": true
      }
    },
    {
      "id": "waste_ghoul",
      "map": "world",
      "x": 82,
      "y": 41,
      "color": "#aa8",
      "name": "Waste Ghoul",
      "title": "Rotwalker",
      "desc": "A decayed wanderer hungry for flesh.",
      "portraitSheet": "assets/portraits/dustland-module/waste_ghoul_4.png",
      "portraitLock": false,
      "tree": {
        "start": {
          "text": "It shambles toward you.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        }
      },
      "combat": {
        "HP": 7,
        "ATK": 2,
        "loot": "goggles",
        "auto": true
      }
    },
    {
      "id": "iron_brute",
      "name": "Iron Brute",
      "desc": "A hulking brute plated in scrap.",
      "color": "#ff3333",
      "symbol": "!",
      "map": "world",
      "x": 116,
      "y": 37,
      "tree": {
        "start": {
          "text": "The brute roars.",
          "choices": [
            {
              "label": "(Fight)",
              "to": "do_fight"
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "do_fight": {
          "text": "",
          "choices": [
            {
              "label": "(Continue)",
              "to": "bye"
            }
          ]
        }
      },
      "questId": "",
      "loop": [
        {
          "x": 120,
          "y": 37
        },
        {
          "x": 124,
          "y": 37
        },
        {
          "x": 124,
          "y": 33
        },
        {
          "x": 120,
          "y": 33
        }
      ],
      "combat": {
        "HP": 15,
        "ATK": 3,
        "DEF": 2,
        "loot": "raider_knife"
      },
      "portraitSheet": "assets/portraits/dustland-module/iron_brute_4.png",
      "portraitLock": false
    },
    {
      "id": "stalker_patrol",
      "map": "world",
      "x": 90,
      "y": 47,
      "color": "#f55",
      "name": "Grit Stalker",
      "title": "Wasteland Hunter",
      "desc": "A ruthless drifter prowling for prey.",
      "portraitSheet": "assets/portraits/portrait_1079.png",
      "portraitLock": false,
      "tree": {
        "start": {
          "text": "The stalker circles the wastes.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        }
      },
      "loop": [
        {
          "x": 90,
          "y": 47
        },
        {
          "x": 110,
          "y": 47
        },
        {
          "x": 110,
          "y": 39
        },
        {
          "x": 90,
          "y": 39
        }
      ],
      "combat": {
        "HP": 7,
        "ATK": 2,
        "DEF": 1,
        "loot": "raider_knife",
        "auto": true
      }
    },
    {
      "id": "trainer_power",
      "map": "world",
      "x": 6,
      "y": 44,
      "color": "#ffcc99",
      "name": "Brakk",
      "title": "Power Trainer",
      "desc": "A former arena champ teaching raw strength.",
      "portraitSheet": "assets/portraits/dustland-module/brakk_4.png",
      "tree": {
        "start": {
          "text": "Brakk cracks his knuckles.",
          "choices": [
            {
              "label": "(Upgrade Skills)",
              "to": "train",
              "effects": [
                {
                  "effect": "showTrainer",
                  "trainer": "power"
                }
              ]
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "train": {
          "text": "Push your limits.",
          "choices": [
            {
              "label": "(Back)",
              "to": "start"
            }
          ]
        }
      }
    },
    {
      "id": "trainer_endurance",
      "map": "world",
      "x": 6,
      "y": 46,
      "color": "#99ccff",
      "name": "Rusty",
      "title": "Endurance Trainer",
      "desc": "A grizzled scavenger preaching survival.",
      "portraitSheet": "assets/portraits/dustland-module/rusty_4.png",
      "tree": {
        "start": {
          "text": "Rusty studies your stance.",
          "choices": [
            {
              "label": "(Upgrade Skills)",
              "to": "train",
              "effects": [
                {
                  "effect": "showTrainer",
                  "trainer": "endurance"
                }
              ]
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "train": {
          "text": "Breathe deep and endure.",
          "choices": [
            {
              "label": "(Back)",
              "to": "start"
            }
          ]
        }
      }
    },
    {
      "id": "trainer_tricks",
      "map": "world",
      "x": 6,
      "y": 48,
      "color": "#cc99ff",
      "name": "Mira",
      "title": "Tricks Trainer",
      "desc": "A nimble tinkerer teaching odd moves.",
      "portraitSheet": "assets/portraits/dustland-module/mira_4.png",
      "tree": {
        "start": {
          "text": "Mira twirls a coin.",
          "choices": [
            {
              "label": "(Upgrade Skills)",
              "to": "train",
              "effects": [
                {
                  "effect": "showTrainer",
                  "trainer": "tricks"
                }
              ]
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "train": {
          "text": "Learn a new trick.",
          "choices": [
            {
              "label": "(Back)",
              "to": "start"
            }
          ]
        }
      }
    },
    {
      "id": "respec_vendor",
      "map": "world",
      "x": 94,
      "y": 50,
      "color": "#ffee99",
      "name": "Nora",
      "title": "Worm Seller",
      "desc": "She trades memory worms for scrap.",
      "portraitSheet": "assets/portraits/dustland-module/nora_4.png",
      "tree": {
        "start": {
          "text": "Fresh worms for fading sins.",
          "choices": [
            {
              "label": "Buy Memory Worm (500 Scrap)",
              "to": "buy"
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "buy": {
          "text": "One bite resets the mind.",
          "choices": [
            {
              "label": "(Buy)",
              "to": "start",
              "effects": [
                {
                  "effect": "buyMemoryWorm"
                }
              ]
            },
            {
              "label": "(Back)",
              "to": "start"
            }
          ]
        }
      }
    },
    {
      "id": "slots",
      "map": "slot_shack",
      "x": 3,
      "y": 2,
      "color": "#d4af37",
      "name": "One-Armed Bandit",
      "title": "Slot Machine",
      "desc": "It wheezes, eager for scrap.",
      "portraitSheet": "assets/portraits/dustland-module/slot_machine.png",
      "symbol": "?",
      "tree": {
        "start": {
          "text": "Lights sputter behind cracked glass.",
          "choices": [
            {
              "label": "(1 scrap)",
              "to": "start",
              "effects": [
                {
                  "effect": "pullSlots",
                  "cost": 1,
                  "payouts": [
                    0,
                    1,
                    2
                  ]
                }
              ]
            },
            {
              "label": "(5 scrap)",
              "to": "start",
              "effects": [
                {
                  "effect": "pullSlots",
                  "cost": 5,
                  "payouts": [
                    0,
                    3,
                    5,
                    6,
                    10
                  ]
                }
              ]
            },
            {
              "label": "(25 scrap)",
              "to": "start",
              "effects": [
                {
                  "effect": "pullSlots",
                  "cost": 25,
                  "payouts": [
                    0,
                    10,
                    25,
                    35,
                    50
                  ]
                }
              ]
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        }
      }
    },
    {
      "id": "workbench",
      "map": "workshop",
      "x": 2,
      "y": 2,
      "color": "#bfa",
      "name": "Workbench",
      "title": "Crafter",
      "desc": "Tools litter the surface.",
      "prompt": "Cluttered workbench stacked with tools",
      "workbench": true
    },
    {
      "id": "scrap_behemoth",
      "name": "Scrap Behemoth",
      "desc": "A towering mass of twisted metal.",
      "color": "#ff3333",
      "symbol": "!",
      "map": "world",
      "x": 113,
      "y": 45,
      "tree": {
        "start": {
          "text": "The behemoth looms.",
          "choices": [
            {
              "label": "(Fight)",
              "to": "do_fight"
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "do_fight": {
          "text": "",
          "choices": [
            {
              "label": "(Continue)",
              "to": "bye"
            }
          ]
        }
      },
      "questId": "",
      "combat": {
        "HP": 30,
        "ATK": 3,
        "DEF": 2,
        "loot": "raider_knife",
        "boss": true,
        "special": {
          "cue": "crackles with energy!",
          "dmg": 5,
          "delay": 1000
        }
      },
      "portraitSheet": "assets/portraits/portrait_1084.png",
      "portraitLock": false
    },
    {
      "id": "sparkcrate",
      "map": "echoes_atrium",
      "x": 3,
      "y": 2,
      "color": "#9ef7a0",
      "name": "Sparking Crate",
      "desc": "Faint humming echoes from inside.",
      "prompt": "Crate sparking with bottled energy",
      "tree": {
        "start": {
          "text": "A crate vibrates with energy.",
          "choices": [
            {
              "label": "(Open)",
              "to": "open",
              "once": true
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "open": {
          "text": "Inside you find a Spark Key.",
          "choices": [
            {
              "label": "(Take Key)",
              "to": "empty",
              "reward": "spark_key"
            }
          ]
        },
        "empty": {
          "text": "An empty crate.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        }
      }
    },
    {
      "id": "door_workshop",
      "map": "echoes_atrium",
      "x": 14,
      "y": 4,
      "color": "#a9f59f",
      "name": "Humming Door",
      "title": "To Workshop",
      "desc": "Its lock crackles for a Spark Key.",
      "prompt": "Metal door glowing with static lock",
      "questId": "q_spark",
      "tree": {
        "start": {
          "text": "The door is sealed.",
          "choices": [
            {
              "label": "(Search for Spark Key)",
              "to": "accept",
              "q": "accept"
            },
            {
              "label": "(Use Spark Key)",
              "to": "do_turnin",
              "q": "turnin"
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "accept": {
          "text": "Its lock crackles for a Spark Key.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "do_turnin": {
          "text": "The door slides aside.",
          "choices": [
            {
              "label": "(Continue)",
              "to": "bye",
              "goto": {
                "map": "echoes_workshop",
                "x": 1,
                "y": 4
              }
            }
          ]
        }
      }
    },
    {
      "id": "cogcrate",
      "map": "echoes_workshop",
      "x": 4,
      "y": 5,
      "color": "#9ef7a0",
      "name": "Gear Crate",
      "desc": "Loose gears rattle within.",
      "prompt": "Heavy crate packed with gears",
      "tree": {
        "start": {
          "text": "The crate is heavy with metal.",
          "choices": [
            {
              "label": "(Open)",
              "to": "open",
              "once": true
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "open": {
          "text": "Among the gears is a Cog Key.",
          "choices": [
            {
              "label": "(Take Key)",
              "to": "empty",
              "reward": "cog_key"
            }
          ]
        },
        "empty": {
          "text": "Only scraps remain.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        }
      }
    },
    {
      "id": "door_archive",
      "map": "echoes_workshop",
      "x": 14,
      "y": 4,
      "color": "#a9f59f",
      "name": "Rust Door",
      "title": "To Archive",
      "desc": "Its hinges await a Cog Key.",
      "prompt": "Rusted door with cracked hinges",
      "questId": "q_cog",
      "tree": {
        "start": {
          "text": "The door is locked tight.",
          "choices": [
            {
              "label": "(Search for Cog Key)",
              "to": "accept",
              "q": "accept"
            },
            {
              "label": "(Use Cog Key)",
              "to": "do_turnin",
              "q": "turnin"
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "accept": {
          "text": "Its hinges await a Cog Key.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "do_turnin": {
          "text": "The door creaks open.",
          "choices": [
            {
              "label": "(Continue)",
              "to": "bye",
              "goto": {
                "map": "echoes_archive",
                "x": 1,
                "y": 4
              }
            }
          ]
        }
      }
    },
    {
      "id": "rat",
      "map": "echoes_atrium",
      "x": 7,
      "y": 4,
      "color": "#f88",
      "name": "Dust Rat",
      "title": "Menace",
      "desc": "A rat swollen with dust.",
      "prompt": "Dust-swollen rat baring teeth",
      "tree": {
        "start": {
          "text": "The rat bares its teeth.",
          "choices": [
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        }
      },
      "combat": {
        "HP": 5,
        "ATK": 2,
        "DEF": 1,
        "loot": "rat_tail"
      }
    },
    {
      "id": "ghoul",
      "map": "echoes_archive",
      "x": 7,
      "y": 4,
      "color": "#f88",
      "name": "Gear Ghoul",
      "title": "Guardian",
      "desc": "A whirring husk hungry for scraps.",
      "prompt": "Whirring metal ghoul hungry for scrap",
      "questId": "q_beacon",
      "tree": {
        "start": {
          "text": "The ghoul clanks forward.",
          "choices": [
            {
              "label": "(Fight)",
              "to": "do_fight",
              "q": "turnin"
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        }
      },
      "combat": {
        "HP": 8,
        "ATK": 3,
        "DEF": 2,
        "loot": "copper_cog"
      }
    },
    {
      "id": "beacon",
      "map": "echoes_archive",
      "x": 13,
      "y": 4,
      "color": "#b8ffb6",
      "name": "Hope Beacon",
      "title": "Lightbringer",
      "desc": "A small lamp pulsing warmly.",
      "prompt": "Warm lamp shining hope",
      "tree": {
        "start": {
          "text": "The beacon glows, promising brighter days.",
          "choices": [
            {
              "label": "(Take Sun Charm)",
              "to": "reward",
              "reward": "sun_charm"
            },
            {
              "label": "(Leave)",
              "to": "bye"
            }
          ]
        },
        "reward": {
          "text": "You pocket the charm. The light feels hopeful.",
          "choices": [
            {
              "label": "(Step outside)",
              "to": "bye",
              "goto": {
                "map": "world",
                "x": 2,
                "y": 45
              }
            }
          ]
        }
      }
    }
  ],
  "events": [
    {
      "map": "hall",
      "x": 14,
      "y": 18,
      "events": [
        {
          "when": "enter",
          "effect": "toast",
          "msg": "You smell rot."
        }
      ]
    }
  ],
  "zones": [
    {
      "map": "world",
      "x": 0,
      "y": 0,
      "w": 120,
      "h": 5,
      "perStep": {
        "hp": -1,
        "msg": "Nanite swarm!"
      },
      "negate": "mask"
    },
    {
      "map": "hall",
      "x": 16,
      "y": 18,
      "w": 2,
      "h": 1,
      "useItem": {
        "id": "wand",
        "reward": "scrap 5",
        "once": true
      }
    }
  ],
  "name": "dustland-module",
  "templates": [
    {
      "id": "rotwalker",
      "name": "Rotwalker",
      "portraitSheet": "assets/portraits/dustland-module/rotwalker_4.png",
      "portraitLock": false,
      "combat": {
        "HP": 6,
        "ATK": 2,
        "DEF": 0
      }
    },
    {
      "id": "scavenger",
      "name": "Scavenger",
      "portraitSheet": "assets/portraits/dustland-module/scavenger_4.png",
      "portraitLock": false,
      "combat": {
        "HP": 5,
        "ATK": 2,
        "DEF": 0
      }
    },
    {
      "id": "vine_creature",
      "name": "Vine Creature",
      "portraitSheet": "assets/portraits/dustland-module/vine_creature_4.png",
      "portraitLock": false,
      "combat": {
        "HP": 4,
        "ATK": 1,
        "DEF": 0
      }
    },
    {
      "id": "sand_titan",
      "name": "Sand Titan",
      "portraitSheet": "assets/portraits/dustland-module/sand_titan.png",
      "portraitLock": false,
      "combat": {
        "HP": 20,
        "ATK": 6,
        "DEF": 4,
        "challenge": 9
      }
    },
    {
      "id": "dune_reaper",
      "name": "Dune Reaper",
      "portraitSheet": "assets/portraits/dustland-module/dune_reaper_4.png",
      "portraitLock": false,
      "combat": {
        "HP": 90,
        "ATK": 8,
        "DEF": 7,
        "challenge": 32,
        "special": {
          "cue": "lashes the wind with scythes!",
          "dmg": 10
        }
      }
    },
    {
      "id": "sand_colossus",
      "name": "Sand Colossus",
      "portraitSheet": "assets/portraits/dustland-module/sand_colossus_4.png",
      "portraitLock": false,
      "combat": {
        "HP": 120,
        "ATK": 10,
        "DEF": 8,
        "challenge": 36,
        "requires": "artifact_blade",
        "special": {
          "cue": "shakes the desert!",
          "dmg": 12
        }
      }
    }
  ],
  "encounters": {
    "world": [
      {
        "templateId": "vine_creature",
        "loot": "plant_fiber",
        "lootChance": 0.25,
        "maxDist": 20
      },
      {
        "templateId": "rotwalker",
        "loot": "water_flask",
        "lootChance": 0.25,
        "maxDist": 24
      },
      {
        "templateId": "scavenger",
        "loot": "raider_knife",
        "lootChance": 0.75,
        "maxDist": 36
      },
      {
        "templateId": "sand_titan",
        "loot": "artifact_blade",
        "lootChance": 0.75,
        "minDist": 30
      },
      {
        "templateId": "dune_reaper",
        "loot": "artifact_blade",
        "lootChance": 0.75,
        "minDist": 40
      },
      {
        "templateId": "sand_colossus",
        "loot": "artifact_blade",
        "lootChance": 0.75,
        "minDist": 44
      }
    ]
  },
  "buildings": [
    {
      "x": 40,
      "y": 42,
      "w": 3,
      "h": 3,
      "doorX": 41,
      "doorY": 44,
      "interiorId": "slot_shack",
      "boarded": false,
      "grid": [
        [
          9,
          9,
          9
        ],
        [
          9,
          9,
          9
        ],
        [
          9,
          8,
          9
        ]
      ]
    },
    {
      "x": 46,
      "y": 42,
      "w": 3,
      "h": 3,
      "doorX": 47,
      "doorY": 44,
      "interiorId": "workshop",
      "boarded": false,
      "grid": [
        [
          9,
          9,
          9
        ],
        [
          9,
          9,
          9
        ],
        [
          9,
          8,
          9
        ]
      ]
    },
    {
      "x": 117,
      "y": 0,
      "w": 3,
      "h": 3,
      "doorX": 118,
      "doorY": 2,
      "interiorId": "portal_hut",
      "boarded": false,
      "grid": [
        [
          9,
          9,
          9
        ],
        [
          9,
          9,
          9
        ],
        [
          9,
          8,
          9
        ]
      ]
    },
    {
      "x": 70,
      "y": 42,
      "w": 3,
      "h": 3,
      "doorX": 71,
      "doorY": 44,
      "interiorId": "echoes_atrium",
      "boarded": false,
      "grid": [
        [
          9,
          9,
          9
        ],
        [
          9,
          9,
          9
        ],
        [
          9,
          8,
          9
        ]
      ]
    }
  ],
  "portals": [
    {
      "map": "portal_hut",
      "x": 2,
      "y": 1,
      "toMap": "hall",
      "toX": 15,
      "toY": 18
    }
  ],
  "interiors": [
    {
      "id": "hall",
      "w": 30,
      "h": 22,
      "grid": [
        "🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜🧱🧱🧱🌿🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🌿🧱🧱🧱⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🌿🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱"
      ],
      "entryX": 15,
      "entryY": 18
    },
    {
      "id": "slot_shack",
      "w": 7,
      "h": 7,
      "grid": [
        "🧱🧱🧱🧱🧱🧱🧱",
        "🧱⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜🧱",
        "🧱🧱🧱🚪🧱🧱🧱"
      ],
      "entryX": 3,
      "entryY": 5
    },
    {
      "id": "workshop",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱⬜⬜⬜🧱",
        "🧱⬜⬜⬜🧱",
        "🧱⬜⬜⬜🧱",
        "🧱🧱🧱🚪🧱"
      ],
      "entryX": 2,
      "entryY": 3
    },
    {
      "id": "portal_hut",
      "w": 5,
      "h": 5,
      "grid": [
        "🧱🧱🧱🧱🧱",
        "🧱⬜🌀⬜🧱",
        "🧱⬜⬜⬜🧱",
        "🧱⬜⬜⬜🧱",
        "🧱🧱🧱🚪🧱"
      ],
      "entryX": 2,
      "entryY": 3
    },
    {
      "id": "echo_chamber",
      "w": 5,
      "h": 5,
      "grid": [
        "🪨🪨🪨🪨🪨",
        "🪨⬜⬜⬜🪨",
        "🪨⬜🌟⬜🪨",
        "🪨⬜⬜⬜🪨",
        "🪨🪨🪨🪨🪨"
      ],
      "entryX": 2,
      "entryY": 2
    },
    {
      "id": "echoes_atrium",
      "w": 16,
      "h": 8,
      "grid": [
        "🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱🧱🧱🧱🧱🧱🧱🚪🧱🧱🧱🧱🧱🧱🧱🧱"
      ],
      "entryX": 7,
      "entryY": 6
    },
    {
      "id": "echoes_workshop",
      "w": 16,
      "h": 8,
      "grid": [
        "🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱🧱🧱🧱🧱🧱🧱🚪🧱🧱🧱🧱🧱🧱🧱🧱"
      ],
      "entryX": 1,
      "entryY": 4
    },
    {
      "id": "echoes_archive",
      "w": 16,
      "h": 8,
      "grid": [
        "🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱",
        "🧱🧱🧱🧱🧱🧱🧱🚪🧱🧱🧱🧱🧱🧱🧱🧱"
      ],
      "entryX": 1,
      "entryY": 4
    }
  ]
}
`;

let slotNetPayout = 0;
function pullSlots(cost, payouts) {
  if (player.scrap < cost) {
    log('Not enough scrap.');
    return;
  }
  player.scrap -= cost;
  const lead = typeof leader === 'function' ? leader() : null;
  const luck = (lead?.stats?.LCK || 0) + (lead?._bonus?.LCK || 0);
  const eff = Math.max(0, luck - 7);
  let idx = Math.floor(rng() * payouts.length);
  if (eff > 0 && rng() < eff * 0.05) {
    idx = Math.min(idx + 1, payouts.length - 1);
    log('Lucky spin!');
  }
  const reward = payouts[idx];
  if (reward > 0) {
    player.scrap += reward;
    log(`The machine rattles and spits out ${reward} scrap.`);
  } else {
    log('The machine coughs and eats your scrap.');
  }
  slotNetPayout += reward - cost;
  if (slotNetPayout >= 500) {
    log('The machine sparks and collapses!');
    const slotNpc = NPCS.find(n => n.id === 'slots');
    const dropPos = slotNpc ? { map: slotNpc.map, x: slotNpc.x, y: slotNpc.y } : { map: party.map, x: party.x, y: party.y };
    if (slotNpc) removeNPC(slotNpc);
    const cache = SpoilsCache?.create?.('vaulted');
    if (cache) {
      const registered = registerItem?.(cache) || cache;
      itemDrops?.push?.({ id: registered.id, ...dropPos });
      globalThis.EventBus?.emit?.('spoils:drop', { cache: registered, target: slotNpc });
    }
  }
  updateHUD?.();
}

function buyMemoryWorm() {
  if (player.scrap < 500) {
    log('Not enough scrap.');
    return;
  }
  player.scrap -= 500;
  addToInv('memory_worm');
  renderInv?.();
  updateHUD?.();
  log('Purchased Memory Worm.');
}

function handleCustomEffects(list) {
  return (list || []).map(e => {
    if (!e || typeof e !== 'object') return e;
    switch (e.effect) {
      case 'showTrainer':
        return () => TrainerUI?.showTrainer?.(e.trainer);
      case 'pullSlots':
        return () => pullSlots(e.cost, e.payouts);
      case 'buyMemoryWorm':
        return buyMemoryWorm;
      case 'craftSignalBeacon':
        return () => Dustland.workbench?.craftSignalBeacon?.();
      default:
        return e;
    }
  });
}

function postLoad(module) {
  const exit = module.npcs?.find(n => n.id === 'exitdoor');
  if (exit) {
    exit.processNode = function (node) {
      if (node === 'start') {
        const monsterAlive = NPCS.some(n => n.id === 'hall_rotwalker');
        exit.tree.start.text = monsterAlive
          ? 'Caretaker Kesh eyes the chained exit. "There\'s a rotwalker at the top of the hall. Killing it would be a good test."'
          : 'Caretaker Kesh eyes the chained exit.';
      }
    };
  }
  for (const npc of module.npcs || []) {
    for (const node of Object.values(npc.tree || {})) {
      if (node.effects) node.effects = handleCustomEffects(node.effects);
      for (const choice of node.choices || []) {
        if (choice.effects) choice.effects = handleCustomEffects(choice.effects);
      }
    }
  }

  for (const npc of module.npcs || []) {
    const arr = globalThis.soundSources;
    if (npc.hintSound && Array.isArray(arr)) {
      arr.push({ id: npc.id, x: npc.x, y: npc.y, map: npc.map });
    }
  }

  const key = module.items?.find(i => i.use && i.use.effect === 'vision');
  if (key) {
    key.use = {
      onUse() {
        setMap('echo_chamber');
        setPartyPos(2, 2);
        log('A vision of a shining world surrounds you.');
      }
    };
  }


  // expose procedural map action for Adventure Kit
  module.generateMap = regen => globalThis.generateProceduralWorld?.(regen);

  const sage = module.npcs?.find(n => n.id === 'tape_sage');
  if (sage) sage.onMemoryTape = msg => { log('Archivist listens: ' + msg); };

  const bus = globalThis.Dustland?.eventBus;
  if (bus) {
    let turns = 0;
    const doorX = 15, doorY = 18;
    const open = () => {
      setTile('hall', doorX, doorY, TILE.DOOR);
      portals.push({ map: 'hall', x: doorX, y: doorY, toMap: 'world', toX: 2, toY: Math.floor(WORLD_H / 2) });
      log('A door to the wastes grinds open.');
    };
    bus.on('sfx', id => {
      if (id !== 'step' || state.map !== 'hall') return;
      if (++turns === 100) open();
    });
  }
}

globalThis.DUSTLAND_MODULE = JSON.parse(DATA);
globalThis.DUSTLAND_MODULE.postLoad = postLoad;

globalThis.startGame = function () {
  DUSTLAND_MODULE.postLoad?.(DUSTLAND_MODULE);
  const { start: s } = applyModule(DUSTLAND_MODULE) || {};
  const loc = s || { map: 'world', x: 2, y: Math.floor(WORLD_H / 2) };
  setMap(loc.map, loc.map === 'world' ? 'Wastes' : 'Test Hall');
  setPartyPos(loc.x, loc.y);
};
