// @ts-nocheck
// Entry module that loads World One with a brief tutorial dialog.
(function () {
    let worldOneStart;
    function startWrapper() {
        worldOneStart?.();
    }
    startGame = startWrapper;
    const script = document.createElement('script');
    script.src = 'modules/world-one.module.js';
    script.onload = () => {
        worldOneStart = startGame;
        startGame = startWrapper;
        const heart = {
            name: 'Wistful Heart',
            tree: {
                start: {
                    text: 'A traveler with a wistful heart watches the ruins. "Two worlds lie out there, linked by sleeping bunkers."',
                    choices: [
                        { label: 'What are bunkers?', to: 'bunkers' },
                        { label: 'How do I travel quickly?', to: 'travel' },
                        { label: '(Step into the wastes)', to: 'bye', effects: [startWrapper] }
                    ]
                },
                bunkers: {
                    text: '"Bunkers are buried shelters," they sigh. "Wake one and its terminal remembers the others."',
                    choices: [{ label: '(Back)', to: 'start' }]
                },
                travel: {
                    text: '"When bunkers awaken, their terminals let you fast travel," the traveler murmurs. "Choose a lit terminal to cross between worlds."',
                    choices: [{ label: '(Back)', to: 'start' }]
                }
            }
        };
        openDialog(heart);
    };
    document.head.appendChild(script);
})();
