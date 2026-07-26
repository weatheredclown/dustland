const ackModuleSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Adventure Kit Module",
    "type": "object",
    "properties": {
        "seed": { "type": ["number", "string"] },
        "name": { "type": "string" },
        "description": { "type": "string" },
        "author": { "type": "string" },
        "version": { "type": ["string", "number"] },
        "module": { "type": "string" },
        "moduleVar": { "type": "string" },
        "credits": {
            "type": "array",
            "items": { "$ref": "#/definitions/credit" }
        },
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
            "items": {
                "oneOf": [
                    { "type": "string" },
                    { "type": "array", "items": { "type": "number" } }
                ]
            }
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
                    },
                    "entryX": { "type": "number" },
                    "entryY": { "type": "number" },
                    "name": { "type": "string" },
                    "label": { "type": "string" },
                    "desc": { "type": "string" }
                },
                "required": ["id", "grid"],
                "additionalProperties": false
            }
        },
        "mapLabels": {
            "type": "object",
            "additionalProperties": { "type": ["string", "object"] }
        },
        "props": { "type": "object" },
        "personas": {
            "type": "object",
            "additionalProperties": { "type": "object" }
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
                    "doorX": { "type": "number" },
                    "doorY": { "type": "number" },
                    "interiorId": { "type": ["string", "null"] },
                    "boarded": { "type": "boolean" },
                    "bunker": { "type": "boolean" },
                    "bunkerId": { "type": "string" },
                    "name": { "type": "string" },
                    "grid": {
                        "type": "array",
                        "items": {
                            "type": "array",
                            "items": { "type": ["number", "null"] }
                        }
                    }
                },
                "required": ["x", "y"],
                "additionalProperties": false
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
                    "entryY": { "type": "number" },
                    "name": { "type": "string" },
                    "label": { "type": "string" },
                    "desc": { "type": "string" }
                },
                "required": ["id", "grid"],
                "additionalProperties": false
            }
        },
        "npcs": {
            "type": "array",
            "items": { "$ref": "#/definitions/npc" }
        },
        "items": {
            "type": "array",
            "items": { "$ref": "#/definitions/item" }
        },
        "quests": {
            "type": "array",
            "items": { "$ref": "#/definitions/quest" }
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
                    "toY": { "type": "number" },
                    "desc": { "type": "string" },
                    "if": { "$ref": "#/definitions/flagCondition" }
                },
                "required": ["map", "x", "y", "toMap", "toX", "toY"],
                "additionalProperties": false
            }
        },
        "events": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "map": { "type": "string" },
                    "x": { "type": "number" },
                    "y": { "type": "number" },
                    "events": {
                        "type": "array",
                        "items": { "$ref": "#/definitions/effect" }
                    }
                },
                "required": ["map", "x", "y"],
                "additionalProperties": false
            }
        },
        "schedules": {
            "type": "object",
            "properties": {
                "world": { "$ref": "#/definitions/scheduleList" },
                "npcs": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "npcId": { "type": "string" },
                            "timeline": { "$ref": "#/definitions/scheduleList" }
                        },
                        "required": ["npcId", "timeline"],
                        "additionalProperties": false
                    }
                }
            },
            "additionalProperties": false
        },
        "zones": {
            "type": "array",
            "items": { "$ref": "#/definitions/zone" }
        },
        "zoneEffects": {
            "type": "array",
            "items": { "$ref": "#/definitions/zone" }
        },
        "encounters": {
            "type": "object",
            "additionalProperties": {
                "type": "array",
                "items": { "$ref": "#/definitions/combat" }
            }
        },
        "behaviors": {
            "type": "object",
            "properties": {
                "stepUnlocks": { "$ref": "#/definitions/stepUnlockList" },
                "arenas": { "$ref": "#/definitions/arenaList" },
                "memoryTapes": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "npcId": { "type": "string" },
                            "log": { "type": "string" },
                            "logPrefix": { "type": "string" }
                        },
                        "required": ["npcId"],
                        "additionalProperties": false
                    }
                },
                "dialogMutations": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "npcId": { "type": "string" },
                            "nodeId": { "type": "string" },
                            "defaultText": { "type": "string" },
                            "variants": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "condition": {
                                            "type": "object",
                                            "properties": {
                                                "type": { "type": "string" },
                                                "npcId": { "type": "string" },
                                                "flag": { "type": "string" },
                                                "op": { "type": "string" },
                                                "value": { "type": "number" }
                                            },
                                            "required": ["type"],
                                            "additionalProperties": true
                                        },
                                        "text": { "type": "string" }
                                    },
                                    "required": ["text"],
                                    "additionalProperties": false
                                }
                            }
                        },
                        "required": ["npcId", "nodeId"],
                        "additionalProperties": false
                    }
                }
            },
            "additionalProperties": false
        },
        "templates": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": { "type": "string" },
                    "name": { "type": "string" },
                    "desc": { "type": "string" },
                    "color": { "type": "string" },
                    "symbol": { "type": "string" },
                    "prompt": { "type": "string" },
                    "portraitSheet": { "type": "string" },
                    "portraitLock": { "type": "boolean" },
                    "combat": { "$ref": "#/definitions/combat" }
                },
                "required": ["id"],
                "additionalProperties": false
            }
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
    "additionalProperties": false,
    "definitions": {
        "credit": {
            "oneOf": [
                { "type": "string" },
                {
                    "type": "object",
                    "properties": {
                        "name": { "type": "string" },
                        "title": { "type": "string" },
                        "role": { "type": "string" }
                    },
                    "additionalProperties": false
                }
            ]
        },
        "npc": {
            "type": "object",
            "properties": {
                "id": { "type": "string" },
                "map": { "type": "string" },
                "x": { "type": "number" },
                "y": { "type": "number" },
                "color": { "type": "string" },
                "overrideColor": { "type": "boolean" },
                "name": { "type": "string" },
                "title": { "type": "string" },
                "desc": { "type": "string" },
                "prompt": { "type": "string" },
                "symbol": { "type": "string" },
                "portraitSheet": { "type": "string" },
                "portraitLock": { "type": "boolean" },
                "hintSound": { "type": "boolean" },
                "tree": { "$ref": "#/definitions/dialogTree" },
                "questId": { "type": "string" },
                "quests": {
                    "type": "array",
                    "items": { "type": "string" }
                },
                "questDialogs": {
                    "type": "array",
                    "items": { "type": "string" }
                },
                "combat": { "$ref": "#/definitions/combat" },
                "locked": { "type": "boolean" },
                "shop": { "type": ["object", "boolean"] },
                "trainer": { "type": ["string", "object", "boolean"] },
                "workbench": { "type": ["object", "boolean"] },
                "door": { "type": ["object", "boolean"] },
                "hidden": { "type": "boolean" },
                "reveal": { "$ref": "#/definitions/flagCondition" },
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
            "additionalProperties": false
        },
        "item": {
            "type": "object",
            "properties": {
                "id": { "type": "string" },
                "name": { "type": "string" },
                "type": { "type": "string" },
                "desc": { "type": "string" },
                "map": { "type": ["string", "null"] },
                "x": { "type": ["number", "null"] },
                "y": { "type": ["number", "null"] },
                "slot": { "type": "string" },
                "rank": { "type": "string" },
                "rarity": { "type": "string" },
                "baseId": { "type": "string" },
                "persona": { "type": "string" },
                "fuel": { "type": "number" },
                "scrap": { "type": "number" },
                "value": { "type": "number" },
                "equip": { "type": ["object", "null"] },
                "mods": {
                    "type": "object",
                    "additionalProperties": { "type": "number" }
                },
                "tags": {
                    "type": "array",
                    "items": { "type": "string" }
                },
                "use": {
                    "type": ["object", "null"],
                    "properties": {
                        "type": { "type": "string" },
                        "amount": { "type": "number" },
                        "effect": { "type": ["string", "object"] },
                        "effects": {
                            "type": "array",
                            "items": { "$ref": "#/definitions/effect" }
                        },
                        "consume": { "type": "boolean" },
                        "text": { "type": "string" },
                        "toast": { "type": "string" }
                    },
                    "additionalProperties": true
                }
            },
            "required": ["id"],
            "additionalProperties": false
        },
        "quest": {
            "type": "object",
            "properties": {
                "id": { "type": "string" },
                "title": { "type": "string" },
                "desc": { "type": "string" },
                "item": { "type": "string" },
                "itemTag": { "type": "string" },
                "count": { "type": "number" },
                "reward": { "type": ["string", "object", "null"] },
                "xp": { "type": "number" },
                "reqFlag": { "type": "string" },
                "autoStart": { "type": "boolean" },
                "dialog": {
                    "oneOf": [
                        { "type": "string" },
                        {
                            "type": "object",
                            "properties": {
                                "offer": { "type": "string" },
                                "active": { "type": "string" },
                                "completed": { "type": "string" }
                            },
                            "additionalProperties": false
                        }
                    ]
                },
                "progressText": { "type": "string" },
                "dialogNodes": {
                    "type": "array",
                    "items": {
                        "oneOf": [
                            { "type": "string" },
                            {
                                "type": "object",
                                "properties": {
                                    "npcId": { "type": "string" },
                                    "nodeId": { "type": "string" }
                                },
                                "required": ["npcId", "nodeId"],
                                "additionalProperties": false
                            }
                        ]
                    }
                },
                "givers": {
                    "type": "array",
                    "items": {
                        "oneOf": [
                            { "type": "string" },
                            {
                                "type": "object",
                                "properties": { "id": { "type": "string" } },
                                "required": ["id"],
                                "additionalProperties": true
                            }
                        ]
                    }
                }
            },
            "required": ["id"],
            "additionalProperties": false
        },
        "zone": {
            "type": "object",
            "properties": {
                "map": { "type": "string" },
                "x": { "type": "number" },
                "y": { "type": "number" },
                "w": { "type": "number" },
                "h": { "type": "number" },
                "if": { "$ref": "#/definitions/flagCondition" },
                "require": { "type": "string" },
                "negate": { "type": "string" },
                "useItem": { "type": ["string", "object"] },
                "weather": { "type": ["string", "object"] },
                "walled": { "type": "boolean" },
                "entrances": {
                    "type": "object",
                    "properties": {
                        "north": { "type": "boolean" },
                        "south": { "type": "boolean" },
                        "east": { "type": "boolean" },
                        "west": { "type": "boolean" }
                    },
                    "additionalProperties": false
                },
                "perStep": { "type": "object" },
                "step": { "type": "object" },
                "spawns": {
                    "type": "array",
                    "items": { "$ref": "#/definitions/combat" }
                },
                "minSteps": { "type": "number" },
                "maxSteps": { "type": "number" },
                "noEncounters": { "type": "boolean" }
            },
            "required": ["map", "x", "y", "w", "h"],
            "additionalProperties": false
        },
        "combat": {
            "type": "object",
            "properties": {
                "id": { "type": "string" },
                "name": { "type": "string" },
                "desc": { "type": "string" },
                "prompt": { "type": "string" },
                "color": { "type": "string" },
                "symbol": { "type": "string" },
                "portraitSheet": { "type": "string" },
                "portraitLock": { "type": "boolean" },
                "templateId": { "type": ["string", "null"] },
                "HP": { "type": "number" },
                "hp": { "type": "number" },
                "ATK": { "type": "number" },
                "DEF": { "type": "number" },
                "adr": { "type": "number" },
                "boss": { "type": "boolean" },
                "count": { "type": ["number", "object"] },
                "challenge": { "type": "number" },
                "auto": { "type": ["boolean", "object"] },
                "counterBasic": {
                    "oneOf": [
                        { "type": "boolean" },
                        {
                            "type": "object",
                            "properties": { "dmg": { "type": "number" } },
                            "additionalProperties": false
                        }
                    ]
                },
                "prob": { "type": "number" },
                "noLuckyKill": { "type": "boolean" },
                "requires": { "type": ["string", "array"] },
                "immune": { "type": ["string", "array"] },
                "resists": {
                    "type": "array",
                    "items": { "type": "object" }
                },
                "special": { "type": ["object", "array"] },
                "loot": { "type": ["string", "object", "null"] },
                "lootChance": { "type": "number" },
                "lootTable": {
                    "type": "array",
                    "items": { "type": "object" }
                },
                "scrap": {
                    "oneOf": [
                        { "type": "number" },
                        {
                            "type": "object",
                            "properties": {
                                "min": { "type": "number" },
                                "max": { "type": "number" },
                                "chance": { "type": "number" }
                            },
                            "additionalProperties": false
                        }
                    ]
                },
                "xp": { "type": "number" },
                "minDist": { "type": "number" },
                "maxDist": { "type": "number" },
                "deathEffects": {
                    "type": "array",
                    "items": { "$ref": "#/definitions/effect" }
                }
            },
            "additionalProperties": false
        },
        "dialogTree": {
            "type": "object",
            "additionalProperties": {
                "oneOf": [
                    { "$ref": "#/definitions/dialogNode" },
                    { "type": "null" }
                ]
            }
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
                "next": {
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
                },
                "checks": {
                    "type": "array",
                    "items": { "$ref": "#/definitions/effect" }
                }
            },
            "additionalProperties": false
        },
        "dialogChoice": {
            "type": "object",
            "properties": {
                "id": { "type": "string" },
                "label": { "type": "string" },
                "to": { "type": "string" },
                "once": { "type": "boolean" },
                "q": { "type": ["string", "null"], "enum": ["accept", "turnin", null] },
                "reward": { "type": ["string", "object", "null"] },
                "reqItem": { "type": ["string", "null"] },
                "reqTag": { "type": ["string", "null"] },
                "reqCount": { "type": ["number", "null"] },
                "reqFlag": { "type": ["string", "null"] },
                "reqSlot": { "type": ["string", "null"] },
                "costItem": { "type": ["string", "null"] },
                "costTag": { "type": ["string", "null"] },
                "costSlot": { "type": ["string", "null"] },
                "costCount": { "type": ["number", "null"] },
                "if": { "oneOf": [{ "$ref": "#/definitions/flagCondition" }, { "type": "null" }] },
                "ifOnce": {
                    "type": "object",
                    "properties": {
                        "node": { "type": "string" },
                        "label": { "type": "string" },
                        "used": { "type": "boolean" }
                    },
                    "required": ["node", "label"],
                    "additionalProperties": false
                },
                "setFlag": { "oneOf": [{ "$ref": "#/definitions/flagOperation" }, { "type": "null" }] },
                "goto": { "oneOf": [{ "$ref": "#/definitions/goto" }, { "type": "null" }] },
                "effects": {
                    "oneOf": [
                        { "type": "array", "items": { "$ref": "#/definitions/effect" } },
                        { "type": "null" }
                    ]
                },
                "check": {
                    "type": "object",
                    "properties": {
                        "stat": { "type": "string" },
                        "dc": { "type": "number" }
                    },
                    "required": ["stat"],
                    "additionalProperties": true
                },
                "success": { "type": "string" },
                "failure": { "type": "string" },
                "join": { "type": ["string", "object"] },
                "applyModule": { "type": "string" },
                "spawn": { "$ref": "#/definitions/spawn" }
            },
            "required": ["label"],
            "additionalProperties": false
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
                "op": { "enum": [">=", ">", "<=", "<", "!=", "=", "=="] },
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
                    "properties": {
                        "effect": { "type": "string" },
                        "when": { "type": "string" },
                        "messages": {
                            "type": "array",
                            "items": { "$ref": "#/definitions/endSlide" }
                        },
                        "credits": {
                            "type": "array",
                            "items": { "$ref": "#/definitions/credit" }
                        }
                    },
                    "required": ["effect"],
                    "additionalProperties": true
                }
            ]
        },
        "endSlide": {
            "oneOf": [
                { "type": "string" },
                {
                    "type": "object",
                    "properties": {
                        "text": { "type": "string" },
                        "if": { "$ref": "#/definitions/flagCondition" }
                    },
                    "required": ["text"],
                    "additionalProperties": false
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
        },
        "scheduleList": {
            "type": "array",
            "items": { "$ref": "#/definitions/scheduleEntry" }
        },
        "scheduleEntry": {
            "type": "object",
            "properties": {
                "id": { "type": "string" },
                "label": { "type": "string" },
                "event": { "type": "string" },
                "payload": { "type": "object" },
                "trigger": { "$ref": "#/definitions/scheduleTrigger" },
                "repeat": { "$ref": "#/definitions/repeatRule" },
                "prerequisites": {
                    "type": "array",
                    "items": { "$ref": "#/definitions/schedulePrerequisite" }
                },
                "notes": { "type": "string" }
            },
            "required": ["event", "trigger"],
            "additionalProperties": false
        },
        "scheduleTrigger": {
            "oneOf": [
                {
                    "type": "object",
                    "properties": {
                        "type": { "const": "immediate" }
                    },
                    "required": ["type"],
                    "additionalProperties": false
                },
                {
                    "type": "object",
                    "properties": {
                        "type": { "const": "time" },
                        "hour": { "type": "integer", "minimum": 0, "maximum": 23 },
                        "minute": { "type": "integer", "minimum": 0, "maximum": 59 },
                        "day": { "type": ["integer", "string"] }
                    },
                    "required": ["type", "hour"],
                    "additionalProperties": false
                },
                {
                    "type": "object",
                    "properties": {
                        "type": { "const": "delay" },
                        "hours": { "type": "integer", "minimum": 0 },
                        "minutes": { "type": "integer", "minimum": 0 }
                    },
                    "required": ["type"],
                    "anyOf": [
                        { "required": ["hours"] },
                        { "required": ["minutes"] }
                    ],
                    "additionalProperties": false
                },
                {
                    "type": "object",
                    "properties": {
                        "type": { "const": "afterEvent" },
                        "eventId": { "type": "string" },
                        "offsetHours": { "type": "integer", "minimum": 0 },
                        "offsetMinutes": { "type": "integer", "minimum": 0 }
                    },
                    "required": ["type", "eventId"],
                    "additionalProperties": false
                }
            ]
        },
        "repeatRule": {
            "type": "object",
            "properties": {
                "type": {
                    "enum": ["none", "interval", "daily", "weekly"]
                },
                "intervalHours": { "type": "integer", "minimum": 0 },
                "intervalMinutes": { "type": "integer", "minimum": 0 },
                "maxRuns": { "type": "integer", "minimum": 1 },
                "days": {
                    "type": "array",
                    "items": { "type": "string" }
                },
                "skipIfActive": { "type": "boolean" }
            },
            "required": ["type"],
            "allOf": [
                {
                    "if": { "properties": { "type": { "const": "interval" } } },
                    "then": {
                        "anyOf": [
                            { "required": ["intervalHours"] },
                            { "required": ["intervalMinutes"] }
                        ]
                    }
                },
                {
                    "if": { "properties": { "type": { "const": "weekly" } } },
                    "then": { "required": ["days"] }
                }
            ],
            "additionalProperties": false
        },
        "schedulePrerequisite": {
            "oneOf": [
                {
                    "type": "object",
                    "properties": {
                        "type": { "const": "flag" },
                        "flag": { "type": "string" },
                        "value": { "type": ["boolean", "string", "number"] }
                    },
                    "required": ["type", "flag"],
                    "additionalProperties": false
                },
                {
                    "type": "object",
                    "properties": {
                        "type": { "const": "questState" },
                        "questId": { "type": "string" },
                        "state": { "type": "string" }
                    },
                    "required": ["type", "questId", "state"],
                    "additionalProperties": false
                },
                {
                    "type": "object",
                    "properties": {
                        "type": { "const": "eventComplete" },
                        "eventId": { "type": "string" }
                    },
                    "required": ["type", "eventId"],
                    "additionalProperties": false
                },
                {
                    "type": "object",
                    "properties": {
                        "type": { "const": "script" },
                        "handler": { "type": "string" }
                    },
                    "required": ["type", "handler"],
                    "additionalProperties": false
                }
            ]
        },
        "stepUnlockList": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "map": { "type": "string" },
                    "x": { "type": "number" },
                    "y": { "type": "number" },
                    "steps": { "type": "number" },
                    "tile": { "type": ["string", "number"] },
                    "log": { "type": "string" },
                    "toast": { "type": "string" },
                    "portal": {
                        "type": "object",
                        "properties": {
                            "toMap": { "type": "string" },
                            "toX": { "type": "number" },
                            "toY": { "type": "number" }
                        },
                        "required": ["toMap", "toX", "toY"],
                        "additionalProperties": false
                    }
                },
                "required": ["map", "x", "y", "steps"],
                "additionalProperties": false
            }
        },
        "arenaList": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "map": { "type": "string" },
                    "bankId": { "type": "string" },
                    "entranceDelay": { "type": "number" },
                    "resetLog": { "type": "string" },
                    "reward": {
                        "type": "object",
                        "properties": {
                            "log": { "type": "string" },
                            "toast": { "type": "string" }
                        },
                        "additionalProperties": false
                    },
                    "waves": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "templateId": { "type": "string" },
                                "count": { "type": "number" },
                                "bankChallenge": { "type": "number" },
                                "announce": { "type": "string" },
                                "toast": { "type": "string" },
                                "prompt": { "type": "string" },
                                "vulnerability": {
                                    "type": "object",
                                    "properties": {
                                        "items": {
                                            "oneOf": [
                                                { "type": "string" },
                                                { "type": "array", "items": { "type": "string" } }
                                            ]
                                        },
                                        "matchDef": { "type": "number" },
                                        "missDef": { "type": "number" },
                                        "defMod": {
                                            "type": "object",
                                            "properties": {
                                                "match": { "type": "number" },
                                                "miss": { "type": "number" }
                                            },
                                            "additionalProperties": false
                                        },
                                        "successLog": { "type": "string" },
                                        "failLog": { "type": "string" }
                                    },
                                    "additionalProperties": false
                                }
                            },
                            "required": ["templateId"],
                            "additionalProperties": false
                        }
                    }
                },
                "required": ["map", "waves"],
                "additionalProperties": false
            }
        }
    }
};
globalThis.ACK_MODULE_SCHEMA = ackModuleSchema;
export { ackModuleSchema };
