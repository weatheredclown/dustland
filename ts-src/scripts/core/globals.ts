const dustlandGlobalHelpers = (() => {
  type Helpers = {
    ensureDustland(): DustlandNamespace;
    getDustland(): DustlandNamespace | undefined;
    getEventBus(): DustlandEventBus | undefined;
    getParty(): Party | undefined;
    getPlayer(): PlayerState | undefined;
    getNpcRoster(): DustlandNpc[];
    getPersonaTemplates(): Record<string, DustlandPersonaTemplate>;
    setItemGenerator(generator: ItemGenerator): ItemGenerator;
  };

  const getScope = (): GlobalThis => globalThis as unknown as GlobalThis;

  const helpers: Helpers = {
    ensureDustland() {
      const scope = getScope();
      if (!scope.Dustland) {
        scope.Dustland = {};
      }
      return scope.Dustland;
    },
    getDustland() {
      return getScope().Dustland;
    },
    getEventBus() {
      const scope = getScope();
      return scope.Dustland?.eventBus ?? scope.EventBus;
    },
    getParty() {
      return getScope().party;
    },
    getPlayer() {
      return getScope().player;
    },
    getNpcRoster() {
      const roster = getScope().NPCS;
      return Array.isArray(roster) ? roster : [];
    },
    getPersonaTemplates() {
      return helpers.ensureDustland().personaTemplates ?? {};
    },
    setItemGenerator(generator) {
      const scope = getScope();
      scope.ItemGen = generator;
      helpers.ensureDustland().ItemGen = generator;
      return generator;
    }
  };

  return helpers;
})();

(globalThis as unknown as GlobalThis & { DustlandGlobals?: typeof dustlandGlobalHelpers }).DustlandGlobals = dustlandGlobalHelpers;
