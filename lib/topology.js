class Visitor {
  constructor(graph) {
    this.#graph = graph;
  }

  #graph;
  #visiting = new Set();
  #visited = new Set();
  #sorted = new Map();

  #formatSet(set) {
    return Array.from(set)
      .map((item) => item?.name || String(item))
      .join(', ');
  }

  get sorted() {
    return this.#sorted;
  }

  visit(node) {
    if (this.#visiting.has(node))
      throw new Error(`Cyclic dependency detected: [ ${this.#formatSet(this.#visiting)} ]`);
    if (this.#visited.has(node) || !this.#graph.has(node)) return;
    this.#visiting.add(node);
    const dependencies = this.#graph.get(node) || [];
    for (const dependency of dependencies) this.visit(dependency);
    this.#sorted.set(node, dependencies), this.#visited.add(node), this.#visiting.delete(node);
  }
}

class Topology {
  sort(graph) {
    const visitor = new Visitor(graph);
    for (const node of graph.keys()) visitor.visit(node);
    return visitor.sorted;
  }
}

module.exports = { Topology };
