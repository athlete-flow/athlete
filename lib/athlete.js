const { Container } = require('./container');
const { Framework } = require('./framework');
const { Resolver } = require('./resolver');
const { Topology } = require('./topology');

Athlete.LOCATOR_TOKEN = ({ resolveInstance }) => ({ resolveInstance });

function Athlete() {
  const topology = new Topology();
  const resolver = new Resolver(topology);
  const container = new Container(resolver);
  return new Framework(container).init().injectFactory(Athlete.LOCATOR_TOKEN, [[container]]);
}

module.exports = { Athlete };
