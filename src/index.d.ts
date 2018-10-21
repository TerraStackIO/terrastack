/// <reference types="node" />

export as namespace Terrastack;

export = BaseComponent;

declare class BaseComponent<C extends object> {
  /**
   * Initialize the component
   *
   * @param name - Unique name for the component
   */
  constructor(name: string);

  /**
   * Define dependencies to other components.
   * Will be passed as `bindings` to the `configure` input callback
   *
   * @param components - components this component depends on
   *
   * @returns itself for chaining
   *
   */
  bind(components: object): this;

  /**
   * Configures the input for this component via callback function.
   * The bindings of the component are supplied as input argument if present.
   *
   * @param input - input Callback. Gets bindings passed in as argument
   * @returns itself for chaining
   */
  configure(input: (bindings?: any) => C): this;
}

declare namespace BaseComponent {

}
