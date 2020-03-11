# Generate Terraform Provider Schema

Starting from Terraform `0.12` you can use the Terraform CLI to generate a JSON representation of a given provider. Find the details and spec [over here](https://www.terraform.io/docs/commands/providers/schema.html)

### AWS Provider Example 

Get the provider version you want and edit [./aws.tf.json](./aws.tf.json) accordingly.

Find available versions like this

```bash
curl -s https://registry.terraform.io/v1/providers/hashicorp/aws/versions | jq -r '.versions | .[] | .version'
```

The run the following

```bash
terraform init 
terraform providers schema -json | jq > schema.json
```
Inspect the schema

```bash
cat schema.json
```