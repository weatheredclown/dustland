const starterItems = [
    {
        id: 'starter_canteen',
        name: 'Canteen',
        type: 'misc',
        use: { type: 'hydrate', amount: 2, text: 'You take a drink.' }
    }
];
const dustland = (globalThis.Dustland ?? (globalThis.Dustland = {}));
dustland.starterItems = starterItems;
