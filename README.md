# Athlete Documentation

A lightweight DI framework.  
No decorators or string tokens.  
JS/TS friendly.

### Usage

```typescript
import { Athlete } from "athlete-core";

const framework = Athlete(); // or const framework = new Athlete();
```

```typescript
interface IFramework {
  inject<T>(token: Token<T, []>): IFramework;
  inject<T, A extends any[]>(
    token: Token<T, A>,
    dependencies: Dependencies<A>
  ): IFramework;
  injectFactory<T>(token: Token<T, []>): IFramework;
  injectFactory<T, A extends any[]>(
    token: Token<T, A>,
    dependencies: Dependencies<A>
  ): IFramework;
  injectModule<T extends IModule>(token: Token<T, []>): IFramework;
  injectModule<T extends IModule, A extends any[]>(
    token: Token<T, A>,
    dependencies: Dependencies<A>
  ): IFramework;
  buildContainer(): IContainer;
}
```

`framework` is used to configure dependencies.

```typescript
import { Athlete } from "athlete-core";

const container = Athlete().buildContainer();
```

```typescript
interface IContainer {
  resolveInstance<T>(token: Token<T>): T;
  executeCommand<T extends ICommand>(token: Token<T, []>): IContainer;
  executeCommand<T extends ICommand, A extends any[]>(
    token: Token<T, A>,
    dependencies: Dependencies<A>
  ): IContainer;
}
```

`container` is used to get instances.

### Methods

- **inject**: Inject a class or function as a singleton.

```typescript
class ServiceA {}

function ServiceB(serviceA: ServiceA) {}

Athlete().inject(ServiceB, [ServiceA]).inject(ServiceA).buildContainer();
```

You can call injects in any order.

- **injectFactory**: Inject a class or function as a factory (new instance each time).

```typescript
class Logger {}

class ServiceA {
  constructor(readonly logger: Logger) {}
}

function ServiceB(serviceA: ServiceA, logger: Logger) {}

Athlete()
  .inject(ServiceA, [Logger])
  .inject(ServiceB, [ServiceA, Logger])
  .injectFactory(Logger)
  .buildContainer();
```

`Logger` will be instantiated twice. A new instance for each service.

- **ResolveInstance**: Method for getting an instance.

```typescript
class ServiceA {}

function ServiceB(serviceA: ServiceA) {}

const serviceBInstance = Athlete()
  .inject(ServiceB, [ServiceA])
  .inject(ServiceA)
  .buildContainer()
  .resolveInstance(ServiceB);
```

- **injectModule**: Inject a module into the framework.

The `IModule` interface defines a method `export` that is called to inject a module into the framework. The method takes an instance of `IModuleFramework`, which contains methods for injecting dependencies.

```typescript
interface IModule {
  export(injector: IInjector): void;
}
```

```typescript
class ServiceA {}

function ServiceB(serviceA: ServiceA) {}

class ServiceAModule implements IModule {
  readonly SERVICE_A_TOKEN = ServiceA;

  export(injector: IInjector): void {
    injector.inject(this.SERVICE_A_TOKEN);
  }
}

class ServiceBModule implements IModule {
  constructor(readonly serviceA: ServiceA) {}

  readonly SERVICE_B_TOKEN = ServiceB;

  export(injector: IInjector): void {
    injector.inject(this.SERVICE_B_TOKEN, [this.serviceA.SERVICE_A_TOKEN]);
  }
}

Athlete()
  .injectModule(ServiceAModule)
  .injectModule(ServiceBModule, [ServiceAModule]);
```

- **executeCommand**: Method to set a command that will run after the container is created.

If there are multiple commands, they will execute sequentially in the set order.

```typescript
interface ICommand {
  execute(resolver: IResolver): void;
}
```

```typescript
class ServiceA {}

function ServiceB(serviceA: ServiceA) {}

class ServiceAModule implements IModule {
  readonly SERVICE_A_TOKEN = ServiceA;

  export(injector: IInjector): void {
    injector.inject(this.SERVICE_A_TOKEN);
  }
}

class ServiceBModule implements IModule {
  constructor(readonly serviceA: ServiceA) {}

  readonly SERVICE_B_TOKEN = ServiceB;

  export(injector: IInjector): void {
    injector.inject(this.SERVICE_B_TOKEN, [this.serviceA.SERVICE_A_TOKEN]);
  }
}

class ReturnServiceBInstance implements ICommand {
  constructor(readonly serviceBModule: ServiceBModule) {}

  execute(resolver: IResolver): void {
    const serviceBInstance = resolver.resolveInstance(
      this.serviceBModule.SERVICE_B_TOKEN
    );
  }
}

Athlete()
  .injectModule(ServiceAModule)
  .injectModule(ServiceBModule, [ServiceAModule])
  .buildContainer()
  .executeCommand(ReturnServiceBInstance, [ServiceBModule]);
```

- **canBeResolved**: Method to check whether a given candidate can be resolved as a valid token.

If the candidate is a valid token, it can be used for dependency resolution.

```typescript
const isToken = Athlete().buildContainer().canBeResolved(RESOLVER_TOKEN);
// isToken = true
```

- **GetInfo**: Ьethod returns information about the current container. It returns an object containing maps of tokens and modules.

```typescript
export interface IProvider<T = unknown, A extends any[] = any[]> {
  token: Token<T, A>;
  depndencies: A;
  instantiate: (graph: Map<Token, IProvider>) => T;
}

export interface IInfo {
  tokens: Map<Token, IProvider>;
  modules: Map<Token, IProvider>;
}
```

```typescript
const info = Athlete().buildContainer().getInfo();
```

- **Inject objects and primitives**  
  To specify objects or primitives that should not be instantiated, wrap the value in a tuple.

```typescript
class ServiceA {
  constructor(readonly num: number, readonly obj: object) {}
}

Athlete().inject(ServiceA, [[42], [{}]]);
```

- **Inject resolver**  
  You can inject the instance resolver as a dependency.

```typescript
import { Athlete, RESOLVER_TOKEN } from "athlete-core";

class ServiceA {
  constructor(readonly resolver: IResolver) {}

  test() {
    const serviceA = this.resolver.resolveInstance(ServiceA);
  }
}

Athlete().inject(ServiceA, [RESOLVER_TOKEN]);
```

Enjoy programming!
