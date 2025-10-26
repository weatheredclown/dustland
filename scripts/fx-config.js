(function () {
    // Runtime-adjustable visual effect configuration.
    globalThis.fxConfig = {
        enabled: true,
        prevAlpha: 0.2,
        sceneAlpha: 0.2,
        offsetX: 0, // horizontal blur offset (disabled by default)
        offsetY: 0, // vertical blur offset (disabled by default)
        damageFlash: false, // disable red flash by default; toggle via fx menu
        scanlines: false, // overlay horizontal scanlines
        crtShear: false, // slight screen skew effect
        colorBleed: false, // simple chromatic aberration
        footstepBump: false, // camera shake when walking
        grayscale: false, // render world in grayscale
        adrenalineTint: true // green saturation scales with adrenaline
    };
})();
