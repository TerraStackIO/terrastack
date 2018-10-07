/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const { Backend } = require("terrastack");

const local = new Backend({
  local: {}
});

const s3 = new Backend({
  s3: {
    encrypt: true,
    bucket: "terrastack-remote-state",
    region: "eu-central-1",
    dynamodb_table: "terraform-state-lock"
  }
});

module.exports = { local, s3 };
