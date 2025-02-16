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
 * Represents a partial dependency, allowing both injectable and uninjectable tokens.
 */
export type PartialDependecy<T = unknown> = T extends Token
  ? T
  : T extends UninjectableToken
  ? T
  : Dependency<T>;

/**
 * Represents an array of dependencies.
 */
export type Dependencies<A extends any[]> = { [K in keyof A]: Dependency<A[K]> };

/**
 * Represents an array of partial dependencies.
 */
export type PartialDependencies<A extends any[]> = { [K in keyof A]: PartialDependecy<A[K]> };

/**
 * Interface for modules that can be exported in the framework.
 */
export interface IModule {
  /**
   * Exports the module to the framework.
   * @param { IModuleFramework } framework - The framework instance.
   */
  export(framework: IModuleFramework): void;
}

/**
 * Interface for commands that can be executed in the framework.
 */
export interface ICommand {
  /**
   * Executes the command with the given container.
   * @param { ICommandContainer } container - The command execution context.
   */
  execute(container: ICommandContainer): void;
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
   */
  inject<T>(token: Token<T, []>): IFramework;
  inject<T, A extends any[]>(token: Token<T, A>, dependencies: Dependencies<A>): IFramework;

  /**
   * Injects a factory token with dependencies.
   * @template T, A
   * @param { Token<T, A> } token - The factory token to be injected.
   * @param { Dependencies<A> } [dependencies=[]] - The dependencies of the token.
   * @returns { IFramework } The framework instance for chaining.
   */
  injectFactory<T>(token: Token<T, []>): IFramework;
  injectFactory<T, A extends any[]>(token: Token<T, A>, dependencies: Dependencies<A>): IFramework;

  /**
   * Injects a module with dependencies.
   * @template T, A
   * @param { Token<T extends IModule, A> } token - The module token to be injected.
   * @param { PartialDependencies<A> } [dependencies=[]] - The dependencies of the module.
   * @returns { IFramework } The framework instance for chaining.
   */
  injectModule<T extends IModule>(token: Token<T, []>): IFramework;
  injectModule<T extends IModule, A extends any[]>(
    token: Token<T, A>,
    dependencies: PartialDependencies<A>
  ): IFramework;

  /**
   * Builds and returns a container instance with the resolved dependencies.
   * @returns { IContainer } The built container instance.
   */
  buildContainer(): IContainer;
}

/**
 * The module framework interface, providing limited injection methods.
 */
export type IModuleFramework = Pick<IFramework, 'inject' | 'injectFactory' | 'injectModule'>;

/**
 * The dependency container interface.
 */
export interface IContainer {
  /**
   * Resolves an instance of the given token.
   * @template T
   * @param { Token<T> } token - The token to resolve.
   * @returns { T } The resolved instance.
   */
  resolveInstance<T>(token: Token<T>): T;

  /**
   * Executes a command within the container.
   * @template T, A
   * @param { Token<T extends ICommand, A> } token - The command token.
   * @param { PartialDependencies<A> } [dependencies=[]] - Optional dependencies for the command.
   * @returns { IContainer } The container instance for chaining.
   */
  executeCommand<T extends ICommand>(token: Token<T, []>): IContainer;
  executeCommand<T extends ICommand, A extends any[]>(
    token: Token<T, A>,
    dependencies?: PartialDependencies<A>
  ): IContainer;
}

/**
 * The command container interface, providing resolution capabilities.
 */
export type ICommandContainer = Pick<IContainer, 'resolveInstance'>;

/**
 * Creates a new framework instance.
 * @returns { IFramework } The framework instance.
 */
export declare function Athlete(): IFramework;
