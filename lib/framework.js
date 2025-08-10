class Framework {
  constructor(container, providerFactory, asserter) {
    this.#container = container;
    this.#providerFactory = providerFactory;
    this.#asserter = asserter;
  }

  #container;
  #providerFactory;
  #asserter;
  #tokensGraph = new Map();
  #modulesGraph = new Map();

  #injectToken(store, createProvider, token, dependencies) {
    this.#asserter.throwIfIsNotInject(token, dependencies);
    store.set(token, createProvider(token, dependencies));
    return this;
  }

  inject(token, dependencies = []) {
    const createProvider = this.#providerFactory.createProvider.bind(this.#providerFactory);
    return this.#injectToken(this.#tokensGraph, createProvider, token, dependencies);
  }

  injectFactory(token, dependencies = []) {
    const createProvider = this.#providerFactory.createFactoryProvider.bind(this.#providerFactory);
    return this.#injectToken(this.#tokensGraph, createProvider, token, dependencies);
  }

  injectModule(token, dependencies = []) {
    const createProvider = this.#providerFactory.createProvider.bind(this.#providerFactory);
    return this.#injectToken(this.#modulesGraph, createProvider, token, dependencies);
  }

  buildContainer() {
    const graph = new Map([...this.#modulesGraph, ...this.#tokensGraph]);
    this.#asserter.throwIfHasUnknownToken(graph);
    this.#asserter.throwIfHasCyclicDependencies(this.#modulesGraph);
    for (const provider of this.#modulesGraph.values()) provider.instantiate(this.#modulesGraph).export(this);
    return this.#container.init(this.#tokensGraph, this.#modulesGraph);
  }

  registerInjector(injectors) {
    for (const [key, injector] of Object.entries(injectors)) {
      this.#asserter.throwIfInjectoNotFunction(key, injector);
      this[key] = injector.bind(this);
    }
    return this;
  }
}

module.exports = { Framework };
