const schema = {
  npc: ['id', 'map', 'x', 'y'] as const,
  building: ['x', 'y', 'interiorId'] as const,
  zone: ['map', 'x', 'y', 'w', 'h'] as const
};

type SchemaKey = keyof typeof schema;

type Validatable = Record<string, unknown>;

function validate(type: SchemaKey, obj: Validatable): void {
  const required = schema[type];
  if (!required) return;
  for (const key of required) {
    if (obj[key] === undefined) {
      throw new Error(`Missing field ${key as string} in ${type}`);
    }
  }
}

export { schema, validate };
