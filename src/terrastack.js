const ComponentCompiler = require("./component-compiler");
const { Terraform } = require("./terraform");
const eventbus = require("./eventbus");

class Terrastack {
  constructor(stack) {
    this.stack = stack;
    this.components = stack.resolve();
    this.events = eventbus;
  }

  async plan() {
    eventbus.emit("stack:plan", this.stack);
    for (const component of this.components) {
      eventbus.emit("component:before", component);
      const compiler = new ComponentCompiler(
        component,
        this.stack.config,
        this.stack.terraStackDir
      );
      const terraform = new Terraform(component);
      await compiler.compile();
      await terraform.init();
      await terraform.plan();
    }
  }

  // runTaskSequence(tasks) {

  // }
}

module.exports = Terrastack;
