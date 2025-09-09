# Zones

*Author: Priya "Gizmo" Sharma*

Zones mark rectangular regions on a map that apply special effects while the party remains inside. Designers can draw them in the world with the Adventure Kit to control encounter rules or inflict environmental hazards.

## Fields
- `map`: target map id (`world` by default)
- `x`, `y`: top-left tile coordinates
- `w`, `h`: width and height in tiles
- `name`: optional label for editor use
- `perStep`: `{ hp, msg }` applied each move or wait
- `healMult`: multiplier for passive HP regen
- `noEncounters`: disable random combat
- `require`: item id needed for the effect
- `negate`: item id that cancels the effect if in inventory or equipped to the leader

## Example
```json
{
  "map": "world",
  "x": 0,
  "y": 0,
  "w": 10,
  "h": 3,
  "name": "Nanite swarm",
  "perStep": { "hp": -1, "msg": "Nanite swarm!" },
  "negate": "mask"
}
```
