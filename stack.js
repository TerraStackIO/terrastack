const path = require("path");
const fs = require("fs-extra");
const recursiveCopy = require("recursive-copy");
const { run } = require("./run");
const _ = require("lodash");
const { spawnSync } = require("child_process");

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
    // TBD
  }

  async apply() {
    this.resolve();

    for (const component of this.executionOrder) {
      const workingDir = await this.compile(component);
      await this.init(component, workingDir);
      await run("apply -auto-approve -input=false", workingDir, {
        name: component.name,
        env: {
          TF_IN_AUTOMATION: 1
        }
      });

      const obj = spawnSync(`terraform output -json`, {
        timeout: 0,
        shell: "/bin/bash",
        cwd: workingDir
      });

      const output = JSON.parse(obj.stdout);

      component.outputs = output;
    }
  }

  async destroy() {
    for await (const component of this.components) {
      await run(
        "destroy -auto-approve",
        path.join(this.terraStackDir, component.name),
        {
          name: component.name,
          env: {
            TF_IN_AUTOMATION: 1
          }
        }
      );
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

  async compile(component) {
    fs.ensureDirSync(this.terraStackDir);

    const componentDir = path.join(this.terraStackDir, component.name);

    fs.ensureDirSync(componentDir);
    fs.writeFileSync(
      path.join(componentDir, "terrastack.tf"),
      JSON.stringify(this._compileConfig(component.name), null, 2)
    );

    fs.writeFileSync(
      path.join(componentDir, "terrastack.auto.tfvars"),
      JSON.stringify(component.optionsCallback(component.bindings), null, 2)
    );

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
}

module.exports = { Stack };
