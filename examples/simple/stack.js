/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const { Stack } = require("terrastack");
const Network = require("@terrastack/terraform-aws-vpc");

const backend = require("./config/backend");
const provider = require("./config/provider");

const simpleStack = new Stack("simple", { backend, provider });

const network = new Network("network", {}, dependencies => ({
  name: "simple-example",
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

simpleStack.add(network);

module.exports = simpleStack;
