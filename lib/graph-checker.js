class GraphChecker {
  constructor(validator) {
    this.#validator = validator;
  }

  #validator;

  #dfs(token, path, visited, stack, graph) {
    if (stack.has(token)) return path.slice(path.indexOf(token)).concat(token);
    if (visited.has(token)) return null;
    visited.add(token), stack.add(token);
    const dependencies = graph.get(token)?.dependencies || [];
    const cycle = dependencies
      .map((dependency) => this.#dfs(dependency, path.concat(token), visited, stack, graph))
      .find((cycle) => cycle);
    stack.delete(token);
    return cycle;
  }

  foundFirstUnknownToken(graph) {
    for (const provider of graph.values())
      for (const dependency of provider.dependencies)
        if (this.#validator.isToken(dependency) && !graph.has(dependency)) return dependency;
  }

  foundCyclicDependencies(graph) {
    for (const token of graph.keys()) {
      const cycle = this.#dfs(token, [], new Set(), new Set(), graph);
      if (cycle) return cycle;
    }
  }
}

module.exports = { GraphChecker };
