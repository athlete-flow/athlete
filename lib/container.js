class Container {
  constructor(resolver, asserter) {
    this.#resolver = resolver;
    this.#asserter = asserter;
  }

  #resolver;
  #asserter;
  #factoryTokens;
  #instances;
  #modules;

  #formResolvers() {
    return {
      resolveInstance: this.resolveInstance.bind(this),
      canBeResolved: this.canBeResolved.bind(this),
    };
  }

  #formPublicContainer() {
    return {
      executeCommand: this.executeCommand.bind(this),
      ...this.#formResolvers(),
    };
  }

  init(injects, tokens, factoryTokens, moduleTokens) {
    this.#factoryTokens = factoryTokens;
    this.#modules = this.#resolver.resolveModules(moduleTokens);
    for (const module of this.#modules.values()) module.export(injects);
    this.#instances = this.#resolver.resolveInstances(tokens, factoryTokens);
    return this.#formPublicContainer();
  }

  resolveInstance(token) {
    this.#asserter.throwIfIsNotToken(token);
    return this.#resolver.resolveInstance(token, this.#instances, this.#factoryTokens);
  }

  canBeResolved(candidate) {
    return this.#instances.has(candidate) || this.#factoryTokens.has(candidate);
  }

  executeCommand(token, dependencies = []) {
    this.#asserter.throwIfIsNotInject(token, dependencies);
    const command = this.#resolver.resolveCommand(token, dependencies, this.#modules);
    const resolves = this.#formResolvers();
    command.execute(resolves);
    return this.#formPublicContainer();
  }
}

module.exports = { Container };
