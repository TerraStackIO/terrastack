/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const { EventEmitter2 } = require("eventemitter2");

const eventbus = new EventEmitter2({
  wildcard: true,
  delimiter: ":",
  newListener: false
});

module.exports = eventbus;
