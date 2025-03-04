const { Container } = require('./container');
const { Framework } = require('./framework');
const { Resolver } = require('./resolver');
const { Topology } = require('./topology');

function Athlete() {
  const topology = new Topology();
  const resolver = new Resolver(topology);
  const container = new Container(resolver);
  return new Framework(container).init();
}

module.exports = { Athlete };
