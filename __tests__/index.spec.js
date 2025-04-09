const { Athlete, RESOLVER_TOKEN } = require("../index");

const serviceAData = "A";
const serviceBData = "B";
const payload = "payload";

class Logger {}

class ServiceA {
  getData() {
    return serviceAData;
  }
}

class ServiceB {
  constructor(logger, payload) {
    this.payload = payload;
  }

  getData() {
    return serviceBData + this.payload;
  }
}

class Controller {
  constructor(logger, serviceA, serviceB) {
    this.serviceA = serviceA;
    this.serviceB = serviceB;
  }

  getData() {
    return this.serviceA.getData() + this.serviceB.getData();
  }
}

class ServiceAModule {
  SERVICE_A_TOKEN = ServiceA;

  export(framework) {
    framework.inject(this.SERVICE_A_TOKEN);
  }
}

class ServiceBModule {
  constructor(loggerToken) {
    this.loggerToken = loggerToken;
  }

  SERVICE_B_TOKEN = ServiceB;

  export({ inject }) {
    inject(this.SERVICE_B_TOKEN, [this.loggerToken, [payload]]);
  }
}

class ControllerModule {
  constructor(loggerToken, serviceAModule, serviceBModule) {
    this.loggerToken = loggerToken;
    this.serviceAModule = serviceAModule;
    this.serviceBModule = serviceBModule;
  }

  CONTROLLER_TOKEN = Controller;

  export({ inject }) {
    inject(this.CONTROLLER_TOKEN, [
      this.loggerToken,
      this.serviceAModule.SERVICE_A_TOKEN,
      this.serviceBModule.SERVICE_B_TOKEN,
    ]);
  }
}

class GetDataCommand {
  constructor(controllerModule) {
    this.controllerModule = controllerModule;
  }

  execute({ resolveInstance }) {
    const controller = resolveInstance(this.controllerModule.CONTROLLER_TOKEN);
    controller.getData();
  }
}

class CyclicServiceA {
  constructor(cyclicServiceB) {
    this.cyclicServiceB = cyclicServiceB;
  }
}

class CyclicServiceB {
  constructor(cyclicServiceA) {
    this.cyclicServiceA = cyclicServiceA;
  }
}

describe("Framework", () => {
  let framework;

  beforeEach(() => {
    framework = Athlete();
  });

  test("should initialize the framework with the correct properties", () => {
    expect(framework).toHaveProperty("inject");
    expect(framework).toHaveProperty("injectModule");
    expect(framework).toHaveProperty("injectFactory");
    expect(framework).toHaveProperty("buildContainer");
    expect(framework).not.toHaveProperty("init");

    const container = framework.buildContainer();

    expect(container).toHaveProperty("executeCommand");
    expect(container).toHaveProperty("resolveInstance");
    expect(container).toHaveProperty("canBeResolved");
    expect(container).toHaveProperty("getInfo");
    expect(container).not.toHaveProperty("init");
  });

  test("should inject dependencies and resolve them correctly", () => {
    const res = framework
      .injectFactory(Logger)
      .injectModule(ServiceAModule)
      .injectModule(ServiceBModule, [[Logger]])
      .injectModule(ControllerModule, [[Logger], ServiceAModule, ServiceBModule])
      .buildContainer()
      .executeCommand(GetDataCommand, [ControllerModule])
      .resolveInstance(Controller);

    expect(res).toBeInstanceOf(Controller);
    expect(res.getData()).toBe(serviceAData + serviceBData + payload);
  });

  test("should inject and resolve dependencies from factories correctly", () => {
    const MockedLogger = jest.fn();
    const MockedService = jest.fn();
    const MockedController = jest.fn();
    const container = framework
      .injectFactory(MockedLogger)
      .inject(MockedService, [MockedLogger])
      .inject(MockedController, [MockedLogger])
      .buildContainer();

    container.resolveInstance(MockedService);
    container.resolveInstance(MockedService);
    container.resolveInstance(MockedController);
    container.resolveInstance(MockedController);

    expect(MockedLogger).toHaveBeenCalledTimes(4);
    expect(MockedService).toHaveBeenCalledTimes(1);
    expect(MockedController).toHaveBeenCalledTimes(1);
  });

  test("should throw an error if a module's dependencies are not fully injected", () => {
    expect(() => {
      framework
        .injectFactory(Logger)
        .injectModule(ServiceAModule)
        .injectModule(ControllerModule, [[Logger], ServiceAModule, ServiceBModule])
        .buildContainer();
    }).toThrowError(`[ ${ServiceBModule.name} ] has no injection.`);
  });

  test("should throw an error if dependencies are not fully injected", () => {
    expect(() => {
      framework
        .injectFactory(Logger)
        .injectModule(ServiceAModule)
        .buildContainer()
        .executeCommand(GetDataCommand, [ControllerModule]);
    }).toThrowError(`[ ${ControllerModule.name} ] has no injection.`);
  });

  test("should return a resolver instance from the container", () => {
    const container = framework.buildContainer();
    const candidate = container.resolveInstance(RESOLVER_TOKEN).resolveInstance(RESOLVER_TOKEN);

    expect(candidate).toHaveProperty("resolveInstance");
    expect(candidate).toHaveProperty("canBeResolved");
    expect(candidate).toHaveProperty("getInfo");
  });

  test("should return correct resolution status for tokens", () => {
    const success = framework.buildContainer().canBeResolved(RESOLVER_TOKEN);
    const failure = framework.buildContainer().canBeResolved(undefined);

    expect(success).toBe(true);
    expect(failure).toBe(false);
  });

  test("should throw an error for cyclic dependencies", () => {
    expect(() => {
      framework.inject(CyclicServiceA, [CyclicServiceB]).inject(CyclicServiceB, [CyclicServiceA]).buildContainer();
    }).toThrowError(
      `Cyclic dependency detected between [ ${CyclicServiceA.name}, ${CyclicServiceB.name}, ${CyclicServiceA.name} ]`
    );
  });

  test("should throw an error when an invalid dependency is provided", () => {
    const num = 42;
    expect(() => {
      framework.inject(num);
    }).toThrowError(`[ ${String(42)} ] is not a valid token`);

    const boo = function boo(num) {
      return num;
    };

    expect(() => {
      framework.inject(boo, 42);
    }).toThrowError(`Invalid dependencies provided for token [ ${boo.name} ]`);

    const wrongDependencies = [42, 42];

    expect(() => {
      framework.inject((num) => num, [[42, 42]]);
    }).toThrowError(`[ ${String(wrongDependencies)} ] is not a valid dependency.`);
  });

  test("should return container information correctly", () => {
    const info = framework.buildContainer().getInfo();

    expect(info?.tokens).toBeInstanceOf(Map);
    expect(info?.modules).toBeInstanceOf(Map);
    expect(info?.tokens.size).toBe(1);
    expect(info?.modules.size).toBe(0);
  });
});
