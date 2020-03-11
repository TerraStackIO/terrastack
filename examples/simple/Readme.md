# Simple Typescript Example

This demonstrates a simple example based on Typescript. For convenience, the current Terraform AWS provider schema is commited under [./.schema/aws-provider.json](./.schema/aws-provider.json)

## Getting started

Make sure to run `yarn && yarn build` in the [root directory](../..) of the project

```bash
yarn
terrastack import -i .schema/aws-provider.json
yarn build
node stacks/simple.js
cat dist/mys3bucketstack.tf.json
cd dist
terraform init
terraform plan
```