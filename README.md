# Athlete

**A minimal, security-first dependency injection framework.**

Zero dependencies. No decorators. No string tokens. Fully auditable.

[![npm version](https://badge.fury.io/js/athlete-core.svg)](https://www.npmjs.com/package/athlete-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why Athlete?

Modern frameworks come with hundreds of dependencies, creating security risks through supply chain attacks. Athlete takes a different approach:

- **🔒 Zero Dependencies** - No hidden vulnerabilities in your dependency tree
- **📦 Minimal Size** - ~300 lines of code, easily auditable in 10 minutes
- **🚫 No Magic** - No decorators, no reflection, no string tokens
- **✅ Type-Safe** - Full TypeScript support without compromises
- **🔍 Transparent** - Every line of code can be reviewed and understood

**Perfect for security-critical projects** where code transparency matters: tools for journalists, platforms for activists, applications for NGOs.

## Installation

```bash
npm install athlete-core
```

## Quick Start

```typescript
import { Athlete } from "athlete-core";

class UserService {
  getUser(id: string) {
    return { id, name: "Alice" };
  }
}

class AuthService {
  constructor(private userService: UserService) {}

  authenticate(userId: string) {
    const user = this.userService.getUser(userId);
    return { user, token: "..." };
  }
}

const container = Athlete().inject(UserService).inject(AuthService, [UserService]).buildContainer();

const auth = container.resolveInstance(AuthService);
```

## Core Concepts

### Dependency Injection Without Decorators

Unlike NestJS or InversifyJS, Athlete doesn't use decorators or metadata. Dependencies are explicit:

```typescript
// ❌ Other frameworks - hidden dependencies via decorators
@Injectable()
class Service {
  constructor(@Inject("TOKEN") private dep: Dependency) {}
}

// ✅ Athlete - explicit, type-safe dependencies
class Service {
  constructor(readonly dep: Dependency) {}
}

Athlete().inject(Service, [Dependency]);
```

### Framework API

```typescript
interface IFramework {
  inject<T>(token: Token<T, []>): IFramework;
  inject<T, A extends any[]>(token: Token<T, A>, dependencies: Dependencies<A>): IFramework;
  injectFactory<T>(token: Token<T, []>): IFramework;
  injectFactory<T, A extends any[]>(token: Token<T, A>, dependencies: Dependencies<A>): IFramework;
  injectModule<T extends IModule>(token: Token<T, []>): IFramework;
  injectModule<T extends IModule, A extends any[]>(token: Token<T, A>, dependencies: Dependencies<A>): IFramework;
  buildContainer(): IСontainer;
}
```

### Container API

```typescript
interface IСontainer {
  resolveInstance<T>(token: Token<T>): T;
  executeCommand<T extends ICommand>(token: Token<T, []>): IСontainer;
  executeCommand<T extends ICommand, A extends any[]>(token: Token<T, A>, dependencies: Dependencies<A>): IСontainer;
  getInfo(): IInfo;
}
```

## Usage Examples

### Singleton Injection

```typescript
class DatabaseConnection {}
class UserRepository {
  constructor(readonly db: DatabaseConnection) {}
}

const container = Athlete().inject(DatabaseConnection).inject(UserRepository, [DatabaseConnection]).buildContainer();

const repo = container.resolveInstance(UserRepository);
```

### Factory Injection

Create new instances for each injection:

```typescript
class Logger {
  log(message: string) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }
}

class ServiceA {
  constructor(readonly logger: Logger) {}
}

class ServiceB {
  constructor(readonly logger: Logger) {}
}

Athlete()
  .inject(ServiceA, [Logger])
  .inject(ServiceB, [Logger])
  .injectFactory(Logger) // New Logger instance for each service
  .buildContainer();
```

### Modular Architecture

```typescript
import type { IModule } from "athlete-core";
...

class DatabaseModule implements IModule {
  readonly DB_TOKEN = DatabaseConnection;
  readonly REPO_TOKEN = UserRepository;

  export(framework: IFramework): void {
    framework.inject(this.DB_TOKEN).inject(this.REPO_TOKEN, [this.DB_TOKEN]);
  }
}

class AuthModule implements IModule {
  constructor(readonly dbModule: DatabaseModule) {}

  readonly AUTH_TOKEN = AuthService;

  export(framework: IFramework): void {
    framework.inject(this.AUTH_TOKEN, [this.dbModule.REPO_TOKEN]);
  }
}

const container = Athlete().injectModule(DatabaseModule).injectModule(AuthModule, [DatabaseModule]).buildContainer();
```

### Primitive Values

Inject configuration or primitives:

```typescript
class ApiClient {
  constructor(readonly baseUrl: string, readonly timeout: number, readonly config: object) {}
}

Athlete().inject(ApiClient, [
  ["https://api.example.com"], // Wrap primitives in tuples
  [5000],
  [{ retries: 3 }],
]);
```

### Container Injection

Inject the container itself for dynamic resolution:

```typescript
import { CONTAINER_TOKEN } from "athlete-core";

class ServiceFactory {
  constructor(readonly container: IСontainer) {}

  createService(type: string) {
    switch (type) {
      case "user":
        return this.container.resolveInstance(UserService);
      case "auth":
        return this.container.resolveInstance(AuthService);
    }
  }
}

Athlete().inject(ServiceFactory, [CONTAINER_TOKEN]);
```

### Commands

Execute initialization logic after container creation:

```typescript
import type { ICommand } from "athlete-core";
...

class StartServer implements ICommand {
  constructor(readonly app: Application) {}

  execute(container: IСontainer): void {
    this.app.listen(3000);
    console.log("Server started");
  }
}

Athlete().inject(Application).buildContainer().executeCommand(StartServer, [Application]);
```

### Custom Injectors

Extend the framework with domain-specific methods:

```typescript
function injectRepository<T extends Repository, A extends any[]>(
  token: Token<T, A>,
  dependencies = [] as Dependencies<A>
) {
  return athlete.inject(token, dependencies).injectFactory(TransactionManager); // Auto-inject transaction manager
}

const framework = Athlete().registerInjector(injectRepository).injectRepository(UserRepository, [DatabaseConnection]);
```

## Security Audit Guide

Athlete's simplicity makes security auditing straightforward:

1. **Review the source** - ~300 lines
2. **Check dependencies** - `package.json` has ZERO runtime dependencies
3. **Verify types** - All dependencies are explicitly declared
4. **Test isolation** - No global state, no prototype pollution

**Time required:** ~10 minutes for a complete audit.

Compare to:

- Express: 500+ transitive dependencies
- NestJS: 1000+ transitive dependencies
- Athlete: **0 dependencies**

## Comparison

| Feature             | Athlete | NestJS | InversifyJS |
| ------------------- | ------- | ------ | ----------- |
| Dependencies        | 0       | 1000+  | 50+         |
| Bundle Size         | ~5KB    | ~1MB   | ~100KB      |
| Decorators Required | ❌      | ✅     | ✅          |
| Reflect Metadata    | ❌      | ✅     | ✅          |
| Type Safety         | ✅      | ✅     | ✅          |
| Audit Time          | 10 min  | Days   | Hours       |

## Ecosystem

Athlete is designed to be the foundation of a larger ecosystem:

- **athlete-core** - DI framework (this package)
- **athlete-json-validation** - Runtime validation
- **athlete-http** - HTTP server (coming soon)
- **athlete-router** - Routing for HTTP/WebSocket (coming soon)
- **athlete-plugins** - Middleware alternative (coming soon)

## Philosophy

1. **Security through simplicity** - Fewer lines = fewer bugs
2. **Transparency over magic** - Explicit is better than implicit
3. **No hidden dependencies** - Supply chain security matters
4. **Framework, not library** - Opinionated but flexible

## Use Cases

Athlete is ideal for:

- 🔐 **Security-critical applications** - Financial services, healthcare, government
- 📰 **Journalism tools** - Secure communication platforms
- 🎯 **Activist platforms** - Privacy-focused applications
- 🏢 **NGO projects** - Resource-constrained organizations
- 🎓 **Educational projects** - Learning DI without complexity

## Contributing

Contributions welcome! Please read our contributing guidelines first.

## License

MIT © Denis Ardyshev

## Links

- [GitHub](https://github.com/athlete-flow/athlete)
- [npm](https://www.npmjs.com/package/athlete-core)
- [Issues](https://github.com/athlete-flow/athlete/issues)

---

**Enjoy programming without the bloat!** 🚀
