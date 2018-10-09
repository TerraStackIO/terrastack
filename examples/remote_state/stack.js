/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const { Stack } = require("terrastack");
const AwsRemoteState = require("@terrastack/terraform-remote-state-aws");

const { s3, local } = require("./config/backend");
const provider = require("./config/provider");

const applyStack = async stack => {
  await stack.compile();
  await stack.init();
  await stack.plan();
  await stack.apply();
};

const component = new AwsRemoteState("remote-state", {
  bucket: "terrastack-remote-state",
  dynamodb_table: "terraform-state-lock"
});

const buildStack = backend => {
  const stack = new Stack("terraform-remote-state", { backend, provider });
  stack.add(component);
  return stack;
};

const localStack = buildStack(local);
const remoteStack = buildStack(s3);

(async () => {
  await applyStack(localStack);
  await applyStack(remoteStack);
})();
