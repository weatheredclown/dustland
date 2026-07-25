(() => {
    const toSlug = (value) => value.trim().toLowerCase().replace(/\s+/g, '_');
    const dustlandStarter = (globalThis.Dustland ?? (globalThis.Dustland = {}));
    const wizardStepsStarter = dustlandStarter.WizardSteps ?? {};
    const { text, mapPlacement, confirm } = wizardStepsStarter;
    if (!text || !mapPlacement || !confirm) {
        console.warn('Starter module wizard skipped initialization because required steps are missing.');
        return;
    }
    // Nudge a picked coordinate onto the nearest walkable tile so the
    // generated module never starts the party (or drops the quest item)
    // in water or inside a rock.
    const snapToWalkable = (pos) => {
        const g = globalThis;
        const world = g.world;
        const tile = g.TILE;
        if (!Array.isArray(world) || !world.length || !tile)
            return pos;
        const blocked = new Set([tile.WATER, tile.WALL, tile.BUILDING].filter((t) => typeof t === 'number'));
        const h = world.length;
        const w = world[0]?.length ?? 0;
        const inBounds = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
        const ok = (x, y) => inBounds(x, y) && !blocked.has(world[y][x]);
        const cx = Math.min(Math.max(pos.x, 0), Math.max(0, w - 1));
        const cy = Math.min(Math.max(pos.y, 0), Math.max(0, h - 1));
        if (ok(cx, cy))
            return { x: cx, y: cy };
        for (let r = 1; r < Math.max(w, h); r++) {
            for (let dy = -r; dy <= r; dy++) {
                for (let dx = -r; dx <= r; dx++) {
                    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r)
                        continue;
                    if (ok(cx + dx, cy + dy))
                        return { x: cx + dx, y: cy + dy };
                }
            }
        }
        return { x: cx, y: cy };
    };
    const seedStep = () => {
        let input = null;
        return {
            render(container, state) {
                const note = document.createElement('p');
                note.textContent = 'The seed shapes the generated world. Any word or number works.';
                container.appendChild(note);
                const labelEl = document.createElement('label');
                labelEl.textContent = 'World Seed';
                input = document.createElement('input');
                input.value = state.seed ?? '';
                input.placeholder = 'e.g. rustwind';
                container.appendChild(labelEl);
                container.appendChild(input);
            },
            validate() {
                return Boolean(input && input.value.trim() !== '');
            },
            onComplete(state) {
                if (input)
                    state.seed = input.value.trim();
            }
        };
    };
    const questStep = () => {
        let itemEl = null;
        let scrapEl = null;
        return {
            render(container, state) {
                const labelEl = document.createElement('label');
                labelEl.textContent = 'Quest Item Name';
                itemEl = document.createElement('input');
                itemEl.placeholder = 'e.g. Water Chip';
                if (state.itemName)
                    itemEl.value = state.itemName;
                container.appendChild(labelEl);
                container.appendChild(itemEl);
                const scrapLabel = document.createElement('label');
                scrapLabel.textContent = 'Scrap Reward';
                scrapEl = document.createElement('input');
                scrapEl.type = 'number';
                scrapEl.min = '0';
                scrapEl.value = String(state.scrapReward ?? 10);
                container.appendChild(scrapLabel);
                container.appendChild(scrapEl);
            },
            validate() {
                return Boolean(itemEl && itemEl.value.trim() !== '');
            },
            onComplete(state) {
                state.itemName = itemEl?.value.trim() ?? '';
                state.scrapReward = Math.max(0, parseInt(scrapEl?.value ?? '10', 10) || 0);
            }
        };
    };
    const starterWizard = {
        title: 'Starter Module Wizard',
        steps: [
            text('Module Name', 'moduleName'),
            seedStep(),
            mapPlacement('startPos'),
            text('First NPC Name', 'npcName'),
            text('NPC Greeting', 'npcDialogue'),
            questStep(),
            mapPlacement('itemPos'),
            mapPlacement('bldgPos'),
            confirm('This creates the world, your start point, a quest giver, their fetch quest, and a building.')
        ],
        commit(state) {
            const seedText = state.seed?.trim() || 'dustland';
            const numeric = Number(seedText);
            const seed = Number.isFinite(numeric) && seedText !== '' && /^-?\d+$/.test(seedText) ? numeric : seedText;
            // Generate the world first so placements snap against real terrain.
            globalThis.genWorld?.(seed);
            const start = snapToWalkable(state.startPos ?? { x: 2, y: 2 });
            const npcPos = snapToWalkable({ x: start.x + 1, y: start.y });
            const itemPos = snapToWalkable(state.itemPos ?? { x: start.x + 4, y: start.y + 4 });
            const bldgPos = snapToWalkable(state.bldgPos ?? { x: start.x + 6, y: start.y });
            const npcName = state.npcName ?? 'Guide';
            const npcId = toSlug(npcName) || 'guide';
            const itemName = state.itemName ?? 'Relic';
            const itemId = toSlug(itemName) || 'relic';
            const questId = `${npcId}_quest`;
            const npc = {
                id: npcId,
                name: npcName,
                tree: {
                    start: {
                        text: state.npcDialogue ?? 'Welcome to the waste.',
                        choices: [
                            { label: '(Ask about work)', to: 'job' },
                            { label: '(Leave)', to: 'bye' }
                        ]
                    },
                    job: {
                        text: `I need ${itemName}. Bring it back and I'll make it worth your while.`,
                        choices: [
                            { label: '(Accept the job)', to: 'accept', q: 'accept' },
                            { label: '(Turn in)', to: 'do_turnin', q: 'turnin' },
                            { label: '(Leave)', to: 'bye' }
                        ]
                    },
                    accept: { text: 'It\'s out there somewhere. Watch the horizon.', choices: [{ label: '(Leave)', to: 'bye' }] },
                    do_turnin: { text: 'You came through. Here\'s your cut.', choices: [{ label: '(Leave)', to: 'bye' }] }
                },
                map: 'world',
                x: npcPos.x,
                y: npcPos.y
            };
            const item = {
                id: itemId,
                name: itemName,
                type: 'quest',
                map: 'world',
                x: itemPos.x,
                y: itemPos.y
            };
            const quest = {
                id: questId,
                giver: npcId,
                item: itemId,
                title: `Bring back ${itemName}`,
                reward: `SCRAP ${String(state.scrapReward ?? 10)}`
            };
            return {
                name: state.moduleName?.trim() || 'starter-module',
                seed,
                start: { map: 'world', x: start.x, y: start.y },
                npcs: [npc],
                items: [item],
                quests: [quest],
                buildings: [{ x: bldgPos.x, y: bldgPos.y }]
            };
        }
    };
    dustlandStarter.StarterWizard = starterWizard;
    const dustlandWizards = (dustlandStarter.wizards ?? (dustlandStarter.wizards = {}));
    dustlandWizards.starter = starterWizard;
})();
