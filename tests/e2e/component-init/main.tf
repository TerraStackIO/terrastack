variable "foo" {}

variable "foo_with_default" {
  default = "bar"
}

variable "foo_list" {
  type = "list"
}

variable "foo_map" {
  type = "map"
}
