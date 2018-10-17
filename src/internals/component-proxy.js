const path = require("path");

class ComponentProxy {
  constructor(component, baseDir) {
    this.name = component.name;
    this.bindings = component.bindings;
    this.inputCallback = component.inputCallback;
    this.sourceDir = component.sourceDir;
    this.version = component.version;
    this.baseDir = baseDir;
    this.workingDir = path.join(this.baseDir, this.name);
  }
}

module.exports = ComponentProxy;
