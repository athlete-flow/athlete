class Asserter {
  constructor(validator, graphChecker) {
    this.#validator = validator;
    this.#graphChecker = graphChecker;
  }

  #validator;
  #graphChecker;

  #formName(token) {
    const MAX_LENGTH = 20;
    return token?.name ?? String(token).slice(0, MAX_LENGTH);
  }

  #formNames(tokens) {
    return tokens.map((token) => this.#formName(token)).join(", ");
  }

  throwIfIsNotToken(token) {
    if (!this.#validator.isToken(token)) throw new Error(`[ ${this.#formName(token)} ] is not a valid token.`);
  }

  throwIfIsNotDependency(dependency) {
    if (!this.#validator.isDependency(dependency))
      throw new Error(`[ ${this.#formName(dependency)} ] is not a valid dependency.`);
  }

  throwIfIsNotInject(token, dependencies) {
    this.throwIfIsNotToken(token);
    if (!Array.isArray(dependencies))
      throw new Error(`Invalid dependencies provided for token [ ${this.#formName(token)} ].`);
    for (const dependency of dependencies) this.throwIfIsNotDependency(dependency);
  }

  throwIfCanNotBeResolved(token) {
    throw new Error(`[ ${this.#formName(token)} ] cannot be resolved.`);
  }

  throwIfHasUnknownToken(graph) {
    const unknownToken = this.#graphChecker.foundFirstUnknownToken(graph);
    if (unknownToken) throw new Error(`[ ${this.#formName(unknownToken)} ] has no injection.`);
  }

  throwIfHasUnknownTokens(graph, dependencies) {
    for (const dependency of dependencies)
      if (!Array.isArray(dependency) && !graph.has(dependency))
        throw new Error(`[ ${this.#formName(dependency)} ] has no injection.`);
  }

  throwIfHasCyclicDependencies(graph) {
    const path = this.#graphChecker.foundCyclicDependencies(graph);
    if (Array.isArray(path) && path.length)
      throw new Error(`Cyclic dependency detected between [ ${this.#formNames(path)} ].`);
  }

  throwIfInjectoNotFunction(key, injector) {
    if (typeof injector !== "function") throw new Error(`Injector property '${key}' must be a function`);
  }

  throwIfNotInjector(injector) {
    const isValid = typeof injector === "function" && injector.name.length > 0;
    if (!isValid) throw new Error(`[ ${this.#formName(injector)} ] is not a valid injector.`);
  }
}

module.exports = { Asserter };
