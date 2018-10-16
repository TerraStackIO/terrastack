/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const fs = require("fs-extra");
const recursiveCopy = require("recursive-copy");
const path = require("path");
const eventbus = require("./eventbus");

class ComponentCompiler {
  constructor(component, config, baseDir) {
    this.component = component;
    this.config = config;
    this.baseDir = baseDir;
    this.componentDir = path.join(this.baseDir, this.component.name);
  }

  async compile(skipConfiguration = false) {
    fs.ensureDirSync(this.componentDir);
    this._writeConfig();
    if (!skipConfiguration) this._writeInput();
    await this._copySource();
    eventbus.emit("component:compile", this.component, this.componentDir);

    return this.componentDir;
  }

  _writeConfig() {
    fs.writeFileSync(
      path.join(this.componentDir, "terrastack.tf"),
      JSON.stringify(this._compileConfig(), null, 2)
    );
  }

  _writeInput() {
    fs.writeFileSync(
      path.join(this.componentDir, "terrastack.auto.tfvars"),
      JSON.stringify(
        this.component.inputCallback(this.component.bindings),
        null,
        2
      )
    );
  }

  async _copySource() {
    await recursiveCopy(this.component.sourceDir, this.componentDir, {
      filter: ["**/*", "!.terrastack"],
      overwrite: true
    });
  }

  _compileConfig() {
    const data = Object.keys(this.config).map(key =>
      this.config[key].compile(
        path.join(path.basename(this.baseDir), this.component.name)
      )
    );

    return Object.assign({}, ...data);
  }
}

module.exports = ComponentCompiler;
