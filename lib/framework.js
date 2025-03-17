class Framework {
  constructor(container, asserter) {
    this.#container = container;
    this.#asserter = asserter;
  }

  #container;
  #asserter;
  #tokens = new Map();
  #factoryTokens = new Map();
  #moduleTokens = new Map();

  #formInjects() {
    return {
      inject: (token, dependencies = []) => {
        this.inject(token, dependencies);
        return this.#formInjects();
      },
      injectFactory: (token, dependencies = []) => {
        this.injectFactory(token, dependencies);
        return this.#formInjects();
      },
    };
  }

  init() {
    return {
      buildContainer: this.buildContainer.bind(this),
      injectModule: this.injectModule.bind(this),
      injectFactory: this.injectFactory.bind(this),
      inject: this.inject.bind(this),
    };
  }

  inject(token, dependencies = []) {
    this.#asserter.throwIfIsNotInject(token, dependencies);
    this.#tokens.set(token, dependencies);
    return this;
  }

  injectFactory(token, dependencies = []) {
    this.#asserter.throwIfIsNotInject(token, dependencies);
    this.#factoryTokens.set(token, dependencies);
    return this;
  }

  injectModule(token, dependencies = []) {
    this.#asserter.throwIfIsNotInject(token, dependencies);
    this.#moduleTokens.set(token, dependencies);
    return this;
  }

  buildContainer() {
    return this.#container.init(
      this.#formInjects(),
      this.#tokens,
      this.#factoryTokens,
      this.#moduleTokens
    );
  }
}

module.exports = { Framework };
