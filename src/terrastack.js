/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const Terraform = require("./internals/terraform");
const eventbus = require("./internals/eventbus");
const { asyncCompile } = require("./internals/component-compiler");

class Terrastack {
  constructor(stack) {
    this.stack = stack;
    this.componentChunks = stack.resolve();
    this.events = eventbus;

    this.events.on("component:output:success", function(component) {
      // update the component somehow. There should be a better way than events.
      // I think we're loosing the reference to the original objects in stack.resolve()
    });
  }

  async plan() {
    eventbus.emit("stack:plan", this.stack);
    this.eachComponent(async component => {
      eventbus.emit("component:before", component);
      const terraform = new Terraform(component);
      await this.runTaskSequence([
        asyncCompile(component, this.stack.config),
        terraform.asyncInit(),
        terraform.asyncPlan(),
        terraform.asyncOutput()
      ]);
    });
  }

  async apply() {
    eventbus.emit("stack:apply", this.stack);
    this.eachComponent(async component => {
      eventbus.emit("component:before", component);
      const terraform = new Terraform(component);
      await this.runTaskSequence([
        asyncCompile(component, this.stack.config),
        terraform.asyncInit(),
        terraform.asyncApply(),
        terraform.asyncOutput()
      ]);
    });
  }

  async eachComponent(applyFunction) {
    for (const chunk of this.componentChunks) {
      await Promise.all(chunk.map(component => applyFunction(component)));
    }
  }

  async runTaskSequence(tasks) {
    try {
      return await tasks.reduce(function(previous, current) {
        return previous.then(function() {
          return current();
        });
      }, Promise.resolve());
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = Terrastack;
