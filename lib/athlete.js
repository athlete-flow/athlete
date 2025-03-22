const { Asserter } = require('./asserter');
const { Container } = require('./container');
const { Framework } = require('./framework');
const { GraphChecker } = require('./graph-checker');
const { ProviderFactory } = require('./provider');
const { Validator } = require('./validator');

const RESOLVER_TOKEN = (container) => ({
  resolveInstance: container.resolveInstance.bind(container),
});

function Athlete() {
  const validator = new Validator();
  const providerFactory = new ProviderFactory();
  const graphChecker = new GraphChecker(validator);
  const asserter = new Asserter(validator, graphChecker);
  const container = new Container(providerFactory, asserter);
  const { init } = new Framework(container, providerFactory, asserter);
  return init().inject(RESOLVER_TOKEN, [[container]]);
}

module.exports = { Athlete, RESOLVER_TOKEN };
