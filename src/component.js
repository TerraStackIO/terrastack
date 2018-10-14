class Component {
  constructor(name, component) {
    this.name = name;
    this.component = component;
  }

  foo() {
    return `yeah ${this.name}`;
  }
}

module.exports = Component;
