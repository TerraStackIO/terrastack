const path = require("path");
const { runTerrastack } = require("../runTerrastack");

describe("Component Init", () => {
  it("generates a Terrastack index.js file", () => {
    const dir = path.resolve(__dirname, "..", "component-init");
    const result = runTerrastack(dir, [
      "component",
      "init",
      "-t",
      "1.0.0",
      "-d",
      "description",
      "foo-module"
    ]);

    console.log(result);
    // expect(extractSummary(stderr).summary).toMatchSnapshot();

    // expect(status).toBe(1);
    // expect(stderr).toMatch(
    //   /ReferenceError: thisIsARuntimeError is not defined/,
    // );
    // expect(stderr).toMatch(/> 10 \| thisIsARuntimeError\(\);/);
    // expect(stderr).toMatch(
    //   /\s+at\s(?:.+?)\s\(__tests__\/runtime_error.test\.js/,
    // );
  });
});
