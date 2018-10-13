const ComponentCompiler = require("./component-compiler");
const { Terraform } = require("./terraform");

const callbacks = {
  start: () => {
    console.log(`started`);
  },
  success: () => {
    console.log(`success`);
  },
  failed: () => {
    console.log(`failed`);
  }
};

const plan = async stack => {
  const components = await stack.resolve();

  for (const component of components) {
    const compiler = new ComponentCompiler(
      component,
      stack.config,
      stack.terraStackDir
    );
    const workingDir = await compiler.compile();
    console.log(workingDir);
    const terraform = new Terraform(workingDir);
    await terraform.init(callbacks);
    await terraform.plan(callbacks);
  }
};

module.exports = { plan };
