/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const path = require("path");
const ComponentProxy = require("./internals/component-proxy");
const _ = require("lodash");

class Stack {
  constructor(name, config) {
    this.name = name;
    this.config = config;
    this.components = [];
    this.executionOrder = [];
    this.terraStackDir = path.join(process.cwd(), ".terrastack", name);
  }

  add(...component) {
    this.components.push(
      ...component.map(c => new ComponentProxy(c, this.terraStackDir))
    );
  }

  resolve() {
    let availableComponents = this.components.slice(0);

    while (availableComponents.length > 0) {
      let countBefore = availableComponents.length;

      availableComponents = availableComponents.filter(component => {
        if (
          _.isEmpty(component.bindings) ||
          this._allBindingsAlreadyConsumed(component)
        ) {
          this.executionOrder.push(component);
          return false;
        } else {
          return true;
        }
      });

      // We expect the availableComponents array to change after each loop at least by one element.
      // So, if there was no change, some dependencies are circular or missing in the stack.
      if (availableComponents.length == countBefore) {
        throw "Circular or missing dependencies detected!";
      }
    }
    return this.executionOrder;
  }

  _allBindingsAlreadyConsumed(component) {
    return Object.values(component.bindings).every(binding => {
      if (this.executionOrder.includes(binding)) {
        return true;
      } else {
        return false;
      }
    });
  }
}

module.exports = Stack;
