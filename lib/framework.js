class Framework {
  constructor(CONTAINER_TOKEN, container, providerFactory, asserter) {
    this.CONTAINER_TOKEN = CONTAINER_TOKEN;
    this.#container = container;
    this.#providerFactory = providerFactory;
    this.#asserter = asserter;
  }

  #container;
  #providerFactory;
  #asserter;
  #tokensGraph = new Map();
  #modulesGraph = new Map();
  CONTAINER_TOKEN;

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
    this.inject(this.CONTAINER_TOKEN, [[this.#container]]);
    this.#asserter.throwIfHasUnknownToken(this.#modulesGraph);
    this.#asserter.throwIfHasCyclicDependencies(this.#modulesGraph);
    for (const provider of this.#modulesGraph.values()) provider.instantiate(this.#modulesGraph).export(this);
    return this.#container.init(this.#tokensGraph, this.#modulesGraph);
  }

  registerInjector(injector) {
    this.#asserter.throwIfNotInjector(injector);
    this[injector.name] = injector.bind(this);
    return this;
  }
}

module.exports = { Framework };
