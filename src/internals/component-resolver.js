/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const _ = require("lodash");

class ComponentResolver {
  constructor(components) {
    this.components = components;
    this.componentLayers = {};
    this.executionChunks = null;
  }

  resolve() {
    if (this.executionChunks != null) {
      return this.executionChunks;
    }

    this.executionChunks = [[]];

    let remainingComponents = this.components.slice(0);

    while (remainingComponents.length > 0) {
      let countBefore = remainingComponents.length;

      remainingComponents = remainingComponents.filter(component => {
        if (_.isEmpty(component.bindings)) {
          // Components without binding, belongs always to layer 0
          this.executionChunks[0].push(component);
          this.componentLayers[component.name] = 0;

          return false;
        } else if (this._allBindingsAlreadyConsumed(component)) {
          // We assume here that all bindings got the `_layer` variable set in the previous loops
          let parentLayers = Object.values(component.bindings).map(
            component => this.componentLayers[component.name]
          );

          let layer = Math.max(...parentLayers) + 1;
          this.componentLayers[component.name] = layer;

          if (this.executionChunks[layer] == undefined) {
            this.executionChunks[layer] = [];
          }

          this.executionChunks[layer].push(component);

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
      if (this.componentLayers[binding.name] != undefined) {
        return true;
      } else {
        return false;
      }
    });
  }
}

module.exports = ComponentResolver;
