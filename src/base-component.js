const path = require("path");

class BaseComponent {
  constructor(name) {
    this.name = name;
  }

  configure(input) {
    this.inputCallback = input;
    return this;
  }

  bind(components) {
    this.bindings = components;
    return this;
  }

  setWorkingDir(baseDir) {
    this.baseDir = baseDir;
    this.workingDir = path.join(baseDir, this.name);
  }
}

module.exports = BaseComponent;
