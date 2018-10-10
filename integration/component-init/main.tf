variable "foo" {}

variable "foo_with_description" {
  description = "bar"
}

variable "foo_list" {
  type = "list"
}

variable "foo_map" {
  type = "map"
}

variable "foo_with_default_string" {
  default = "bar"
}

variable "foo_default_list" {
  default = []
}

variable "foo_default_map" {
  default = {}
}

variable "foo_default_boolean" {
  default = true
}

variable "foo_default_integer" {
  default = 1
}

variable "foo_with_default_string_and_description" {
  default     = "bar"
  description = "foo_bar"
}
