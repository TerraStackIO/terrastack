/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const { spawn } = require("child_process");
const eventbus = require("./eventbus");

class Terraform {
  constructor(component) {
    this.component = component;
  }

  async init() {
    eventbus.emit("component:init:start", this.component);
    await this._exec("init -force-copy ").then(
      ...this._defaultCallbacks("init")
    );
  }

  async plan() {
    eventbus.emit("component:plan:start", this.component);
    await this._exec("plan -input=false -lock=false -detailed-exitcode").then(
      () => {
        eventbus.emit("component:plan:success", this.component);
      },
      code => {
        // Code 2 means: Succeeded, but there is a diff
        if (code == 2) {
          eventbus.emit("component:plan:diff", this.component);
        } else {
          eventbus.emit("component:plan:failed", this.component);
          eventbus.emit("error", this.component);
        }
      }
    );
  }

  async state() {
    eventbus.emit("component:state:start", this.component);
    await this._exec("state list").then(...this._defaultCallbacks("state"));
  }

  async apply() {
    eventbus.emit("component:apply:start", this.component);
    await this._exec("apply -auto-approve -input=false").then(
      ...this._defaultCallbacks("apply")
    );
  }

  async output() {
    eventbus.emit("component:output:start", this.component);
    await this._exec("output -json").then(...this._defaultCallbacks("output"));
  }

  async destroy() {
    eventbus.emit("component:destroy:start", this.component);
    await this._exec("destroy -auto-approve").then(
      ...this._defaultCallbacks("destroy")
    );
  }

  async _exec(cmd) {
    return new Promise((resolve, reject) => {
      const proc = spawn(`terraform ${cmd} -no-color`, {
        timeout: 0,
        shell: "/bin/bash",
        env: Object.assign({ TF_IN_AUTOMATION: 1 }, process.env),
        cwd: this.component.workingDir
      });

      proc.stdout.on("data", output => {
        eventbus.emit("output:stdout", this.component, output.toString());
      });

      proc.stderr.on("data", output => {
        eventbus.emit("output:stderr", this.component, output.toString());
      });

      proc.on("close", function(code) {
        if (code !== 0) {
          reject(code);
        } else {
          resolve();
        }
      });
    });
  }

  _defaultCallbacks(command) {
    return [
      () => {
        eventbus.emit(`component:${command}:success`, this.component);
      },
      code => {
        eventbus.emit(`component:${command}:failed`, this.component, code);
        eventbus.emit("error", this.component);
      }
    ];
  }
}

module.exports = Terraform;
