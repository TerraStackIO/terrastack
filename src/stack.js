/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const path = require("path");
const ComponentProxy = require("./internals/component-proxy");
const ComponentResolver = require("./internals/component-resolver");

class Stack {
  constructor(name, config) {
    this.name = name;
    this.config = config;
    this.components = [];
    this.terraStackDir = path.join(process.cwd(), ".terrastack", name);
  }

  add(...component) {
    this.components.push(
      ...component.map(c => new ComponentProxy(c, this.terraStackDir))
    );
  }

  resolve() {
    return new ComponentResolver(this.components).resolve();
  }
}

module.exports = Stack;
