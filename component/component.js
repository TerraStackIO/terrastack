const Mustache = require("mustache");
const template = require("fs-extra")
  .readFileSync(require.resolve("./component.mustache"))
  .toString();

// Disable HTML escaping
Mustache.escape = e => e;

const typeMap = function(type, defaultValue) {
  const mapping = { list: "Array", object: "Object.<string, (string|number)>" };

  if (type == "String" || type === undefined) {
    if (Array.isArray(defaultValue)) return "Array";
    const assumedType = typeof defaultValue;
    return mapping[assumedType] || assumedType;
  } else {
    return mapping[type];
  }
};

const defaultValue = value => {
  if (typeof value !== "object") return value;
  return Array.isArray(value) && value.length == 0 ? value : value[0];
};

const parseAndRender = () => {
  const moduleJSON = JSON.parse(
    require("child_process")
      .execSync("cat *.tf | json2hcl -reverse")
      .toString("UTF-8")
  );

  const variables = moduleJSON.variable.map(element =>
    Object.keys(element).map(k => ({
      key: k,
      value: element[k][0]
    }))
  );

  const view = {
    variables: [].concat(...variables),
    description: function() {
      return `${this.value.description}. Default: ${JSON.stringify(
        defaultValue(this.value.default)
      )}`;
    },
    type: function() {
      console.log(this.key);
      return (
        typeMap(this.value.type, defaultValue(this.value.default)) || "String"
      );
    },
    property: function() {
      return this.value.hasOwnProperty("default")
        ? `[${this.key}=${JSON.stringify(defaultValue(this.value.default))}]`
        : this.key;
    }
  };

  return Mustache.render(template, view);
};

module.exports = parseAndRender;
