const { spawn } = require("child_process");
const logger = require("./logger");

function run(cmd, workDir, options = {}) {
  const { name } = options;
  const env = options.env || {};
  const callbacks = options.callbacks || {
    stdout: output => {
      logger.log({ label: name, level: "info", message: output.toString() });
    },
    stderr: output => {
      logger.log({ label: name, level: "error", message: output.toString() });
    }
  };

  return new Promise((resolve, reject) => {
    const proc = spawn(`terraform ${cmd}`, {
      timeout: 0,
      shell: "/bin/bash",
      env: Object.assign({}, process.env, env),
      cwd: workDir
    });

    let data = "";
    let errors = "";

    proc.stdout.on("data", output => {
      data += output.toString();
      callbacks.stdout(output);
    });

    proc.stderr.on("data", output => {
      errors += output.toString();
      callbacks.stderr(output);
    });

    proc.on("close", function(code) {
      if (code !== 0) {
        console.log(code, errors);
        reject(errors);
      } else {
        try {
          resolve(true);
        } catch (error) {
          reject(error);
        }
      }
    });
  });
}

module.exports = { run };
