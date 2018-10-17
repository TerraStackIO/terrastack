const ComponentCompiler = require("./internals/component-compiler");
const Terraform = require("./internals/terraform");
const eventbus = require("./internals/eventbus");

class Terrastack {
  constructor(stack) {
    this.stack = stack;
    this.componentChunks = stack.resolve();
    this.events = eventbus;
  }

  async plan() {
    eventbus.emit("stack:plan", this.stack);
    this.eachComponent(async component => {
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
    });
  }

  async eachComponent(applyFunction) {
    for (const chunk of this.componentChunks) {
      await Promise.all(chunk.map(component => applyFunction(component)));
    }
  }

  // runTaskSequence(tasks) {

  // }
}

module.exports = Terrastack;
