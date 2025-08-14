class Container {
  constructor(providerFactory, asserter) {
    this.#providerFactory = providerFactory;
    this.#asserter = asserter;
  }

  #providerFactory;
  #asserter;
  #tokensGraph = new Map();
  #modulesGraph = new Map();

  canBeResolved(candidate) {
    return this.#tokensGraph.has(candidate);
  }

  resolveInstance(token) {
    this.#asserter.throwIfIsNotToken(token);
    if (!this.canBeResolved(token)) this.#asserter.throwIfCanNotBeResolved(token);
    const provider = this.#tokensGraph.get(token);
    return provider.instantiate(this.#tokensGraph);
  }

  executeCommand(token, dependencies = []) {
    const graph = new Map([...this.#modulesGraph, ...this.#tokensGraph]);
    this.#asserter.throwIfIsNotInject(token, dependencies);
    this.#asserter.throwIfHasUnknownTokens(graph, dependencies);
    const provider = this.#providerFactory.createProvider(token, dependencies);
    const command = provider.instantiate(this.#modulesGraph);
    command.execute(this);
    return this;
  }

  getInfo() {
    return { tokens: this.#tokensGraph, modules: this.#modulesGraph };
  }

  init(tokensGraph, modulesGraph) {
    this.#asserter.throwIfHasUnknownToken(tokensGraph);
    this.#asserter.throwIfHasCyclicDependencies(tokensGraph);
    this.#tokensGraph = tokensGraph;
    this.#modulesGraph = modulesGraph;
    return this;
  }
}

module.exports = { Container };
