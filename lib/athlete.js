const { Asserter } = require("./asserter");
const { Container } = require("./container");
const { Framework } = require("./framework");
const { GraphChecker } = require("./graph-checker");
const { ProviderFactory } = require("./provider");
const { Validator } = require("./validator");

const CONTAINER_TOKEN = (container) => container;

function Athlete() {
  const validator = new Validator();
  const providerFactory = new ProviderFactory();
  const graphChecker = new GraphChecker(validator);
  const asserter = new Asserter(validator, graphChecker);
  const container = new Container(providerFactory, asserter);
  return new Framework(CONTAINER_TOKEN, container, providerFactory, asserter);
}

module.exports = { Athlete, CONTAINER_TOKEN };
