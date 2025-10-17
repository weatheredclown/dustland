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

  const TILE_SLOT_PATTERN = /^tile[-_:]?(.+)$/i;

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

  const generatedConfigs = new Map();

  function toForwardSlashes(value){
    return typeof value === 'string' ? value.replace(/\\/g, '/') : '';
  }

  function normalizeBaseDir(value){
    if(!value) return '';
    const text = toForwardSlashes(String(value)).replace(/\/+/g, '/');
    return text.replace(/\/+$/g, '').replace(/\s+$/g, '').trim();
  }

  function normalizeStyleDir(value){
    if(!value) return '';
    let text = toForwardSlashes(String(value)).replace(/\/+/g, '/');
    text = text.replace(/^\s+/g, '').replace(/\s+$/g, '');
    return text.replace(/^\/+/g, '').replace(/\/+$/g, '');
  }

  function normalizeFilePath(value){
    if(!value) return '';
    let text = toForwardSlashes(String(value)).replace(/\/+/g, '/');
    text = text.replace(/^\.\//, '');
    text = text.replace(/^\/+/g, '').replace(/\/+$/g, '');
    return text;
  }

  function normalizeExtension(ext){
    if(!ext) return '.png';
    const text = String(ext).trim();
    if(!text) return '.png';
    return text.startsWith('.') ? text : `.${text}`;
  }

  function isPlainObject(value){
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  function buildAssetUrl(path, baseDir, styleDir){
    if(!path) return '';
    const raw = String(path).trim();
    if(/^([a-z]+:|data:|blob:)/i.test(raw)) return raw;
    let relative = normalizeFilePath(raw);
    if(!relative) return '';
    if(styleDir && !relative.startsWith(`${styleDir}/`)){
      relative = `${styleDir}/${relative}`;
    }
    return baseDir ? `${baseDir}/${relative}` : relative;
  }

  function rewriteSpriteEntry(entry, baseDir, styleDir){
    if(entry == null) return entry;
    if(typeof entry === 'string'){
      return buildAssetUrl(entry, baseDir, styleDir);
    }
    if(Array.isArray(entry)){
      return entry.map(item => rewriteSpriteEntry(item, baseDir, styleDir));
    }
    if(!isPlainObject(entry)) return entry;
    const copy = {};
    for(const [key, value] of Object.entries(entry)){
      if(key === 'variants'){
        copy.variants = rewriteSpriteEntry(value, baseDir, styleDir);
        continue;
      }
      if(key === 'frame' && isPlainObject(value)){
        const frameCopy = { ...value };
        if(typeof frameCopy.src === 'string'){
          frameCopy.src = buildAssetUrl(frameCopy.src, baseDir, styleDir);
        }
        copy.frame = frameCopy;
        continue;
      }
      if((key === 'src' || key === 'atlas') && typeof value === 'string'){
        copy[key] = buildAssetUrl(value, baseDir, styleDir);
        continue;
      }
      copy[key] = rewriteSpriteEntry(value, baseDir, styleDir);
    }
    return copy;
  }

  function discoverSlotNames(){
    const slots = new Set();
    const nodes = document.querySelectorAll('[data-skin-slot]');
    nodes.forEach(node => {
      const name = node?.getAttribute?.('data-skin-slot');
      if(name) slots.add(name);
    });
    return Array.from(slots);
  }

  function cloneGeneratedConfig(config){
    if(!config) return null;
    const slots = config.slots;
    let slotsCopy = null;
    if(Array.isArray(slots)) slotsCopy = [...slots];
    else if(slots && typeof slots === 'object') slotsCopy = { ...slots };
    const manifest = config.manifest && typeof config.manifest === 'object' ? { ...config.manifest } : null;
    return {
      baseDir: config.baseDir,
      styleDir: config.styleDir,
      extension: config.extension,
      manifest,
      slots: slotsCopy
    };
  }

  function defaultGeneratedConfig(name){
    const styleDir = normalizeStyleDir(name || 'preview');
    return {
      baseDir: 'ComfyUI/output',
      styleDir,
      extension: '.png',
      manifest: null,
      slots: null
    };
  }

  function normalizeGeneratedOverride(name, input){
    const result = {};
    if(!input || typeof input !== 'object') return result;
    if(typeof input.baseDir === 'string' && input.baseDir.trim()){
      result.baseDir = normalizeBaseDir(input.baseDir.trim());
    }
    if(typeof input.styleDir === 'string' && input.styleDir.trim()){
      result.styleDir = normalizeStyleDir(input.styleDir.trim());
    }
    if(typeof input.extension === 'string' && input.extension.trim()){
      result.extension = normalizeExtension(input.extension.trim());
    }
    if('manifest' in input){
      const manifest = input.manifest;
      if(manifest && typeof manifest === 'object' && !Array.isArray(manifest)) result.manifest = { ...manifest };
      else result.manifest = null;
    }
    if('slots' in input){
      const slots = input.slots;
      if(Array.isArray(slots)) result.slots = [...slots];
      else if(slots && typeof slots === 'object') result.slots = { ...slots };
      else result.slots = null;
    }
    return result;
  }

  function mergeGeneratedConfig(base, override){
    const baseCopy = cloneGeneratedConfig(base) || defaultGeneratedConfig('preview');
    const merged = {
      baseDir: override.baseDir ?? baseCopy.baseDir,
      styleDir: override.styleDir ?? baseCopy.styleDir,
      extension: override.extension ?? baseCopy.extension,
      manifest: ('manifest' in override) ? override.manifest : baseCopy.manifest,
      slots: ('slots' in override) ? override.slots : baseCopy.slots
    };
    merged.baseDir = normalizeBaseDir(merged.baseDir);
    merged.styleDir = normalizeStyleDir(merged.styleDir || baseCopy.styleDir);
    merged.extension = normalizeExtension(merged.extension);
    if(merged.manifest && typeof merged.manifest === 'object') merged.manifest = { ...merged.manifest };
    if(Array.isArray(merged.slots)) merged.slots = [...merged.slots];
    else if(merged.slots && typeof merged.slots === 'object') merged.slots = { ...merged.slots };
    else merged.slots = merged.slots ?? null;
    return merged;
  }

  const RESERVED_SLOT_KEYS = new Set(['ui', 'tiles', 'icons', 'map', 'meta', 'id', 'label', 'version', 'info', 'slots']);

  function mergeStyleObject(target, source, baseDir, styleDir){
    const next = { ...target };
    for(const [prop, raw] of Object.entries(source)){
      if(typeof raw === 'string' && prop.toLowerCase().includes('image')){
        const trimmed = raw.trim();
        if(trimmed.startsWith('url(')){
          next[prop] = trimmed;
        } else {
          const url = buildAssetUrl(trimmed, baseDir, styleDir);
          next[prop] = url ? `url(${url})` : raw;
        }
      } else {
        next[prop] = raw;
      }
    }
    return next;
  }

  function applySlotDefinition(slotStyles, slotName, definition, baseDir, styleDir, extension){
    if(!slotName) return;
    let next = slotStyles[slotName] ? { ...slotStyles[slotName] } : {};
    if(definition == null){
      const url = buildAssetUrl(`${slotName}${extension}`, baseDir, styleDir);
      if(url) next.backgroundImage = `url(${url})`;
    } else if(typeof definition === 'string'){
      const url = buildAssetUrl(definition, baseDir, styleDir);
      if(url) next.backgroundImage = `url(${url})`;
    } else if(isPlainObject(definition)){
      next = mergeStyleObject(next, definition, baseDir, styleDir);
    }
    if(Object.keys(next).length) slotStyles[slotName] = next;
  }

  function extractManifestSections(manifest){
    const result = {
      slots: null,
      uiVars: null,
      tiles: null,
      icons: null,
      map: null,
      meta: null,
      id: null,
      label: null
    };
    if(!isPlainObject(manifest)) return result;
    const slots = {};
    let hasSlots = false;
    if(isPlainObject(manifest.ui)){
      if(isPlainObject(manifest.ui.vars)) result.uiVars = { ...manifest.ui.vars };
      if(isPlainObject(manifest.ui.slots)){
        for(const [slotName, value] of Object.entries(manifest.ui.slots)){
          slots[slotName] = value;
          hasSlots = true;
        }
      }
    }
    if(isPlainObject(manifest.slots)){
      for(const [slotName, value] of Object.entries(manifest.slots)){
        slots[slotName] = value;
        hasSlots = true;
      }
    }
    for(const [key, value] of Object.entries(manifest)){
      if(RESERVED_SLOT_KEYS.has(key)) continue;
      if(typeof value === 'string' || isPlainObject(value)){
        slots[key] = value;
        hasSlots = true;
      }
    }
    result.slots = hasSlots ? slots : null;
    if(manifest.tiles) result.tiles = manifest.tiles;
    if(manifest.icons) result.icons = manifest.icons;
    if(manifest.map) result.map = manifest.map;
    if(manifest.meta) result.meta = manifest.meta;
    if(typeof manifest.id === 'string') result.id = manifest.id.trim();
    if(typeof manifest.label === 'string') result.label = manifest.label.trim();
    return result;
  }

  function buildGeneratedSkin(name, config){
    const styleId = typeof name === 'string' ? name.trim() : '';
    if(!styleId) return null;
    const merged = mergeGeneratedConfig(defaultGeneratedConfig(styleId), config || {});
    const manifestSections = extractManifestSections(merged.manifest);
    const styleDir = merged.styleDir;
    const baseDir = merged.baseDir;
    const extension = merged.extension;
    const normalizedExtension = typeof extension === 'string' ? extension : '';
    const normalizedExtensionLower = normalizedExtension.toLowerCase();
    function appendDefaultExtension(base){
      if(!base) return null;
      if(!normalizedExtension) return base;
      const trimmed = String(base).trim();
      if(!trimmed) return null;
      const lower = trimmed.toLowerCase();
      if(lower.endsWith(normalizedExtensionLower)) return trimmed;
      return `${trimmed}${normalizedExtension}`;
    }
    function defaultSlotFilename(name){
      const base = typeof name === 'string' ? name.trim() : '';
      if(!base) return null;
      return appendDefaultExtension(base);
    }
    function defaultTileFilename(tileKey){
      const slug = typeof tileKey === 'string' ? tileKey.trim() : '';
      if(!slug) return null;
      const sanitized = slug.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '');
      if(!sanitized) return null;
      return appendDefaultExtension(`${sanitized.toLowerCase()}_tile`);
    }
    const slotStyles = {};
    const tileSlotDefinitions = new Map();
    function handleSlotDefinition(slotName, definition){
      const name = typeof slotName === 'string' ? slotName.trim() : String(slotName ?? '');
      if(!name) return;
      const tileKey = parseTileSlotName(name);
      if(tileKey){
        let effectiveDefinition = definition;
        if(effectiveDefinition == null){
          effectiveDefinition = defaultTileFilename(tileKey) ?? defaultSlotFilename(name);
        }
        if(effectiveDefinition != null){
          tileSlotDefinitions.set(tileKey, effectiveDefinition);
        }
        const appliedDefinition = effectiveDefinition ?? definition;
        applySlotDefinition(slotStyles, name, appliedDefinition, baseDir, styleDir, extension);
        return;
      }
      applySlotDefinition(slotStyles, name, definition, baseDir, styleDir, extension);
    }
    if(Array.isArray(merged.slots)){
      merged.slots.forEach(slot => handleSlotDefinition(slot, null));
    } else if(isPlainObject(merged.slots)){
      for(const [slotName, value] of Object.entries(merged.slots)){
        handleSlotDefinition(slotName, value);
      }
    } else if(!manifestSections.slots){
      discoverSlotNames().forEach(slot => handleSlotDefinition(slot, null));
    }
    if(manifestSections.slots){
      for(const [slotName, value] of Object.entries(manifestSections.slots)){
        handleSlotDefinition(slotName, value);
      }
    }
    const ui = {};
    if(manifestSections.uiVars) ui.vars = { ...manifestSections.uiVars };
    if(Object.keys(slotStyles).length) ui.slots = slotStyles;
    let tileConfig = null;
    if(manifestSections.tiles){
      tileConfig = rewriteSpriteEntry(manifestSections.tiles, baseDir, styleDir);
      if(typeof tileConfig === 'string') tileConfig = { atlas: tileConfig };
      else if(!isPlainObject(tileConfig)) tileConfig = {};
    }
    if(tileSlotDefinitions.size){
      if(!isPlainObject(tileConfig)) tileConfig = {};
      const existingSource = isPlainObject(tileConfig.map) ? tileConfig.map : (isPlainObject(tileConfig.tiles) ? tileConfig.tiles : {});
      const tileMap = { ...existingSource };
      for(const [tileKey, definition] of tileSlotDefinitions){
        if(definition == null) continue;
        const lowerKey = tileKey.toLowerCase();
        const upperKey = lowerKey.toUpperCase();
        const tileId = tileIdByName(tileKey);
        const idKey = tileId == null ? null : String(tileId);
        if(Object.prototype.hasOwnProperty.call(tileMap, lowerKey) || Object.prototype.hasOwnProperty.call(tileMap, upperKey) || (idKey != null && Object.prototype.hasOwnProperty.call(tileMap, idKey))){
          continue;
        }
        const rewritten = rewriteSpriteEntry(definition, baseDir, styleDir);
        if(rewritten == null) continue;
        tileMap[lowerKey] = rewritten;
      }
      const hasEntries = Object.keys(tileMap).length > 0;
      if(hasEntries || (isPlainObject(existingSource) && Object.keys(existingSource).length)){
        if(isPlainObject(tileConfig.map)) tileConfig.map = tileMap;
        else if(isPlainObject(tileConfig.tiles)) tileConfig.tiles = tileMap;
        else if(hasEntries) tileConfig.map = tileMap;
      }
    }
    const skin = {
      id: manifestSections.id || `generated-${styleDir || styleId}`,
      label: manifestSections.label || styleId
    };
    if(Object.keys(ui).length) skin.ui = ui;
    if(hasTileMapEntries(tileConfig)) skin.tiles = tileConfig;
    if(manifestSections.icons) skin.icons = rewriteSpriteEntry(manifestSections.icons, baseDir, styleDir);
    if(manifestSections.map) skin.map = rewriteSpriteEntry(manifestSections.map, baseDir, styleDir);
    if(manifestSections.meta) skin.meta = { ...manifestSections.meta };
    const hasVisuals = skin.ui || skin.tiles || skin.icons || skin.map;
    if(!hasVisuals) return null;
    return skin;
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

  function toFiniteNumber(...values){
    for(const value of values){
      if(Number.isFinite(value)) return value;
    }
    return null;
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
    const tileWidth = toFiniteNumber(base.tileWidth, frame.tileWidth, context?.tileWidth, context?.tileSize);
    const tileHeight = toFiniteNumber(base.tileHeight, frame.tileHeight, context?.tileHeight, context?.tileSize);
    const sw = toFiniteNumber(base.w, base.width, frame.w, frame.width, tileWidth, context?.tileWidth, context?.tileSize, image.naturalWidth, image.width) || 0;
    const sh = toFiniteNumber(base.h, base.height, frame.h, frame.height, tileHeight, context?.tileHeight, context?.tileSize, sw) || 0;
    const resolvedWidth = sw || (image.naturalWidth || image.width);
    const resolvedHeight = sh || (image.naturalHeight || image.height);
    const columns = toFiniteNumber(base.columns, frame.columns, context?.columns, context?.cols, context?.tileColumns, context?.tileCols);
    const index = toFiniteNumber(base.index, frame.index, base.tileIndex, frame.tileIndex);
    const col = (() => {
      const direct = toFiniteNumber(base.col, base.column, frame.col, frame.column);
      if(direct != null) return direct;
      if(index != null){
        const cellWidth = sw || resolvedWidth;
        if(!cellWidth) return index;
        const totalCols = columns || Math.floor((image.naturalWidth || image.width || 0) / cellWidth) || 0;
        if(totalCols > 0) return index % totalCols;
      }
      return null;
    })();
    const row = (() => {
      const direct = toFiniteNumber(base.row, base.rows, frame.row, frame.rows);
      if(direct != null) return direct;
      if(index != null){
        const cellWidth = sw || resolvedWidth;
        const cellHeight = sh || resolvedHeight;
        if(!cellWidth || !cellHeight) return 0;
        const totalCols = columns || Math.floor((image.naturalWidth || image.width || 0) / cellWidth) || 0;
        if(totalCols > 0) return Math.floor(index / totalCols);
      }
      return null;
    })();
    let sx = toFiniteNumber(base.x, frame.x, base.sx, frame.sx);
    let sy = toFiniteNumber(base.y, frame.y, base.sy, frame.sy);
    const cellWidth = sw || (tileWidth || resolvedWidth);
    const cellHeight = sh || (tileHeight || resolvedHeight);
    if(sx == null && col != null && cellWidth){
      sx = col * cellWidth;
    }
    if(sy == null && row != null && cellHeight){
      sy = row * cellHeight;
    }
    if(!Number.isFinite(sx)) sx = 0;
    if(!Number.isFinite(sy)) sy = 0;
    const spriteWidth = sw || cellWidth;
    const spriteHeight = sh || cellHeight;
    if(!Number.isFinite(spriteWidth) || !Number.isFinite(spriteHeight)) return null;
    const sprite = {
      image,
      sx,
      sy,
      sw: spriteWidth,
      sh: spriteHeight
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

  function parseTileSlotName(name){
    if(typeof name !== 'string') return null;
    const match = name.trim().match(TILE_SLOT_PATTERN);
    if(!match) return null;
    const slug = match[1]?.trim();
    if(!slug) return null;
    return slug.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
  }

  function tileIdByName(name){
    if(!name) return null;
    const tiles = globalThis.TILE;
    if(!tiles || typeof tiles !== 'object') return null;
    const upper = String(name).replace(/[^a-z0-9]+/gi, '_').toUpperCase();
    if(Object.prototype.hasOwnProperty.call(tiles, upper)) return tiles[upper];
    return null;
  }

  function hasTileMapEntries(config){
    if(!isPlainObject(config)) return false;
    if(isPlainObject(config.map) && Object.keys(config.map).length) return true;
    if(isPlainObject(config.tiles) && Object.keys(config.tiles).length) return true;
    return false;
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

  function cloneSpriteBase(entry){
    if(!isPlainObject(entry)) return entry;
    const clone = {};
    for(const [key, value] of Object.entries(entry)){
      if(key === 'variants') continue;
      if(isPlainObject(value)) clone[key] = { ...value };
      else if(Array.isArray(value)) clone[key] = value.map(item => (isPlainObject(item) ? { ...item } : item));
      else clone[key] = value;
    }
    return clone;
  }

  function mergeVariantEntry(base, variant){
    if(!isPlainObject(base)) return variant;
    const merged = { ...base };
    if(typeof variant === 'string'){
      merged.src = variant;
      return merged;
    }
    if(!isPlainObject(variant)) return merged;
    if(isPlainObject(variant.frame)){
      merged.frame = { ...(isPlainObject(merged.frame) ? merged.frame : {}), ...variant.frame };
    }
    for(const [key, value] of Object.entries(variant)){
      if(key === 'frame' || key === 'variants') continue;
      merged[key] = value;
    }
    return merged;
  }

  function selectVariantIndex(count, context, tileId){
    if(!Number.isFinite(count) || count <= 0) return 0;
    const x = Number.isFinite(context?.x) ? context.x : 0;
    const y = Number.isFinite(context?.y) ? context.y : 0;
    const seed = Number.isFinite(context?.seed) ? context.seed : 0;
    let h = Math.imul(x | 0, 0x45d9f3b);
    h = Math.imul(h ^ Math.imul((y | 0) ^ 0x27d4eb2d, 0x165667b1), 0x27d4eb2d);
    h ^= Math.imul(seed | 0, 0x9e3779b9);
    const tileSalt = typeof tileId === 'number' ? tileId : (String(tileId).length & 0xffffffff);
    h = Math.imul(h ^ tileSalt, 0x9e3779b1);
    h ^= h >>> 16;
    const idx = Math.abs(h) % count;
    return Number.isFinite(idx) ? idx : 0;
  }

  function resolveTileVariant(def, context, tileId){
    if(Array.isArray(def) && def.length){
      const idx = selectVariantIndex(def.length, context, tileId);
      const entry = def[idx] ?? def[0];
      return { entry, cacheKey: `arr:${idx}` };
    }
    if(isPlainObject(def) && Array.isArray(def.variants) && def.variants.length){
      const base = cloneSpriteBase(def);
      const idx = selectVariantIndex(def.variants.length, context, tileId);
      const variantEntry = def.variants[idx] ?? def.variants[0];
      const merged = mergeVariantEntry(base, variantEntry);
      return { entry: merged, cacheKey: `obj:${idx}` };
    }
    return { entry: def, cacheKey: 'base' };
  }

  function getTileSprite(tileId, context = {}){
    const key = String(tileId);
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
    const variant = resolveTileVariant(def, context, tileId);
    const cacheKey = variant.cacheKey ? `${key}|${variant.cacheKey}` : key;
    if(tileSpriteCache.has(cacheKey)) return tileSpriteCache.get(cacheKey);
    const sprite = createSprite(variant.entry, skin.tiles);
    tileSpriteCache.set(cacheKey, sprite || null);
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

  function preloadTileDefinition(entry){
    if(!entry) return;
    if(typeof entry === 'string'){
      loadImage(entry);
      return;
    }
    if(Array.isArray(entry)){
      entry.forEach(preloadTileDefinition);
      return;
    }
    if(!isPlainObject(entry)) return;
    if(typeof entry.src === 'string') loadImage(entry.src);
    if(typeof entry.atlas === 'string') loadImage(entry.atlas);
    if(entry.frame && typeof entry.frame === 'object' && typeof entry.frame.src === 'string') loadImage(entry.frame.src);
    if(entry.variants) preloadTileDefinition(entry.variants);
  }

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
      for(const value of Object.values(defs)) preloadTileDefinition(value);
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

  function registerGeneratedSkin(name, input = {}){
    const styleId = typeof name === 'string' ? name.trim() : '';
    if(!styleId) return null;
    const overrides = normalizeGeneratedOverride(styleId, input);
    const merged = mergeGeneratedConfig(defaultGeneratedConfig(styleId), overrides);
    generatedConfigs.set(styleId, merged);
    return cloneGeneratedConfig(merged);
  }

  function loadGeneratedSkin(name, input = {}){
    const styleId = typeof name === 'string' ? name.trim() : '';
    if(!styleId) return null;
    const stored = generatedConfigs.get(styleId) || defaultGeneratedConfig(styleId);
    const overrides = normalizeGeneratedOverride(styleId, input);
    const merged = mergeGeneratedConfig(stored, overrides);
    generatedConfigs.set(styleId, merged);
    const skin = buildGeneratedSkin(styleId, merged);
    if(!skin) return null;
    registerSkin(skin);
    applySkin(skin);
    return cloneSkin(skin);
  }

  function listGeneratedSkins(){
    return Array.from(generatedConfigs.keys());
  }

  function getGeneratedSkinConfig(name){
    const styleId = typeof name === 'string' ? name.trim() : '';
    if(!styleId) return null;
    const stored = generatedConfigs.get(styleId);
    return stored ? cloneGeneratedConfig(stored) : null;
  }

  const api = {
    applySkin,
    registerSkin,
    registerGeneratedSkin,
    loadGeneratedSkin,
    listGeneratedSkins,
    getGeneratedSkinConfig,
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
  globalThis.loadSkin = globalThis.loadSkin || ((name, options) => api.loadGeneratedSkin(name, options));

  resetSkin(false);
})();
