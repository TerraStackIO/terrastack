class BaseComponent {
  /**
   * Initialize the component
   * @param {string} name - Unique name for the component
   */
  constructor(name) {
    this.name = name;
  }

  configure(input) {
    this.inputCallback = input;
    return this;
  }

  /**
   * Define dependencies to other components.
   * Will be passed as `bindings` to the `configure` input callback
   *
   * @param {object} components - components this component depends on
   *
   * @returns this
   *
   * @example
   * ```js
   component.bind({
     network
   })
   ```
   */
  bind(components) {
    this.bindings = components;
    return this;
  }
}

module.exports = BaseComponent;
