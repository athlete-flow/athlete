class Visitor {
  constructor(graph, asserter) {
    this.#graph = graph;
    this.#asserter = asserter;
  }

  #graph;
  #asserter;
  #visiting = new Set();
  #visited = new Set();
  #sorted = new Map();

  get sorted() {
    return this.#sorted;
  }

  visit(node) {
    this.#asserter.throwIfHasCyclicDependency(this.#visiting, node);
    if (this.#visited.has(node) || !this.#graph.has(node)) return;
    this.#visiting.add(node);
    const dependencies = this.#graph.get(node) || [];
    for (const dependency of dependencies) this.visit(dependency);
    this.#sorted.set(node, dependencies), this.#visited.add(node), this.#visiting.delete(node);
  }
}

class Topology {
  constructor(asserter) {
    this.#asserter = asserter;
  }

  #asserter;

  sort(graph) {
    const visitor = new Visitor(graph, this.#asserter);
    for (const node of graph.keys()) visitor.visit(node);
    return visitor.sorted;
  }
}

module.exports = { Topology };
