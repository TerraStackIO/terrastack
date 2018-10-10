const fs = require("fs-extra");
const os = require("os");
const path = require("path");
const { runTerrastack } = require("../runTerrastack");

describe("Component Init", () => {
  const dir = path.resolve(__dirname, "..", "component-init");
  const workDir = path.resolve(os.tmpdir(), "component-init");

  beforeEach(() => {
    fs.removeSync(path.resolve(workDir, "*"));
    fs.copySync(dir, workDir);
  });

  it("generates a Terrastack index.js file", () => {
    const result = runTerrastack(workDir, [
      "component",
      "init",
      "-t",
      "1.0.0",
      "-d",
      "description",
      "foo-module"
    ]);

    const generatedIndexContent = fs
      .readFileSync(
        path.resolve(workDir, ".terrastack", "component", "index.js")
      )
      .toString();

    expect(generatedIndexContent).toMatchSnapshot();
  });
});
