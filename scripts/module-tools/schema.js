export const schema = {
  npc: ['id', 'map', 'x', 'y'],
  building: ['x', 'y', 'interiorId'],
  zone: ['map', 'x', 'y', 'w', 'h']
};

export function validate(type, obj) {
  const req = schema[type];
  if (!req) return;
  for (const key of req) {
    if (obj[key] === undefined) {
      throw new Error(`Missing field ${key} in ${type}`);
    }
  }
}
