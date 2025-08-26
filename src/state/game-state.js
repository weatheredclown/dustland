class GameState {
  static #instance;
  #playerHealth = 0;

  constructor() {
    if (GameState.#instance) {
      return GameState.#instance;
    }
    GameState.#instance = this;
    if (typeof player !== 'undefined' && typeof player.hp === 'number') {
      this.#playerHealth = player.hp;
    }
  }

  getPlayerHealth() {
    return this.#playerHealth;
  }

  setPlayerHealth(hp) {
    this.#playerHealth = hp;
    if (typeof player !== 'undefined') {
      player.hp = hp;
    }
  }
}

const gameState = new GameState();
Object.assign(globalThis, { GameState, gameState });
export { GameState, gameState };
