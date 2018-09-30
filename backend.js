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
