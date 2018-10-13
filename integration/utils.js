/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// return the result of the spawned process:
//  [ 'status', 'signal', 'output', 'pid', 'stdout', 'stderr',
//    'envPairs', 'options', 'args', 'file' ]

const { sync } = require("execa");

const runNode = (dir, script) => {
  const result = sync("node", ["-e", script], {
    cwd: dir,
    env: process.env,
    reject: false
  });

  return result;
};

const addTerrastack = (dir, origin) => {
  const result = sync("yarn", ["add", `file:${origin}`], {
    cwd: dir,
    env: process.env,
    reject: false
  });

  return result;
};

module.exports = { runNode, addTerrastack };
