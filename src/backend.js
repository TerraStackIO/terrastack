/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const _ = require("lodash");

class Backend {
  constructor(terraformJSON) {
    this.terraformJSON = terraformJSON;
  }

  compile(key) {
    const config = Object.assign({}, this.terraformJSON);
    if (config.hasOwnProperty("s3")) {
      _.set(config, "s3.key", "terrastack/" + key);
    }
    return { terraform: [{ backend: [config] }] };
  }
}

module.exports = { Backend };
