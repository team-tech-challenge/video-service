terraform {
  required_version = ">= 1.0.5"
  required_providers {
    helm = {
      source  = "hashicorp/helm"
      version = ">= 2.7"
    }
    kubectl = {
      source  = "gavinbunney/kubectl"
      version = "~> 1.11.2"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.43.0"
    }
  }
}
