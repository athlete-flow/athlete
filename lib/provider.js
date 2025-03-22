const construct = (token, args) => {
  if (token.prototype && token.prototype.constructor === token) return new token(...args);
  return token(...args);
};

const collectAsIs = (graph, dependencies) =>
  dependencies.map((dependency) =>
    graph.has(dependency) ? graph.get(dependency).instantiate(graph) : dependency
  );

const collectFirstItem = (graph, dependencies) =>
  dependencies.map((dependency) =>
    graph.has(dependency) ? graph.get(dependency).instantiate(graph) : dependency[0]
  );

class Provider {
  constructor(instancer, collect, token, dependencies) {
    this.#instancer = instancer;
    this.#collect = collect;
    this.token = token;
    this.dependencies = dependencies;
  }

  #instancer;
  #collect;

  instantiate(graph) {
    const args = this.#collect(graph, this.dependencies);
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
    return new Provider(new Singleton(), collectFirstItem, token, dependencies);
  }

  createFactoryProvider(token, dependencies) {
    return new Provider(new Factory(), collectFirstItem, token, dependencies);
  }

  createModuleProvider(token, dependencies) {
    return new Provider(new Singleton(), collectAsIs, token, dependencies);
  }

  createCommandProvider(token, dependencies) {
    return new Provider(new Singleton(), collectAsIs, token, dependencies);
  }
}

module.exports = { ProviderFactory };
