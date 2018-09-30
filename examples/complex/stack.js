const { Stack, Backend, Provider } = require("terrastack");
const Network = require("@terrastack/terraform-aws-vpc");
const EC2Instance = require("@terrastack/terraform-aws-ec2-instance");

const network = new Network("network", () => ({
  name: "complex-example",
  cidr: "10.0.0.0/16",
  azs: ["eu-central-1a", "eu-central-1b", "eu-central-1c"],
  private_subnets: ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"],
  public_subnets: ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"],
  assign_generated_ipv6_cidr_block: true,
  enable_nat_gateway: false,
  single_nat_gateway: true,
  public_subnet_tags: {
    Name: "overridden-name-public"
  },
  tags: {
    Owner: "user",
    Environment: "dev"
  },
  vpc_tags: {
    Name: "vpc-name"
  }
}));

const ec2 = new EC2Instance(`ec2`, { network }, bindings => ({
  name: "complex-ec2",
  ami: "ami-ebd02392",
  instance_type: "t3.micro",
  subnet_id: bindings.network.outputs.public_subnets[0],
  vpc_security_group_ids: bindings.network.outputs.default_security_group_id
}));

const ec2instances = [];

for (const a of [1, 2, 3]) {
  ec2instances.push(
    new EC2Instance(`ec2`, { network }, bindings => ({
      name: "complex-ec2",
      ami: "ami-ebd02392",
      instance_type: "t3.micro",
      subnet_id: bindings.network.outputs.public_subnets[0],
      vpc_security_group_ids: bindings.network.outputs.default_security_group_id
    }))
  );
}

const backend = new Backend({
  s3: {
    encrypt: true,
    bucket: "terrastack-remote-state",
    region: "eu-central-1",
    dynamodb_table: "terraform-state-lock"
  }
});

const provider = new Provider({
  provider: [{ aws: { region: process.env.AWS_DEFAULT_REGION } }]
});

const complexStack = new Stack("complex", { backend, provider });

complexStack.add(network, ec2, ...ec2instances);

module.exports = complexStack;
