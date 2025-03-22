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

  #injector = {
    inject: (token, dependencies) => this.inject(token, dependencies).#injector,
    injectFactory: (token, dependencies) => this.injectFactory(token, dependencies).#injector,
  };

  #publicFramework = {
    inject: (token, dependencies) => this.inject(token, dependencies).#publicFramework,
    injectFactory: (token, dependencies) =>
      this.injectFactory(token, dependencies).#publicFramework,
    injectModule: (token, dependencies) => this.injectModule(token, dependencies).#publicFramework,
    buildContainer: this.buildContainer.bind(this),
  };

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
    const createProvider = this.#providerFactory.createModuleProvider.bind(this.#providerFactory);
    return this.#injectToken(this.#modulesGraph, createProvider, token, dependencies);
  }

  buildContainer() {
    const graph = new Map([...this.#modulesGraph, ...this.#tokensGraph]);
    this.#asserter.throwIfNotValidGraph(graph);
    for (const provider of this.#modulesGraph.values())
      provider.instantiate(this.#modulesGraph).export(this.#injector);
    return this.#container.init(this.#tokensGraph, this.#modulesGraph);
  }

  init = () => this.#publicFramework;
}

module.exports = { Framework };
