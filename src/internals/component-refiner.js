const path = require("path");

let refine = (component, baseDir) => {
  component.baseDir = baseDir;
  component.workingDir = path.join(baseDir, component.name);
  return component;
};

module.exports = refine;
