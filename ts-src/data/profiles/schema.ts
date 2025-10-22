// @ts-nocheck
globalThis.PROFILE_SCHEMA = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Profiles",
  "type": "object",
  "additionalProperties": {
    "type": "object",
    "properties": {
      "mods": {
        "type": "object",
        "additionalProperties": { "type": "number" }
      },
      "effects": {
        "type": "array",
        "items": { "type": "object" }
      }
    },
    "additionalProperties": false
  }
};
