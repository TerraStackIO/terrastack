class BaseComponent {
  constructor(name) {
    this.name = name;
  }

  configure(input) {
    this.inputCallback = input;
    return this;
  }

  bind(components) {
    this.bindings = components;
    return this;
  }
}

module.exports = BaseComponent;
