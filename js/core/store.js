const INITIAL_STATE = Object.freeze({
  workspace: null,
  locale: "pt-BR",
  theme: "light",
  experienceMode: "guided",
  connection: "online",
  provider: "indexeddb",
  persistence: "starting",
  pwa: Object.freeze({ updateAvailable: false, criticalOperation: false, syncState: "notConfigured" }),
});

export class Store {
  #state;
  #subscribers = new Set();

  constructor(initialState = INITIAL_STATE) {
    this.#state = Object.freeze({ ...initialState });
  }

  getState() {
    return this.#state;
  }

  setState(patch) {
    if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
      throw new TypeError("Store patch must be an object.");
    }
    const previousState = this.#state;
    this.#state = Object.freeze({ ...previousState, ...patch });
    for (const subscriber of [...this.#subscribers]) {
      subscriber(this.#state, previousState);
    }
  }

  subscribe(subscriber) {
    this.#subscribers.add(subscriber);
    return () => this.#subscribers.delete(subscriber);
  }
}

export const store = new Store();
