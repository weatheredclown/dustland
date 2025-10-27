import fs from 'node:fs';
import { readModule } from './utils.js';
const [file] = process.argv.slice(2);
if (!file) {
    console.error('Usage: node scripts/module-tools/cleanup-dustland-dialog.js <moduleFile>');
    process.exit(1);
}
const mod = readModule(file);
const data = mod.data;
const questDialogText = {
    q_solar_alignment: {
        offer: "The Archivist taps a reel. 'The Sun Charm hums with a lost broadcast. Bring it so I can hear the dawn.'",
        active: "The Archivist taps a reel. 'The Sun Charm hums with a lost broadcast. Bring it so I can hear the dawn.'",
        completed: "The Archivist squints at the receiver. 'I traced the pattern, but Signal Fragment C will complete the chorus.'"
    },
    q_solar_signal: {
        offer: "The Archivist squints at the receiver. 'I traced the pattern, but Signal Fragment C will complete the chorus.'",
        active: "The Archivist squints at the receiver. 'I traced the pattern, but Signal Fragment C will complete the chorus.'",
        completed: "The Archivist lets the reels spin freely. 'The message sings thanks to you. Stay and listen.'"
    }
};
if (Array.isArray(data.quests)) {
    for (const quest of data.quests) {
        const questId = quest.id;
        if (!questId)
            continue;
        const dialog = questDialogText[questId];
        if (dialog) {
            quest.dialog = { ...dialog };
        }
    }
}
if (Array.isArray(data.npcs)) {
    for (const npc of data.npcs) {
        if (!npc)
            continue;
        if (npc.id === 'tape_sage' && npc.dialogs) {
            delete npc.dialogs;
        }
        const tree = npc.tree;
        if (!tree || typeof tree !== 'object')
            continue;
        for (const node of Object.values(tree)) {
            if (!node || !Array.isArray(node.choices))
                continue;
            node.choices = node.choices.filter((choice) => {
                if (!choice || choice.to !== 'bye')
                    return true;
                const definedKeys = Object.keys(choice).filter(key => choice[key] !== undefined);
                return definedKeys.some(key => key !== 'label' && key !== 'to');
            });
        }
    }
}
mod.write(data);
const text = fs.readFileSync(file, 'utf8');
const ascii = text.replace(/[\u007f-\uffff]/g, ch => {
    const code = ch.charCodeAt(0).toString(16).padStart(4, '0');
    return `\\u${code}`;
});
fs.writeFileSync(file, ascii);
