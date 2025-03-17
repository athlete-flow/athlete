class Asserter {
  constructor(validator) {
    this.#validator = validator;
  }

  #validator;

  #formName(candidate) {
    const MAX_LENGTH = 20;
    return candidate.name ?? String(candidate).slice(0, MAX_LENGTH);
  }

  #formNames(set) {
    return Array.from(set).map(this.#formName.bind(this)).join(', ');
  }

  throwIfIsNotToken(token) {
    if (!this.#validator.isToken(token))
      throw new Error(`[ ${this.#formName(token)} ] is not a token`);
  }

  throwIfIsNotDependency(dependency) {
    if (!this.#validator.isDependency(dependency))
      throw new Error(`[ ${this.#formName(dependency)} ] is not a dependency`);
  }

  throwIfIsNotInject(token, dependencies) {
    this.throwIfIsNotToken(token);
    if (!Array.isArray(dependencies))
      throw new Error(`Wrong dependencies from [ ${this.#formName(token)} ] token`);
    for (const candidate of dependencies) this.throwIfIsNotDependency(candidate);
  }

  throwIfHasCyclicDependency(visiting, node) {
    if (visiting.has(node))
      throw new Error(`Cyclic dependency detected: [ ${this.#formNames(visiting)} ]`);
  }
}

module.exports = { Asserter };
