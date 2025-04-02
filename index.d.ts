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
  depndencies: A;
  instantiate: (graph: Map<Token, IProvider>) => T;
}

/**
 * Interface for modules that can be exported in the framework.
 * @example
 * class ExampleModule implements IModule {
 *    readonly LOGGER_TOKEN: Logger
 *
 *    public export(injector: IInjector): void {
 *      injector.inject(this.LOGGER_TOKEN)
 *    }
 * }
 */
export interface IModule {
  /**
   * Exports the module to the framework context.
   * @param { IInjector } injector - The framework instance as injector.
   */
  export(injector: IInjector): void;
}

/**
 * Interface for commands that can be executed in the framework.
 * @example
 * class ExampleCommand implements ICommand {
 *    constructor(private readonly exampleModule: ExampleModule) {}
 *
 *    public execute(resolver: IResolver): void {
 *      const { LOGGER_TOKEN } = this.exampleModule
 *      const isToken = resolver.canBeResolved(LOGGER_TOKEN)
 *      if (isToken) {
 *        const logger = resolver.resolveInstance(isToken)
 *        logger.log('example')
 *      }
 *    }
 * }
 */
export interface ICommand {
  /**
   * Executes the command with the given resolver.
   * @param { IResolver } resolver - The command execution context.
   */
  execute(resolver: IResolver): void;
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
   * @returns { IFramework } The framework instance for chaining.
   * @example
   * framework.inject(MyService, [dependency1, dependency2]);
   */
  inject<T>(token: Token<T, []>): IFramework;
  inject<T, A extends any[]>(token: Token<T, A>, dependencies: Dependencies<A>): IFramework;

  /**
   * Injects a factory token with dependencies.
   * @template T, A
   * @param { Token<T, A> } token - The factory token to be injected.
   * @param { Dependencies<A> } [dependencies=[]] - The dependencies of the token.
   * @returns { IFramework } The framework instance for chaining.
   * @example
   * framework.injectFactory(MyFactoryToken);
   */
  injectFactory<T>(token: Token<T, []>): IFramework;
  injectFactory<T, A extends any[]>(token: Token<T, A>, dependencies: Dependencies<A>): IFramework;

  /**
   * Injects a module with dependencies.
   * @template T, A
   * @param { Token<T extends IModule, A> } token - The module token to be injected.
   * @param { Dependencies<A> } [dependencies=[]] - The dependencies of the module.
   * @returns { IFramework } The framework instance for chaining.
   * @example
   * framework.injectModule(MyModuleToken, [dependency1]);
   */
  injectModule<T extends IModule>(token: Token<T, []>): IFramework;
  injectModule<T extends IModule, A extends any[]>(
    token: Token<T, A>,
    dependencies: Dependencies<A>
  ): IFramework;

  /**
   * Builds and returns a container instance with the resolved dependencies.
   * @returns { IContainer } The built container instance.
   * @example
   * const container = framework.buildContainer();
   */
  buildContainer(): IContainer;
}

/**
 * The module framework interface, providing limited injection methods.
 * @example
 * injector.inject(MyService, [dependency1, dependency2]);
 * injector.injectFactory(MyFactoryToken);
 */
export interface IInjector {
  /**
   * Injects a token with dependencies.
   * @template T, A
   * @param { Token<T, A> } token - The token to be injected.
   * @param { Dependencies<A> } [dependencies=[]] - The dependencies of the token.
   * @returns { IInjector } The framework instance for chaining.
   * @example
   * injector.inject(MyService, [dependency1, dependency2]);
   */
  inject<T>(token: Token<T, []>): IInjector;
  inject<T, A extends any[]>(token: Token<T, A>, dependencies: Dependencies<A>): IInjector;

  /**
   * Injects a factory token with dependencies.
   * @template T, A
   * @param { Token<T, A> } token - The factory token to be injected.
   * @param { Dependencies<A> } [dependencies=[]] - The dependencies of the token.
   * @returns { IInjector } The framework instance for chaining.
   * @example
   * injector.injectFactory(MyFactoryToken);
   */
  injectFactory<T>(token: Token<T, []>): IInjector;
  injectFactory<T, A extends any[]>(token: Token<T, A>, dependencies: Dependencies<A>): IInjector;
}

/**
 * Interface for retrieving information about tokens and modules in the dependency context.
 */
export interface IInfo {
  tokens: Map<Token, IProvider>;
  modules: Map<Token, IProvider>;
}

/**
 * The resolver interface, providing resolution capabilities.
 * @example
 * const instance = resolver.resolveInstance(MyToken)
 * const isToken = resolver.canBeResolved(MyToken)
 * const info = resolver.getInfo();
 */
export interface IResolver {
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
   * Provides information about the current state of the framework.
   * @returns { IInfo } The current state info.
   * @example
   * const info = resolver.getInfo();
   */
  getInfo(): IInfo;
}

/**
 * The dependency container interface.
 */
export interface IContainer extends IResolver {
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
  executeCommand<T extends ICommand, A extends any[]>(
    token: Token<T, A>,
    dependencies: Dependencies<A>
  ): IContainer;
}

export interface AthleteConstructor {
  new (): IFramework;
  (): IFramework;
}

/**
 * Creates a new framework instance.
 * @returns { IFramework } The framework instance.
 * @example
 * const athlete = Athlete();
 * // or
 * const athlete = new Athlete();
 */
export declare const Athlete: AthleteConstructor;

/**
 * Injectable token for container Resolver.
 * @example
 * const resolverToken: Token<IResolver> = RESOLVER_TOKEN;
 */
export declare const RESOLVER_TOKEN: Token<IResolver>;
