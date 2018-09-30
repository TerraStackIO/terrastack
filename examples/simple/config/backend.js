const { Backend } = require("terrastack");

const s3 = new Backend({
  s3: {
    encrypt: true,
    bucket: "terrastack-remote-state",
    region: "eu-central-1",
    dynamodb_table: "terraform-state-lock"
  }
});

module.exports = s3;
