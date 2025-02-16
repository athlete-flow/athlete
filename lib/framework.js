class Framework {
  constructor(container) {
    this.#container = container;
  }

  #container;
  #tokens = new Map();
  #factoryTokens = new Map();
  #moduleTokens = new Map();

  #formInjects() {
    return {
      inject: this.inject.bind(this),
      injectFactory: this.injectFactory.bind(this),
      injectModule: this.injectModule.bind(this),
    };
  }

  #formPublicFramework() {
    return { buildContainer: this.buildContainer.bind(this), ...this.#formInjects() };
  }

  onInit() {
    return this.#formPublicFramework();
  }

  inject(token, dependencies = []) {
    this.#tokens.set(token, dependencies);
    return this;
  }

  injectFactory(token, dependencies = []) {
    this.#factoryTokens.set(token, dependencies);
    return this;
  }

  injectModule(token, dependencies = []) {
    this.#moduleTokens.set(token, dependencies);
    return this;
  }

  buildContainer() {
    return this.#container.onInit(
      this.#formInjects(),
      this.#tokens,
      this.#factoryTokens,
      this.#moduleTokens
    );
  }
}

module.exports = { Framework };
