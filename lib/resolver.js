class Resolver {
  constructor(topology) {
    this.#topology = topology;
  }

  #topology;

  #isFactory = (factoryTokens, token) => factoryTokens.has(token);

  #construct(token, args) {
    return token.prototype && token.prototype.constructor === token
      ? new token(...args)
      : token(...args);
  }

  #createInstance(token, dependencies, instances, factoryTokens) {
    const args = dependencies.map((dependency) =>
      Array.isArray(dependency)
        ? dependency[0]
        : this.resolveInstance(dependency, instances, factoryTokens)
    );
    return this.#construct(token, args);
  }

  resolveModules(moduleTokens) {
    const sortedTokens = this.#topology.sort(moduleTokens);
    const modules = new Map();
    for (const [token, dependencies] of sortedTokens) {
      const args = dependencies.map((dependency) => modules.get(dependency) || dependency);
      modules.set(token, this.#construct(token, args));
    }
    return modules;
  }

  resolveInstances(tokens, factoryTokens) {
    const sortedTokens = this.#topology.sort(new Map([...factoryTokens, ...tokens]));
    const instances = new Map();
    for (const [token, dependencies] of sortedTokens) {
      const instance = this.#isFactory(factoryTokens, token)
        ? () => this.#createInstance(token, dependencies, instances, factoryTokens)
        : this.#createInstance(token, dependencies, instances, factoryTokens);
      instances.set(token, instance);
    }
    return instances;
  }

  resolveInstance(token, instances, factoryTokens) {
    const candidate = instances.get(token);
    if (!candidate)
      throw new Error(`Dependency not found for token: [ ${token?.name || String(token)} ]`);
    return this.#isFactory(factoryTokens, token) ? candidate() : candidate;
  }

  resolveCommand(token, dependencies, modules) {
    const args = dependencies.map((dependency) => modules.get(dependency) || dependency);
    return this.#construct(token, args);
  }
}

module.exports = { Resolver };
