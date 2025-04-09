class Validator {
  isToken(candidate) {
    return typeof candidate === "function";
  }

  isDependencyTuple(candidate) {
    return Array.isArray(candidate) && candidate.length === 1;
  }

  isDependency(candidate) {
    return this.isToken(candidate) || this.isDependencyTuple(candidate);
  }
}

module.exports = { Validator };
