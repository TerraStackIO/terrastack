const { spawn } = require("child_process");
const { createLogger, format, transports } = require("winston");
const path = require("path");

class Terraform {
  constructor(workingDir) {
    this.workingDir = workingDir;
    this.logger = createLogger({
      format: format.combine(
        format.timestamp(),
        format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
      transports: [
        new transports.File({
          filename: path.join(workingDir, "terrastack.log"),
          level: "info"
        })
      ]
    });
  }

  async init(callbacks) {
    callbacks.start();
    await this._exec("init -force-copy ").then(
      _stdout => {
        callbacks.success();
      },
      (_code, _stdout, _stderr) => {
        callbacks.failed();
      }
    );
  }

  async plan(callbacks) {
    callbacks.start();
    await this._exec("plan -input=false -lock=false -detailed-exitcode").then(
      _stdout => {
        callbacks.success(false);
      },
      (code, _stdout, _stderr) => {
        // Code 2 means: Succeeded, but there is a diff
        if (code == 2) {
          callbacks.success(true);
        } else {
          callbacks.failed();
        }
      }
    );
  }

  async apply(callbacks) {
    callbacks.start();
    await this._exec("apply -auto-approve -input=false").then(
      _stdout => {
        callbacks.success();
      },
      (_code, _stdout, _stderr) => {
        callbacks.failed();
      }
    );
  }

  async output(callbacks) {
    callbacks.start();
    await this._exec("output -json").then(
      stdout => {
        callbacks.success(JSON.parse(stdout));
      },
      (_code, _stdout, _stderr) => {
        callbacks.failed();
      }
    );
  }

  async destroy(callbacks) {
    callbacks.start();
    await this._exec("destroy -auto-approve").then(
      _stdout => {
        callbacks.success();
      },
      (_code, _stdout, _stderr) => {
        callbacks.failed();
      }
    );
  }

  async _exec(cmd) {
    return new Promise((resolve, reject) => {
      const proc = spawn(`terraform ${cmd} -no-color`, {
        timeout: 0,
        shell: "/bin/bash",
        env: Object.assign({ TF_IN_AUTOMATION: 1 }, process.env),
        cwd: this.workingDir
      });

      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", output => {
        stdout += output.toString();
        this.logger.log({ level: "info", message: output.toString() });
      });

      proc.stderr.on("data", output => {
        stderr += output.toString();
        this.logger.log({ level: "error", message: output.toString() });
      });

      proc.on("close", function(code) {
        if (code !== 0) {
          reject(code, stdout, stderr);
        } else {
          resolve(stdout);
        }
      });
    });
  }
}

module.exports = { Terraform };
