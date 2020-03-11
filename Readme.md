# Terrastack - Polyglot Terraform supercharged by the CDK

Terrastack enables you to keep using Terraform as engine, while defining your resources in actual programming languages such as Typescript, Python, Java or C# - with more to come ([perhaps Ruby?](https://github.com/aws/jsii/issues/144)).

This is made possible by the [Cloud Development Kit (CDK)](https://github.com/aws/aws-cdk/) and [jsii](https://github.com/aws/jsii) for generating the polyglot libraries. While the major use-case for the CDK is generating Cloudformation configuration as YAML, it's capable of generating pretty much any configuration. 

Applying it Terraform was inspired by the release of [cdk8s](https://github.com/awslabs/cdk8s), which also paved the way for rapid progress towards a working Terraform version.

## How does it work?

Terrastack makes use of the following things: 

- Terraform [provider schemas](https://www.terraform.io/docs/commands/providers/schema.html) - See [an example](./examples/provider-schema)
- Besides from HCL, Terraform [understands JSON as well](https://www.terraform.io/docs/configuration/syntax-json.html)
- [Code generator](./packages/terrastack-cli) to transform the provider schema in proper Typescript classes 
- A custom [Stack](./packages/@terrastack/core/lib/stack.ts) and [ResourceObject](./packages/@terrastack/core/lib/resource-object.ts) class to interface with the CDK 

With that, we're able to generate packages for any given Terraform provider in the following languages:

- Typescript ([tested](./examples/simple)) 
- Python ([tested](./examples/simple-python))
- C# (yet to test)
- Java (yet to test)

## Current Status

In the current state, this is mostly a prototype. It demonstrates that it's possible and quite useful to leverage the CDK. Interfaces and Apis will certainly change and there are still some problems to solve. 

However, it's possible to generate full bindings for a given Terraform provider (tested with AWS and Google Cloud so far).

## Roadmap

- [x] Generate Terraform constructs (Level 1 in CDK speak) from the Terraform JSON schema
- [x] Build Terraform stacks out of those resources in Typescript, Python, Java or C#
- [x] Reference resources within a stack
- [x] Synthesize valid Terraform JSON which is plannable and applyable
- [x] Leverage existing CDK packages which are not bound to cloudformation directly, such as global tagging or an IAM Policy builder 
- [ ] Multiple Stacks with individual state
- [ ] Input Variables
- [ ] Outputs
- [ ] Remote State
- [ ] Pregenerate schemas for Terraform Providers
- [ ] Built-in functions
- [ ] Generic resource features such as lifecycles and dependencies
- [ ] Modules
- [ ] Dynamic blocks 
- [ ] count / for each 
- [ ] Converting HCL to Terrastack resources
- [ ] Publish easy consumable packages for providers and open source modules
- [ ] Better Terraform integration
- [ ] More examples
