#!/usr/bin/env node

const fs = require("fs-extra");
const componentCode = require("./component-skeleton");
const packageDefaults = require("./package");

const initComponent = (name, version, description) => {
  console.log(`Starting to init component "${name}" in version ${version}`);

  fs.ensureDirSync(".terrastack/component");
  fs.writeFileSync(".terrastack/component/index.js", componentCode());
  console.log("Writing .terrastack/component/index.js");

  const package = Object.assign(
    {},
    { name, version, description },
    packageDefaults
  );

  fs.writeFileSync("package.json", JSON.stringify(package, null, 2));
  console.log("Writing package.json");
  console.log("Finished!");
};

module.exports = initComponent;
