const { EventEmitter2 } = require("eventemitter2");

const eventbus = new EventEmitter2({
  wildcard: true,
  delimiter: ":",
  newListener: false
});

module.exports = eventbus;
