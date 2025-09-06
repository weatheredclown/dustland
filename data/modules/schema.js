globalThis.ACK_MODULE_SCHEMA = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Adventure Kit Module",
  "type": "object",
  "properties": {
    "seed": { "type": ["number", "string"] },
    "name": { "type": "string" },
    "module": { "type": "string" },
    "moduleVar": { "type": "string" },
    "start": {
      "type": "object",
      "properties": {
        "map": { "type": "string" },
        "x": { "type": "number" },
        "y": { "type": "number" }
      },
      "required": ["map", "x", "y"],
      "additionalProperties": false
    },
    "startMap": { "type": "string" },
    "startPoint": {
      "type": "object",
      "properties": {
        "x": { "type": "number" },
        "y": { "type": "number" }
      },
      "required": ["x", "y"],
      "additionalProperties": false
    },
    "world": {
      "type": "array",
      "items": { "type": "string" }
    },
    "maps": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "w": { "type": "number" },
          "h": { "type": "number" },
          "grid": {
            "type": "array",
            "items": { "type": "string" }
          }
        },
        "required": ["id", "grid"],
        "additionalProperties": true
      }
    },
    "buildings": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "x": { "type": "number" },
          "y": { "type": "number" },
          "w": { "type": "number" },
          "h": { "type": "number" },
          "interiorId": { "type": "string" }
        },
        "required": ["x", "y"],
        "additionalProperties": true
      }
    },
    "interiors": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "w": { "type": "number" },
          "h": { "type": "number" },
          "grid": {
            "type": "array",
            "items": {
              "oneOf": [
                { "type": "string" },
                { "type": "array", "items": { "type": "number" } }
              ]
            }
          },
          "entryX": { "type": "number" },
          "entryY": { "type": "number" }
        },
        "required": ["id", "grid"],
        "additionalProperties": true
      }
    },
    "npcs": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "map": { "type": "string" },
          "x": { "type": "number" },
          "y": { "type": "number" },
          "color": { "type": "string" },
          "name": { "type": "string" },
          "title": { "type": "string" },
          "desc": { "type": "string" },
          "prompt": { "type": "string" },
          "tree": { "$ref": "#/definitions/dialogTree" },
          "questId": { "type": "string" },
          "combat": { "type": "object" },
          "symbol": { "type": "string" },
          "locked": { "type": "boolean" },
          "shop": { "type": "object" },
          "hidden": { "type": "boolean" },
          "reveal": { "type": "object" },
          "portraitSheet": { "type": "string" },
          "hintSound": { "type": "boolean" },
          "portraitLock": { "type": "boolean" },
          "loop": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "x": { "type": "number" },
                "y": { "type": "number" }
              },
              "required": ["x", "y"],
              "additionalProperties": false
            }
          }
        },
        "required": ["id", "map", "x", "y"],
        "additionalProperties": true
      }
    },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "type": { "type": "string" },
          "desc": { "type": "string" },
          "map": { "type": "string" },
          "x": { "type": "number" },
          "y": { "type": "number" },
          "slot": { "type": "string" },
          "rank": { "type": "string" },
          "rarity": { "type": "string" },
          "mods": {
            "type": "object",
            "additionalProperties": { "type": "number" }
          },
          "tags": {
            "type": "array",
            "items": { "type": "string" }
          },
          "value": { "type": "number" },
          "use": {
            "type": "object",
            "properties": {
              "type": { "type": "string" },
              "amount": { "type": "number" }
            },
            "additionalProperties": true
          }
        },
        "required": ["id"],
        "additionalProperties": true
      }
    },
    "quests": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "title": { "type": "string" },
          "desc": { "type": "string" },
          "item": { "type": "string" },
          "reward": { "type": ["string", "object"] },
          "xp": { "type": "number" },
          "reqFlag": { "type": "string" },
          "count": { "type": "number" }
        },
        "required": ["id"],
        "additionalProperties": true
      }
    },
    "portals": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "map": { "type": "string" },
          "x": { "type": "number" },
          "y": { "type": "number" },
          "toMap": { "type": "string" },
          "toX": { "type": "number" },
          "toY": { "type": "number" }
        },
        "required": ["map", "x", "y", "toMap", "toX", "toY"],
        "additionalProperties": true
      }
    },
    "events": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "map": { "type": "string" },
          "x": { "type": "number" },
          "y": { "type": "number" }
        },
        "required": ["map", "x", "y"],
        "additionalProperties": true
      }
    },
    "zones": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "map": { "type": "string" },
          "x": { "type": "number" },
          "y": { "type": "number" },
          "w": { "type": "number" },
          "h": { "type": "number" }
        },
        "required": ["map", "x", "y", "w", "h"],
        "additionalProperties": true
      }
    },
    "zoneEffects": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "map": { "type": "string" },
          "x": { "type": "number" },
          "y": { "type": "number" },
          "w": { "type": "number" },
          "h": { "type": "number" },
          "spawns": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "name": { "type": "string" },
                "HP": { "type": "number" },
                "ATK": { "type": "number" },
                "DEF": { "type": "number" }
              },
              "required": ["name"],
              "additionalProperties": true
            }
          },
          "minSteps": { "type": "number" },
          "maxSteps": { "type": "number" },
          "noEncounters": { "type": "boolean" }
        },
        "required": ["map", "x", "y", "w", "h"],
        "additionalProperties": true
      }
    },
    "encounters": {
      "type": "object",
      "additionalProperties": {
        "type": "array",
        "items": { "type": "object" }
      }
    },
    "templates": {
      "type": "array",
      "items": { "type": "object" }
    },
    "procGen": {
      "type": "object",
      "properties": {
        "seed": { "type": "number" },
        "falloff": { "type": "number" },
        "roads": { "type": "boolean" },
        "ruins": { "type": "boolean" }
      },
      "additionalProperties": false
    }
  },
  "required": [],
  "additionalProperties": true,
  "definitions": {
    "dialogTree": {
      "type": "object",
      "additionalProperties": { "$ref": "#/definitions/dialogNode" }
    },
    "dialogNode": {
      "type": "object",
      "properties": {
        "text": {
          "oneOf": [
            { "type": "string" },
            { "type": "array", "items": { "type": "string" } }
          ]
        },
        "choices": {
          "type": "array",
          "items": { "$ref": "#/definitions/dialogChoice" }
        },
        "jump": {
          "type": "array",
          "items": { "$ref": "#/definitions/jumpOption" }
        },
        "effects": {
          "type": "array",
          "items": { "$ref": "#/definitions/effect" }
        }
      },
      "additionalProperties": true
    },
    "dialogChoice": {
      "type": "object",
      "properties": {
        "label": { "type": "string" },
        "to": { "type": "string" },
        "once": { "type": "boolean" },
        "q": { "type": "string", "enum": ["accept", "turnin"] },
        "reward": { "type": "string" },
        "reqItem": { "type": "string" },
        "reqCount": { "type": "number" },
        "reqFlag": { "type": "string" },
        "reqSlot": { "type": "string" },
        "if": { "$ref": "#/definitions/flagCondition" },
        "setFlag": { "$ref": "#/definitions/flagOperation" },
        "goto": { "$ref": "#/definitions/goto" },
        "effects": {
          "type": "array",
          "items": { "$ref": "#/definitions/effect" }
        },
        "success": { "type": "string" },
        "failure": { "type": "string" },
        "spawn": { "$ref": "#/definitions/spawn" }
      },
      "required": ["label"],
      "additionalProperties": true
    },
    "jumpOption": {
      "type": "object",
      "properties": {
        "to": { "type": "string" },
        "if": { "$ref": "#/definitions/flagCondition" }
      },
      "required": ["to"],
      "additionalProperties": false
    },
    "flagCondition": {
      "type": "object",
      "properties": {
        "flag": { "type": "string" },
        "op": { "type": "string" },
        "value": { "type": "number" }
      },
      "required": ["flag"],
      "additionalProperties": false
    },
    "flagOperation": {
      "type": "object",
      "properties": {
        "flag": { "type": "string" },
        "op": { "type": "string" },
        "value": { "type": "number" }
      },
      "required": ["flag"],
      "additionalProperties": false
    },
    "goto": {
      "type": "object",
      "properties": {
        "map": { "type": "string" },
        "x": { "type": "number" },
        "y": { "type": "number" },
        "target": { "type": "string" },
        "rel": { "type": "boolean" }
      },
      "additionalProperties": true
    },
    "effect": {
      "oneOf": [
        { "type": "string" },
        {
          "type": "object",
          "properties": { "effect": { "type": "string" } },
          "required": ["effect"],
          "additionalProperties": true
        }
      ]
    },
    "spawn": {
      "type": "object",
      "properties": {
        "templateId": { "type": "string" },
        "x": { "type": "number" },
        "y": { "type": "number" },
        "challenge": { "type": ["number", "object"] }
      },
      "required": ["templateId"],
      "additionalProperties": true
    }
  }
};
