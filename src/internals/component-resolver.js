/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const _ = require("lodash");

class ComponentResolver {
  constructor(components) {
    this.components = components;
    this.executionChunks = [[]];
  }

  resolve() {
    let remainingComponents = this.components.slice(0);

    while (remainingComponents.length > 0) {
      let countBefore = remainingComponents.length;

      remainingComponents = remainingComponents.filter(component => {
        if (_.isEmpty(component.bindings)) {
          // Components without binding, belongs always to layer 0
          this._addToLayer(0, component);

          return false;
        } else if (this._allBindingsAlreadyConsumed(component)) {
          // We assume here that all bindings got the `_layer` variable set in the previous loops
          let parentLayers = Object.values(component.bindings).map(
            c => c._layer
          );

          this._addToLayer(Math.max(...parentLayers) + 1, component);

          return false;
        } else {
          // component could not be resolved, so it remains in the `remainingComponents` variable
          return true;
        }
      });

      // We expect the remainingComponents array to change after each loop at least by one element.
      // So, if there was no change, some dependencies are circular or missing in the stack.
      if (remainingComponents.length == countBefore) {
        throw "Circular or missing dependencies detected!";
      }
    }
    return this.executionChunks;
  }

  _allBindingsAlreadyConsumed(component) {
    return Object.values(component.bindings).every(binding => {
      if (binding._layer != undefined) {
        return true;
      } else {
        return false;
      }
    });
  }

  _addToLayer(layer, component) {
    component._layer = layer;
    if (this.executionChunks[layer] == undefined) {
      this.executionChunks[layer] = [];
    }
    this.executionChunks[layer].push(component);
  }
}

module.exports = ComponentResolver;
