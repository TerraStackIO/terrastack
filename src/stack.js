/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const path = require("path");
const fs = require("fs-extra");
const recursiveCopy = require("recursive-copy");
const _ = require("lodash");
const { spawnSync } = require("child_process");
const { Terraform } = require("./terraform");

class Stack {
  constructor(name, config) {
    this.name = name;
    this.config = config;
    this.components = [];
    this.executionOrder = [];
    this.terraStackDir = path.join(process.cwd(), ".terrastack", name);
  }

  add(...component) {
    this.components.push(...component);
  }

  async init(component, workingDir) {
    await run("init -force-copy", workingDir, { name: component.name });
  }

  async plan() {
    this.resolve();
    console.log(this.executionOrder);
    for (const component of this.executionOrder) {
      const callbacks = context => ({
        start: () => {
          console.log(`${context}: ${component.name} started`);
        },
        success: () => {
          console.log(`${context}: ${component.name} success`);
        },
        failed: () => {
          console.log(`${context}: ${component.name} failed`);
        }
      });
      const workingDir = await this._compile(component);
      const terraform = new Terraform(workingDir);

      await terraform.init(callbacks("init"));
      await terraform.plan(callbacks("plan"));

      await terraform.output(
        Object.assign(callbacks("output"), {
          success: output => {
            component.outputs = this._unwrapOutputs(output);
          }
        })
      );
    }
  }

  async apply() {
    this.resolve();

    for (const component of this.executionOrder) {
      const callbacks = {
        start: () => {
          console.log(`${component.name} started`);
        },
        success: () => {
          console.log(`${component.name} success`);
        },
        failed: () => {
          console.log(`${component.name} failed`);
        }
      };
      const workingDir = await this._compile(component);
      const terraform = new Terraform(workingDir);

      await terraform.init(callbacks);

      await terraform.apply(callbacks);

      await terraform.output(
        Object.assign(callbacks, {
          success: output => {
            component.outputs = this._unwrapOutputs(output);
          }
        })
      );
    }
  }

  list() {
    this.resolve();
    return this.executionOrder;
  }

  async state(componentName) {
    const component = _.find(this.components, c => {
      return c.name == componentName;
    });

    const callbacks = {
      start: () => {},
      success: output => {
        console.log(`${output}`);
      },
      failed: () => {
        console.log(`${component.name} failed`);
      }
    };

    const workingDir = await this._compile(component);
    const terraform = new Terraform(workingDir);
    await terraform.init(callbacks);
    await terraform.state(callbacks);
    this.executionOrder;
  }

  async refresh(workingDir) {
    const obj = spawnSync(`terraform output -json`, {
      timeout: 0,
      shell: "/bin/bash",
      cwd: workingDir
    });

    return JSON.parse(obj.stdout);
  }

  async destroy() {
    this.resolve();

    for (const component of this.executionOrder.reverse()) {
      const callbacks = {
        start: () => {
          console.log(`${component.name} started`);
        },
        success: () => {
          console.log(`${component.name} success`);
        },
        failed: () => {
          console.log(`${component.name} failed`);
        }
      };
      const workingDir = await this._compile(component, true);
      const terraform = new Terraform(workingDir);

      await terraform.init(callbacks);

      await terraform.destroy(callbacks);
    }
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
  }

  async _compile(component, skipConfiguration = false) {
    fs.ensureDirSync(this.terraStackDir);

    const componentDir = path.join(this.terraStackDir, component.name);

    fs.ensureDirSync(componentDir);
    fs.writeFileSync(
      path.join(componentDir, "terrastack.tf"),
      JSON.stringify(this._compileConfig(component.name), null, 2)
    );

    if (!skipConfiguration) {
      fs.writeFileSync(
        path.join(componentDir, "terrastack.auto.tfvars"),
        JSON.stringify(component.inputCallback(component.bindings), null, 2)
      );
    }

    await recursiveCopy(component.sourceDir, componentDir, {
      filter: ["**/*", "!.terrastack"],
      overwrite: true
    })
      .then(function(results) {
        console.info("Copied " + results.length + " files");
      })
      .catch(function(error) {
        console.error("Copy failed: " + error);
      });

    return componentDir;
  }

  _compileConfig(componentId) {
    const data = Object.keys(this.config).map(key =>
      this.config[key].compile(path.join(this.name, componentId))
    );

    return Object.assign({}, ...data);
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

  _unwrapOutputs(output) {
    return Object.entries(output).reduce((hash, element) => {
      const [key, value] = element;
      /* value is an object with the following keys:
       * sensitive: true/false
       * type: list/string
       * value: [...]/""
       */
      hash[key] = value["value"];
      return hash;
    }, {});
  }
}

module.exports = { Stack };
