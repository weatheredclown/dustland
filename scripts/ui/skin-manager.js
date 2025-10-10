/* global EventBus */
(function(){
  const UI_VAR_MAP = {
    panel: {
      backgroundColor: '--skin-panel-bg-color',
      backgroundImage: '--skin-panel-bg-image',
      border: '--skin-panel-border',
      radius: '--skin-panel-radius',
      shadow: '--skin-panel-shadow'
    },
    panelHeader: {
      backgroundColor: '--skin-panel-header-bg-color',
      backgroundImage: '--skin-panel-header-bg-image',
      border: '--skin-panel-header-border',
      shadow: '--skin-panel-header-shadow'
    },
    panelBody: {
      background: '--skin-panel-body-bg'
    },
    panelTitle: {
      color: '--skin-panel-title-color'
    },
    panelSubtitle: {
      color: '--skin-panel-subtitle-color'
    },
    panelToggle: {
      backgroundColor: '--skin-panel-toggle-bg',
      border: '--skin-panel-toggle-border',
      radius: '--skin-panel-toggle-radius',
      color: '--skin-panel-toggle-color'
    },
    section: {
      backgroundColor: '--skin-section-bg-color',
      backgroundImage: '--skin-section-bg-image',
      border: '--skin-section-border',
      radius: '--skin-section-radius',
      shadow: '--skin-section-shadow',
      titleColor: '--skin-section-title-color'
    },
    log: {
      backgroundColor: '--skin-log-bg-color',
      border: '--skin-log-border',
      shadow: '--skin-log-shadow'
    },
    controlItem: {
      backgroundColor: '--skin-control-item-bg-color',
      border: '--skin-control-item-border',
      radius: '--skin-control-item-radius',
      keyColor: '--skin-control-keys-color',
      descColor: '--skin-control-desc-color'
    },
    button: {
      backgroundColor: '--skin-button-bg-color',
      backgroundImage: '--skin-button-bg-image',
      border: '--skin-button-border',
      color: '--skin-button-color',
      radius: '--skin-button-radius',
      shadow: '--skin-button-shadow',
      hoverBackground: '--skin-button-hover-bg-color',
      hoverBorder: '--skin-button-hover-border',
      activeBackground: '--skin-button-active-bg-color'
    },
    pill: {
      backgroundColor: '--skin-pill-bg-color',
      border: '--skin-pill-border',
      color: '--skin-pill-color'
    },
    tab: {
      backgroundColor: '--skin-tab-bg-color',
      border: '--skin-tab-border',
      radius: '--skin-tab-radius',
      color: '--skin-tab-color',
      activeOutline: '--skin-tab-active-outline'
    },
    badge: {
      backgroundColor: '--skin-badge-bg-color',
      border: '--skin-badge-border'
    },
    hud: {
      labelColor: '--skin-hud-label-color',
      barBackground: '--skin-hudbar-bg-color',
      barFill: '--skin-hudbar-fill-color',
      barGhost: '--skin-hudbar-ghost-color'
    },
    weather: {
      backgroundColor: '--skin-weather-bg-color',
      border: '--skin-weather-border'
    },
    slot: {
      backgroundColor: '--skin-slot-bg-color',
      border: '--skin-slot-border',
      radius: '--skin-slot-radius'
    },
    pcard: {
      backgroundColor: '--skin-pcard-bg-color',
      border: '--skin-pcard-border'
    },
    quest: {
      backgroundColor: '--skin-quest-bg-color',
      border: '--skin-quest-border'
    },
    window: {
      backgroundColor: '--skin-window-bg-color',
      backgroundImage: '--skin-window-bg-image',
      border: '--skin-window-border',
      radius: '--skin-window-radius',
      shadow: '--skin-window-shadow'
    },
    windowHeader: {
      backgroundColor: '--skin-window-header-bg-color',
      backgroundImage: '--skin-window-header-bg-image',
      border: '--skin-window-header-border',
      color: '--skin-window-title-color'
    },
    dialog: {
      backgroundColor: '--skin-dialog-bg-color',
      backgroundImage: '--skin-dialog-bg-image',
      border: '--skin-dialog-border',
      radius: '--skin-dialog-radius',
      headerBackground: '--skin-dialog-header-bg',
      choiceBackground: '--skin-dialog-choice-bg',
      choiceBorder: '--skin-dialog-choice-border',
      choiceHoverBackground: '--skin-dialog-choice-hover-bg',
      choiceHoverBorder: '--skin-dialog-choice-hover-border'
    },
    overlay: {
      background: '--skin-overlay-backdrop'
    },
    combatWindow: {
      backgroundColor: '--skin-combat-window-bg-color',
      border: '--skin-combat-window-border',
      radius: '--skin-combat-window-radius',
      shadow: '--skin-combat-window-shadow'
    },
    mapFrame: {
      color: '--skin-map-frame-color',
      width: '--skin-map-frame-width'
    }
  };

  const SLOT_PROP_MAP = {
    background: 'background',
    backgroundColor: 'background-color',
    backgroundImage: 'background-image',
    backgroundSize: 'background-size',
    backgroundRepeat: 'background-repeat',
    border: 'border',
    borderRadius: 'border-radius',
    borderImage: 'border-image',
    boxShadow: 'box-shadow',
    color: 'color',
    textShadow: 'text-shadow',
    textTransform: 'text-transform',
    fontFamily: 'font-family',
    fontSize: 'font-size',
    fontWeight: 'font-weight',
    letterSpacing: 'letter-spacing',
    lineHeight: 'line-height',
    filter: 'filter',
    opacity: 'opacity',
    padding: 'padding',
    margin: 'margin',
    outline: 'outline'
  };

  const ALL_VAR_NAMES = Array.from(new Set(Object.values(UI_VAR_MAP).flatMap(section => Object.values(section))));

  const registry = new Map();
  const callbacks = new Set();
  const imageCache = new Map();
  const tileSpriteCache = new Map();
  const itemSpriteCache = new Map();
  let entitySpriteCache = new WeakMap();
  const playerSpriteCache = new Map();
  const remoteSpriteCache = new Map();
  const tileNameCache = new Map();

  const state = {
    currentSkin: null,
    domReady: document.readyState !== 'loading',
    slotApplied: [],
    mapFrame: null
  };

  if(!state.domReady){
    document.addEventListener('DOMContentLoaded', () => {
      state.domReady = true;
      if(state.currentSkin) applySlotStyles(state.currentSkin);
    }, { once: true });
  }

  function cloneSkin(skin){
    if(!skin) return null;
    if(typeof structuredClone === 'function'){
      try { return structuredClone(skin); } catch (err) { void err; }
    }
    try {
      return JSON.parse(JSON.stringify(skin));
    } catch (err) {
      return null;
    }
  }

  function registerSkin(skin){
    if(!skin || !skin.id) return null;
    const copy = cloneSkin(skin);
    if(!copy) return null;
    registry.set(skin.id, copy);
    return copy;
  }

  function resolveSkin(input){
    if(!input) return null;
    if(typeof input === 'string'){
      const stored = registry.get(input);
      return stored ? cloneSkin(stored) : null;
    }
    if(typeof input === 'object') return cloneSkin(input);
    return null;
  }

  function resetCssVars(){
    const root = document.documentElement;
    if(!root) return;
    const style = root.style;
    for(const name of ALL_VAR_NAMES){
      style.removeProperty(name);
    }
  }

  function applyCssVars(skin){
    resetCssVars();
    const root = document.documentElement;
    if(!root || !skin) return;
    const style = root.style;
    const ui = skin.ui || {};
    if(skin.cssVars && typeof skin.cssVars === 'object'){
      for(const [name, value] of Object.entries(skin.cssVars)){
        if(value == null) continue;
        style.setProperty(name, String(value));
      }
    }
    if(ui.vars && typeof ui.vars === 'object'){
      for(const [name, value] of Object.entries(ui.vars)){
        if(value == null) continue;
        style.setProperty(name, String(value));
      }
    }
    for(const [section, mapping] of Object.entries(UI_VAR_MAP)){
      const source = ui[section] || skin[section];
      if(!source) continue;
      for(const [key, varName] of Object.entries(mapping)){
        const val = source[key];
        if(val == null) continue;
        style.setProperty(varName, String(val));
      }
    }
  }

  function clearSlotStyles(){
    for(const info of state.slotApplied){
      const { el, props } = info;
      if(!el || !el.style) continue;
      for(const prop of props){
        el.style.removeProperty(prop);
      }
    }
    state.slotApplied.length = 0;
  }

  function applySlotStyles(skin){
    clearSlotStyles();
    if(!skin || !skin.ui || !skin.ui.slots) return;
    const slots = skin.ui.slots;
    for(const [slot, config] of Object.entries(slots)){
      if(!config) continue;
      const elements = document.querySelectorAll(`[data-skin-slot="${slot}"]`);
      if(!elements.length) continue;
      for(const el of elements){
        if(!el || !el.style) continue;
        const appliedProps = [];
        for(const [key, value] of Object.entries(config)){
          if(value == null) continue;
          let cssProp;
          if(key.startsWith('--')){
            cssProp = key;
          } else {
            cssProp = SLOT_PROP_MAP[key] || key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
          }
          try {
            el.style.setProperty(cssProp, String(value));
            appliedProps.push(cssProp);
          } catch (err) {
            void err;
          }
        }
        if(appliedProps.length){
          state.slotApplied.push({ el, props: appliedProps });
        }
      }
    }
  }

  function applyMapFrame(skin){
    const frame = skin?.map?.frame;
    if(frame){
      const color = frame.color ?? frame.strokeStyle ?? frame.fill ?? null;
      const width = frame.width ?? frame.lineWidth ?? frame.strokeWidth ?? null;
      state.mapFrame = {
        color: color ?? null,
        lineWidth: width ?? null
      };
      const root = document.documentElement;
      if(root){
        const style = root.style;
        if(color != null) style.setProperty('--skin-map-frame-color', String(color));
        if(width != null){
          const val = typeof width === 'number' ? `${width}px` : String(width);
          style.setProperty('--skin-map-frame-width', val);
        }
      }
    } else {
      state.mapFrame = null;
    }
  }

  function clearCaches(){
    tileSpriteCache.clear();
    itemSpriteCache.clear();
    entitySpriteCache = new WeakMap();
    playerSpriteCache.clear();
    remoteSpriteCache.clear();
  }

  function resetSkin(shouldNotify = false){
    state.currentSkin = null;
    state.mapFrame = null;
    clearCaches();
    clearSlotStyles();
    resetCssVars();
    if(shouldNotify) notifyChange();
  }

  function applySkin(input){
    const skin = resolveSkin(input);
    if(!skin){
      resetSkin(true);
      return;
    }
    state.currentSkin = skin;
    clearCaches();
    applyCssVars(skin);
    applyMapFrame(skin);
    if(state.domReady) applySlotStyles(skin);
    prepareAssets(skin);
    notifyChange();
  }

  function notifyChange(){
    const payload = state.currentSkin ? cloneSkin(state.currentSkin) : null;
    for(const fn of callbacks){
      try { fn(payload); } catch (err) { void err; }
    }
    try {
      EventBus?.emit?.('skin:changed', { skin: payload });
    } catch (err) { void err; }
  }

  function onChange(fn){
    if(typeof fn === 'function') callbacks.add(fn);
    return () => offChange(fn);
  }

  function offChange(fn){
    callbacks.delete(fn);
  }

  function loadImage(src){
    if(!src || typeof Image === 'undefined') return null;
    if(imageCache.has(src)) return imageCache.get(src);
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    imageCache.set(src, img);
    img.addEventListener('error', () => {
      imageCache.delete(src);
    }, { once: true });
    return img;
  }

  function createSprite(entry, context){
    if(!entry) return null;
    const base = typeof entry === 'string' ? { src: entry } : entry;
    const atlas = base.atlas || context?.atlas;
    const src = base.src || atlas;
    if(!src) return null;
    const image = loadImage(src);
    if(!image) return null;
    const frame = base.frame || {};
    const sx = Number.isFinite(base.x) ? base.x : Number.isFinite(frame.x) ? frame.x : 0;
    const sy = Number.isFinite(base.y) ? base.y : Number.isFinite(frame.y) ? frame.y : 0;
    const sw = Number.isFinite(base.w) ? base.w : Number.isFinite(base.width) ? base.width : Number.isFinite(frame.w) ? frame.w : Number.isFinite(frame.width) ? frame.width : (context?.tileWidth || context?.tileSize || image.naturalWidth || image.width);
    const sh = Number.isFinite(base.h) ? base.h : Number.isFinite(base.height) ? base.height : Number.isFinite(frame.h) ? frame.h : Number.isFinite(frame.height) ? frame.height : (context?.tileHeight || context?.tileSize || sw);
    const sprite = {
      image,
      sx,
      sy,
      sw,
      sh
    };
    if(Number.isFinite(base.scale)) sprite.scale = base.scale;
    if(Number.isFinite(base.dw)) sprite.dw = base.dw;
    if(Number.isFinite(base.dh)) sprite.dh = base.dh;
    if(Number.isFinite(base.displayWidth)) sprite.displayWidth = base.displayWidth;
    if(Number.isFinite(base.displayHeight)) sprite.displayHeight = base.displayHeight;
    if(Number.isFinite(base.offsetX) || Number.isFinite(base.dx)) sprite.offsetX = Number.isFinite(base.offsetX) ? base.offsetX : base.dx;
    if(Number.isFinite(base.offsetY) || Number.isFinite(base.dy)) sprite.offsetY = Number.isFinite(base.offsetY) ? base.offsetY : base.dy;
    if(base.align || base.anchor) sprite.align = base.align || base.anchor;
    return sprite;
  }

  function findConfig(source, key){
    if(!source || key == null) return null;
    if(Object.prototype.hasOwnProperty.call(source, key)) return source[key];
    if(typeof key === 'string'){
      const lower = key.toLowerCase();
      if(Object.prototype.hasOwnProperty.call(source, lower)) return source[lower];
      const upper = key.toUpperCase();
      if(Object.prototype.hasOwnProperty.call(source, upper)) return source[upper];
    }
    return null;
  }

  function tileName(id){
    if(tileNameCache.has(id)) return tileNameCache.get(id);
    const tiles = globalThis.TILE;
    if(tiles){
      for(const [name, value] of Object.entries(tiles)){
        if(value === id){
          tileNameCache.set(id, name.toLowerCase());
          return tileNameCache.get(id);
        }
      }
    }
    tileNameCache.set(id, null);
    return null;
  }

  function resolveTileDefinition(tiles, tileId){
    if(!tiles) return null;
    const defs = tiles.map || tiles.tiles || {};
    const keys = [];
    if(typeof tileId === 'number'){
      keys.push(String(tileId));
      const name = tileName(tileId);
      if(name) keys.push(name, name.toUpperCase());
    } else if(typeof tileId === 'string'){
      keys.push(tileId, tileId.toLowerCase(), tileId.toUpperCase());
    }
    for(const key of keys){
      if(Object.prototype.hasOwnProperty.call(defs, key)) return defs[key];
    }
    return null;
  }

  function getTileSprite(tileId){
    const key = String(tileId);
    if(tileSpriteCache.has(key)) return tileSpriteCache.get(key);
    const skin = state.currentSkin;
    if(!skin?.tiles){
      tileSpriteCache.set(key, null);
      return null;
    }
    const def = resolveTileDefinition(skin.tiles, tileId);
    if(!def){
      tileSpriteCache.set(key, null);
      return null;
    }
    const sprite = createSprite(def, skin.tiles);
    tileSpriteCache.set(key, sprite || null);
    return sprite || null;
  }

  function getItemCacheKey(item, context){
    const first = Array.isArray(item?.items) && item.items.length ? item.items[0] : item;
    const dropType = context?.dropType ?? item?.dropType ?? '';
    const slot = first?.slot ?? '';
    const type = first?.type ?? '';
    const id = first?.id ?? '';
    const rarity = first?.rarity ?? '';
    const multi = context?.multi ? 'multi' : 'single';
    return [dropType, slot, type, id, rarity, multi].join('|');
  }

  function getItemSprite(item, context = {}){
    const key = getItemCacheKey(item, context);
    if(itemSpriteCache.has(key)) return itemSpriteCache.get(key);
    const skin = state.currentSkin;
    if(!skin?.icons?.items){
      itemSpriteCache.set(key, null);
      return null;
    }
    const icons = skin.icons;
    const cfg = icons.items;
    let entry = null;
    const dropType = String(context.dropType ?? item?.dropType ?? '').toLowerCase();
    const first = Array.isArray(item?.items) && item.items.length ? item.items[0] : item;
    if(context.multi && cfg.multi) entry = cfg.multi;
    if(!entry && cfg.byDropType && dropType){
      entry = findConfig(cfg.byDropType, dropType);
    }
    if(!entry && first){
      if(cfg.bySlot && first.slot){
        entry = findConfig(cfg.bySlot, first.slot);
      }
      if(!entry && cfg.byType && first.type){
        entry = findConfig(cfg.byType, first.type);
      }
      if(!entry && cfg.byId && first.id){
        entry = findConfig(cfg.byId, first.id);
      }
      if(!entry && cfg.byRarity && first.rarity){
        entry = findConfig(cfg.byRarity, first.rarity);
      }
    }
    if(!entry && cfg.default) entry = cfg.default;
    const sprite = entry ? createSprite(entry, icons) : null;
    itemSpriteCache.set(key, sprite || null);
    return sprite || null;
  }

  function collectEntityTags(entity){
    const tags = ['entity'];
    if(!entity || typeof entity !== 'object') return tags;
    if(entity.id) tags.push(`id:${entity.id}`);
    if(entity.type) tags.push(entity.type);
    if(entity.role) tags.push(`role:${entity.role}`);
    if(entity.faction) tags.push(`faction:${entity.faction}`);
    if(entity.trainer) tags.push('trainer');
    if(entity.shop) tags.push('shop');
    if(entity.questId || entity.quests) tags.push('quest');
    if(entity.inanimate) tags.push('object');
    if(entity.attackOnSight || (entity.combat && !entity.friendly)) tags.push('hostile');
    if(entity.friendly) tags.push('friendly');
    if(entity.combat) tags.push('combat');
    if(entity.tags && Array.isArray(entity.tags)) tags.push(...entity.tags.map(String));
    return tags;
  }

  function getEntitySprite(entity){
    if(!entity || typeof entity !== 'object') return null;
    if(entitySpriteCache.has(entity)) return entitySpriteCache.get(entity);
    const skin = state.currentSkin;
    if(!skin?.icons?.entities){
      entitySpriteCache.set(entity, null);
      return null;
    }
    const icons = skin.icons;
    const cfg = icons.entities;
    let entry = null;
    if(cfg.byId && entity.id){
      entry = findConfig(cfg.byId, entity.id);
    }
    if(!entry && cfg.byTag){
      const tags = collectEntityTags(entity);
      for(const tag of tags){
        const found = findConfig(cfg.byTag, tag);
        if(found){ entry = found; break; }
      }
    }
    if(!entry && cfg.byType && entity.type){
      entry = findConfig(cfg.byType, entity.type);
    }
    if(!entry && cfg.default) entry = cfg.default;
    const sprite = entry ? createSprite(entry, icons) : null;
    entitySpriteCache.set(entity, sprite || null);
    return sprite || null;
  }

  function getPlayerSprite(playerInfo, context = {}){
    const key = context.mode ? `mode:${context.mode}` : 'default';
    if(playerSpriteCache.has(key)) return playerSpriteCache.get(key);
    const skin = state.currentSkin;
    if(!skin?.icons?.player){
      playerSpriteCache.set(key, null);
      return null;
    }
    const icons = skin.icons;
    const cfg = icons.player;
    let entry = null;
    if(context.mode && cfg.states){
      entry = findConfig(cfg.states, context.mode);
    }
    if(!entry && cfg.byPersona && playerInfo?.persona){
      entry = findConfig(cfg.byPersona, playerInfo.persona);
    }
    if(!entry && cfg.byId && playerInfo?.id){
      entry = findConfig(cfg.byId, playerInfo.id);
    }
    if(!entry && cfg.default) entry = cfg.default;
    if(!entry && cfg.sprite) entry = cfg.sprite;
    const sprite = entry ? createSprite(entry, icons) : null;
    playerSpriteCache.set(key, sprite || null);
    return sprite || null;
  }

  function getRemotePartySprite(info){
    if(!info || typeof info !== 'object') return null;
    const key = String(info.id ?? info.playerId ?? info.name ?? `${info.x ?? ''}:${info.y ?? ''}`);
    if(remoteSpriteCache.has(key)) return remoteSpriteCache.get(key);
    const skin = state.currentSkin;
    if(!skin?.icons?.remoteParty){
      remoteSpriteCache.set(key, null);
      return null;
    }
    const cfg = skin.icons.remoteParty;
    let entry = null;
    if(cfg.byId && info.id){
      entry = findConfig(cfg.byId, info.id);
    }
    if(!entry && cfg.byFaction && info.faction){
      entry = findConfig(cfg.byFaction, info.faction);
    }
    if(!entry && cfg.default) entry = cfg.default;
    const sprite = entry ? createSprite(entry, skin.icons) : null;
    remoteSpriteCache.set(key, sprite || null);
    return sprite || null;
  }

  function getMapFrame(){
    if(!state.mapFrame) return null;
    return { ...state.mapFrame };
  }

  const SPRITE_META_KEYS = new Set(['src','atlas','frame','x','y','w','h','width','height','scale','offsetX','offsetY','dx','dy','align','anchor','dw','dh','displayWidth','displayHeight']);

  function preloadIconGroup(group){
    if(!group) return;
    if(Array.isArray(group)){
      group.forEach(preloadIconGroup);
      return;
    }
    if(typeof group === 'string'){
      loadImage(group);
      return;
    }
    if(typeof group !== 'object') return;
    if(group.src) loadImage(group.src);
    if(group.atlas) loadImage(group.atlas);
    for(const [key, value] of Object.entries(group)){
      if(SPRITE_META_KEYS.has(key)) continue;
      preloadIconGroup(value);
    }
  }

  function prepareAssets(skin){
    if(!skin) return;
    if(skin.tiles){
      if(skin.tiles.atlas) loadImage(skin.tiles.atlas);
      const defs = skin.tiles.map || skin.tiles.tiles || {};
      for(const value of Object.values(defs)){
        if(typeof value === 'string') loadImage(value);
        else if(value && typeof value === 'object'){
          if(value.src) loadImage(value.src);
          if(value.atlas) loadImage(value.atlas);
        }
      }
    }
    if(skin.icons){
      if(skin.icons.atlas) loadImage(skin.icons.atlas);
      preloadIconGroup(skin.icons.player);
      preloadIconGroup(skin.icons.entities);
      preloadIconGroup(skin.icons.items);
      preloadIconGroup(skin.icons.remoteParty);
      if(skin.icons.extra) preloadIconGroup(skin.icons.extra);
    }
  }

  const api = {
    applySkin,
    registerSkin,
    getRegisteredSkin(id){ return registry.get(id) ? cloneSkin(registry.get(id)) : null; },
    getCurrentSkin(){ return state.currentSkin ? cloneSkin(state.currentSkin) : null; },
    getTileSprite,
    getItemSprite,
    getEntitySprite,
    getPlayerSprite,
    getRemotePartySprite,
    getMapFrame,
    onChange,
    offChange,
    reset: () => resetSkin(true)
  };

  globalThis.Dustland = globalThis.Dustland || {};
  globalThis.Dustland.skin = api;
  globalThis.DustlandSkin = api;

  resetSkin(false);
})();
