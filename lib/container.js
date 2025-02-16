class Container {
  constructor(resolver) {
    this.#resolver = resolver;
  }

  #resolver;
  #factoryTokens;
  #instances;
  #modules;

  #formResolvers() {
    return { resolveInstance: this.resolveInstance.bind(this) };
  }

  #formPublicContainer() {
    return {
      executeCommand: this.executeCommand.bind(this),
      ...this.#formResolvers(),
    };
  }

  onInit(injects, tokens, factoryTokens, moduleTokens) {
    this.#factoryTokens = factoryTokens;
    this.#modules = this.#resolver.resolveModules(moduleTokens);
    for (const module of this.#modules.values()) module.export(injects);
    this.#instances = this.#resolver.resolveInstances(tokens, factoryTokens);
    return this.#formPublicContainer();
  }

  resolveInstance(token) {
    return this.#resolver.resolveInstance(token, this.#instances, this.#factoryTokens);
  }

  executeCommand(token, dependencies = []) {
    const command = this.#resolver.resolveCommand(token, dependencies, this.#modules);
    const resolves = this.#formResolvers();
    command.execute(resolves);
    return this.#formPublicContainer();
  }
}

module.exports = { Container };
