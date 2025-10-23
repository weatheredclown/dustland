interface PositionLike {
  x?: number;
  y?: number;
}

interface TargetLike extends PositionLike {
  hidden?: boolean;
}

interface SignalCompass {
  update(position?: PositionLike | null, target?: TargetLike | null): void;
}

(function(){
  function createSignalCompass(parent?: HTMLElement | null): SignalCompass {
    const container = parent ?? document.body;
    const el = document.createElement('div');
    el.className = 'signal-compass';
    const arrow = document.createElement('div');
    arrow.className = 'arrow';
    el.appendChild(arrow);
    container.appendChild(el);

    return {
      update(position?: PositionLike | null, target?: TargetLike | null){
        const navigationConfig = globalThis.ACK?.config?.navigation ?? {};
        if (navigationConfig.enabled === false && target?.hidden) {
          el.style.display = 'none';
          return;
        }

        el.style.display = '';
        const dx = (target?.x ?? 0) - (position?.x ?? 0);
        const dy = (target?.y ?? 0) - (position?.y ?? 0);
        const angle = Math.atan2(dy, dx);
        arrow.style.transform = `rotate(${angle}rad)`;
      }
    };
  }

  const dustland = (globalThis.Dustland ??= {} as DustlandNamespace);
  (dustland as DustlandNamespace & { createSignalCompass: typeof createSignalCompass }).createSignalCompass = createSignalCompass;
})();

