/// <reference types="node" />

export as namespace Terrastack;

export declare class Stack {
  /**
   * Initialize a stack
   *
   * @param name - Unique name for the stack
   * @param config - Configuration for the stack
   */
  constructor(name: string, config: object);

  /**
   * Add components to the stack
   *
   * @param components - One or more components
   */
  add(...components: object);
}

export declare class Provider {
  /**
   * Initialize a Provider
   *
   * @param config - Configuration for the Provider
   */
  constructor(config: object);
}

export declare class Backend {
  /**
   * Initialize a Provider
   *
   * @param config - Configuration for the Backend
   */
  constructor(config: object);
}

export declare class Terrastack {
  /**
   * Initialize Terrastack
   *
   * @param stack - Stack to orchestrate
   */
  constructor(stack: Stack);

  /**
   * Plan the stack
   */
  plan();

  /**
   * Apply the stack
   */
  apply();
}

export declare class BaseComponent<C extends object> {
  /**
   * Initialize the component
   *
   * @param name - Unique name for the component
   * {link}
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

namespace BaseComponent {
  export declare interface KeyValuePair {
    [key: string]: string | number;
  }
}
