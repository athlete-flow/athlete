const { Asserter } = require('./asserter');
const { Container } = require('./container');
const { Framework } = require('./framework');
const { Resolver } = require('./resolver');
const { Topology } = require('./topology');
const { Validator } = require('./validator');

const LOCATOR_TOKEN = (container) => ({
  resolveInstance: container.resolveInstance.bind(container),
});

function Athlete() {
  const validator = new Validator();
  const asserter = new Asserter(validator);
  const topology = new Topology(asserter);
  const resolver = new Resolver(topology);
  const container = new Container(resolver, asserter);
  return new Framework(container, asserter).init().inject(LOCATOR_TOKEN, [[container]]);
}

module.exports = { Athlete, LOCATOR_TOKEN };
