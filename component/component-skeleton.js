const Mustache = require("mustache");

const parseAndRender = () => {
  const moduleJSON = JSON.parse(
    require("child_process")
      .execSync("cat *.tf | json2hcl -reverse")
      .toString("UTF-8")
  );

  console.log("Parsing module as JSON");

  const variables = moduleJSON.variable.map(element =>
    Object.keys(element).map(k => ({
      key: k,
      value: element[k][0]
    }))
  );

  const typeMap = {
    list: "Array",
    map: "Object"
  };

  const view = {
    description:
      "Terraform module which creates VPC resources on AWS (from package.json)",
    variables: [].concat(...variables),
    type: function() {
      return typeMap[this.value.type] || "String";
    },
    property: function() {
      return this.value.hasOwnProperty("default") ? `[${this.key}]` : this.key;
    }
  };

  const template = `
const path = require("path");

/**
* @typedef InputProperties
* @type {object}
* @description {{description}}
{{#variables}}
{{=<% %>=}}
* @property {<% type %>} <% property %> - <% value.description %>
<%={{ }}=%>
{{/variables}}
*/

/**
 * OptionsCallback to configure the component input.
 * @callback optionsCallback
 * @param {object} bindings
 * @returns {InputProperties} inputs object for the component
 */

class Component {

  /**
   * Initialize the component
   * @param {string} name - Unique name for the component
   * @param {object} bindings - Define dependencies for this component. Will be passed as argument to the optionsCallback
   * @param {optionsCallback} optionsCallback - Configure the component via the return value of this callback
   */
  constructor(name, bindings, optionsCallback) {
    this.name = name;
    this.optionsCallback = optionsCallback;
    this.bindings = bindings;
    this.sourceDir = path.join(__dirname, "../..");
    this.version = 1
  }
}

module.exports = Component;
`.trim();

  return Mustache.render(template, view);
};

module.exports = parseAndRender;
