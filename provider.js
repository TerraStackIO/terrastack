class Provider {
  constructor(terraformJSON) {
    this.terraformJSON = terraformJSON;
  }

  compile() {
    return this.terraformJSON;
  }
}

module.exports = { Provider };
