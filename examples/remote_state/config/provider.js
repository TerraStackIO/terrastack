/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const { Provider } = require("terrastack");

const provider = new Provider({
  provider: [
    {
      aws: {
        region: process.env.AWS_DEFAULT_REGION
      }
    }
  ]
});

module.exports = provider;
