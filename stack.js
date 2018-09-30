const path = require("path");
const fs = require("fs-extra");
const recursiveCopy = require("recursive-copy");
const { run } = require("./run");

class Stack {
  constructor(name, config) {
    this.name = name;
    this.config = config;
    this.elements = [];
  }

  add(element) {
    this.elements.push(element);
  }

  async init() {
    const terraStackDir = path.join(process.cwd(), ".terrastack", this.name);
    for await (const element of this.elements) {
      await run("init -force-copy", path.join(terraStackDir, element.id), {
        name: element.id
      });
    }
  }

  async plan() {
    const terraStackDir = path.join(process.cwd(), ".terrastack", this.name);
    for await (const element of this.elements) {
      await run("plan -lock=false", path.join(terraStackDir, element.id), {
        name: element.id
      });
    }
  }

  async apply() {
    const terraStackDir = path.join(process.cwd(), ".terrastack", this.name);
    for await (const element of this.elements) {
      await run(
        "apply -auto-approve -input=false",
        path.join(terraStackDir, element.id),
        {
          name: element.id,
          env: {
            TF_IN_AUTOMATION: 1
          }
        }
      );
    }
  }

  async destroy() {
    const terraStackDir = path.join(process.cwd(), ".terrastack", this.name);
    for await (const element of this.elements) {
      await run("destroy -auto-approve", path.join(terraStackDir, element.id), {
        name: element.id,
        env: {
          TF_IN_AUTOMATION: 1
        }
      });
    }
  }

  async compile() {
    const terraStackDir = path.join(process.cwd(), ".terrastack", this.name);
    fs.ensureDirSync(terraStackDir);

    for await (const element of this.elements) {
      const workingDir = path.join(terraStackDir, element.id);
      fs.ensureDirSync(workingDir);
      fs.writeFileSync(
        path.join(workingDir, "terrastack.tf"),
        JSON.stringify(this._compileConfig(element.id), null, 2)
      );

      fs.writeFileSync(
        path.join(workingDir, "terrastack.auto.tfvars"),
        JSON.stringify(element.variables, null, 2)
      );

      await recursiveCopy(element.sourceDir, workingDir, {
        filter: ["**/*", "!.terrastack"],
        overwrite: true
      })
        .then(function(results) {
          console.info("Copied " + results.length + " files");
        })
        .catch(function(error) {
          console.error("Copy failed: " + error);
        });
    }
  }

  _compileConfig(componentId) {
    const data = Object.keys(this.config).map(key =>
      this.config[key].compile(path.join(this.name, componentId))
    );

    return Object.assign({}, ...data);
  }
}

module.exports = { Stack };
