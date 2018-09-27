const { Backend } = require("terrastack");

const local = new Backend({
  local: {}
});

const s3 = new Backend({
  s3: {
    encrypt: true,
    bucket: "terrastack-remote-state",
    region: "eu-central-1",
    dynamodb_table: "terraform-state-lock"
  }
});

module.exports = { local, s3 };
