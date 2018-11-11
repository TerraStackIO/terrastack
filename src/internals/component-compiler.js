/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const fs = require("fs-extra");
const recursiveCopy = require("recursive-copy");
const path = require("path");
const eventbus = require("./eventbus");

const writeConfig = (component, config) => {
  fs.writeFileSync(
    path.join(component.workingDir, "terrastack.tf"),
    JSON.stringify(compileConfig(component, config), null, 2)
  );
};

const compileConfig = (component, config) => {
  const data = Object.keys(config).map(key =>
    config[key].compile(component.workingDir)
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

const compile = async (component, config) => {
  fs.emptyDirSync(component.workingDir);
  writeConfig(component, config);
  writeInput(component);
  await copySource(component);
  eventbus.emit("component:compile", component);
};

const asyncCompile = (component, config) => {
  return () =>
    new Promise((resolve, reject) => resolve(compile(component, config)));
};

module.exports = { compile, asyncCompile };
