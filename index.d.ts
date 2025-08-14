/**
 * Represents a class constructor.
 */
export type Class<T = unknown, A extends any[] = any[]> = new (...args: A) => T;

/**
 * Represents a function type.
 */
export type Func<T = unknown, A extends any[] = any[]> = (...args: A) => T;

/**
 * Represents a token that can be injected into the framework.
 */
export type Token<T = unknown, A extends any[] = any[]> = Class<T, A> | Func<T, A>;

/**
 * Represents a dependency that cannot be injected.
 */
export type UninjectableToken<T = unknown> = [T];

/**
 * Represents a dependency, which can be either an injectable token or an uninjectable one.
 */
export type Dependency<T = unknown> = Token<T> | UninjectableToken<T>;

/**
 * Represents an array of dependencies.
 */
export type Dependencies<A extends any[]> = { [K in keyof A]: Dependency<A[K]> };

/**
 * A provider interface that handles dependency injection.
 */
export interface IProvider<T = unknown, A extends any[] = any[]> {
  token: Token<T, A>;
  dependencies: A;
  instantiate: (graph: Map<Token, IProvider>) => T;
}

/**
 * Interface for modules that can be exported in the framework.
 * @example
 * class ExampleModule implements IModule {
 *    readonly LOGGER_TOKEN: Logger
 *
 *    public export(framework: IFramework): void {
 *      framework.inject(this.LOGGER_TOKEN)
 *    }
 * }
 */
export interface IModule {
  /**
   * Exports the module to the framework context.
   * @param { IFramework } framework - The framework instance.
   */
  export(framework: IFramework): void;
}

/**
 * Interface for commands that can be executed in the framework.
 * @example
 * class ExampleCommand implements ICommand {
 *    constructor(private readonly exampleModule: ExampleModule) {}
 *
 *    public execute(container: IContainer): void {
 *      const { LOGGER_TOKEN } = this.exampleModule
 *      const isToken = container.canBeResolved(LOGGER_TOKEN)
 *      if (isToken) {
 *        const logger = container.resolveInstance(isToken)
 *        logger.log('example')
 *      }
 *    }
 * }
 */
export interface ICommand {
  /**
   * Executes the command with the given container.
   * @param { IContainer } container - The container instance.
   */
  execute(container: IContainer): void;
}

/**
 * The main framework interface for dependency injection.
 */
export interface IFramework {
  /**
   * Injects a token with dependencies.
   * @template T, A
   * @param { Token<T, A> } token - The token to be injected.
   * @param { Dependencies<A> } [dependencies=[]] - The dependencies of the token.
   * @returns { this } The framework instance for chaining.
   * @example
   * framework.inject(MyService, [dependency1, dependency2]);
   */
  inject<T>(token: Token<T, []>): this;
  inject<T, A extends any[]>(token: Token<T, A>, dependencies: Dependencies<A>): this;

  /**
   * Injects a factory token with dependencies.
   * @template T, A
   * @param { Token<T, A> } token - The factory token to be injected.
   * @param { Dependencies<A> } [dependencies=[]] - The dependencies of the token.
   * @returns { this } The framework instance for chaining.
   * @example
   * framework.injectFactory(MyFactoryToken);
   */
  injectFactory<T>(token: Token<T, []>): this;
  injectFactory<T, A extends any[]>(token: Token<T, A>, dependencies: Dependencies<A>): this;

  /**
   * Injects a module with dependencies.
   * @template T, A
   * @param { Token<T extends IModule, A> } token - The module token to be injected.
   * @param { Dependencies<A> } [dependencies=[]] - The dependencies of the module.
   * @returns { this } The framework instance for chaining.
   * @example
   * framework.injectModule(MyModuleToken, [dependency1]);
   */
  injectModule<T extends IModule>(token: Token<T, []>): this;
  injectModule<T extends IModule, A extends any[]>(token: Token<T, A>, dependencies: Dependencies<A>): this;

  /**
   * Builds and returns a container instance with the resolved dependencies.
   * @returns { IContainer } The built container instance.
   * @example
   * const container = framework.buildContainer();
   */
  buildContainer(): IContainer;

  /**
   * Registers a custom injector method.
   * @template T
   * @param {(...args: any) => T} injector - The injector function.
   * @returns {T} The extended framework instance.
   * @example
   * function injectRoute(token, deps = []) {
   *   // do smth
   *   return framework.inject(token, deps);
   * }
   * framework.registerInjector(injectRoute);
   */
  registerInjector<T extends this>(injector: (...args: any) => T): T;
  registerInjector<T extends this>(injector: (...args: any) => this): T;

  /**
   * Injectable token for container instance.
   * @example
   * const containerToken: Token<IContainer> = framework.CONTAINER_TOKEN;
   */
  CONTAINER_TOKEN: Token<IContainer>;
}

/**
 * Interface for retrieving information about tokens and modules in the dependency context.
 */
export interface IInfo {
  tokens: Map<Token, IProvider>;
  modules: Map<Token, IProvider>;
}

/**
 * The dependency container interface.
 */
export interface IContainer {
  /**
   * Resolves an instance of the given token.
   * @template T
   * @param { Token<T> } token - The token to resolve.
   * @returns { T } The resolved instance.
   * @example
   * const instance = resolver.resolveInstance(MyToken)
   */
  resolveInstance<T>(token: Token<T>): T;

  /**
   * Determines whether the given candidate can be resolved as a token.
   *
   * @param {unknown} candidate - The value to check.
   * @returns {candidate is Token} `true` if the candidate is a valid token, otherwise `false`.
   * @example
   * const isToken = resolver.canBeResolved(MyService);
   */
  canBeResolved(candidate: unknown): candidate is Token;

  /**
   * Executes a command within the container.
   * @template T, A
   * @param { Token<T extends ICommand, A> } token - The command token.
   * @param { Dependencies<A> } [dependencies=[]] - Optional dependencies for the command.
   * @returns { IContainer } The container instance for chaining.
   * @example
   * container.executeCommand(MyCommandToken);
   */
  executeCommand<T extends ICommand>(token: Token<T, []>): IContainer;
  executeCommand<T extends ICommand, A extends any[]>(token: Token<T, A>, dependencies: Dependencies<A>): IContainer;

  /**
   * Provides information about the current state of the framework.
   * @returns { IInfo } The current state info.
   * @example
   * const info = resolver.getInfo();
   */
  getInfo(): IInfo;
}

/**
 * Creates a new framework instance factory.
 * @returns { IFramework } The framework instance.
 * @example
 * const athlete = Athlete();
 */
export declare function Athlete(): IFramework;

/**
 * Injectable token for container instance.
 * @example
 * const containerToken: Token<IContainer> = CONTAINER_TOKEN;
 */
export declare const CONTAINER_TOKEN: Token<IContainer>;
