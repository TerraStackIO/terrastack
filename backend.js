const _ = require("lodash");

class Backend {
  constructor(terraformJSON) {
    this.terraformJSON = terraformJSON;
  }

  compile(key) {
    const config = Object.assign({}, this.terraformJSON);
    _.set(config, "s3.key", "terrastack/" + key);
    return { terraform: [{ backend: [config] }] };
  }
}

module.exports = { Backend };
