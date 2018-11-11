/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const _ = require("lodash");
const fs = require("fs-extra");
const os = require("os");
const path = require("path");
const { runNode, addTerrastack } = require("../utils");

const runTerrastack = () => {
  const Terrastack = require("terrastack");
  const stack = require(process.cwd() + "/stack.js");
  new Terrastack(stack).init();
};

describe("Stack", () => {
  const rootDir = path.resolve(__dirname, "..", "..");
  const dir = path.resolve(rootDir, "examples", "simple");
  const workDir = path.resolve(os.tmpdir(), "simple");

  beforeEach(() => {
    fs.removeSync(path.resolve(workDir, "*"));
    fs.copySync(dir, workDir);
    fs.removeSync(path.resolve(workDir, "node_modules/*"));
    fs.removeSync(path.resolve(workDir, ".terrastack/*"));
    addTerrastack(workDir, rootDir);
  });

  it("applies a simple stack", () => {
    const apply = runNode(workDir, `${runTerrastack.toString()}()`);

    const state = runNode(
      workDir,
      `
        require(process.cwd() + "/stack.js").state("network")
      `
    );

    const result = _.slice(state.stdout.split("\n"), 2).sort();
    expect(result).toMatchSnapshot();
  });
});
