const { Stack, dependsOn } = require("terrastack");
const Network = require("@terrastack/terraform-aws-vpc");

const backend = require("./config/backend");
const provider = require("./config/provider");

const simpleStack = new Stack("simple", { backend, provider });

const network = new Network("network", {
  name: "simple-example",
  cidr: "10.0.0.0/16",
  azs: ["eu-west-1a", "eu-west-1b", "eu-west-1c"],
  private_subnets: ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"],
  public_subnets: ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"],
  assign_generated_ipv6_cidr_block: true,
  enable_nat_gateway: true,
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
});
simpleStack.add(network);

(async () => {
  await simpleStack.compile();
  await simpleStack.init();
  await simpleStack.plan();
  // await simpleStack.apply();
})();
