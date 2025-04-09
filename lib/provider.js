const construct = (token, args) => {
  if (token.prototype && token.prototype.constructor === token) return new token(...args);
  return token(...args);
};

class Provider {
  constructor(instancer, token, dependencies) {
    this.#instancer = instancer;
    this.token = token;
    this.dependencies = dependencies;
  }

  #instancer;

  #collectDependencies(graph) {
    return this.dependencies.map((dependency) =>
      graph.has(dependency) ? graph.get(dependency).instantiate(graph) : dependency[0]
    );
  }

  instantiate(graph) {
    const args = this.#collectDependencies(graph);
    return this.#instancer.instantiate(this.token, args);
  }
}

class Singleton {
  instance;

  instantiate(token, args) {
    if (!this.instance) this.instance = construct(token, args);
    return this.instance;
  }
}

class Factory {
  instantiate(token, args) {
    return construct(token, args);
  }
}

class ProviderFactory {
  createProvider(token, dependencies) {
    return new Provider(new Singleton(), token, dependencies);
  }

  createFactoryProvider(token, dependencies) {
    return new Provider(new Factory(), token, dependencies);
  }
}

module.exports = { ProviderFactory };
