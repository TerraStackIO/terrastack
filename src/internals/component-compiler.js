/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const fs = require("fs-extra");
const recursiveCopy = require("recursive-copy");
const path = require("path");
const eventbus = require("./eventbus");

const writeConfig = (stack, component) => {
  fs.writeFileSync(
    path.join(component.workingDir, "terrastack.tf"),
    JSON.stringify(compileConfig(stack, component), null, 2)
  );
};

const compileConfig = (stack, component) => {
  const data = Object.keys(stack.config).map(key =>
    stack.config[key].compile(`${stack.name}/${component.name}`)
  );
  return Object.assign({}, ...data);
};

const writeInput = component => {
  fs.writeFileSync(
    path.join(component.workingDir, "terrastack.auto.tfvars"),
    JSON.stringify(component.inputCallback(component.bindings), null, 2)
  );
};

const copySource = async component => {
  await recursiveCopy(component.sourceDir, component.workingDir, {
    filter: ["**/*", "!.terrastack"],
    overwrite: true
  });
};

const compile = async (stack, component) => {
  fs.emptyDirSync(component.workingDir);
  writeConfig(stack, component);
  writeInput(component);
  await copySource(component);
  eventbus.emit("component:compile", component);
};

const asyncCompile = (stack, component) => {
  return () =>
    new Promise((resolve, reject) => resolve(compile(stack, component)));
};

module.exports = { compile, asyncCompile };
