const path = require("path");

class BaseComponent {
  constructor(name, options = {}) {
    this.name = name;
    this.output = wrap({});
    this.state = "constructed";
    this.options = Object.assign({ destroy: false }, options);
    this.bindings = {};
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

  setOutput(output) {
    this.output = wrap(output);
  }
}

const wrap = obj => {
  return new Proxy(obj, {
    get(target, propKey) {
      return target[propKey] || { value: "<computed>" };
    }
  });
};

module.exports = BaseComponent;
