// return the result of the spawned process:
//  [ 'status', 'signal', 'output', 'pid', 'stdout', 'stderr',
//    'envPairs', 'options', 'args', 'file' ]

const { sync } = require("execa");
const path = require("path");

const TERRASTACK_PATH = path.resolve(__dirname, "../bin/terrastack");

const runTerrastack = (dir, args) => {
  const result = sync(TERRASTACK_PATH, args || [], {
    cwd: dir,
    env: process.env,
    reject: false
  });

  return result;
};

module.exports = {
  runTerrastack
};
