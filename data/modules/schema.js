const ackModuleSchema = {
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
        "tileGraphics": {
            "type": "object",
            "properties": {
                "defaults": {
                    "type": "object",
                    "additionalProperties": { "type": "string" }
                },
                "interiors": {
                    "type": "object",
                    "additionalProperties": { "type": "string" }
                },
                "maps": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "object",
                        "additionalProperties": { "type": "string" }
                    }
                }
            },
            "additionalProperties": false
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
                    "tileSprite": { "type": "string" },
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
                            "amount": { "type": "number" },
                            "effect": { "type": ["string", "object"] },
                            "effects": {
                                "type": "array",
                                "items": {
                                    "oneOf": [
                                        { "type": "string" },
                                        { "type": "object" }
                                    ]
                                }
                            },
                            "consume": { "type": "boolean" },
                            "text": { "type": "string" },
                            "toast": { "type": "string" }
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
            "items": {
                "type": "object",
                "properties": {
                    "map": { "type": "string" },
                    "x": { "type": "number" },
                    "y": { "type": "number" },
                    "w": { "type": "number" },
                    "h": { "type": "number" },
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
                    }
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
                    "weather": { "type": ["string", "object"] },
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
globalThis.ACK_MODULE_SCHEMA = ackModuleSchema;
export {};
