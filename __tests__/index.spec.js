const { Athlete } = require('../index');

class Logger {}

class ServiceA {
  getData() {
    return 'A';
  }
}

class ServiceB {
  constructor(logger, payload) {
    this.payload = payload;
  }

  getData() {
    return 'B' + this.payload;
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
    inject(this.SERVICE_B_TOKEN, [this.loggerToken, ['payload']]);
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

describe('Framework', () => {
  let framework;

  beforeEach(() => {
    framework = Athlete();
  });

  test('should initialize framework correctly', () => {
    expect(framework).toHaveProperty('inject');
    expect(framework).toHaveProperty('injectModule');
    expect(framework).toHaveProperty('injectFactory');
    expect(framework).toHaveProperty('buildContainer');

    const container = framework.buildContainer();

    expect(container).toHaveProperty('executeCommand');
    expect(container).toHaveProperty('resolveInstance');
  });

  test('should inject and resolve dependencies correctly', () => {
    const res = framework
      .injectFactory(Logger)
      .injectModule(ServiceAModule)
      .injectModule(ServiceBModule, [Logger])
      .injectModule(ControllerModule, [Logger, ServiceAModule, ServiceBModule])
      .buildContainer()
      .executeCommand(GetDataCommand, [ControllerModule])
      .resolveInstance(Controller);

    expect(res).toBeInstanceOf(Controller);
    expect(res.getData()).toBe('A' + 'B' + 'payload');
  });

  test('should throw error if dependencies are not fully injected', () => {
    expect(() => {
      framework
        .injectFactory(Logger)
        .injectModule(ServiceAModule)
        .injectModule(ControllerModule, [Logger, ServiceAModule, ServiceBModule])
        .buildContainer();
    }).toThrowError();

    expect(() => {
      framework
        .injectFactory(Logger)
        .injectModule(ServiceAModule)
        .buildContainer()
        .executeCommand(GetDataCommand, [ControllerModule]);
    }).toThrowError();
  });

  test('should throw error on cyclic dependency', () => {
    expect(() => {
      framework
        .inject(CyclicServiceA, [CyclicServiceB])
        .inject(CyclicServiceB, [CyclicServiceA])
        .buildContainer();
    }).toThrowError('Cyclic dependency detected: [ CyclicServiceA, CyclicServiceB ]');
  });
});
