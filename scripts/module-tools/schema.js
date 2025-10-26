const schema = {
    npc: ['id', 'map', 'x', 'y'],
    building: ['x', 'y', 'interiorId'],
    zone: ['map', 'x', 'y', 'w', 'h']
};
function validate(type, obj) {
    const required = schema[type];
    if (!required)
        return;
    for (const key of required) {
        if (obj[key] === undefined) {
            throw new Error(`Missing field ${key} in ${type}`);
        }
    }
}
export { schema, validate };
